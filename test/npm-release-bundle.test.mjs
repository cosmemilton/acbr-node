import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, access, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertApprovedManifest, assertReusedArtifacts, artifactDownloadUrl, assertRegistryMatches, dryRunBundle, publishBundle, stagedArtifact, safeNpmError, inspectBundle, writePublicationResult } from '../scripts/npm-release-bundle.mjs';

const version = '0.1.0';
const stageId = '1de6f3db-2ed9-4d72-b3dd-8f0e2b474a2f';
const registry = 'https://registry.npmjs.org';
const digest = (data, algorithm = 'sha1') => createHash(algorithm).update(data).digest('hex');
const noStages = async () => null;

function releaseEntries() {
  return ['cosmemilton-acbr-node-linux-x64', 'cosmemilton-acbr-node-win32-x64', 'cosmemilton-acbr-node']
    .map(name => ({ name, data: Buffer.from('approved ' + name), tarball: path.join('/reviewed', name + '-' + version + '.tgz') }));
}

function reviewedStage(entry) {
  return { name: entry.name, version, stageId, bytes: entry.data.length,
    sha256: digest(entry.data, 'sha256'), stagedBytesMatchApproved: true };
}

function stagedNpm(entry, options = {}) {
  const stage = { id: stageId, packageName: entry.name, version, tag: 'latest', access: 'public', shasum: digest(entry.data) };
  const calls = [];
  let directory;
  const npm = async (command, args, config) => {
    assert.equal(command, 'npm');
    calls.push({ args, config });
    const operation = args[1];
    assert.deepEqual(args.slice(3), ['--json', '--registry', registry, '--loglevel', 'error']);
    if (operation === 'list') {
      assert.equal(args[2], entry.name);
      return { code: 0, stdout: options.listJson ?? JSON.stringify(options.list ?? [stage]) };
    }
    if (operation === 'view') {
      assert.equal(args[2], stageId);
      return { code: 0, stdout: options.viewJson ?? JSON.stringify(options.view ?? stage) };
    }
    assert.equal(operation, 'download');
    assert.equal(args[2], stageId);
    assert.ok(config.cwd);
    directory = config.cwd;
    const filename = options.filename ?? `${entry.name}-${version}-${stageId}.tgz`;
    await writeFile(path.join(directory, filename), options.data ?? entry.data);
    if (options.extraFile) await writeFile(path.join(directory, 'unexpected.tgz'), 'unexpected');
    return { code: 0, stdout: JSON.stringify({ [entry.name]: { name: entry.name, version, size: entry.data.length,
      filename: `${entry.name}-${version}.tgz`, shasum: digest(entry.data) } }) };
  };
  return { stage, calls, npm, get directory() { return directory; } };
}

function manifest() {
  const names = ['cosmemilton-acbr-node-linux-x64', 'cosmemilton-acbr-node-win32-x64', 'cosmemilton-acbr-node'];
  return {
    formatVersion: 1, version: '0.1.0', baseUrl: 'https://miltonjunior.dev.br/acbr-node/releases/0.1.0/',
    validationSha256: 'a'.repeat(64), checksumsSha256: 'b'.repeat(64),
    generated: { fileHashes: Object.fromEntries(['generated/acbr/models.ts', 'generated/acbr/index.ts', 'native/generated/AcbrModels.pas'].map(name => [name, 'c'.repeat(64)])) },
    artifacts: names.map(name => ({ name, file: `${name.replace(/^@/, '').replace('/', '-')}-0.1.0.tgz`, bytes: 100, sha256: 'd'.repeat(64) })),
  };
}

function sdkManifest() {
  const original = manifest();
  Object.assign(original.generated, { sourceRevision: 48590, sourceHash: 'e'.repeat(64), contractHash: 'f'.repeat(64) });
  return { original, release: { ...structuredClone(original), formatVersion: 2, releaseKind: 'sdk-only',
    version: '0.1.1', baseUrl: 'https://miltonjunior.dev.br/acbr-node/releases/0.1.1/',
    artifacts: original.artifacts.map((entry, index) => ({ ...entry,
      version: index < 2 ? original.version : '0.1.1',
      ...(index < 2 ? { reusedFrom: original.version } : { file: 'cosmemilton-acbr-node-0.1.1.tgz' }),
    })),
  } };
}

function sdkEntries() {
  return releaseEntries().map((entry, index) => ({ ...entry, version: index < 2 ? version : '0.1.1',
    ...(index < 2 ? { reusedFrom: version } : {}),
  }));
}

test('SDK-only manifest pins both unchanged runtimes to an existing approved release', async () => {
  const { original, release } = sdkManifest();
  assertApprovedManifest(release);
  await assertReusedArtifacts(release, async requested => { assert.equal(requested, version); return original; });
  for (const change of [
    value => { value.releaseKind = 'full'; },
    value => { delete value.artifacts[0].version; },
    value => { delete value.artifacts[0].reusedFrom; },
    value => { value.artifacts[1].version = value.version; },
    value => { value.artifacts[2].version = version; },
    value => { value.artifacts[2].reusedFrom = value.version; },
    value => { delete value.generated.sourceHash; },
  ]) {
    const altered = structuredClone(release); change(altered);
    assert.throws(() => assertApprovedManifest(altered));
  }
  for (const change of [
    value => { value.artifacts[0].sha256 = '0'.repeat(64); },
    value => { value.artifacts[1].bytes++; },
    value => { value.generated.contractHash = '0'.repeat(64); },
    value => { value.generated.sourceHash = '0'.repeat(64); },
    value => { value.generated.fileHashes['native/generated/AcbrModels.pas'] = '0'.repeat(64); },
  ]) {
    const altered = structuredClone(release); change(altered);
    await assert.rejects(assertReusedArtifacts(altered, async () => original), /diverge/);
  }
  await assert.rejects(assertReusedArtifacts(release, async () => ({ ...original, version: '0.0.1', baseUrl: 'https://miltonjunior.dev.br/acbr-node/releases/0.0.1/' })), /diverge|inválido/);
});

test('historical v1 approval files remain valid and cannot opt into mixed versions implicitly', async () => {
  for (const releasedVersion of ['0.2.0', '0.2.1']) {
    await assertReusedArtifacts(JSON.parse(await readFile(new URL(`../release/${releasedVersion}/manifest.json`, import.meta.url), 'utf8')));
  }
  for (const key of ['version', 'reusedFrom']) {
    const altered = manifest(); altered.artifacts[0][key] = '0.0.1';
    assert.throws(() => assertApprovedManifest(altered), /sincronizadas/);
  }
});

test('SDK-only downloads keep runtime URLs on their original version and new reports on the SDK release', () => {
  const { original, release } = sdkManifest();
  for (const entry of release.artifacts) {
    assert.equal(artifactDownloadUrl(release, entry.file),
      (entry.reusedFrom ? original.baseUrl : release.baseUrl) + entry.file);
  }
  for (const filename of ['SHA256SUMS', 'VALIDATION.json']) assert.equal(artifactDownloadUrl(release, filename), release.baseUrl + filename);
  assert.throws(() => artifactDownloadUrl(release, '../private-file'), /não aprovado/);
  for (const entry of original.artifacts) assert.equal(artifactDownloadUrl(original, entry.file), original.baseUrl + entry.file);
});

test('SDK-only publication verifies runtime versions without staging or republishing them', async () => {
  const entries = sdkEntries(), calls = [], lookups = [], stages = [];
  let sdkPublished = false;
  const result = await publishBundle(entries, '0.1.1', {
    hasToken: true,
    lookup: async (entry, requestedVersion) => {
      lookups.push([entry.name, requestedVersion]); assert.equal(requestedVersion, entry.version);
      return entry.reusedFrom || sdkPublished ? { shasum: digest(entry.data) } : null;
    },
    stageLookup: async (entry, requestedVersion) => { stages.push([entry.name, requestedVersion]); return null; },
    npm: async (command, args) => {
      calls.push(args);
      if (args[0] === 'publish') {
        const sdk = entries[2]; assert.equal(args[1], sdk.tarball); sdkPublished = true;
        return { code: 0, stdout: JSON.stringify({ [sdk.name]: { name: sdk.name, version: sdk.version,
          size: sdk.data.length, shasum: digest(sdk.data), integrity: 'sha512-' + createHash('sha512').update(sdk.data).digest('base64') } }) };
      }
      return { code: 0 };
    },
  });
  assert.equal(result.version, '0.1.1'); assert.equal(result.status, 'published');
  assert.deepEqual(result.packages.map(entry => entry.version), [version, version, '0.1.1']);
  assert.deepEqual(result.packages.slice(0, 2).map(entry => entry.reusedFrom), [version, version]);
  assert.equal(result.packages[2].npmDiagnostic.tarballMetadataMatches, true);
  assert.deepEqual(calls.map(args => args[0]), ['whoami', 'publish']);
  assert.deepEqual(stages, [[entries[2].name, '0.1.1']]);
  assert.equal(lookups.length, 4);
});

test('SDK-only dry run and publication refuse missing or changed reused runtimes before any submission', async () => {
  for (const conflicting of [false, true]) {
    const entries = sdkEntries(), calls = [];
    const options = { hasToken: true, stageLookup: noStages,
      lookup: async entry => entry === entries[0] ? conflicting ? { shasum: '0'.repeat(40) } : null : { shasum: digest(entry.data) },
      npm: async (command, args) => { calls.push(args); return { code: 0 }; },
    };
    await assert.rejects(dryRunBundle(entries, '0.1.1', options), /precisa estar publicado|diverge/);
    assert.deepEqual(calls, []);
    await assert.rejects(publishBundle(entries, '0.1.1', options));
    assert.deepEqual(calls.map(args => args[0]), ['whoami']);
  }
});

test('SDK-only dry run skips both old runtime versions and tests only the new SDK', async () => {
  const entries = sdkEntries(), calls = [];
  await dryRunBundle(entries, '0.1.1', {
    lookup: async (entry, requestedVersion) => {
      assert.equal(requestedVersion, entry.version);
      return entry.reusedFrom ? { shasum: digest(entry.data) } : null;
    },
    npm: async (command, args) => { calls.push(args); return { code: 0 }; },
  });
  assert.equal(calls.length, 1); assert.equal(calls[0][1], entries[2].tarball);
});

test('SDK-only inspection and sanitized receipt preserve each approved package version', async t => {
  const entries = sdkEntries(), calls = [], stages = [];
  const result = await inspectBundle(entries, '0.1.1', {
    hasToken: true,
    lookup: async (entry, requestedVersion) => { assert.equal(requestedVersion, entry.version); return { shasum: digest(entry.data) }; },
    stageLookup: async (entry, requestedVersion) => { stages.push(requestedVersion); return null; },
    npm: async (command, args) => {
      calls.push(args);
      if (args[0] === '--version') return { code: 0, stdout: '11.16.0' };
      if (args[0] === 'config') return { code: 0, stdout: 'false' };
      if (args[0] === 'view') {
        const entry = entries.find(item => args[1] === `${item.name}@${item.version}`);
        assert.ok(entry);
        return { code: 0, stdout: JSON.stringify({ name: entry.name, version: entry.version, dist: { shasum: digest(entry.data) } }) };
      }
      return { code: 0 };
    },
  });
  assert.deepEqual(stages, [version, version, '0.1.1']);
  const directory = await mkdtemp(path.join(tmpdir(), 'acbr-sdk-release-result-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const receipt = await writePublicationResult(directory, result, null);
  assert.deepEqual(receipt.packages.map(entry => entry.version), [version, version, '0.1.1']);
  assert.equal(receipt.packages[0].reusedFrom, version);
  const invalid = structuredClone(result); invalid.packages[2].version = version;
  await assert.rejects(writePublicationResult(directory, invalid, null), /Identidade/);
});

test('release manifest confines download origin, version, package identities and order', () => {
  assertApprovedManifest(manifest());
  for (const change of [
    value => { value.baseUrl = 'https://example.com/'; },
    value => { value.version = '../0.1.0'; },
    value => { value.artifacts.reverse(); },
    value => { value.artifacts[0].file = '../runtime.tgz'; },
    value => { value.artifacts[0].sha256 = ''; },
    value => { value.generated.fileHashes = {}; },
  ]) { const value = manifest(); change(value); assert.throws(() => assertApprovedManifest(value)); }
});

test('reruns accept identical published bytes and refuse either conflicting npm digest', () => {
  const data = Buffer.from('reviewed npm artifact');
  const dist = { integrity: 'sha512-' + createHash('sha512').update(data).digest('base64'), shasum: createHash('sha1').update(data).digest('hex') };
  assertRegistryMatches(dist, data, 'runtime');
  assertRegistryMatches({ shasum: dist.shasum }, data, 'runtime');
  assert.throws(() => assertRegistryMatches(dist, Buffer.from('changed'), 'runtime'), /diverge/);
  assert.throws(() => assertRegistryMatches({ ...dist, shasum: '0'.repeat(40) }, data, 'runtime'), /diverge/);
  assert.throws(() => assertRegistryMatches({}, data, 'runtime'), /diverge/);
});

test('dry run skips an identical public Linux package and checks only missing tarballs without scripts or authentication', async () => {
  const entries = releaseEntries();
  const lookedUp = [];
  const calls = [];
  await dryRunBundle(entries, version, {
    lookup: async (entry, requestedVersion) => {
      assert.equal(requestedVersion, version);
      lookedUp.push(entry.name);
      return entry === entries[0] ? { shasum: digest(entry.data),
        integrity: 'sha512-' + createHash('sha512').update(entry.data).digest('base64') } : null;
    },
    npm: async (command, args) => {
      assert.equal(command, 'npm');
      assert.deepEqual(lookedUp, entries.map(entry => entry.name), 'All public hashes must be checked before the first dry run.');
      calls.push(args);
      return { code: 0 };
    },
  });
  assert.deepEqual(calls, entries.slice(1).map(entry => [
    'publish', entry.tarball, '--dry-run', '--access', 'public', '--ignore-scripts', '--registry', registry, '--loglevel', 'error',
  ]));
});

test('a conflicting public SDK digest prevents every dry run including missing runtimes', async () => {
  const entries = releaseEntries();
  const calls = [];
  await assert.rejects(dryRunBundle(entries, version, {
    lookup: async entry => entry === entries[2] ? { shasum: '0'.repeat(40) } : null,
    npm: async (command, args) => { calls.push(args); return { code: 0 }; },
  }), /diverge do tarball aprovado/);
  assert.deepEqual(calls, []);
});

test('an entirely published release with identical bytes needs no npm dry run or authentication', async () => {
  const entries = releaseEntries();
  const lookedUp = [];
  const calls = [];
  await dryRunBundle(entries, version, {
    lookup: async (entry, requestedVersion) => {
      assert.equal(requestedVersion, version);
      lookedUp.push(entry.name);
      return { shasum: digest(entry.data) };
    },
    npm: async (command, args) => { calls.push(args); return { code: 0 }; },
  });
  assert.deepEqual(lookedUp, entries.map(entry => entry.name));
  assert.deepEqual(calls, []);
});

test('partial publication skips identical runtime, publishes remaining packages in order and stops on conflicts before publishing', async () => {
  const entries = ['linux', 'windows', 'sdk'].map(name => ({ name, data: Buffer.from(name), tarball: name + '.tgz' }));
  const digests = Object.fromEntries(entries.map(entry => [entry.name, { shasum: createHash('sha1').update(entry.data).digest('hex') }]));
  const published = new Map([['linux', digests.linux]]);
  const calls = [];
  const npm = async (command, args) => {
    calls.push(args);
    if (args[0] === 'publish') {
      const entry = entries.find(item => item.tarball === args[1]);
      published.set(entry.name, digests[entry.name]);
    }
    return { code: 0 };
  };
  const result = await publishBundle(entries, '0.1.0', { npm, lookup: async entry => published.get(entry.name) ?? null, stageLookup: noStages, hasToken: true });
  assert.equal(result.status, 'published');
  assert.deepEqual(calls.filter(args => args[0] === 'publish').map(args => args[1]), ['windows.tgz', 'sdk.tgz']);
  calls.length = 0;
  published.delete('windows');
  published.set('sdk', { shasum: '0'.repeat(40) });
  await assert.rejects(publishBundle(entries, '0.1.0', { npm, lookup: async entry => published.get(entry.name) ?? null, stageLookup: noStages, hasToken: true }), /diverge/);
  assert.equal(calls.filter(args => args[0] === 'publish').length, 0);
});

test('publication verifies delayed registry metadata without publishing twice', async () => {
  const entry = { name: 'sdk', data: Buffer.from('sdk'), tarball: 'sdk.tgz' };
  const digest = { shasum: createHash('sha1').update(entry.data).digest('hex') };
  let lookups = 0, publications = 0;
  const delays = [];
  const result = await publishBundle([entry], '0.1.0', {
    hasToken: true, pause: async milliseconds => { delays.push(milliseconds); }, stageLookup: noStages,
    npm: async (command, args) => { if (args[0] === 'publish') publications++; return { code: 0 }; },
    lookup: async () => ++lookups < 45 ? null : digest,
  });
  assert.equal(result.status, 'published');
  assert.equal(publications, 1);
  assert.equal(lookups, 45);
  assert.ok(delays.length > 40);
  assert.ok(delays.every(milliseconds => milliseconds > 0 && milliseconds <= 10000));
  assert.ok(delays.includes(10000));
});

test('an identical pending runtime is skipped while Windows publishes and the SDK stages its exact approved tarball', async () => {
  const entries = releaseEntries();
  const published = new Map();
  const calls = [];
  let sdkStaged = false;
  const result = await publishBundle(entries, version, {
    hasToken: true,
    lookup: async entry => published.get(entry.name) ?? null,
    stageLookup: async entry => entry === entries[0] || (entry === entries[2] && sdkStaged) ? reviewedStage(entry) : null,
    npm: async (command, args) => {
      assert.equal(command, 'npm');
      calls.push(args);
      if (args[0] === 'publish') {
        assert.equal(args[1], entries[1].tarball);
        const entry = entries[1];
        published.set(entry.name, { shasum: digest(entry.data) });
      } else if (args[0] === 'stage') {
        assert.deepEqual(args, ['stage', 'publish', entries[2].tarball, '--access', 'public', '--ignore-scripts', '--dry-run=false', '--json', '--registry', registry, '--loglevel', 'notice']);
        sdkStaged = true;
      } else assert.equal(args[0], 'whoami');
      return { code: 0 };
    },
  });
  assert.deepEqual(calls.map(args => args[0]), ['whoami', 'publish', 'stage']);
  assert.deepEqual(calls.filter(args => args[0] === 'publish').map(args => args[1]), [entries[1].tarball]);
  assert.equal(result.status, 'awaiting-2fa');
  assert.deepEqual(result.packages.map(entry => entry.status), ['awaiting-2fa', 'published', 'awaiting-2fa']);
  assert.equal(result.packages[0].sha256, digest(entries[0].data, 'sha256'));
  assert.equal(result.packages[2].sha256, digest(entries[2].data, 'sha256'));
  assert.equal(result.packages[2].stagedBytesMatchApproved, true);
});

test('metadata appearing after the former ten-minute window is confirmed without a second submission', async () => {
  const entry = { name: 'sdk', data: Buffer.from('late registry visibility'), tarball: 'sdk.tgz' };
  const dist = { shasum: digest(entry.data) };
  let checks = 0, submissions = 0;
  const result = await publishBundle([entry], version, {
    hasToken: true, pause: async () => {}, stageLookup: noStages,
    lookup: async () => ++checks < 150 ? null : dist,
    npm: async (command, args) => {
      if (args[0] === 'publish') { submissions++; assert.ok(args.includes('--dry-run=false')); }
      return { code: 0 };
    },
  });
  assert.equal(result.status, 'published');
  assert.equal(submissions, 1);
  assert.equal(checks, 150);
});

test('both pending runtimes keep the SDK out of public publication and submit only its exact approved tarball to staging', async () => {
  const entries = releaseEntries();
  const calls = [];
  let sdkStaged = false;
  const result = await publishBundle(entries, version, {
    hasToken: true,
    lookup: async () => null,
    stageLookup: async entry => entry !== entries[2] || sdkStaged ? reviewedStage(entry) : null,
    npm: async (command, args, options) => {
      assert.equal(command, 'npm');
      calls.push(args);
      if (args[0] === 'whoami') return { code: 0 };
      assert.deepEqual(args, ['stage', 'publish', entries[2].tarball, '--access', 'public', '--ignore-scripts', '--dry-run=false', '--json', '--registry', registry, '--loglevel', 'notice']);
      assert.equal(options.allowFailure, true);
      sdkStaged = true;
      return { code: 0 };
    },
  });
  assert.deepEqual(calls.map(args => args[0]), ['whoami', 'stage']);
  assert.equal(calls.some(args => args[0] === 'publish' || args.includes('approve')), false);
  assert.equal(result.status, 'awaiting-2fa');
  assert.deepEqual(result.packages.map(entry => entry.status), ['awaiting-2fa', 'awaiting-2fa', 'awaiting-2fa']);
  assert.equal(result.packages[2].sha256, digest(entries[2].data, 'sha256'));
  assert.equal(result.packages[2].stagedBytesMatchApproved, true);
});

test('a conflicting pending stage stops the preflight before publishing any missing package', async () => {
  const entries = releaseEntries();
  const calls = [];
  const npm = async (command, args) => { calls.push(args); return { code: 0 }; };
  await assert.rejects(publishBundle(entries, version, {
    hasToken: true, npm, lookup: async () => null,
    stageLookup: async entry => {
      if (entry === entries[2]) throw Error('Bytes de staging divergem do tarball aprovado: ' + entry.name);
      return null;
    },
  }), /Bytes de staging divergem/);
  assert.deepEqual(calls.map(args => args[0]), ['whoami']);
});

test('rerunning a fully staged release never republishes or approves any package', async () => {
  const entries = releaseEntries();
  for (let attempt = 0; attempt < 2; attempt++) {
    const calls = [];
    const result = await publishBundle(entries, version, {
      hasToken: true, lookup: async () => null, stageLookup: async entry => reviewedStage(entry),
      npm: async (command, args) => { calls.push(args); return { code: 0 }; },
    });
    assert.equal(result.status, 'awaiting-2fa');
    assert.equal(result.packages.length, 3);
    assert.ok(result.packages.every(entry => entry.status === 'awaiting-2fa' && entry.stagedBytesMatchApproved));
    assert.deepEqual(calls.map(args => args[0]), ['whoami']);
  }
});

test('E_STAGE_REQUIRED falls back once to staging the exact reviewed tarball with scripts disabled', async t => {
  for (const npmCode of ['E_STAGE_REQUIRED', 'E403']) {
    await t.test(npmCode, async () => {
      const entry = releaseEntries()[0];
      const calls = [];
      let staged = false;
      const result = await publishBundle([entry], version, {
        hasToken: true, lookup: async () => null,
        stageLookup: async () => staged ? reviewedStage(entry) : null,
        npm: async (command, args, options) => {
          calls.push({ args, options });
          if (args[0] === 'publish') return { code: 1, stderr: `npm error code ${npmCode}\nnpm error E_STAGE_REQUIRED: private diagnostic token=do-not-log\n` };
          if (args[0] === 'stage') { staged = true; return { code: 0 }; }
          assert.equal(args[0], 'whoami');
          return { code: 0 };
        },
      });
      assert.deepEqual(calls.map(call => call.args[0]), ['whoami', 'publish', 'stage']);
      assert.deepEqual(calls[2].args, ['stage', 'publish', entry.tarball, '--access', 'public', '--ignore-scripts', '--dry-run=false', '--json', '--registry', registry, '--loglevel', 'notice']);
      assert.equal(calls[1].options.allowFailure, true);
      assert.equal(calls[2].options.allowFailure, true);
      assert.equal(result.status, 'awaiting-2fa');
    });
  }
});

test('other npm errors never trigger a stage submission or expose their raw diagnostics', async () => {
  const entry = releaseEntries()[0];
  const calls = [];
  await assert.rejects(publishBundle([entry], version, {
    hasToken: true, lookup: async () => null, stageLookup: noStages, pause: async () => {},
    npm: async (command, args) => {
      calls.push(args);
      return args[0] === 'whoami' ? { code: 0 } : {
        code: 1, stderr: 'npm error code E403\nnpm error permission denied for stage-only token=do-not-log\n',
      };
    },
  }), error => {
    assert.match(error.message, /Publicação não confirmada/);
    assert.doesNotMatch(error.message, /do-not-log/);
    return true;
  });
  assert.deepEqual(calls.map(args => args[0]), ['whoami', 'publish']);
});

test('publish exit zero with an approved pending stage reports awaiting 2FA instead of public success', async () => {
  const entry = releaseEntries()[0];
  let publications = 0;
  const result = await publishBundle([entry], version, {
    hasToken: true, lookup: async () => null,
    stageLookup: async () => publications ? reviewedStage(entry) : null,
    npm: async (command, args) => { if (args[0] === 'publish') publications++; return { code: 0 }; },
  });
  assert.equal(publications, 1);
  assert.equal(result.status, 'awaiting-2fa');
  assert.equal(result.packages[0].status, 'awaiting-2fa');
});

test('stagedArtifact verifies the downloaded bytes independently and cleans its temporary directory', async () => {
  const entry = releaseEntries()[0];
  const mock = stagedNpm(entry);
  const result = await stagedArtifact(entry, version, { npm: mock.npm });
  assert.deepEqual(result, reviewedStage(entry));
  assert.deepEqual(mock.calls.map(call => call.args[1]), ['list', 'view', 'download']);
  await assert.rejects(access(mock.directory), { code: 'ENOENT' });
});

test('stagedArtifact accepts the official list and view shape when access is omitted', async () => {
  const entry = releaseEntries()[0];
  const stage = stagedNpm(entry).stage;
  delete stage.access;
  const mock = stagedNpm(entry, { list: [stage], view: stage });
  assert.deepEqual(await stagedArtifact(entry, version, { npm: mock.npm }), reviewedStage(entry));
  await assert.rejects(access(mock.directory), { code: 'ENOENT' });
});

test('stagedArtifact ignores unrelated versions and names without attempting a download', async () => {
  const entry = releaseEntries()[0];
  const mock = stagedNpm(entry, { list: [
    { packageName: entry.name, version: '0.0.0-stage' },
    { packageName: releaseEntries()[1].name, version },
  ] });
  assert.equal(await stagedArtifact(entry, version, { npm: mock.npm }), null);
  assert.deepEqual(mock.calls.map(call => call.args[1]), ['list']);
});

test('stagedArtifact refuses altered bytes even when list and view claim the approved digest', async () => {
  const entry = releaseEntries()[0];
  const altered = Buffer.from(entry.data);
  altered[0] ^= 1;
  const mock = stagedNpm(entry, { data: altered });
  await assert.rejects(stagedArtifact(entry, version, { npm: mock.npm }), /Bytes de staging divergem/);
  await assert.rejects(access(mock.directory), { code: 'ENOENT' });
});

test('stagedArtifact refuses changed view identity, unsafe UUID, private access, wrong tag and conflicting digest', async t => {
  const entry = releaseEntries()[0];
  for (const [label, change] of [
    ['package name', { packageName: releaseEntries()[1].name }],
    ['version', { version: '0.2.0' }],
    ['unsafe UUID', { id: '../outside' }],
    ['changed UUID', { id: 'f8e7a45b-7a5f-4f31-8e6d-9dd1c6ef38c0' }],
    ['private access', { access: 'restricted' }],
    ['wrong tag', { tag: 'private' }],
    ['conflicting digest', { shasum: '0'.repeat(40) }],
  ]) {
    await t.test(label, async () => {
      const baseline = stagedNpm(entry).stage;
      const mock = stagedNpm(entry, { view: { ...baseline, ...change } });
      await assert.rejects(stagedArtifact(entry, version, { npm: mock.npm }), /incompatível|mudou|diverge/);
      assert.deepEqual(mock.calls.map(call => call.args[1]), ['list', 'view']);
    });
  }
  const invalidList = stagedNpm(entry, { list: [{ ...stagedNpm(entry).stage, id: '../outside' }] });
  await assert.rejects(stagedArtifact(entry, version, { npm: invalidList.npm }), /incompatível/);
  assert.deepEqual(invalidList.calls.map(call => call.args[1]), ['list']);
});

test('stagedArtifact refuses duplicate candidates and invalid list or view JSON without exposing raw responses', async t => {
  const entry = releaseEntries()[0];
  const stage = stagedNpm(entry).stage;
  for (const [label, options, message] of [
    ['duplicate candidates', { list: [stage, stage] }, /Mais de um staging/],
    ['list shape', { listJson: '{}' }, /Lista de staging npm inválida/],
    ['list JSON', { listJson: 'token=do-not-log' }, /JSON de staging npm inválida/],
    ['view JSON', { viewJson: 'token=do-not-log' }, /JSON de staging npm inválida/],
  ]) {
    await t.test(label, async () => {
      const mock = stagedNpm(entry, options);
      await assert.rejects(stagedArtifact(entry, version, { npm: mock.npm }), error => {
        assert.match(error.message, message);
        assert.doesNotMatch(error.message, /do-not-log/);
        return true;
      });
      assert.ok(mock.calls.every(call => call.args[1] !== 'download'));
    });
  }
});

test('stagedArtifact refuses downloads with an unexpected filename or extra files and cleans them', async t => {
  const entry = releaseEntries()[0];
  for (const [label, options] of [
    ['unexpected filename', { filename: `${entry.name}-${version}.tgz` }],
    ['extra file', { extraFile: true }],
  ]) {
    await t.test(label, async () => {
      const mock = stagedNpm(entry, options);
      await assert.rejects(stagedArtifact(entry, version, { npm: mock.npm }), /Download de staging npm incompatível/);
      await assert.rejects(access(mock.directory), { code: 'ENOENT' });
    });
  }
});

test('npm authentication diagnostics retain only validated error codes', () => {
  const stderr = 'npm error code EOTP\nnpm error token=must-never-be-echoed\n';
  assert.match(safeNpmError({ code: 1, stderr }), /EOTP/);
  assert.doesNotMatch(safeNpmError({ code: 1, stderr }), /must-never/);
  assert.doesNotMatch(safeNpmError({ code: 1, stderr: 'npm error code token=value\n' }), /token=value/);
});

test('tarball extraction refuses traversal and symlinks before writing outside package', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'acbr-release-extraction-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const [index, [name, kind]] of [['package/../../escaped', 'file'], ['package/link', 'symlink']].entries()) {
    const tarball = path.join(directory, `hostile-${index}.tgz`);
    const code = 'import io,tarfile,sys\nwith tarfile.open(sys.argv[1],"w:gz") as t:\n m=tarfile.TarInfo(sys.argv[2])\n if sys.argv[3]=="symlink": m.type=tarfile.SYMTYPE; m.linkname="../../escaped"\n else: m.size=1\n t.addfile(m,io.BytesIO(b"x") if m.isfile() else None)';
    const python = process.platform === 'win32' ? 'python' : 'python3';
    assert.equal(spawnSync(python, ['-c', code, tarball, name, kind], { windowsHide: true }).status, 0);
    const result = spawnSync(python, ['scripts/unpack-npm-tarball.py', tarball, path.join(directory, `extract-${index}`)], { windowsHide: true });
    assert.notEqual(result.status, 0);
  }
  await assert.rejects(access(path.join(directory, 'escaped')));
});
