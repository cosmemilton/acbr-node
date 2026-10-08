import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultConfig, parseConfig, loadConfig } from '../src/config.js';
import { lockExistingSource, snapshotSource, verifySource, updateSource } from '../src/source.js';

test('source lock detects changed, added and removed files before build/update', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-source-'));
  try {
    const config = parseConfig(defaultConfig(), join(directory, 'acbr.config.json'));
    await mkdir(join(config.source.directory, 'Fontes'), { recursive: true });
    await writeFile(join(config.source.directory, 'Fontes/model.pas'), 'unit model;');
    const lock = await lockExistingSource(config, 48590);
    assert.equal((await verifySource(config)).source.treeHash, lock.source.treeHash);
    await writeFile(join(config.source.directory, 'Fontes/model.pas'), 'alterado');
    await assert.rejects(verifySource(config), /model.pas/);
    await assert.rejects(updateSource(config), /divergem do lock/);
    assert.equal(await readFile(join(config.source.directory, 'Fontes/model.pas'), 'utf8'), 'alterado');
    await writeFile(join(config.source.directory, 'Fontes/model.pas'), 'unit model;');
    await writeFile(join(config.source.directory, 'extra.txt'), 'extra');
    await assert.rejects(verifySource(config), /extra.txt/);
    await rm(join(config.source.directory, 'extra.txt'));
    await rm(join(config.source.directory, 'Fontes/model.pas'));
    await assert.rejects(verifySource(config), /model.pas/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('snapshots are deterministic and reject source symlinks', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-snapshot-'));
  try {
    await writeFile(join(directory, 'b.pas'), 'b'); await writeFile(join(directory, 'a.pas'), 'a');
    const first = await snapshotSource(directory); const second = await snapshotSource(directory);
    assert.deepEqual(first, second);
    assert.deepEqual(Object.keys(first.files), ['a.pas', 'b.pas']);
    if (process.platform !== 'win32') {
      await symlink(join(directory, 'a.pas'), join(directory, 'escaped'));
      await assert.rejects(snapshotSource(directory), /link simbólico/);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('unmanaged existing sources are preserved without SVN/network operations', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-unmanaged-'));
  try {
    const config = parseConfig(defaultConfig(), join(directory, 'acbr.config.json'));
    await mkdir(config.source.directory, { recursive: true });
    await writeFile(join(config.source.directory, 'important.txt'), 'preservar');
    await assert.rejects(updateSource(config), /Não foi possível ler/);
    assert.equal(await readFile(join(config.source.directory, 'important.txt'), 'utf8'), 'preservar');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('concurrent source operations and builds are refused while update owns marker', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-operation-'));
  try {
    const config = parseConfig(defaultConfig(), join(directory, 'acbr.config.json'));
    await writeFile(`${config.lockPath}.operation`, '{"pid":123}');
    await assert.rejects(updateSource(config), /Outra operação/);
    await assert.rejects(verifySource(config), /em andamento/);
    assert.equal(await readFile(`${config.lockPath}.operation`, 'utf8'), '{"pid":123}');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('explicit revision and default HEAD update persist only resolved revision with locked files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-update-revision-'));
  try {
    const raw = defaultConfig(); raw.source.revision = 48590;
    const configPath = join(directory, 'acbr.config.json');
    await writeFile(configPath, JSON.stringify(raw));
    const config = parseConfig(raw, configPath);
    const requested: string[] = [];
    const runner = async (_command: string, args: string[]) => {
      if (args[0] === 'info') {
        const target = args[args.indexOf('-r') + 1]!; requested.push(target);
        return { stdout: target === 'HEAD' ? '50123\n' : `${target}\n`, stderr: '' };
      }
      assert.equal(args[0], 'export');
      const destination = args.at(-1)!;
      if (destination.endsWith('LICENSE.TXT')) await writeFile(destination, 'license');
      else { await mkdir(destination, { recursive: true }); await writeFile(join(destination, 'fixture.pas'), 'unit fixture;'); }
      return { stdout: '', stderr: '' };
    };
    const explicit = await updateSource(config, 48591, runner);
    assert.equal(explicit.source.revision, 48591);
    assert.equal((await loadConfig(configPath)).source.revision, 48591);
    assert.equal((await verifySource(config)).source.treeHash, explicit.source.treeHash);
    const head = await updateSource(config, undefined, runner);
    assert.equal(head.source.revision, 50123);
    assert.deepEqual(requested, ['48591', 'HEAD']);
    const saved = JSON.parse(await readFile(configPath, 'utf8'));
    assert.equal(saved.source.revision, 50123);
    assert.equal(saved.source.directory, '.acbr/source');
    assert.deepEqual(saved.native, raw.native);
    assert.equal((await verifySource(await loadConfig(configPath))).source.revision, 50123);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
