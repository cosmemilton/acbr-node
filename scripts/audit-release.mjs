import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
export const GENERATED_FILES = ['generated/acbr/models.ts', 'generated/acbr/index.ts', 'native/generated/AcbrModels.pas'];
const HASH = /^[a-f0-9]{64}$/;
export async function sha256(file) { return createHash('sha256').update(await readFile(file)).digest('hex'); }
export function assertGeneratedHashes(hashes) {
  if (!hashes || typeof hashes !== 'object' || Array.isArray(hashes) || Object.keys(hashes).length !== GENERATED_FILES.length ||
      GENERATED_FILES.some(name => !Object.hasOwn(hashes, name) || !HASH.test(hashes[name]))) throw Error('Manifesto precisa dos hashes dos três arquivos gerados.');
}
export async function auditGenerated(root, generated, lock) {
  assertGeneratedHashes(generated.fileHashes);
  if (!Number.isSafeInteger(generated.sourceRevision) || !HASH.test(generated.contractHash) || generated.sourceRevision !== lock.source.revision || generated.sourceHash !== lock.source.treeHash) throw Error('Contrato e lock ACBr divergem.');
  for (const name of GENERATED_FILES) if (await sha256(path.join(root, name)) !== generated.fileHashes[name]) throw Error('Arquivo gerado alterado: ' + name);
}
async function inventory(root, prefix = '') {
  const names = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const name = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isSymbolicLink()) throw Error('Link não permitido no runtime: ' + name);
    if (entry.isDirectory()) names.push(...await inventory(root, name));
    else if (entry.isFile()) names.push(name);
    else throw Error('Arquivo não regular no runtime: ' + name);
  }
  return names.sort();
}
export async function auditRuntime(root, directory, platform, version, generated, lock) {
  const pkg = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
  const runtime = path.join(directory, 'runtime');
  const manifest = JSON.parse(await readFile(path.join(runtime, 'manifest.json'), 'utf8'));
  const build = JSON.parse(await readFile(path.join(runtime, 'sources/build.json'), 'utf8'));
  assertGeneratedHashes(manifest.generatedFileHashes);
  if (pkg.version !== version || pkg.name !== 'cosmemilton-acbr-node-' + platform + '-x64' || manifest.formatVersion !== 1 || manifest.sourceRevision !== generated.sourceRevision || manifest.contractHash !== generated.contractHash || manifest.platform !== platform || manifest.arch !== 'x64' || manifest.testOnly || build.testOnly ||
      build.sourceRevision !== generated.sourceRevision || build.sourceTreeHash !== lock.source.treeHash || GENERATED_FILES.some(name => manifest.generatedFileHashes[name] !== generated.fileHashes[name])) throw Error('Runtime incompatível, desatualizado ou destinado a testes: ' + platform);
  if (!manifest.files || typeof manifest.files !== 'object' || !Object.hasOwn(manifest.files, manifest.executable)) throw Error('Manifesto runtime não contém executável.');
  for (const [name, expected] of Object.entries(manifest.files)) {
    if (!name || path.posix.isAbsolute(name) || name.includes('\\') || name.split('/').some(part => part === '..' || part === '.' || !part) || !HASH.test(expected)) throw Error('Caminho/hash inválido no runtime: ' + name);
    const file = path.join(runtime, name);
    if (!(await lstat(file)).isFile() || await sha256(file) !== expected) throw Error('Hash inválido no runtime: ' + name);
  }
  const actual = (await inventory(runtime)).filter(name => name !== 'manifest.json');
  if (JSON.stringify(actual) !== JSON.stringify(Object.keys(manifest.files).sort())) throw Error('Runtime contém arquivos fora do manifesto.');
  const required = ['licenses/ACBr-LICENSE.TXT', 'licenses/FPC-COPYING.GPL.txt', 'licenses/FPC-COPYING.LGPL.txt', 'licenses/FPC-COPYING.FPC', 'licenses/Lazarus-COPYING.txt', 'licenses/Lazarus-COPYING.LGPL.txt', 'licenses/Lazarus-COPYING.modifiedLGPL.txt', 'licenses/toolchain-notices.json', 'sources/acbr-source.tar.gz', 'sources/build.json', 'sources/native-dependencies.json', 'ACBrNFeServicos.ini', 'openssl.cnf'];
  if (!actual.some(name => name.startsWith('schemas/'))) throw Error('Schemas ausentes.');
  if (platform === 'win32') required.push('licenses/GCC-Runtime.LICENSE', 'licenses/GCC-GPL-3.LICENSE', 'licenses/MinGW-w64.LICENSE', 'licenses/libcrypto-3-x64.dll.LICENSE', 'licenses/libssl-3-x64.dll.LICENSE', 'licenses/libxml2.dll.LICENSE', 'licenses/legacy.dll.LICENSE', 'sources/win32-x64-SOURCE.json', 'ossl-modules/legacy.dll');
  else required.push('ossl-modules/legacy.so');
  for (const name of required) if (!Object.hasOwn(manifest.files, name)) throw Error('Material correspondente/notice ausente: ' + name);
  for (const name of await inventory(path.join(root, 'native'))) {
    if (!/\.(pas|lpr|inc|lpi)$/i.test(name)) continue;
    const staged = 'sources/native/' + name;
    if (manifest.files[staged] !== await sha256(path.join(root, 'native', name))) throw Error('Fonte do motor diverge do pacote principal: ' + name);
  }
  if (platform === 'win32') {
    const provenance = JSON.parse(await readFile(path.join(runtime, 'sources/win32-x64-SOURCE.json'), 'utf8'));
    if (provenance.platform !== 'win32' || provenance.arch !== 'x64' || provenance.vcRedistributable !== false || !provenance.validation?.peImportAudit || !provenance.artifacts?.length) throw Error('Proveniência Windows incompleta.');
    for (const artifact of provenance.artifacts) {
      const name = (artifact.name === 'legacy.dll' ? 'ossl-modules/' : 'lib/') + artifact.name;
      if (manifest.files[name] !== artifact.sha256) throw Error('DLL diverge da proveniência: ' + artifact.name);
    }
  }
  return { packageName: pkg.name, manifest };
}
export function auditMainInventory(files) {
  for (const { path: name } of files) {
    if (/(?:^|\/)(?:node_modules|\.acbr|test|tests)(?:\/|$)/.test(name) || /acbr\.windows.*\.json$|\.(?:pfx|p12|key|pem|crt|o|ppu|exe|dll|so|cfg)$/i.test(name)) throw Error('Arquivo indevido no pacote principal: ' + name);
  }
  for (const required of ['native/acbr-worker.lpr', 'tools/extract-model.lpr', 'dist/cli.js', 'dist/index.js', 'dist/index.cjs', 'LICENSE', 'NOTICE']) {
    if (!files.some(file => file.path === required)) throw Error('Asset principal ausente: ' + required);
  }
}
