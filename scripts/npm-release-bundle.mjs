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

const npmErrorCodes = new Set(['E_STAGE_REQUIRED', 'EOTP', 'E401', 'E403', 'E404', 'ENEEDAUTH',
  'EPUBLISHCONFLICT', 'EPRIVATE', 'E400', 'E409', 'E422', 'EUSAGE', 'ENOTSUP', 'ECONNRESET',
  'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'EJSONPARSE', 'EINVALIDPACKAGENAME', 'EINVALIDTAGNAME', 'EBADENGINE']);
const npmCategories = new Set(['stage-required', 'scope-not-found', 'access-denied', 'two-factor-required', 'check-scope-and-token']);
function parseNpmJson(text) {
  if (typeof text !== 'string' || text.length > 1024 * 1024) return undefined;
  try { return JSON.parse(text); } catch { return undefined; }
}
function npmErrorCode(result) {
  const code = /(?:^|\n)npm (?:ERR!|error) code ([A-Z0-9_]+)(?:\r?\n|$)/.exec(result.stderr ?? '')?.[1];
  if (npmErrorCodes.has(code)) return code;
  for (const text of [result.stdout, result.stderr]) {
    const value = parseNpmJson(text)?.error?.code;
    if (npmErrorCodes.has(value)) return value;
  }
}

export function classifyNpmError(result) {
  const stderr = result.stderr ?? '';
  const code = npmErrorCode(result);
  if (code === 'E_STAGE_REQUIRED' || /\bE_STAGE_REQUIRED\b/.test(stderr)) return 'stage-required';
  if (code === 'EOTP') return 'two-factor-required';
  if (/scope not found/i.test(stderr)) return 'scope-not-found';
  if (['E401', 'E403', 'ENEEDAUTH'].includes(code)) return 'access-denied';
  if (/(?:permission|not allowed|unauthorized|access denied)/i.test(stderr)) return 'access-denied';
  if (/(?:2fa|two-factor|one-time|otp)/i.test(stderr)) return 'two-factor-required';
  if (code === 'E404') return 'check-scope-and-token';
  return undefined;
}

export function safeNpmError(result) {
  const code = npmErrorCode(result);
  const detail = code ? `, ${code}` : '';
  const errorCategory = npmCategories.has(result.errorCategory) ? result.errorCategory : classifyNpmError(result);
  const hints = {
    'stage-required': 'O npm exige staging e aprovação do mantenedor com 2FA.',
    'scope-not-found': 'Confira se o nome do pacote pertence à conta npm autenticada.',
    'access-denied': 'Confira se o NPM_TOKEN permite criar e publicar os três pacotes cosmemilton-acbr-node.',
    'two-factor-required': 'Confira a política de 2FA e a permissão de publicação automatizada do NPM_TOKEN.',
    'check-scope-and-token': 'Confira a conta autenticada, os nomes npm e as permissões de criação/publicação do NPM_TOKEN.',
  };
  const guidance = hints[errorCategory] ?? (['EOTP', 'E401', 'E403', 'ENEEDAUTH'].includes(code)
    ? 'Confira o secret NPM_TOKEN, as permissões dos três pacotes e a política de 2FA no npm.' : '');
  const exitCode = Number.isInteger(result.code) && result.code >= 0 && result.code <= 255 ? result.code : 'desconhecido';
  return `exit ${exitCode}${detail}${errorCategory ? `, categoria ${errorCategory}` : ''}.${guidance ? ' ' + guidance : ''}`;
}

export function safeNpmDiagnostic(result, entry, version) {
  const json = parseNpmJson(result.stdout);
  const hasJson = typeof result.stdout === 'string' && result.stdout.length <= 1024 * 1024 && (() => { try { JSON.parse(result.stdout); return true; } catch { return false; } })();
  const packed = json?.[entry?.name];
  const diagnostic = {
    exitCode: Number.isInteger(result.code) && result.code >= 0 && result.code <= 255 ? result.code : null,
    outputKind: !result.stdout?.trim() ? 'empty' : json?.error ? 'json-error' : packed ? 'tarball-metadata' : hasJson ? 'json' : 'text',
  };
  const code = npmErrorCode(result), category = classifyNpmError(result);
  if (code) diagnostic.errorCode = code;
  if (category) diagnostic.errorCategory = category;
  if (packed && entry?.data) {
    const integrity = `sha512-${createHash('sha512').update(entry.data).digest('base64')}`;
    const shasum = createHash('sha1').update(entry.data).digest('hex');
    diagnostic.tarballMetadataMatches = packed.name === entry.name && packed.version === version &&
      packed.shasum === shasum && packed.integrity === integrity && packed.size === entry.data.length;
    diagnostic.stageIdPresent = stageIdPattern.test(packed.stageId ?? '');
  }
  const stderr = result.stderr ?? '';
  const hints = [];
  if (/dry[ -]run/i.test(stderr)) hints.push('dry-run-mentioned');
  if (/(?:pending|awaiting)[^\r\n]{0,40}(?:review|approval)/i.test(stderr)) hints.push('approval-mentioned');
  if (/\b(?:2fa|two-factor|one-time|otp)\b/i.test(stderr)) hints.push('two-factor-mentioned');
  if (/\b(?:staging|stage-required|E_STAGE_REQUIRED)\b/i.test(stderr)) hints.push('staging-mentioned');
  if (hints.length) diagnostic.noticeHints = hints;
  return diagnostic;
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
  onProgress = async () => {},
} = {}) {
  const outcomes = entries.map(entry => ({ name: entry.name, version, status: 'not-attempted', registryChecks: 0, stageChecks: 0 }));
  let phase = 'authentication', currentIndex = -1, diagnostic;
  const checkpoint = () => onProgress({ version, status: 'in-progress', phase, packages: outcomes });
  const checkPublic = async index => {
    const outcome = outcomes[index];
    outcome.registryChecks++;
    outcome.lastRegistryCheckAt = new Date().toISOString();
    const dist = await lookup(entries[index], version);
    if (dist) assertRegistryMatches(dist, entries[index].data, entries[index].name);
    outcome.publicVersion = dist ? 'verified' : 'absent';
    if (dist) outcome.status = 'published';
    return dist;
  };
  const checkStage = async index => {
    outcomes[index].stageChecks++;
    const stage = await stageLookup(entries[index], version);
    outcomes[index].staging = stage ? 'verified' : 'absent';
    return stage;
  };
  try {
    if (!hasToken) throw Error('NODE_AUTH_TOKEN ausente no passo de publicação.');
    await checkpoint();
    await npm('npm', ['whoami', '--registry', registry, '--loglevel', 'error']);
    phase = 'preflight';
    const existing = [], pending = [];
    // Check all public digests and pending bytes before the first submission.
    for (const [index] of entries.entries()) {
      currentIndex = index;
      existing.push(Boolean(await checkPublic(index)));
    }
    for (const [index] of entries.entries()) {
      currentIndex = index;
      pending.push(existing[index] ? null : await checkStage(index));
    }
    await checkpoint();
    for (const [index, entry] of entries.entries()) {
      currentIndex = index;
      diagnostic = undefined;
      if (existing[index]) {
        outcomes[index].status = 'published';
        console.log(`Já publicado com bytes idênticos: ${entry.name}@${version}`);
        continue;
      }
      if (pending[index]) {
        Object.assign(outcomes[index], pending[index], { status: 'awaiting-2fa' });
        console.log(`::notice::Staging conferido, aguardando 2FA: ${entry.name}@${version}, ${pending[index].stageId}`);
        continue;
      }
      const deferSdk = entry.name === packageNames[2] && outcomes.some(item => item.status === 'awaiting-2fa');
      phase = 'publication';
      outcomes[index].status = 'publication-unconfirmed';
      await checkpoint();
      console.log(`${deferSdk ? 'Enviando SDK para staging' : 'Publicando'}: ${entry.name}@${version}`);
      const publishArgs = ['publish', entry.tarball, '--access', 'public', '--ignore-scripts', '--dry-run=false', '--json', '--registry', registry, '--loglevel', 'notice'];
      let result = await npm('npm', deferSdk ? ['stage', ...publishArgs] : publishArgs, { allowFailure: true });
      if (!deferSdk && classifyNpmError(result) === 'stage-required')
        result = await npm('npm', ['stage', ...publishArgs], { allowFailure: true });
      diagnostic = safeNpmDiagnostic(result, entry, version);
      outcomes[index].npmDiagnostic = diagnostic;
      // JSON is local tarball metadata, never a publication receipt. Notices may
      // contain authentication links; only the closed diagnostic schema is logged.
      console.log(`Diagnóstico npm sanitizado: ${JSON.stringify(diagnostic)}`);
      phase = 'confirmation';
      await checkpoint();
      let dist, staged;
      // The observed 0.1.1 Linux upload became public after the former
      // ten-minute confirmation window. Keep one submission and wait longer.
      const confirmationAttempts = result.code === 0 ? 180 : 3;
      for (let attempt = 0; attempt < confirmationAttempts; attempt++) {
        if (attempt) await pause(Math.min(attempt * 1000, 10000));
        dist = await checkPublic(index);
        if (dist) break;
        staged = await checkStage(index);
        if (staged) break;
        if (attempt % 6 === 5) await checkpoint();
      }
      if (staged) {
        Object.assign(outcomes[index], staged, { status: 'awaiting-2fa' });
        await checkpoint();
        console.log(`::notice::Staging conferido, aguardando 2FA: ${entry.name}@${version}, ${staged.stageId}`);
        continue;
      }
      if (!dist) throw Error(`Publicação não confirmada: ${entry.name} (${safeNpmError(result)}) Consulte o resultado antes de qualquer nova tentativa.`);
      outcomes[index].status = 'published';
      await checkpoint();
    }
    return { version, status: outcomes.some(entry => entry.status === 'awaiting-2fa') ? 'awaiting-2fa' : 'published', packages: outcomes };
  } catch (error) {
    if (currentIndex >= 0 && outcomes[currentIndex].status === 'not-attempted')
      outcomes[currentIndex].status = ['publication', 'confirmation'].includes(phase) ? 'publication-unconfirmed' : 'blocked';
    const result = { version, status: 'failed', phase, packages: outcomes,
      error: { category: phase === 'confirmation' ? 'publication-unconfirmed' : 'publication-failed', ...diagnostic } };
    // Never relay arbitrary exception text from npm, a response, or a network
    // failure. Keep only fixed messages for known integrity failures.
    let message = `Publicação bloqueada na etapa ${phase}. Consulte o resultado sanitizado.`;
    const causeMessage = typeof error?.message === 'string' ? error.message : '';
    if (/^A versão já publicada diverge do tarball aprovado:/.test(causeMessage)) message = 'A versão consultada diverge do tarball aprovado.';
    else if (/^Bytes de staging divergem do tarball aprovado:/.test(causeMessage)) message = 'Bytes de staging divergem do tarball aprovado.';
    else if (phase === 'confirmation') message = `Publicação não confirmada. Consulte o resultado sanitizado antes de qualquer nova tentativa.`;
    const failure = new Error(message);
    failure.publicationResult = result;
    throw failure;
  }
}

export async function inspectBundle(entries, version, {
  npm = run, lookup = registryDist, hasToken = Boolean(process.env.NODE_AUTH_TOKEN),
  stageLookup = (entry, version) => stagedArtifact(entry, version, { npm }),
} = {}) {
  if (!hasToken) throw Error('NODE_AUTH_TOKEN ausente no diagnóstico autenticado.');
  await npm('npm', ['whoami', '--registry', registry, '--loglevel', 'error']);
  const npmVersion = (await npm('npm', ['--version'])).stdout?.trim();
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(npmVersion ?? '')) throw Error('Versão npm inválida no diagnóstico.');
  const dryRunConfigured = parseNpmJson((await npm('npm', ['config', 'get', 'dry-run', '--json'])).stdout);
  if (typeof dryRunConfigured !== 'boolean') throw Error('Configuração dry-run inválida no diagnóstico.');
  const packages = [];
  for (const entry of entries) {
    const dist = await lookup(entry, version);
    if (dist) assertRegistryMatches(dist, entry.data, entry.name);
    const view = await npm('npm', ['view', `${entry.name}@${version}`, '--json', '--registry', registry, '--loglevel', 'error', '--prefer-online'], { allowFailure: true });
    let authenticatedVersion = 'unconfirmed';
    if (view.code === 0) {
      const metadata = parseNpmJson(view.stdout);
      if (metadata?.name !== entry.name || metadata.version !== version) throw Error('Metadados autenticados npm incompatíveis.');
      assertRegistryMatches(metadata.dist, entry.data, entry.name);
      authenticatedVersion = 'verified';
    } else if (npmErrorCode(view) === 'E404') authenticatedVersion = 'absent';
    const stage = await stageLookup(entry, version);
    packages.push({ name: entry.name, version, publicVersion: dist ? 'verified' : 'absent', authenticatedVersion,
      staging: stage ? 'verified' : 'absent', ...(stage ? { stageId: stage.stageId } : {}), npmDiagnostic: safeNpmDiagnostic(view, entry, version) });
  }
  return { version, status: 'diagnostic-only', npmVersion, dryRunConfigured, packages };
}


const noticeHints = new Set(['dry-run-mentioned', 'approval-mentioned', 'two-factor-mentioned', 'staging-mentioned']);
function projectDiagnostic(value) {
  const safe = {};
  if (Object.hasOwn(value ?? {}, 'exitCode')) safe.exitCode = Number.isInteger(value.exitCode) && value.exitCode >= 0 && value.exitCode <= 255 ? value.exitCode : null;
  if (npmErrorCodes.has(value?.errorCode)) safe.errorCode = value.errorCode;
  if (npmCategories.has(value?.errorCategory)) safe.errorCategory = value.errorCategory;
  if (['publication-failed', 'publication-unconfirmed'].includes(value?.category)) safe.category = value.category;
  if (['empty', 'json-error', 'tarball-metadata', 'json', 'text'].includes(value?.outputKind)) safe.outputKind = value.outputKind;
  for (const key of ['tarballMetadataMatches', 'stageIdPresent']) if (typeof value?.[key] === 'boolean') safe[key] = value[key];
  if (Array.isArray(value?.noticeHints)) safe.noticeHints = [...new Set(value.noticeHints.filter(hint => noticeHints.has(hint)))];
  return safe;
}

export async function writePublicationResult(directory, result, summaryPath = process.env.GITHUB_STEP_SUMMARY) {
  if (!versionPattern.test(result?.version ?? '') || !['published', 'awaiting-2fa', 'failed', 'in-progress', 'diagnostic-only'].includes(result.status) || !Array.isArray(result.packages)) throw Error('Resultado de publicação inválido.');
  const safe = { version: result.version, status: result.status, packages: result.packages.map(entry => {
    if (!packageNames.includes(entry.name) || entry.version !== result.version) throw Error('Identidade do resultado de publicação inválida.');
    const item = { name: entry.name, version: entry.version };
    if (['published', 'awaiting-2fa', 'publication-unconfirmed', 'not-attempted', 'blocked'].includes(entry.status)) item.status = entry.status;
    for (const key of ['publicVersion', 'authenticatedVersion', 'staging']) if (['absent', 'verified', 'unconfirmed'].includes(entry[key])) item[key] = entry[key];
    for (const key of ['registryChecks', 'stageChecks']) if (Number.isInteger(entry[key]) && entry[key] >= 0 && entry[key] <= 10000) item[key] = entry[key];
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.lastRegistryCheckAt ?? '')) item.lastRegistryCheckAt = entry.lastRegistryCheckAt;
    if (stageIdPattern.test(entry.stageId ?? '') && (entry.stagedBytesMatchApproved === true || (result.status === 'diagnostic-only' && entry.staging === 'verified'))) item.stageId = entry.stageId;
    if (hashPattern.test(entry.sha256 ?? '')) item.sha256 = entry.sha256;
    if (Number.isSafeInteger(entry.bytes) && entry.bytes > 0 && entry.bytes <= 200 * 1024 * 1024) item.bytes = entry.bytes;
    if (typeof entry.stagedBytesMatchApproved === 'boolean') item.stagedBytesMatchApproved = entry.stagedBytesMatchApproved;
    if (entry.npmDiagnostic) item.npmDiagnostic = projectDiagnostic(entry.npmDiagnostic);
    return item;
  }) };
  if (['authentication', 'preflight', 'publication', 'confirmation'].includes(result.phase)) safe.phase = result.phase;
  if (result.error) safe.error = projectDiagnostic(result.error);
  if (typeof result.dryRunConfigured === 'boolean') safe.dryRunConfigured = result.dryRunConfigured;
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(result.npmVersion ?? '')) safe.npmVersion = result.npmVersion;
  const filename = result.status === 'diagnostic-only' ? 'NPM_DIAGNOSTIC_RESULT.json' : 'PUBLICATION_RESULT.json';
  await writeFile(path.join(directory, filename), JSON.stringify(safe, null, 2) + '\n');
  if (summaryPath) {
    const lines = safe.packages.map(entry => `- ${entry.name}@${entry.version}: ${entry.status ?? entry.authenticatedVersion}${entry.stageId ? `; stage ${entry.stageId}` : ''}`);
    await appendFile(summaryPath, `Resultado npm: ${safe.status}${safe.phase ? `; etapa ${safe.phase}` : ''}\n\n${lines.join('\n')}\n`);
  }
  return safe;
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
  if (!['--download', '--validate', '--dry-run', '--publish', '--inspect'].includes(mode) || !suppliedDirectory || extra.length) throw Error('Use --download|--validate|--dry-run|--publish|--inspect DIRETÓRIO.');
  const directory = path.resolve(suppliedDirectory);
  const approved = await readApprovedManifest();
  if (mode === '--download') return downloadBundle(directory, approved.manifest);
  const entries = await validateBundle(directory, approved);
  if (mode === '--inspect') {
    const result = await writePublicationResult(directory, await inspectBundle(entries, approved.manifest.version));
    console.log(JSON.stringify(result));
    return result;
  }
  if (mode === '--publish') {
    try {
      const result = await writePublicationResult(directory, await publishBundle(entries, approved.manifest.version, {
        onProgress: result => writePublicationResult(directory, result, null),
      }));
      console.log(`Resultado npm: ${result.status}`);
      return result;
    } catch (error) {
      if (error.publicationResult) await writePublicationResult(directory, error.publicationResult);
      throw error;
    }
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
