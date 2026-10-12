import assert from 'node:assert/strict';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Explicit local preview installation only; never publishes or starts a motor.
const [tarballArgument, directoryArgument, npmCliArgument, cacheArgument] = process.argv.slice(2);
if (!tarballArgument || !directoryArgument || !npmCliArgument || !cacheArgument) throw Error('Use: node tests/cli-help-installed.mjs TAR_DIR_TGZ NEW_DIRECTORY NPM_CLI CACHE');
const tarball = path.resolve(tarballArgument), directory = path.resolve(directoryArgument), npmCli = path.resolve(npmCliArgument), cache = path.resolve(cacheArgument);
try { await access(directory); throw Error('Destination exists; no files overwritten.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'cli-help-offline-synthetic-test', version: '0.0.0', private: true, type: 'module' }));
for (const filename of ['user-empty.npmrc', 'global-empty.npmrc']) await writeFile(path.join(directory, filename), '');
const installation = spawnSync(process.execPath, [npmCli, 'install', tarball, '--offline', '--omit=optional', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', cache,
  '--userconfig', path.join(directory, 'user-empty.npmrc'), '--globalconfig', path.join(directory, 'global-empty.npmrc'), '--loglevel', 'error'], { cwd: directory, encoding: 'utf8', timeout: 120000, windowsHide: true });
if (installation.status !== 0) throw Error(`Offline preview installation failed (exit ${installation.status}).`);
const pkgRoot = path.join(directory, 'node_modules/cosmemilton-acbr-node');
for (const platform of ['linux', 'win32']) await assert.rejects(access(path.join(directory, `node_modules/cosmemilton-acbr-node-${platform}-x64`)), { code: 'ENOENT' });
const lock = JSON.parse(await readFile(path.join(directory, 'package-lock.json'), 'utf8'));
assert.equal(lock.packages['node_modules/cosmemilton-acbr-node'].integrity, `sha512-${createHash('sha512').update(await readFile(tarball)).digest('base64')}`);
const guard = path.join(directory, 'offline-guard.mjs');
await writeFile(guard, `import cp from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import path from 'node:path';
import {syncBuiltinESMExports} from 'node:module';
const deny=()=>{throw Error('SYNTHETIC_OFFLINE_GUARD_VIOLATION');};
for(const key of ['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork'])cp[key]=deny;
http.request=deny;http.get=deny;https.request=deny;https.get=deny;net.connect=deny;net.createConnection=deny;tls.connect=deny;globalThis.fetch=deny;
const allowed=new Set(${JSON.stringify(['dist/contract.json', 'package.json', 'acbr.lock.json'].map(filename => path.resolve(pkgRoot, filename)))});
const original=fs.readFile;
fs.readFile=async(filename,...args)=>{if(!allowed.has(path.resolve(String(filename))))deny();return original(filename,...args);};
syncBuiltinESMExports();\n`);
const env = { ...process.env, NODE_OPTIONS: `--import=${pathToFileURL(guard).href}` };
const entry = path.join(pkgRoot, 'dist/cli.js');
function invoke(args) {
  const result = spawnSync(process.execPath, [entry, ...args], { cwd: directory, env, encoding: 'utf8', timeout: 15000, windowsHide: true });
  if (result.error) throw result.error;
  return result;
}
const nfe = invoke(['help', 'TAG', 'Ide.tpNF', '--json']);
assert.equal(nfe.status, 0); assert.equal(nfe.stderr, '');
const description = JSON.parse(nfe.stdout); assert.deepEqual(description.values, ['tnEntrada', 'tnSaida']);
assert.equal(description.sdkVersion, JSON.parse(await readFile(path.join(pkgRoot, 'package.json'), 'utf8')).version);
const pis = invoke(['help', 'TAG', 'Det[].Imposto.PIS.CST', '--json']); assert.equal(pis.status, 0); assert.equal(JSON.parse(pis.stdout).values.length, 33);
const ambiguous = invoke(['help', 'TAG', 'CST', '--json']); assert.equal(ambiguous.status, 1); assert.equal(JSON.parse(ambiguous.stderr).error.code, 'CAMPO_AMBIGUO');
const invalid = invoke(['help', 'TAG', 'Ide[].tpNF', '--json']); assert.equal(invalid.status, 1); assert.equal(JSON.parse(invalid.stderr).error.code, 'CAMPO_NAO_COLECAO');
const human = invoke(['help', 'TAG', 'Ide.tpNF']); assert.equal(human.status, 0); assert.match(human.stdout, /tnEntrada, tnSaida/);
const bin = process.platform === 'win32'
  ? spawnSync('cmd.exe', ['/d', '/c', 'node_modules\\.bin\\acbr-node.cmd help TAG Ide.tpNF --json'], { cwd: directory, env, encoding: 'utf8', timeout: 15000, windowsHide: true })
  : spawnSync(process.execPath, [path.join(directory, 'node_modules/.bin/acbr-node'), 'help', 'TAG', 'Ide.tpNF', '--json'], { cwd: directory, env, encoding: 'utf8', timeout: 15000 });
assert.equal(bin.status, 0); assert.deepEqual(JSON.parse(bin.stdout).values, ['tnEntrada', 'tnSaida']);
console.log(JSON.stringify({ platform: process.platform, node: process.version, sdkVersion: description.sdkVersion, sourceRevision: description.sourceRevision, contractHash: description.contractHash,
  optionalRuntimesInstalled: false, localTarballIntegrityVerified: true, checks: 6, passed: 6, cliShim: 'passed', subprocessesFromHelp: 0, networkFromHelp: 0, configOrCertificateReadsFromHelp: 0 }, null, 2));
