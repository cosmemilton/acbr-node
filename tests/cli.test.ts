import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main, parseArguments } from '../src/cli.js';
function capture() {
  let stdout = ''; let stderr = '';
  return { io: { stdout: { write(text: string) { stdout += text; } }, stderr: { write(text: string) { stderr += text; } } }, result: () => ({ stdout, stderr }) };
}
test('CLI shows help and rejects unexpected options/revisions', async () => {
  const report = capture(); assert.equal(await main(['--help'], report.io), 0); assert.match(report.result().stdout, /source update/);
  assert.throws(() => parseArguments(['build', '--force']), /desconhecida/);
  assert.throws(() => parseArguments(['source', 'update', '--revision', '12x']), /número SVN/);
  assert.throws(() => parseArguments(['init', '--config']), /obrigatório/);
});

test('global and command help are available without installed metadata or configuration', async () => {
  const dependencies = { contractRoot: join(tmpdir(), 'acbr-help-does-not-read-this-directory') };
  const global = capture(); assert.equal(await main(['help'], global.io, dependencies), 0);
  assert.match(global.result().stdout, /describe \[TARGET\]/); assert.match(global.result().stdout, /--version/);
  for (const [command, expected] of [
    [['describe'], 'acbr-node describe [TARGET]'],
    [['describe', 'TTipoNFe'], 'acbr-node describe [TARGET]'],
    [['help', 'TAG'], 'acbr-node help TAG caminho'],
    [['init'], 'acbr-node init'],
    [['source'], 'acbr-node source update'],
    [['source', 'update'], 'acbr-node source update'],
    [['source', 'lock'], 'acbr-node source lock'],
    [['generate'], 'acbr-node generate'],
    [['build'], 'acbr-node build'],
    [['check'], 'acbr-node check'],
    [['doctor'], 'acbr-node doctor'],
  ] as const) {
    const report = capture();
    assert.equal(await main([...command, '--help'], report.io, dependencies), 0);
    assert.ok(report.result().stdout.startsWith(`Uso: ${expected}`)); assert.equal(report.result().stderr, '');
  }
  const short = capture(); assert.equal(await main(['describe', '-h'], short.io, dependencies), 0);
  assert.match(short.result().stdout, /contrato instalado/);
});
test('CLI init writes JSON output and refuses a second init', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-cli-'));
  try {
    const config = join(directory, 'acbr.config.json');
    const first = capture(); assert.equal(await main(['init', '--config', config, '--revision', '48590', '--json'], first.io), 0);
    assert.equal(JSON.parse(first.result().stdout).configPath, config);
    await access(join(directory, 'native/acbr-worker.lpr'));
    await access(join(directory, 'tools/extract-model.lpr'));
    const second = capture(); assert.equal(await main(['init', '--config', config], second.io), 1); assert.match(second.result().stderr, /EEXIST/);
    const invalid = capture(); assert.equal(await main(['build', '--config', config, '--revision', '48590'], invalid.io), 1); assert.match(invalid.result().stderr, /somente em init e source/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('CLI init preserves native custom source and does not leave configuration on collision', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'acbr-init-preserve-'));
  try {
    await mkdir(join(directory, 'native'));
    const worker = join(directory, 'native/acbr-worker.lpr');
    await writeFile(worker, 'program user_worker; begin end.');
    const config = join(directory, 'acbr.config.json');
    const report = capture();
    assert.equal(await main(['init', '--config', config], report.io), 1);
    assert.match(report.result().stderr, /arquivo existente divergente/);
    assert.equal(await readFile(worker, 'utf8'), 'program user_worker; begin end.');
    await assert.rejects(access(config), /ENOENT/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
