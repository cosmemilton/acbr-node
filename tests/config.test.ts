import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultConfig, initializeConfig, loadConfig, parseConfig } from '../src/config.js';

test('relative paths resolve from config location, independent of process cwd', () => {
  const directory = join(tmpdir(), 'acbr-project', 'config');
  const config = parseConfig(defaultConfig(), join(directory, 'acbr.config.json'));
  assert.equal(config.source.directory, join(directory, '.acbr/source'));
  assert.equal(config.native.project, join(directory, 'native/acbr-worker.lpr'));
  assert.equal(config.native.fpc, 'fpc');
});
test('rejects unknown fields and unexpected SVN origins', () => {
  assert.throws(() => parseConfig({ ...defaultConfig(), typo: 1 }, '/tmp/acbr.config.json'), /desconhecido/);
  const config = defaultConfig(); config.source.url = 'https://example.invalid/acbr';
  assert.throws(() => parseConfig(config, '/tmp/acbr.config.json'), /oficial/);
  for (const invalid of [0, -1, 1.5, '123', NaN]) {
    const candidate = defaultConfig(); (candidate.source as unknown as { revision: unknown }).revision = invalid;
    assert.throws(() => parseConfig(candidate, '/tmp/acbr.config.json'), /revision/);
  }
});
test('init refuses overwriting an existing configuration', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-config-'));
  try {
    const path = join(directory, 'acbr.config.json');
    await initializeConfig(path, 48590);
    const initial = await readFile(path, 'utf8');
    await assert.rejects(initializeConfig(path), /EEXIST/);
    assert.equal(await readFile(path, 'utf8'), initial);
    assert.equal((await loadConfig(path)).source.revision, 48590);
    await writeFile(path, '{broken');
    await assert.rejects(loadConfig(path), /JSON inválido/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
