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
