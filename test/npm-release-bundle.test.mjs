import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertApprovedManifest, assertRegistryMatches, publishBundle, safeNpmError } from '../scripts/npm-release-bundle.mjs';

function manifest() {
  const names = ['@cosmemilton/acbr-node-linux-x64', '@cosmemilton/acbr-node-win32-x64', '@cosmemilton/acbr-node'];
  return {
    formatVersion: 1, version: '0.1.0', baseUrl: 'https://miltonjunior.dev.br/acbr-node/releases/0.1.0/',
    validationSha256: 'a'.repeat(64), checksumsSha256: 'b'.repeat(64),
    generated: { fileHashes: Object.fromEntries(['generated/acbr/models.ts', 'generated/acbr/index.ts', 'native/generated/AcbrModels.pas'].map(name => [name, 'c'.repeat(64)])) },
    artifacts: names.map(name => ({ name, file: `${name.slice(1).replace('/', '-')}-0.1.0.tgz`, bytes: 100, sha256: 'd'.repeat(64) })),
  };
}

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
  await publishBundle(entries, '0.1.0', { npm, lookup: async entry => published.get(entry.name) ?? null, hasToken: true });
  assert.deepEqual(calls.filter(args => args[0] === 'publish').map(args => args[1]), ['windows.tgz', 'sdk.tgz']);
  calls.length = 0;
  published.delete('windows');
  published.set('sdk', { shasum: '0'.repeat(40) });
  await assert.rejects(publishBundle(entries, '0.1.0', { npm, lookup: async entry => published.get(entry.name) ?? null, hasToken: true }), /diverge/);
  assert.equal(calls.filter(args => args[0] === 'publish').length, 0);
});

test('publication verifies delayed registry metadata without publishing twice', async () => {
  const entry = { name: 'sdk', data: Buffer.from('sdk'), tarball: 'sdk.tgz' };
  const digest = { shasum: createHash('sha1').update(entry.data).digest('hex') };
  let lookups = 0, publications = 0;
  await publishBundle([entry], '0.1.0', {
    hasToken: true, pause: async () => {},
    npm: async (command, args) => { if (args[0] === 'publish') publications++; return { code: 0 }; },
    lookup: async () => ++lookups < 4 ? null : digest,
  });
  assert.equal(publications, 1);
  assert.equal(lookups, 4);
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
    assert.equal(spawnSync('python3', ['-c', code, tarball, name, kind]).status, 0);
    const result = spawnSync('python3', ['scripts/unpack-npm-tarball.py', tarball, path.join(directory, `extract-${index}`)]);
    assert.notEqual(result.status, 0);
  }
  await assert.rejects(access(path.join(directory, 'escaped')));
});
