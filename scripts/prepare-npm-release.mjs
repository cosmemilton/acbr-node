import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './audit-release.mjs';
import { assertApprovedManifest } from './npm-release-bundle.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [option, authorizedOn, ...extra] = process.argv.slice(2);
if (option !== '--authorized-on' || !/^\d{4}-\d{2}-\d{2}$/.test(authorizedOn ?? '') || extra.length) {
  throw Error('Use --authorized-on AAAA-MM-DD somente após autorização para publicar os artefatos revisados.');
}
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const generated = JSON.parse(await readFile(path.join(root, '.acbr/generated/manifest.json'), 'utf8'));
const artifactDirectory = path.join(root, '.acbr/release-artifacts');
const validation = JSON.parse(await readFile(path.join(artifactDirectory, 'VALIDATION.json'), 'utf8'));
if (validation.version !== pkg.version || validation.sourceRevision !== generated.sourceRevision ||
    validation.sourceHash !== generated.sourceHash || validation.contractHash !== generated.contractHash) {
  throw Error('O relatório de testes não corresponde à versão/contrato. Valide a release antes de fixar os hashes.');
}
const artifacts = [];
for (const name of ['@cosmemilton/acbr-node-linux-x64', '@cosmemilton/acbr-node-win32-x64', pkg.name]) {
  const file = `${name.slice(1).replace('/', '-')}-${pkg.version}.tgz`;
  artifacts.push({ name, file, bytes: (await readFile(path.join(artifactDirectory, file))).length, sha256: await sha256(path.join(artifactDirectory, file)) });
}
validation.publication = 'authorized';
validation.publicationAuthorizedOn = authorizedOn;
validation.artifacts = artifacts.map(({ file, bytes, sha256 }) => ({ file, bytes, sha256 }));
const validationContent = JSON.stringify(validation, null, 2) + '\n';
const checksumsContent = artifacts.map(entry => `${entry.sha256}  ${entry.file}`).join('\n') + '\n';
await writeFile(path.join(artifactDirectory, 'VALIDATION.json'), validationContent);
await writeFile(path.join(artifactDirectory, 'SHA256SUMS'), checksumsContent);
const manifest = assertApprovedManifest({
  formatVersion: 1,
  version: pkg.version,
  baseUrl: `https://miltonjunior.dev.br/acbr-node/releases/${pkg.version}/`,
  publicationAuthorizedOn: authorizedOn,
  generated,
  artifacts,
  validationSha256: await sha256(path.join(artifactDirectory, 'VALIDATION.json')),
  checksumsSha256: await sha256(path.join(artifactDirectory, 'SHA256SUMS')),
});
const releaseDirectory = path.join(root, 'release', pkg.version);
await mkdir(releaseDirectory, { recursive: true });
await writeFile(path.join(releaseDirectory, 'VALIDATION.json'), validationContent);
await writeFile(path.join(releaseDirectory, 'SHA256SUMS'), checksumsContent);
await writeFile(path.join(releaseDirectory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(root, '.github/npm-release.json'), JSON.stringify({ version: pkg.version }, null, 2) + '\n');
console.log(`Hashes fixados para ${pkg.version}. Execute npm-release-bundle.mjs --dry-run antes de enviar os cinco assets ao servidor.`);
