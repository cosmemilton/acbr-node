import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { safeNpmDiagnostic, inspectBundle, publishBundle, writePublicationResult } from '../scripts/npm-release-bundle.mjs';

const version = '9.9.9-diagnostic-test';
const registry = 'https://registry.npmjs.org';
const stageId = '1de6f3db-2ed9-4d72-b3dd-8f0e2b474a2f';
const privateValues = ['SYNTHETIC_TOKEN_NEVER_LOG', 'https://sensitive.invalid/token?otp=123456', '654321_SYNTHETIC_OTP'];
const diagnosticFields = new Set(['exitCode', 'errorCode', 'errorCategory', 'outputKind', 'tarballMetadataMatches', 'stageIdPresent', 'noticeHints', 'category']);
const noticeHints = new Set(['dry-run-mentioned', 'approval-mentioned', 'two-factor-mentioned', 'staging-mentioned']);

function entries() {
  return ['cosmemilton-acbr-node-linux-x64', 'cosmemilton-acbr-node-win32-x64', 'cosmemilton-acbr-node'].map(name => ({
    name, data: Buffer.from('APPROVED_SYNTHETIC_BYTES_' + name), tarball: name + '-SYNTHETIC_ONLY.tgz',
  }));
}
function dist(entry) {
  return { shasum: createHash('sha1').update(entry.data).digest('hex'), integrity: 'sha512-' + createHash('sha512').update(entry.data).digest('base64') };
}
function publishMetadata(entry, extra = {}) {
  return { [entry.name]: { name: entry.name, version, ...dist(entry), size: entry.data.length, ...extra } };
}
function noPrivateValues(value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  for (const privateValue of privateValues) assert.ok(!serialized.includes(privateValue), 'Only static, validated diagnostic fields may be retained.');
}
function checkDiagnostic(value) {
  assert.ok(value && typeof value === 'object');
  for (const key of Object.keys(value)) assert.ok(diagnosticFields.has(key), 'Unexpected diagnostic field: ' + key);
  if (value.category !== undefined) assert.ok(['publication-failed', 'publication-unconfirmed'].includes(value.category));
  assert.ok(value.exitCode === null || Number.isInteger(value.exitCode) && value.exitCode >= 0 && value.exitCode <= 255);
  assert.ok(['empty', 'json-error', 'tarball-metadata', 'json', 'text'].includes(value.outputKind));
  if (value.noticeHints !== undefined) {
    assert.ok(Array.isArray(value.noticeHints));
    for (const hint of value.noticeHints) assert.ok(noticeHints.has(hint));
  }
  noPrivateValues(value);
}
async function failureOf(operation) {
  let failure;
  await assert.rejects(operation, error => { failure = error; return true; });
  assert.ok(failure.publicationResult, 'A publication failure must retain its sanitized partial result.');
  noPrivateValues(failure.publicationResult);
  return failure;
}
function publicationMock({ published = new Map(), publishFirst = false } = {}) {
  const calls = [];
  const npm = async (command, args) => {
    assert.equal(command, 'npm'); calls.push(args);
    if (args[0] === 'whoami') return { code: 0, stdout: 'synthetic-reviewer' };
    assert.equal(args[0], 'publish');
    assert.ok(args.includes('--dry-run=false'), 'Publication must explicitly disable inherited dry-run configuration.');
    assert.ok(args.includes('--ignore-scripts'));
    const entry = entries().find(item => item.tarball === args[1]);
    assert.ok(entry, 'Only synthetic approved entries may be submitted to this mock.');
    if (publishFirst && entry.name.endsWith('linux-x64')) published.set(entry.name, dist(entry));
    return { code: 0, stdout: JSON.stringify(publishMetadata(entry)), stderr: privateValues.join('\n') };
  };
  return { calls, npm, published };
}

test('safe diagnostic normalizes exit codes and distinguishes valid JSON primitives from text', () => {
  const entry = entries()[0];
  for (const code of [0, 255, null, -1, 256, 1.5, '0', privateValues[0], undefined]) {
    const diagnostic = safeNpmDiagnostic({ code, stdout: '', stderr: '' }, entry, version);
    checkDiagnostic(diagnostic);
    assert.equal(diagnostic.exitCode, Number.isInteger(code) && code >= 0 && code <= 255 ? code : null);
    assert.equal(diagnostic.outputKind, 'empty');
  }
  for (const stdout of ['null', 'false', '0', '[]', '{}']) {
    const diagnostic = safeNpmDiagnostic({ code: 0, stdout, stderr: '' }, entry, version);
    checkDiagnostic(diagnostic); assert.equal(diagnostic.outputKind, 'json');
  }
  const text = safeNpmDiagnostic({ code: 0, stdout: privateValues.join(' '), stderr: '' }, entry, version);
  checkDiagnostic(text); assert.equal(text.outputKind, 'text');
});

test('JSON errors retain known codes, prioritize EOTP and discard arbitrary codes and categories', () => {
  const entry = entries()[0];
  const jsonError = safeNpmDiagnostic({ code: 1, stdout: JSON.stringify({ error: { code: 'E403', summary: privateValues[0], detail: privateValues[1] } }), stderr: '' }, entry, version);
  checkDiagnostic(jsonError); assert.equal(jsonError.outputKind, 'json-error'); assert.equal(jsonError.errorCode, 'E403');
  const otp = safeNpmDiagnostic({ code: 1, stdout: '', stderr: 'npm error code EOTP\nnpm error permission requires one-time password ' + privateValues[2] }, entry, version);
  checkDiagnostic(otp); assert.equal(otp.errorCode, 'EOTP'); assert.equal(otp.errorCategory, 'two-factor-required');
  const unknown = safeNpmDiagnostic({ code: privateValues[0], errorCategory: privateValues[1], stdout: JSON.stringify({ error: { code: privateValues[0], summary: privateValues[2] } }), stderr: 'npm error code ' + privateValues[0] + '\n' }, entry, version);
  checkDiagnostic(unknown); assert.equal(unknown.exitCode, null); assert.equal(unknown.errorCode, undefined); assert.equal(unknown.errorCategory, undefined);
  const notices = safeNpmDiagnostic({ code: 0, stdout: '', stderr: 'npm notice dry-run; pending approval; two-factor; staging ' + privateValues.join(' ') }, entry, version);
  checkDiagnostic(notices); assert.deepEqual([...notices.noticeHints].sort(), [...noticeHints].sort());
});

test('tarball metadata is only compared and never echoed or treated as publication proof', () => {
  const entry = entries()[0];
  const baseline = safeNpmDiagnostic({ code: 0, stdout: JSON.stringify(publishMetadata(entry, { stageId })), stderr: privateValues[0] }, entry, version);
  checkDiagnostic(baseline); assert.equal(baseline.outputKind, 'tarball-metadata'); assert.equal(baseline.tarballMetadataMatches, true); assert.equal(baseline.stageIdPresent, true);
  assert.ok(!JSON.stringify(baseline).includes(stageId)); assert.ok(!JSON.stringify(baseline).includes(dist(entry).shasum));
  for (const change of [{ name: privateValues[0] }, { version: '9.9.8' }, { shasum: '0'.repeat(40) }, { integrity: 'sha512-' + Buffer.from(privateValues[0]).toString('base64') }, { size: entry.data.length + 1 }]) {
    const diagnostic = safeNpmDiagnostic({ code: 0, stdout: JSON.stringify(publishMetadata(entry, change)), stderr: '' }, entry, version);
    checkDiagnostic(diagnostic); assert.equal(diagnostic.tarballMetadataMatches, false);
  }
});

test('inspectBundle checks public, authenticated and staging evidence without any submission', async () => {
  const reviewed = entries(), calls = [];
  const npm = async (command, args) => {
    assert.equal(command, 'npm'); calls.push(args);
    assert.ok(!args.includes('publish') && !args.includes('approve') && !args.includes('login') && !args.includes('install'));
    if (args[0] === 'whoami') return { code: 0, stdout: 'synthetic-reviewer' };
    if (args[0] === '--version') return { code: 0, stdout: '11.19.0\n' };
    if (args[0] === 'config') { assert.deepEqual(args.slice(0, 4), ['config', 'get', 'dry-run', '--json']); return { code: 0, stdout: 'true' }; }
    assert.equal(args[0], 'view'); assert.ok(args.includes('--json')); assert.ok(args.includes('--prefer-online'));
    assert.equal(args[args.indexOf('--registry') + 1], registry);
    const index = reviewed.findIndex(entry => args[1] === entry.name + '@' + version); assert.notEqual(index, -1);
    if (index === 0) return { code: 0, stdout: JSON.stringify({ name: reviewed[0].name, version, dist: dist(reviewed[0]) }) };
    if (index === 1) return { code: 1, stdout: '', stderr: 'npm error code E404\n' + privateValues[0] };
    return { code: 1, stdout: '', stderr: 'npm error code E403\n' + privateValues[1] };
  };
  const result = await inspectBundle(reviewed, version, { hasToken: true, npm,
    lookup: async entry => entry === reviewed[1] ? dist(entry) : null,
    stageLookup: async entry => entry === reviewed[2] ? { name: entry.name, version, stageId, bytes: entry.data.length, sha256: createHash('sha256').update(entry.data).digest('hex'), stagedBytesMatchApproved: true } : null,
  });
  assert.equal(result.status, 'diagnostic-only'); assert.equal(result.version, version); assert.equal(result.dryRunConfigured, true); assert.equal(result.npmVersion, '11.19.0');
  assert.deepEqual(result.packages.map(entry => entry.publicVersion), ['absent', 'verified', 'absent']);
  assert.deepEqual(result.packages.map(entry => entry.authenticatedVersion), ['verified', 'absent', 'unconfirmed']);
  assert.deepEqual(result.packages.map(entry => entry.staging), ['absent', 'absent', 'verified']);
  assert.equal(result.packages[2].stageId, stageId); noPrivateValues(result);
  assert.equal(calls.filter(args => args[0] === 'view').length, 3);
});

test('exit zero with matching tarball output and bounded empty confirmations retains an unconfirmed failure', async () => {
  const reviewed = entries(), mock = publicationMock(); let registryChecks = 0, stageChecks = 0;
  const failure = await failureOf(publishBundle(reviewed, version, { hasToken: true, npm: mock.npm, pause: async () => {},
    lookup: async () => { registryChecks++; return null; }, stageLookup: async () => { stageChecks++; return null; },
  }));
  const result = failure.publicationResult;
  assert.equal(result.status, 'failed'); assert.equal(result.phase, 'confirmation'); assert.equal(result.version, version);
  assert.deepEqual(result.packages.map(entry => entry.status), ['publication-unconfirmed', 'not-attempted', 'not-attempted']);
  assert.equal(result.error.exitCode, 0); checkDiagnostic(result.error);
  assert.equal(mock.calls.filter(args => args[0] === 'publish').length, 1);
  assert.equal(registryChecks, 183); assert.equal(stageChecks, 183);
});

test('a later confirmation failure preserves an earlier digest-confirmed publication', async () => {
  const reviewed = entries(), mock = publicationMock({ publishFirst: true });
  const failure = await failureOf(publishBundle(reviewed, version, { hasToken: true, npm: mock.npm, pause: async () => {},
    lookup: async entry => mock.published.get(entry.name) ?? null, stageLookup: async () => null,
  }));
  assert.equal(failure.publicationResult.phase, 'confirmation');
  assert.deepEqual(failure.publicationResult.packages.map(entry => entry.status), ['published', 'publication-unconfirmed', 'not-attempted']);
  assert.equal(mock.calls.filter(args => args[0] === 'publish').length, 2);
});

test('preflight digest conflict and lookup exception retain safe reports without submitting anything', async t => {
  for (const mode of ['conflict', 'lookup-error']) await t.test(mode, async () => {
    const reviewed = entries(), mock = publicationMock();
    const failure = await failureOf(publishBundle(reviewed, version, { hasToken: true, npm: mock.npm,
      lookup: async entry => {
        if (mode === 'lookup-error') throw new Error(privateValues.join(' '));
        if (entry === reviewed[0]) return dist(entry);
        return entry === reviewed[2] ? { shasum: '0'.repeat(40) } : null;
      }, stageLookup: async () => null,
    }));
    assert.equal(failure.publicationResult.phase, 'preflight'); assert.equal(failure.publicationResult.status, 'failed');
    assert.equal(mock.calls.filter(args => args[0] === 'publish').length, 0);
    assert.ok(failure.publicationResult.packages.every(entry => entry.status !== 'publication-unconfirmed'));
    if (mode === 'conflict') assert.equal(failure.publicationResult.packages[0].status, 'published');
    noPrivateValues(failure.message);
  });
});

test('failure result persistence replaces stale success and filters arbitrary fields from JSON and summary', async t => {
  const reviewed = entries(), mock = publicationMock();
  const failure = await failureOf(publishBundle(reviewed, version, { hasToken: true, npm: mock.npm, pause: async () => {}, lookup: async () => null, stageLookup: async () => null }));
  const prefix = 'acbr-npm-diagnostic-', temporaryRoot = path.resolve(tmpdir());
  const directory = await mkdtemp(path.join(temporaryRoot, prefix));
  t.after(async () => {
    const absolute = path.resolve(directory);
    assert.equal(path.dirname(absolute), temporaryRoot); assert.ok(path.basename(absolute).startsWith(prefix)); assert.equal((await lstat(absolute)).isSymbolicLink(), false);
    await rm(absolute, { recursive: true, force: true });
  });
  const resultPath = path.join(directory, 'PUBLICATION_RESULT.json'), summaryPath = path.join(directory, 'SUMMARY.txt');
  await writeFile(resultPath, JSON.stringify({ version, status: 'published', stale: true }));
  const dirty = { ...failure.publicationResult, rawStderr: privateValues[0],
    error: { ...failure.publicationResult.error, stdout: privateValues[1], errorCategory: privateValues[2] },
    packages: failure.publicationResult.packages.map(entry => ({ ...entry, arbitrary: privateValues[0] })),
  };
  await writePublicationResult(directory, dirty, summaryPath);
  const saved = JSON.parse(await readFile(resultPath, 'utf8')), summary = await readFile(summaryPath, 'utf8');
  assert.equal(saved.status, 'failed'); assert.equal(saved.phase, 'confirmation'); assert.equal(saved.stale, undefined); assert.equal(saved.rawStderr, undefined);
  assert.deepEqual(saved.packages.map(entry => entry.status), ['publication-unconfirmed', 'not-attempted', 'not-attempted']);
  assert.ok(saved.packages.every(entry => entry.arbitrary === undefined)); checkDiagnostic(saved.error);
  noPrivateValues(saved); noPrivateValues(summary); assert.match(summary, /failed/); assert.match(summary, /publication-unconfirmed/);
});

test('a sanitized checkpoint exists before submission if the process is interrupted before confirmation', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'acbr-publication-checkpoint-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const release = entries();
  let submissions = 0;
  const failure = await failureOf(publishBundle(release, version, {
    hasToken: true, lookup: async () => null, stageLookup: async () => null,
    onProgress: result => writePublicationResult(directory, result, null),
    npm: async (command, args) => {
      if (args[0] === 'whoami') return { code: 0 };
      assert.equal(args[0], 'publish'); submissions++;
      const saved = JSON.parse(await readFile(path.join(directory, 'PUBLICATION_RESULT.json'), 'utf8'));
      assert.equal(saved.status, 'in-progress'); assert.equal(saved.phase, 'publication');
      assert.deepEqual(saved.packages.map(item => item.status), ['publication-unconfirmed', 'not-attempted', 'not-attempted']);
      noPrivateValues(saved);
      throw Error(privateValues.join(' '));
    },
  }));
  assert.equal(submissions, 1); noPrivateValues(failure.message);
  const checkpoint = JSON.parse(await readFile(path.join(directory, 'PUBLICATION_RESULT.json'), 'utf8'));
  assert.equal(checkpoint.status, 'in-progress'); noPrivateValues(checkpoint);
});
