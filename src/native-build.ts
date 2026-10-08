import { copyFile, mkdir, readdir, readFile, rename, rm, stat, chmod, realpath, access, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { AcbrConfig } from './config.js';
import { fileHash, runCommand, snapshotSource, verifySource } from './source.js';

export interface BuiltRuntimeManifest {
  formatVersion: 1; sourceRevision: number; contractHash: string; platform: string; arch: string;
  executable: string; files: Record<string, string>;
  systemDependencies?: string[]; testOnly?: boolean; generatedFileHashes: Record<string, string>;
}
interface GeneratedManifest { sourceRevision: number; sourceHash: string; contractHash: string; fileHashes: Record<string, string>; }
export function runtimeDirectory(config: AcbrConfig): string { return join(config.native.outputDir, `${process.platform}-${process.arch}`); }
async function exists(path: string): Promise<boolean> { try { await access(path); return true; } catch { return false; } }
export async function findLazarus(config: AcbrConfig): Promise<string> {
  const candidates = config.native.lazarusRoot ? [config.native.lazarusRoot] :
    [process.env.LAZARUS_ROOT, '/usr/lib/lazarus/default', '/usr/lib/lazarus/3.0', 'C:\\lazarus'].filter((path): path is string => Boolean(path));
  for (const candidate of candidates) if (await exists(join(candidate, 'components/lazutils'))) return realpath(candidate);
  throw new Error('Lazarus não encontrado. Defina native.lazarusRoot em acbr.config.json ou LAZARUS_ROOT.');
}
async function generatedManifest(config: AcbrConfig): Promise<GeneratedManifest> {
  const path = join(config.generator.outputDir, '.acbr/generated/manifest.json');
  let value: GeneratedManifest;
  try { value = JSON.parse(await readFile(path, 'utf8')) as GeneratedManifest; }
  catch (error) { throw new Error('Contrato gerado ausente ou inválido. Execute acbr-node generate.', { cause: error }); }
  if (!Number.isSafeInteger(value.sourceRevision) || !/^[a-f0-9]{64}$/.test(value.contractHash) || !/^[a-f0-9]{64}$/.test(value.sourceHash)) throw new Error('Manifesto gerado inválido. Execute generate.');
  if (!value.fileHashes || typeof value.fileHashes !== 'object' || Array.isArray(value.fileHashes) || Object.keys(value.fileHashes).length !== 3 || ['generated/acbr/models.ts', 'generated/acbr/index.ts', 'native/generated/AcbrModels.pas'].some(name => !Object.hasOwn(value.fileHashes, name))) throw new Error('Manifesto gerado não contém os hashes dos três arquivos. Execute generate.');
  for (const [name, expected] of Object.entries(value.fileHashes)) {
    const file = resolve(config.generator.outputDir, name);
    const location = relative(config.generator.outputDir, file);
    if (!name || name.startsWith('/') || name.includes('\\') || location === '..' || location.startsWith(`..${sep}`) || !/^[a-f0-9]{64}$/.test(expected)) throw new Error('Caminho ou SHA256 inválido no manifesto gerado.');
    if (await fileHash(file) !== expected) throw new Error(`Arquivo gerado diverge do manifesto: ${name}. Execute generate para restaurar o contrato.`);
  }
  return value;
}
async function subdirectories(path: string): Promise<string[]> {
  const result = [path];
  for (const entry of (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) result.push(...await subdirectories(join(path, entry.name)));
  }
  return result;
}
const REQUIRED_DYNAMIC = ['libssl.so.3', 'libcrypto.so.3', 'libxml2.so.2'];
const CORE_SYSTEM = /^(?:lib(?:c|m|pthread|dl|rt|resolv|anl|util)\.so(?:\.|$)|ld-linux|linux-vdso)/;
async function copyLinuxLibraries(stage: string): Promise<string[]> {
  const { stdout } = await runCommand('ldconfig', ['-p']);
  const libraries = new Map<string, string>();
  for (const name of REQUIRED_DYNAMIC) {
    const line = stdout.split('\n').find(value => value.trim().startsWith(`${name} `) && value.includes('x86-64'));
    const path = line?.split('=>')[1]?.trim();
    if (!path) throw new Error(`Dependência dinâmica ausente: ${name}. Instale OpenSSL 3 e libxml2 compatíveis.`);
    libraries.set(name, await realpath(path));
  }
  const modules = '/usr/lib/x86_64-linux-gnu/ossl-modules';
  if (!(await exists(join(modules, 'legacy.so')))) throw new Error('Provider legacy OpenSSL 3 ausente. Instale o pacote libssl3/libssl3t64 completo.');
  libraries.set('ossl-modules/legacy.so', await realpath(join(modules, 'legacy.so')));
  const systemDependencies = new Set<string>();
  const inspected = new Set<string>();
  while (inspected.size < libraries.size) {
    const [name, path] = [...libraries].find(([name]) => !inspected.has(name))!;
    inspected.add(name);
    const dependencies = await runCommand('ldd', [path]);
    for (const line of dependencies.stdout.split('\n')) {
      if (line.includes('not found')) throw new Error(`Dependência transitiva ausente: ${line.trim()}.`);
      const match = /^\s*(\S+)\s+=>\s+(\S+)/.exec(line);
      if (match) {
        const dependency = match[1]!; const file = match[2]!;
        if (CORE_SYSTEM.test(dependency)) systemDependencies.add(dependency);
        else if (!libraries.has(dependency)) libraries.set(dependency, await realpath(file));
      } else {
        const direct = /^\s*(\/\S+)/.exec(line)?.[1];
        if (direct) systemDependencies.add(basename(direct));
      }
    }
  }
  const licenseDir = join(stage, 'licenses'); await mkdir(licenseDir, { recursive: true });
  const provenance: Record<string, unknown> = {};
  for (const [name, path] of libraries) {
    const destination = name.startsWith('ossl-modules/') ? join(stage, name) : join(stage, 'lib', name);
    await mkdir(dirname(destination), { recursive: true }); await copyFile(path, destination);
    const aliases = name === 'libssl.so.3' ? ['libssl.so'] : name === 'libcrypto.so.3' ? ['libcrypto.so'] : name === 'libxml2.so.2' ? ['libxml2.so'] : [];
    for (const alias of aliases) await copyFile(path, join(stage, 'lib', alias));
    let owner: string;
    try { owner = (await runCommand('dpkg-query', ['-S', path])).stdout.split('\n')[0]!.split(': ')[0]!; }
    catch (error) { throw new Error(`Não foi possível identificar pacote/licença de ${path}. Build requer Debian/Ubuntu com dependências registradas pelo dpkg.`, { cause: error }); }
    const pkg = owner.split(':')[0]!;
    const copyright = `/usr/share/doc/${pkg}/copyright`;
    if (!(await exists(copyright))) throw new Error(`Licença da dependência ${name} não encontrada: ${copyright}.`);
    await copyFile(copyright, join(licenseDir, `${name.replaceAll('/', '-')}.txt`));
    const source = (await runCommand('dpkg-query', ['-W', '-f=${source:Package}|${source:Version}|${Version}', owner])).stdout.trim().split('|');
    provenance[name] = { binaryPackage: owner, binaryVersion: source[2], sourcePackage: source[0], sourceVersion: source[1],
      sourceUrl: `https://launchpad.net/ubuntu/+source/${encodeURIComponent(source[0]!)}/${encodeURIComponent(source[1]!)}`,
      copyright: `licenses/${name.replaceAll('/', '-')}.txt` };
  }
  await mkdir(join(stage, 'sources'), { recursive: true });
  await writeFile(join(stage, 'sources/native-dependencies.json'), `${JSON.stringify(provenance, null, 2)}\n`);
  await writeFile(join(stage, 'openssl.cnf'), 'openssl_conf = openssl_init\n[openssl_init]\nproviders = provider_sect\n[provider_sect]\ndefault = default_sect\nlegacy = legacy_sect\n[default_sect]\nactivate = 1\n[legacy_sect]\nactivate = 1\n');
  return [...systemDependencies].sort();
}
async function copyExplicitLibraries(config: AcbrConfig, stage: string): Promise<void> {
  if (!config.native.libraryFiles?.length) throw new Error('Windows exige native.libraryFiles com DLLs OpenSSL 3/libxml2 e arquivos .LICENSE adjacentes.');
  await mkdir(join(stage, 'lib'), { recursive: true }); await mkdir(join(stage, 'licenses'), { recursive: true });
  const sources: Record<string, unknown> = {};
  const dependencyDirectories = new Set([...(config.native.libraryFiles ?? []), ...(config.native.providerFiles ?? [])].map(dirname));
  for (const directory of dependencyDirectories) {
    for (const entry of await readdir(directory)) {
      if (entry.endsWith('.LICENSE')) await copyFile(join(directory, entry), join(stage, 'licenses', entry));
      else if (entry === 'SOURCE.json') {
        await mkdir(join(stage, 'sources'), { recursive: true });
        await copyFile(join(directory, entry), join(stage, 'sources', `${basename(directory)}-SOURCE.json`));
      }
    }
  }
  for (const [directory, files] of [['lib', config.native.libraryFiles], ['ossl-modules', config.native.providerFiles ?? []]] as const) {
    await mkdir(join(stage, directory), { recursive: true });
    for (const source of files) {
      await copyFile(source, join(stage, directory, basename(source)));
      await copyFile(`${source}.LICENSE`, join(stage, 'licenses', `${basename(source)}.txt`));
      if (await exists(`${source}.SOURCE.json`)) sources[`${directory}/${basename(source)}`] = JSON.parse(await readFile(`${source}.SOURCE.json`, 'utf8'));
    }
  }
  if (!config.native.providerFiles?.some(path => basename(path).toLowerCase() === 'legacy.dll')) throw new Error('Windows requer native.providerFiles com o provider legacy.dll de OpenSSL 3 e licença adjacente.');
  await mkdir(join(stage, 'sources'), { recursive: true });
  await writeFile(join(stage, 'sources/native-dependencies.json'), `${JSON.stringify(sources, null, 2)}\n`);
  await writeFile(join(stage, 'openssl.cnf'), 'openssl_conf = openssl_init\n[openssl_init]\nproviders = provider_sect\n[provider_sect]\ndefault = default_sect\nlegacy = legacy_sect\n[default_sect]\nactivate = 1\n[legacy_sect]\nactivate = 1\n');
}
export async function buildNative(config: AcbrConfig, options: { testOnly?: boolean } = {}): Promise<BuiltRuntimeManifest> {
  if (!['linux', 'win32'].includes(process.platform) || process.arch !== 'x64') throw new Error('Build inicial suporta Linux x64 e Windows x64.');
  const lock = await verifySource(config);
  const contract = await generatedManifest(config);
  if (contract.sourceRevision !== lock.source.revision || contract.sourceHash !== lock.source.treeHash) throw new Error('Contrato gerado não corresponde às fontes travadas. Execute generate.');
  const lazarus = await findLazarus(config);
  const source = config.source.directory;
  const target = options.testOnly ? join(config.projectRoot, '.acbr/test-runtime', `${process.platform}-${process.arch}`) : runtimeDirectory(config);
  const stage = join(dirname(target), `.runtime-stage-${randomUUID()}`);
  const units = join(stage, '.units');
  await mkdir(units, { recursive: true });
  const executable = process.platform === 'win32' ? 'acbr-worker.exe' : 'acbr-worker';
  try {
    const cpu = (await runCommand(config.native.fpc, ['-iTP'])).stdout.trim();
    if (cpu !== 'x86_64') throw new Error(`FPC deve compilar x86_64, encontrado ${cpu}.`);
    const targetOs = process.platform === 'win32' ? 'win64' : 'linux';
    const fontPaths = await subdirectories(join(source, 'Fontes'));
    const lazPaths = [join(lazarus, 'components/lazutils/lib', `x86_64-${targetOs}`), join(lazarus, 'lcl/units', `x86_64-${targetOs}`), join(lazarus, 'lcl/units', `x86_64-${targetOs}`, 'nogui'), join(lazarus, 'packager/units', `x86_64-${targetOs}`)];
    const searchPaths = [dirname(config.native.project), join(config.generator.outputDir, 'native/generated'), ...fontPaths, ...lazPaths];
    const args = ['-vew', '-Mdelphi', '-Scghi', '-O2', '-g-', '-dNOGUI', '-dNOREPORT', ...(options.testOnly ? ['-dACBR_NODE_TEST'] : []), `-FU${units}`, `-FE${stage}`, `-o${executable}`,
      ...searchPaths.map(path => `-Fu${path}`), ...fontPaths.map(path => `-Fi${path}`), config.native.project];
    const responseFile = join(stage, '.compiler.rsp');
    if (args.some(arg => /[\"\r\n]/.test(arg))) throw new Error('Caminhos do build não podem conter aspas ou quebras de linha.');
    await writeFile(responseFile, args.slice(0, -1).join('\n') + '\n');
    const logPath = join(config.projectRoot, '.acbr/build.log');
    try {
      const compilation = await runCommand(config.native.fpc, [`@${responseFile}`, config.native.project], { cwd: config.projectRoot, maxOutputBytes: 32 * 1024 * 1024 });
      await writeFile(logPath, compilation.stdout + compilation.stderr);
    } catch (error) {
      const compilation = error as Error & { stdout?: string; stderr?: string };
      await writeFile(logPath, (compilation.stdout ?? '') + (compilation.stderr ?? compilation.message));
      throw new Error(`${compilation.message}\nLog completo: ${logPath}`, { cause: compilation });
    }
    const systemDependencies = process.platform === 'linux' ? await copyLinuxLibraries(stage) : (await copyExplicitLibraries(config, stage), []);
    const schemas = join(source, 'Exemplos/ACBrDFe/Schemas/NFe');
    await copyTree(schemas, join(stage, 'schemas'));
    const services = join(source, 'Fontes/ACBrDFe/ACBrNFe/ACBrNFeServicos.ini');
    await copyFile(services, join(stage, 'ACBrNFeServicos.ini'));
    await mkdir(join(stage, 'licenses'), { recursive: true });
    await copyFile(join(source, 'Doctos/LICENSE.TXT'), join(stage, 'licenses/ACBr-LICENSE.TXT'));
    await mkdir(join(stage, 'sources/native'), { recursive: true });
    await copyNativeSources(dirname(config.native.project), join(stage, 'sources/native'));
    await copyFile(join(config.generator.outputDir, 'native/generated/AcbrModels.pas'), join(stage, 'sources/native/AcbrModels.pas'));
    for (const name of ['fp-compiler-3.2.2', 'fp-units-rtl-3.2.2', 'fpc']) {
      const license = `/usr/share/doc/${name}/copyright`;
      if (await exists(license)) { await copyFile(license, join(stage, 'licenses/FPC-copyright.txt')); break; }
    }
    await copyCompilerLicenses(config, stage, lazarus);
    const archive = join(stage, 'sources/acbr-source.tar.gz');
    const tarArgs = process.platform === 'linux' ? ['--sort=name', '--mtime=@0', '--owner=0', '--group=0', '--numeric-owner', '-I', 'gzip -n'] : [];
    await runCommand('tar', [...tarArgs, process.platform === 'linux' ? '-cf' : '-czf', archive, '-C', source, 'Fontes', 'Exemplos/ACBrDFe/Schemas/NFe', 'Doctos/LICENSE.TXT']);
    await writeFile(join(stage, 'sources/build.json'), `${JSON.stringify({ sourceRevision: lock.source.revision, sourceUrl: lock.source.url, sourceTreeHash: lock.source.treeHash,
      compiler: (await runCommand(config.native.fpc, ['-iV'])).stdout.trim(), lazarusRoot: lazarus, lazarusVersion: basename(lazarus),
      compilerSourceUrl: 'https://gitlab.com/freepascal.org/fpc/source/-/tree/release_3_2_2', testOnly: options.testOnly ?? false, platform: process.platform, arch: process.arch,
      flags: ['-Mdelphi', '-Scghi', '-O2', '-dNOGUI', '-dNOREPORT'], sourceParts: lock.source.parts }, null, 2)}\n`);
    await rm(units, { recursive: true, force: true });
    await rm(responseFile, { force: true });
    if (process.platform !== 'win32') await chmod(join(stage, executable), 0o755);
    const currentGenerated = await generatedManifest(config);
    if (currentGenerated.contractHash !== contract.contractHash || currentGenerated.sourceHash !== contract.sourceHash ||
        Object.entries(contract.fileHashes).some(([name, hash]) => currentGenerated.fileHashes[name] !== hash)) throw new Error('Arquivos gerados mudaram durante a compilação. Execute build novamente.');
    const currentSource = await verifySource(config);
    if (currentSource.source.revision !== lock.source.revision || currentSource.source.treeHash !== lock.source.treeHash) throw new Error('Fontes ACBr foram atualizadas durante a compilação. Execute generate e build novamente.');
    const files = (await snapshotSource(stage)).files;
    const manifest: BuiltRuntimeManifest = { formatVersion: 1, sourceRevision: lock.source.revision, contractHash: contract.contractHash,
      platform: process.platform, arch: process.arch, executable, files, generatedFileHashes: contract.fileHashes, systemDependencies, ...(options.testOnly ? { testOnly: true } : {}) };
    await writeFile(join(stage, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    await replaceRuntime(stage, target);
    return manifest;
  } finally { await rm(stage, { recursive: true, force: true }); }
}
async function copyNativeSources(source: string, target: string): Promise<void> {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) await copyNativeSources(join(source, entry.name), join(target, entry.name));
    else if (entry.isFile() && /\.(pas|lpr|inc|lpi)$/i.test(entry.name)) await copyFile(join(source, entry.name), join(target, entry.name));
  }
}
async function copyTree(source: string, target: string): Promise<void> {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Arquivo de distribuição não pode ser link: ${entry.name}.`);
    if (entry.isDirectory()) await copyTree(join(source, entry.name), join(target, entry.name));
    else if (entry.isFile()) await copyFile(join(source, entry.name), join(target, entry.name));
  }
}
async function replaceRuntime(stage: string, target: string): Promise<void> {
  const backup = `${target}.${randomUUID()}.backup`;
  const hadTarget = await exists(target);
  if (hadTarget) await rename(target, backup);
  try { await rename(stage, target); }
  catch (error) { if (hadTarget) await rename(backup, target); throw error; }
  if (hadTarget) await rm(backup, { recursive: true, force: true });
}
export async function checkBuild(config: AcbrConfig): Promise<BuiltRuntimeManifest> {
  const lock = await verifySource(config);
  const generated = await generatedManifest(config);
  const directory = runtimeDirectory(config);
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8')) as BuiltRuntimeManifest;
  if (manifest.formatVersion !== 1 || manifest.platform !== process.platform || manifest.arch !== process.arch ||
      manifest.sourceRevision !== lock.source.revision || generated.sourceHash !== lock.source.treeHash || manifest.contractHash !== generated.contractHash ||
      !manifest.generatedFileHashes || Object.entries(generated.fileHashes).some(([name, hash]) => manifest.generatedFileHashes[name] !== hash) ||
      typeof manifest.executable !== 'string' || !manifest.files || !Object.hasOwn(manifest.files, manifest.executable)) throw new Error('Runtime diverge das fontes ou contrato. Execute build.');
  for (const [path, expected] of Object.entries(manifest.files)) {
    if (path.startsWith('/') || path.includes('\\') || path.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(expected)) throw new Error(`Caminho/hash inválido no runtime: ${path}.`);
    if (await fileHash(join(directory, path)) !== expected) throw new Error(`Hash inválido no runtime: ${path}.`);
  }
  return manifest;
}
export interface DoctorItem { name: string; ok: boolean; detail: string; }
export async function doctor(config?: AcbrConfig): Promise<DoctorItem[]> {
  const items: DoctorItem[] = [{ name: 'Node.js', ok: (Number(process.versions.node.split('.')[0]) > 22 || (Number(process.versions.node.split('.')[0]) === 22 && Number(process.versions.node.split('.')[1]) >= 12)), detail: process.versions.node }];
  for (const [name, command, args] of [['SVN', 'svn', ['--version', '--quiet']], ['Free Pascal', config?.native.fpc ?? 'fpc', ['-iV']]] as const) {
    try { const result = await runCommand(command, [...args]); items.push({ name, ok: true, detail: result.stdout.trim() }); }
    catch (error) { items.push({ name, ok: false, detail: (error as Error).message }); }
  }
  if (config) {
    try { items.push({ name: 'Lazarus', ok: true, detail: await findLazarus(config) }); }
    catch (error) { items.push({ name: 'Lazarus', ok: false, detail: (error as Error).message }); }
    try { const lock = await verifySource(config); items.push({ name: 'Fontes ACBr', ok: true, detail: `revisão ${lock.source.revision}, ${lock.source.treeHash}` }); }
    catch (error) { items.push({ name: 'Fontes ACBr', ok: false, detail: (error as Error).message }); }
  }
  if (process.platform === 'linux') {
    try { const result = await runCommand('ldconfig', ['-p']); const missing = REQUIRED_DYNAMIC.filter(name => !result.stdout.includes(name)); items.push({ name: 'OpenSSL/libxml2 dinâmicos', ok: missing.length === 0, detail: missing.length ? `Ausentes: ${missing.join(', ')}` : REQUIRED_DYNAMIC.join(', ') }); }
    catch (error) { items.push({ name: 'OpenSSL/libxml2 dinâmicos', ok: false, detail: (error as Error).message }); }
  }
  return items;
}

async function copyCompilerLicenses(config: AcbrConfig, stage: string, lazarus: string): Promise<void> {
  const packagedLazarus = fileURLToPath(new URL('../docs/licenses/lazarus/', import.meta.url));
  const packagedFpc = fileURLToPath(new URL('../docs/licenses/fpc/', import.meta.url));
  const notices: Record<string, { source: string; sha256: string }> = {};
  async function copyNotice(name: string, candidates: string[]): Promise<void> {
    for (const source of candidates) if (await exists(source)) {
      await copyFile(source, join(stage, 'licenses', name));
      notices[name] = { source, sha256: await fileHash(source) };
      return;
    }
    throw new Error(`Notice obrigatório ausente: ${name}.`);
  }
  for (const name of ['COPYING.txt', 'COPYING.LGPL.txt', 'COPYING.modifiedLGPL.txt']) {
    await copyNotice(`Lazarus-${name}`, [join(lazarus, name), join(lazarus, 'docs', name), join(packagedLazarus, name)]);
  }
  if (await exists(join(packagedLazarus, 'ORIGIN.json'))) await copyFile(join(packagedLazarus, 'ORIGIN.json'), join(stage, 'licenses/Lazarus-notice-origin.json'));
  const fpcRoot = resolve(dirname(config.native.fpc), '../..');
  const sourceRoots = [join(fpcRoot, 'source'), join(lazarus, 'fpc/3.2.2/source'), '/usr/share/fpcsrc/3.2.2'];
  for (const [name, sourceRelative] of [['COPYING.GPL.txt', 'compiler/COPYING.txt'], ['COPYING.LGPL.txt', 'rtl/COPYING.txt'], ['COPYING.FPC', 'rtl/COPYING.FPC']] as const) {
    await copyNotice(`FPC-${name}`, [...sourceRoots.map(directory => join(directory, sourceRelative)), join(packagedFpc, name)]);
  }
  if (await exists(join(packagedFpc, 'ORIGIN.json'))) await copyFile(join(packagedFpc, 'ORIGIN.json'), join(stage, 'licenses/FPC-notice-origin.json'));
  const candidates = [join(fpcRoot, 'doc'), fpcRoot, join(lazarus, 'fpc'), '/usr/share/doc/fp-compiler-3.2.2', '/usr/share/doc/fp-units-rtl-3.2.2'];
  for (const directory of candidates) {
    if (!(await exists(directory))) continue;
    for (const name of await readdir(directory)) {
      if (/^(?:copying|license|copyright)/i.test(name) && (await stat(join(directory, name))).isFile()) await copyFile(join(directory, name), join(stage, 'licenses', `FPC-${basename(directory)}-${name}`));
    }
  }
  await writeFile(join(stage, 'licenses/toolchain-notices.json'), `${JSON.stringify(notices, null, 2)}\n`);
}
