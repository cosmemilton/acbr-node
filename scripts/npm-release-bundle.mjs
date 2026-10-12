import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFile, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRuntime, auditMainInventory, GENERATED_FILES, assertGeneratedHashes, sha256 } from './audit-release.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = 'https://registry.npmjs.org';
const packageNames = ['cosmemilton-acbr-node-linux-x64', 'cosmemilton-acbr-node-win32-x64', 'cosmemilton-acbr-node'];
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const hashPattern = /^[a-f0-9]{64}$/;
const repository = 'git+https://github.com/cosmemilton/acbr-node.git';
const homepage = 'https://miltonjunior.dev.br/acbr-node/';

export function assertApprovedManifest(manifest) {
  if (manifest.formatVersion !== 1 || !versionPattern.test(manifest.version) ||
      manifest.baseUrl !== `${homepage}releases/${manifest.version}/` ||
      !Array.isArray(manifest.artifacts) || manifest.artifacts.length !== 3) throw Error('Manifesto de publicação inválido.');
  assertGeneratedHashes(manifest.generated?.fileHashes);
  for (const [index, name] of packageNames.entries()) {
    const entry = manifest.artifacts[index];
    if (entry.name !== name || entry.file !== `${name.replace(/^@/, '').replace('/', '-')}-${manifest.version}.tgz` ||
        !hashPattern.test(entry.sha256) || !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || entry.bytes > 200 * 1024 * 1024) throw Error('Identidade/hash de tarball inválido.');
  }
  if (!hashPattern.test(manifest.validationSha256) || !hashPattern.test(manifest.checksumsSha256)) throw Error('Hashes de validação ausentes.');
  return manifest;
}

export function assertRegistryMatches(dist, data, name) {
  const integrity = `sha512-${createHash('sha512').update(data).digest('base64')}`;
  const shasum = createHash('sha1').update(data).digest('hex');
  if ((!dist?.integrity && !dist?.shasum) ||
      (dist.integrity && dist.integrity !== integrity) || (dist.shasum && dist.shasum !== shasum)) {
    throw Error(`A versão já publicada diverge do tarball aprovado: ${name}`);
  }
}

function npmErrorCode(result) {
  return /(?:^|\n)npm (?:ERR!|error) code ([A-Z0-9_]+)(?:\r?\n|$)/.exec(result.stderr ?? '')?.[1];
}

export function classifyNpmError(result) {
  const stderr = result.stderr ?? '';
  if (/\bE_STAGE_REQUIRED\b/.test(stderr)) return 'stage-required';
  if (/scope not found/i.test(stderr)) return 'scope-not-found';
  if (/(?:permission|not allowed|unauthorized|access denied)/i.test(stderr)) return 'access-denied';
  if (/(?:2fa|two-factor|one-time|otp)/i.test(stderr)) return 'two-factor-required';
  if (npmErrorCode(result) === 'E404') return 'check-scope-and-token';
  return undefined;
}

export function safeNpmError(result) {
  const code = npmErrorCode(result);
  const detail = code ? `, ${code}` : '';
  const errorCategory = result.errorCategory ?? classifyNpmError(result);
  const hints = {
    'stage-required': 'O npm exige staging e aprovação do mantenedor com 2FA.',
    'scope-not-found': 'Confira se o nome do pacote pertence à conta npm autenticada.',
    'access-denied': 'Confira se o NPM_TOKEN permite criar e publicar os três pacotes cosmemilton-acbr-node.',
    'two-factor-required': 'Confira a política de 2FA e a permissão de publicação automatizada do NPM_TOKEN.',
    'check-scope-and-token': 'Confira a conta autenticada, os nomes npm e as permissões de criação/publicação do NPM_TOKEN.',
  };
  const guidance = hints[errorCategory] ?? (['EOTP', 'E401', 'E403', 'ENEEDAUTH'].includes(code)
    ? 'Confira o secret NPM_TOKEN, as permissões dos três pacotes e a política de 2FA no npm.' : '');
  return `exit ${result.code}${detail}${errorCategory ? `, categoria ${errorCategory}` : ''}.${guidance ? ' ' + guidance : ''}`;
}

async function run(command, args, { allowFailure = false, env = process.env, cwd = root } = {}) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  // npm output is deliberately not echoed: authentication errors must not expose credentials.
  if (command === 'npm') result.errorCategory = classifyNpmError(result);
  if (result.code !== 0 && !allowFailure) throw Error(`${command} ${args[0]} falhou: ${command === 'npm' ? safeNpmError(result) : `exit ${result.code}.`}`);
  return result;
}

export async function readApprovedManifest() {
  const pointer = JSON.parse(await readFile(path.join(root, '.github/npm-release.json'), 'utf8'));
  if (!versionPattern.test(pointer.version)) throw Error('Versão de publicação inválida.');
  const directory = path.join(root, 'release', pointer.version);
  const manifest = assertApprovedManifest(JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8')));
  if (pointer.version !== manifest.version) throw Error('Versão do ponteiro diverge.');
  return { manifest, directory };
}

async function downloadBundle(directory, manifest) {
  await mkdir(directory, { recursive: true });
  for (const name of [...manifest.artifacts.map(entry => entry.file), 'SHA256SUMS', 'VALIDATION.json']) {
    const response = await fetch(manifest.baseUrl + name, { redirect: 'error', signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw Error(`Download falhou: ${name}, HTTP ${response.status}`);
    const maximum = manifest.artifacts.find(entry => entry.file === name)?.bytes ?? 1024 * 1024;
    let bytes = 0;
    const chunks = [];
    for await (const chunk of response.body) {
      bytes += chunk.length;
      if (bytes > maximum) throw Error(`Download excede tamanho aprovado: ${name}`);
      chunks.push(chunk);
    }
    await writeFile(path.join(directory, name), Buffer.concat(chunks));
    console.log(`Baixado: ${name}`);
  }
}

async function inventory(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(path.join(directory, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await inventory(directory, name));
    else if (entry.isFile()) files.push(name);
    else throw Error('Arquivo especial no pacote extraído.');
  }
  return files.sort();
}

export async function validateBundle(directory, approved = undefined) {
  const { manifest, directory: approvedDirectory } = approved ?? await readApprovedManifest();
  const validationFile = path.join(directory, 'VALIDATION.json');
  const checksumsFile = path.join(directory, 'SHA256SUMS');
  if (await sha256(validationFile) !== manifest.validationSha256 || await sha256(checksumsFile) !== manifest.checksumsSha256 ||
      !Buffer.from(await readFile(validationFile)).equals(await readFile(path.join(approvedDirectory, 'VALIDATION.json'))) ||
      !Buffer.from(await readFile(checksumsFile)).equals(await readFile(path.join(approvedDirectory, 'SHA256SUMS')))) throw Error('Relatório/checksums divergem da revisão aprovada.');
  const validation = JSON.parse(await readFile(validationFile, 'utf8'));
  const checksums = (await readFile(checksumsFile, 'utf8')).trim().split('\n').map(line => {
    const match = /^([a-f0-9]{64})  ([a-zA-Z0-9.-]+\.tgz)$/.exec(line);
    if (!match) throw Error('SHA256SUMS inválido.');
    return { sha256: match[1], file: match[2] };
  });
  if (checksums.length !== 3 || validation.version !== manifest.version || validation.publication !== 'authorized' ||
      validation.sourceRevision !== manifest.generated.sourceRevision || validation.sourceHash !== manifest.generated.sourceHash ||
      validation.contractHash !== manifest.generated.contractHash || validation.artifacts?.length !== 3) throw Error('Relatório de validação incompatível.');
  const lock = JSON.parse(await readFile(path.join(root, 'acbr.lock.json'), 'utf8'));
  if (lock.source.revision !== manifest.generated.sourceRevision || lock.source.treeHash !== manifest.generated.sourceHash) throw Error('Lock ACBr diverge da release.');
  for (const name of GENERATED_FILES.filter(name => !name.startsWith('native/'))) {
    if (await sha256(path.join(root, name)) !== manifest.generated.fileHashes[name]) throw Error('Fonte TypeScript gerada diverge da release.');
  }
  const temporary = await mkdtemp(path.join(tmpdir(), 'acbr-npm-bundle-'));
  try {
    const extracted = [];
    const prepared = [];
    for (const entry of manifest.artifacts) {
      const report = validation.artifacts.find(item => item.file === entry.file);
      const sum = checksums.filter(item => item.file === entry.file);
      const data = await readFile(path.join(directory, entry.file));
      if (data.length !== entry.bytes || createHash('sha256').update(data).digest('hex') !== entry.sha256 ||
          report?.bytes !== entry.bytes || report?.sha256 !== entry.sha256 || sum.length !== 1 || sum[0].sha256 !== entry.sha256) throw Error(`Tarball diverge da revisão: ${entry.file}`);
      const target = path.join(temporary, entry.file);
      await run('python3', [path.join(root, 'scripts/unpack-npm-tarball.py'), path.join(directory, entry.file), target]);
      const packageDirectory = path.join(target, 'package');
      const pkg = JSON.parse(await readFile(path.join(packageDirectory, 'package.json'), 'utf8'));
      const workspacePackage = JSON.parse(await readFile(path.join(root, entry.name === packageNames[2] ? 'package.json' : `packages/${entry.name.replace(/^cosmemilton-/, '')}/package.json`), 'utf8'));
      if (pkg.name !== entry.name || pkg.version !== manifest.version || pkg.license !== 'LGPL-2.1-or-later' ||
          pkg.publishConfig?.access !== 'public' || pkg.repository?.url !== repository || pkg.homepage !== homepage ||
          JSON.stringify(pkg) !== JSON.stringify(workspacePackage) || pkg.scripts?.prepublishOnly || pkg.scripts?.publish || pkg.scripts?.postpublish) throw Error(`Metadados npm incompatíveis: ${entry.name}`);
      extracted.push(packageDirectory);
      prepared.push({ ...entry, data, tarball: path.join(directory, entry.file) });
    }
    const mainDirectory = extracted[2];
    const mainPackage = JSON.parse(await readFile(path.join(mainDirectory, 'package.json'), 'utf8'));
    if (packageNames.slice(0, 2).some(name => mainPackage.optionalDependencies?.[name] !== manifest.version)) throw Error('SDK e runtimes têm versões diferentes.');
    auditMainInventory((await inventory(mainDirectory)).map(name => ({ path: name })));
    if (await sha256(path.join(mainDirectory, 'acbr.lock.json')) !== await sha256(path.join(root, 'acbr.lock.json')) ||
        await sha256(path.join(mainDirectory, 'native/generated/AcbrModels.pas')) !== manifest.generated.fileHashes['native/generated/AcbrModels.pas']) throw Error('Fontes do SDK divergem da revisão.');
    for (const name of await inventory(path.join(root, 'native'))) {
      if (/\.(pas|lpr|inc|lpi)$/i.test(name) && await sha256(path.join(mainDirectory, 'native', name)) !== await sha256(path.join(root, 'native', name))) throw Error('Fonte nativa do SDK diverge do checkout: ' + name);
    }
    for (const [index, platform] of ['linux', 'win32'].entries()) {
      await auditRuntime(mainDirectory, extracted[index], platform, manifest.version, manifest.generated, lock);
    }
    console.log(`Auditados os três tarballs ${manifest.version}; hashes, metadados, contratos, fontes e inventários conferidos.`);
    return prepared;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function registryDist(entry, version) {
  const response = await fetch(`${registry}/${encodeURIComponent(entry.name)}/${version}`, { headers: { 'cache-control': 'no-cache' }, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (response.status === 404) return null;
  if (!response.ok) throw Error(`Não foi possível consultar a versão npm: ${entry.name}, HTTP ${response.status}`);
  const metadata = await response.json();
  if (metadata.name !== entry.name || metadata.version !== version || !metadata.dist) throw Error(`Resposta npm incompatível: ${entry.name}`);
  return metadata.dist;
}

const stageIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function parseStageJson(result) {
  try { return JSON.parse(result.stdout); }
  catch { throw Error('Resposta JSON de staging npm inválida.'); }
}

function assertStageIdentity(stage, entry, version) {
  if (!stageIdPattern.test(stage?.id ?? '') || stage.packageName !== entry.name ||
      stage.version !== version || stage.tag !== 'latest' || (stage.access !== undefined && stage.access !== 'public')) {
    throw Error('Identidade/política de staging npm incompatível.');
  }
  assertRegistryMatches({ shasum: stage.shasum }, entry.data, entry.name);
}

export async function stagedArtifact(entry, version, { npm = run } = {}) {
  const list = parseStageJson(await npm('npm', ['stage', 'list', entry.name, '--json', '--registry', registry, '--loglevel', 'error']));
  if (!Array.isArray(list)) throw Error('Lista de staging npm inválida.');
  const matching = list.filter(item => item.packageName === entry.name && item.version === version);
  if (!matching.length) return null;
  if (matching.length !== 1) throw Error('Mais de um staging corresponde à versão aprovada.');
  const stage = matching[0];
  assertStageIdentity(stage, entry, version);
  const details = parseStageJson(await npm('npm', ['stage', 'view', stage.id, '--json', '--registry', registry, '--loglevel', 'error']));
  assertStageIdentity(details, entry, version);
  if (details.id !== stage.id) throw Error('O identificador de staging npm mudou.');
  const directory = await mkdtemp(path.join(tmpdir(), 'acbr-npm-stage-'));
  try {
    await npm('npm', ['stage', 'download', stage.id, '--json', '--registry', registry, '--loglevel', 'error'], { cwd: directory });
    const files = await readdir(directory, { withFileTypes: true });
    const expected = `${entry.name.replace(/^@/, '').replace('/', '-')}-${version}-${stage.id}.tgz`;
    if (files.length !== 1 || !files[0].isFile() || files[0].name !== expected) throw Error('Download de staging npm incompatível.');
    const data = await readFile(path.join(directory, expected));
    if (!data.equals(entry.data)) throw Error(`Bytes de staging divergem do tarball aprovado: ${entry.name}`);
    return { name: entry.name, version, stageId: stage.id, bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'), stagedBytesMatchApproved: true };
  } finally { await rm(directory, { recursive: true, force: true }); }
}

export async function publishBundle(entries, version, {
  npm = run, lookup = registryDist, hasToken = Boolean(process.env.NODE_AUTH_TOKEN),
  stageLookup = (entry, version) => stagedArtifact(entry, version, { npm }),
  pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
} = {}) {
  if (!hasToken) throw Error('NODE_AUTH_TOKEN ausente no passo de publicação.');
  const authentication = await npm('npm', ['whoami', '--registry', registry, '--loglevel', 'error']);
  const username = authentication.stdout?.trim();
  if (username && /^[a-z0-9_-]+$/i.test(username)) console.log(`::notice::Conta npm autenticada: ${username}`);
  const existing = [];
  const pending = [];
  const resultEntries = [];
  // Detect every published-version conflict before publishing any missing package.
  for (const entry of entries) {
    const dist = await lookup(entry, version);
    if (dist) assertRegistryMatches(dist, entry.data, entry.name);
    existing.push(Boolean(dist));
  }
  // Check every pending tarball before submitting anything else; never resubmit a staged version.
  for (const [index, entry] of entries.entries()) pending.push(existing[index] ? null : await stageLookup(entry, version));
  for (const [index, entry] of entries.entries()) {
    if (existing[index]) {
      console.log(`Já publicado com bytes idênticos: ${entry.name}@${version}`);
      resultEntries.push({ name: entry.name, version, status: 'published' }); continue;
    }
    if (pending[index]) {
      console.log(`::notice::Staging conferido, aguardando 2FA: ${entry.name}@${version}, ${pending[index].stageId}`);
      resultEntries.push({ ...pending[index], status: 'awaiting-2fa' }); continue;
    }
    const deferSdk = entry.name === packageNames[2] && resultEntries.some(item => item.status === 'awaiting-2fa');
    console.log(`${deferSdk ? 'Enviando SDK para staging' : 'Publicando'}: ${entry.name}@${version}`);
    let result = await npm('npm', deferSdk
      ? ['stage', 'publish', entry.tarball, '--access', 'public', '--ignore-scripts', '--json', '--registry', registry, '--loglevel', 'error']
      : ['publish', entry.tarball, '--access', 'public', '--ignore-scripts', '--registry', registry, '--loglevel', 'error'], { allowFailure: true });
    if (!deferSdk && classifyNpmError(result) === 'stage-required') {
      result = await npm('npm', ['stage', 'publish', entry.tarball, '--access', 'public', '--ignore-scripts', '--json', '--registry', registry, '--loglevel', 'error'], { allowFailure: true });
    }
    let dist;
    let staged;
    // The registry can take several minutes to expose an accepted new package.
    // Poll for confirmation without submitting the same version again.
    const confirmationAttempts = result.code === 0 ? 60 : 3;
    for (let attempt = 0; attempt < confirmationAttempts; attempt++) {
      if (attempt) await pause(Math.min(attempt * 1000, 10000));
      dist = await lookup(entry, version);
      if (dist) break;
      staged = await stageLookup(entry, version);
      if (staged) break;
    }
    if (staged) {
      console.log(`::notice::Staging conferido, aguardando 2FA: ${entry.name}@${version}, ${staged.stageId}`);
      resultEntries.push({ ...staged, status: 'awaiting-2fa' }); continue;
    }
    if (!dist) throw Error(`Publicação não confirmada: ${entry.name} (${safeNpmError(result)}) Reexecute para recuperar publicações parciais.`);
    assertRegistryMatches(dist, entry.data, entry.name);
    resultEntries.push({ name: entry.name, version, status: 'published' });
  }
  return { version, status: resultEntries.some(entry => entry.status === 'awaiting-2fa') ? 'awaiting-2fa' : 'published', packages: resultEntries };
}

export async function dryRunBundle(entries, version, { npm = run, lookup = registryDist } = {}) {
  const existing = [];
  for (const entry of entries) {
    const dist = await lookup(entry, version);
    if (dist) assertRegistryMatches(dist, entry.data, entry.name);
    existing.push(Boolean(dist));
  }
  for (const [index, entry] of entries.entries()) {
    if (existing[index]) {
      console.log(`Dry run dispensado para versão pública com bytes idênticos: ${entry.name}@${version}`);
      continue;
    }
    await npm('npm', ['publish', entry.tarball, '--dry-run', '--access', 'public', '--ignore-scripts', '--registry', registry, '--loglevel', 'error']);
  }
}

async function main() {
  const [mode, suppliedDirectory, ...extra] = process.argv.slice(2);
  if (!['--download', '--validate', '--dry-run', '--publish'].includes(mode) || !suppliedDirectory || extra.length) throw Error('Use --download|--validate|--dry-run|--publish DIRETÓRIO.');
  const directory = path.resolve(suppliedDirectory);
  const approved = await readApprovedManifest();
  if (mode === '--download') return downloadBundle(directory, approved.manifest);
  const entries = await validateBundle(directory, approved);
  if (mode === '--publish') {
    const result = await publishBundle(entries, approved.manifest.version);
    await writeFile(path.join(directory, 'PUBLICATION_RESULT.json'), JSON.stringify(result, null, 2) + '\n');
    if (process.env.GITHUB_STEP_SUMMARY) {
      const lines = result.packages.map(entry => `- ${entry.name}@${entry.version}: ${entry.status}${entry.stageId ? `; stage ${entry.stageId}; SHA-256 ${entry.sha256}` : ''}`);
      await appendFile(process.env.GITHUB_STEP_SUMMARY, `Resultado npm: ${result.status}\n\n${lines.join('\n')}\n`);
    }
    console.log(`Resultado npm: ${result.status}`);
    return result;
  }
  if (mode === '--dry-run') {
    await dryRunBundle(entries, approved.manifest.version);
    console.log('Dry run dos três pacotes aprovado; nenhuma publicação executada.');
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    const message = String(error.message).replace(/[\r\n]/g, ' ').slice(0, 500);
    console.error(process.env.GITHUB_ACTIONS === 'true' ? `::error::${message.replace(/%/g, '%25')}` : message);
    process.exitCode = 1;
  });
}
