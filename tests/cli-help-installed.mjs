import assert from 'node:assert/strict';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Install a real tarball outside the checkout, with neither motor nor network.
const [tarballArgument, directoryArgument, npmCliArgument, cacheArgument] = process.argv.slice(2);
if (!tarballArgument || !directoryArgument || !npmCliArgument || !cacheArgument) throw Error('Use: node tests/cli-help-installed.mjs TAR_DIR_TGZ NEW_DIRECTORY NPM_CLI CACHE');
const tarball = path.resolve(tarballArgument), directory = path.resolve(directoryArgument), npmCli = path.resolve(npmCliArgument), cache = path.resolve(cacheArgument);
try { await access(directory); throw Error('Destination exists; no files overwritten.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'cli-help-offline-synthetic-test', version: '0.0.0', private: true, type: 'module' }));
for (const filename of ['user-empty.npmrc', 'global-empty.npmrc', '.npmrc']) await writeFile(path.join(directory, filename), '');
const baseEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^npm_config_/i.test(key) && !/^(NPM_TOKEN|NODE_AUTH_TOKEN|NODE_OPTIONS)$/i.test(key)));
const installArgs = [npmCli, 'install', tarball, '--offline', '--omit=optional', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', cache,
  '--userconfig', path.join(directory, 'user-empty.npmrc'), '--globalconfig', path.join(directory, 'global-empty.npmrc'), '--loglevel', 'error'];
const installStarted = new Date().toISOString();
const installation = spawnSync(process.execPath, installArgs, { cwd: directory, env: baseEnv, encoding: 'utf8', timeout: 120000, windowsHide: true });
await writeFile(path.join(directory, 'install.stdout.log'), installation.stdout ?? '');
await writeFile(path.join(directory, 'install.stderr.log'), installation.stderr ?? '');
await writeFile(path.join(directory, 'installation.json'), JSON.stringify({ command: [process.execPath, ...installArgs], cwd: directory,
  started: installStarted, finished: new Date().toISOString(), exitCode: installation.status, signal: installation.signal,
  error: installation.error?.message }, null, 2) + '\n');
if (installation.error || installation.status !== 0) throw Error(`Offline preview installation failed (exit ${installation.status}).`);
const pkgRoot = path.join(directory, 'node_modules/cosmemilton-acbr-node');
for (const platform of ['linux', 'win32']) await assert.rejects(access(path.join(directory, `node_modules/cosmemilton-acbr-node-${platform}-x64`)), { code: 'ENOENT' });
const tarballBytes = await readFile(tarball);
const integrity = `sha512-${createHash('sha512').update(tarballBytes).digest('base64')}`;
const lock = JSON.parse(await readFile(path.join(directory, 'package-lock.json'), 'utf8'));
assert.equal(lock.packages['node_modules/cosmemilton-acbr-node'].integrity, integrity);
const pkg = JSON.parse(await readFile(path.join(pkgRoot, 'package.json'), 'utf8'));
const contract = JSON.parse(await readFile(path.join(pkgRoot, 'dist/contract.json'), 'utf8'));
const types = new Map(contract.ir.types.map(type => [type.name, type]));
const root = types.get(contract.ir.root);
function fieldAt(segments) {
  let node = root, property;
  for (const segment of segments) {
    if (node.kind === 'list') node = types.get(node.item);
    property = node.properties.find(item => item.name === segment);
    assert.ok(property, `Expected generated contract field: ${segment}`);
    if (property.ref) node = types.get(property.ref);
  }
  return { property, node };
}
const nfeField = fieldAt(['Ide', 'tpNF']);
const pisField = fieldAt(['Det', 'Imposto', 'PIS', 'CST']);
const detField = fieldAt(['Det']);
const detItem = types.get(detField.node.item);
assert.equal(nfeField.node.kind, 'enum');
assert.ok(nfeField.node.values.length > 0);
const syntheticConfig = path.join(directory, 'acbr.config.json');
const syntheticCertificate = path.join(directory, 'never-read-synthetic.pfx');
const sentinel = 'SYNTHETIC_INVALID_CONFIG_OR_CERTIFICATE_MUST_NOT_BE_READ\n';
await writeFile(syntheticConfig, sentinel);
await writeFile(syntheticCertificate, sentinel);
const guard = path.join(directory, 'offline-guard.mjs');
const entry = path.join(pkgRoot, 'dist/cli.js');
const shim = path.join(directory, 'node_modules/.bin/acbr-node');
await writeFile(guard, `import cp from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import http2 from 'node:http2';
import net from 'node:net';
import tls from 'node:tls';
import dns from 'node:dns';
import dnsp from 'node:dns/promises';
import dgram from 'node:dgram';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
const receiptPath=process.env.ACBR_HELP_AUDIT_FILE;
if(!receiptPath)throw Error('Missing synthetic help audit path.');
const originalWrite=fs.writeFileSync.bind(fs);
const audit={formatVersion:1,subprocessAttempts:0,networkAttempts:0,unapprovedReadAttempts:0,filesystemMutationAttempts:0,entryReads:0,metadataReads:[]};
const canonical=value=>{const resolved=path.resolve(value instanceof URL?fileURLToPath(value):String(value));return process.platform==='win32'?resolved.toLowerCase():resolved;};
const allowed=new Set(${JSON.stringify(['dist/contract.json', 'package.json', 'acbr.lock.json'].map(filename => path.resolve(pkgRoot, filename)))}.map(canonical));
const entryPaths=new Set(${JSON.stringify([entry, shim])}.map(canonical));
const deny=kind=>{audit[kind]++;throw Error('SYNTHETIC_OFFLINE_GUARD_VIOLATION: '+kind);};
const checkRead=filename=>{if(entryPaths.has(canonical(filename))){audit.entryReads++;return;}if(!allowed.has(canonical(filename)))deny('unapprovedReadAttempts');audit.metadataReads.push(path.basename(String(filename)));};
for(const key of ['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork'])cp[key]=()=>deny('subprocessAttempts');
for(const api of [http,https])for(const key of ['request','get'])api[key]=()=>deny('networkAttempts');
http2.connect=()=>deny('networkAttempts');net.connect=()=>deny('networkAttempts');net.createConnection=()=>deny('networkAttempts');net.Socket.prototype.connect=()=>deny('networkAttempts');tls.connect=()=>deny('networkAttempts');dgram.createSocket=()=>deny('networkAttempts');globalThis.fetch=()=>deny('networkAttempts');
for(const api of [dns,dnsp])for(const key of Object.keys(api))if((key==='lookup'||key==='lookupService'||key==='reverse'||key.startsWith('resolve'))&&typeof api[key]==='function')api[key]=()=>deny('networkAttempts');
for(const api of [fs,fsp])for(const key of ['readFile','readFileSync','createReadStream','access','accessSync','stat','statSync','lstat','lstatSync','readdir','readdirSync','readlink','readlinkSync'])if(typeof api[key]==='function'){const original=api[key];api[key]=function(filename,...args){checkRead(filename);return original.call(this,filename,...args);};}
for(const api of [fs,fsp])for(const key of ['open','openSync'])if(typeof api[key]==='function'){const original=api[key];api[key]=function(filename,flags,...args){if(flags!==undefined&&flags!=='r'&&flags!=='rs'&&flags!==0)deny('filesystemMutationAttempts');checkRead(filename);return original.call(this,filename,flags,...args);};}
for(const api of [fs,fsp])for(const key of ['realpath','realpathSync'])if(typeof api[key]==='function'){const original=api[key];api[key]=function(filename,...args){if(!entryPaths.has(canonical(filename)))checkRead(filename);return original.call(this,filename,...args);};}
for(const api of [fs,fsp])for(const key of ['writeFile','writeFileSync','appendFile','appendFileSync','write','writeSync','writev','writevSync','createWriteStream','copyFile','copyFileSync','cp','cpSync','rename','renameSync','mkdir','mkdirSync','mkdtemp','mkdtempSync','rm','rmSync','rmdir','rmdirSync','unlink','unlinkSync','truncate','truncateSync','chmod','chmodSync','chown','chownSync','symlink','symlinkSync','link','linkSync','utimes','utimesSync'])if(typeof api[key]==='function')api[key]=()=>deny('filesystemMutationAttempts');
process.on('exit',()=>originalWrite(receiptPath,JSON.stringify({...audit,exitCode:process.exitCode??0},null,2)+'\\n'));
syncBuiltinESMExports();\n`);
const checks = [];
let sequence = 0;
async function invoke(name, args, validate, expectedStatus = 0, bin = false) {
  const prefix = `${String(++sequence).padStart(2, '0')}-${name}`;
  const receiptPath = path.join(directory, `${prefix}.audit.json`);
  const env = { ...baseEnv, NODE_OPTIONS: `--import=${pathToFileURL(guard).href}`, ACBR_HELP_AUDIT_FILE: receiptPath };
  const command = bin && process.platform === 'win32' ? 'cmd.exe' : process.execPath;
  const commandArgs = bin && process.platform === 'win32'
    ? ['/d', '/c', 'node_modules\\.bin\\acbr-node.cmd ' + args.join(' ')]
    : [bin ? shim : entry, ...args];
  const started = new Date().toISOString();
  const result = spawnSync(command, commandArgs, { cwd: directory, env, encoding: 'utf8', timeout: 15000, windowsHide: true });
  await writeFile(path.join(directory, `${prefix}.stdout.log`), result.stdout ?? '');
  await writeFile(path.join(directory, `${prefix}.stderr.log`), result.stderr ?? '');
  if (result.error) throw result.error;
  const audit = JSON.parse(await readFile(receiptPath, 'utf8'));
  for (const key of ['subprocessAttempts', 'networkAttempts', 'unapprovedReadAttempts', 'filesystemMutationAttempts']) assert.equal(audit[key], 0, `${name}: ${key}`);
  assert.equal(result.status, expectedStatus, `${name}: exit code; stderr=${result.stderr}`);
  assert.equal(audit.exitCode, expectedStatus, `${name}: receipt exit code`);
  if (expectedStatus === 0) assert.equal(result.stderr, '', `${name}: stderr`);
  else assert.equal(result.stdout, '', `${name}: stdout`);
  const value = await validate(result, audit);
  checks.push({ name, args, command: [command, ...commandArgs], started, finished: new Date().toISOString(), exitCode: result.status,
    audit: path.basename(receiptPath), stdout: `${prefix}.stdout.log`, stderr: `${prefix}.stderr.log`, passed: true });
  return value;
}
function json(result) { return JSON.parse(result.stdout); }
function provenance(description) {
  assert.equal(description.sdkVersion, pkg.version);
  for (const key of ['sourceRevision', 'sourceHash', 'contractHash']) assert.equal(description[key], contract[key]);
  assert.equal(description.root, contract.ir.root);
}
function failure(expected) { return result => { const value = JSON.parse(result.stderr); assert.equal(value.ok, false); assert.equal(value.error.code, expected); assert.equal(typeof value.error.message, 'string'); }; }

// Preserve the six original integration checks and the installed npm shim.
const description = await invoke('legacy-field-json', ['help', 'TAG', 'Ide.tpNF', '--json'], result => {
  const value = json(result); assert.deepEqual(value.values, nfeField.node.values); provenance(value); return value;
});
await invoke('legacy-pis-json', ['help', 'TAG', 'Det[].Imposto.PIS.CST', '--json'], result => assert.deepEqual(json(result).values, pisField.node.values));
await invoke('legacy-ambiguous', ['help', 'TAG', 'CST', '--json'], failure('CAMPO_AMBIGUO'), 1);
await invoke('legacy-invalid-collection', ['help', 'TAG', 'Ide[].tpNF', '--json'], failure('CAMPO_NAO_COLECAO'), 1);
await invoke('legacy-field-text', ['help', 'TAG', 'Ide.tpNF'], result => assert.ok(result.stdout.includes(nfeField.node.values.join(', '))));
await invoke('legacy-shim', ['help', 'TAG', 'Ide.tpNF', '--json'], result => assert.deepEqual(json(result).values, nfeField.node.values), 0, true);

await invoke('describe-field-json', ['describe', 'Ide.tpNF', '--json'], result => assert.deepEqual(json(result), description));
await invoke('describe-enum-json', ['describe', nfeField.node.name, '--json'], result => {
  const value = json(result); provenance(value); assert.equal(value.name, nfeField.node.name); assert.equal(value.pascalType, nfeField.node.name);
  assert.equal(value.kind, 'enum'); assert.equal(value.inputType, 'string'); assert.deepEqual(value.values, nfeField.node.values);
  for (const key of ['path', 'readonly', 'declaredDefault']) assert.equal(Object.hasOwn(value, key), false);
  assert.equal(description.declaredDefault, nfeField.property.declaredDefault);
});
const rootDescription = await invoke('describe-root-default', ['describe', '--json'], result => {
  const value = json(result); provenance(value); assert.equal(value.name, root.name); assert.equal(value.kind, 'object');
  assert.deepEqual(value.members.map(member => member.name), root.properties.map(property => property.name)); return value;
});
await invoke('describe-root-explicit', ['describe', root.name, '--json'], result => assert.deepEqual(json(result), rootDescription));
await invoke('describe-field-text', ['describe', 'Ide.tpNF'], result => {
  assert.ok(result.stdout.startsWith(`${contract.ir.root}.Ide.tpNF\n`));
  assert.ok(result.stdout.includes(`Valores permitidos na API: ${nfeField.node.values.join(', ')}`));
  if (nfeField.property.declaredDefault !== undefined) assert.ok(result.stdout.includes(`Padrão declarado no Pascal: ${nfeField.property.declaredDefault}`));
});
await invoke('describe-enum-text', ['describe', nfeField.node.name], result => {
  assert.ok(result.stdout.includes(`Tipo: ${nfeField.node.name} (enum; entrada string)`));
  assert.ok(result.stdout.includes(`Valores permitidos na API: ${nfeField.node.values.join(', ')}`));
  assert.equal(result.stdout.includes('Padrão declarado'), false);
});
await invoke('describe-root-text', ['describe'], result => {
  assert.ok(result.stdout.includes(`Tipo: ${root.name} (object; entrada object)`)); assert.match(result.stdout, /Campos:/);
});
await invoke('describe-nested-collection', ['describe', 'TNFe.Det[17].Imposto.PIS.CST', '--json'], result => {
  const value = json(result); assert.deepEqual(value.values, pisField.node.values); assert.equal(value.path, `${root.name}.Det[].Imposto.PIS.CST`);
});
await invoke('describe-collection', ['describe', 'Det', '--json'], result => {
  const value = json(result); assert.equal(value.kind, 'list'); assert.equal(value.inputType, 'array'); assert.equal(value.itemType, detField.node.item);
});
await invoke('describe-collection-item', ['describe', 'Det[]', '--json'], result => {
  const value = json(result); assert.equal(value.kind, 'object'); assert.equal(value.pascalType, detItem.name);
  assert.deepEqual(value.members.map(member => member.name), detItem.properties.map(property => property.name));
});
await invoke('describe-type-collection', ['describe', detField.node.name, '--json'], result => {
  const value = json(result); assert.equal(value.name, detField.node.name); assert.equal(value.kind, 'list'); assert.equal(value.itemType, detField.node.item);
});
await invoke('describe-unique-short-field', ['describe', 'tpNF', '--json'], result => assert.deepEqual(json(result), description));
for (const [name, args, expected] of [
  ['ambiguous', ['CST'], 'CAMPO_AMBIGUO'],
  ['invalid-collection', ['Ide[].tpNF'], 'CAMPO_NAO_COLECAO'],
  ['collection-selector-required', ['Det.Imposto'], 'COLECAO_REQUER_INDICE'],
  ['missing-field', ['Ide.dhEmi'], 'CAMPO_INEXISTENTE'],
  ['invalid-path', ['../config.json'], 'CAMINHO_INVALIDO'],
  ['forbidden-config', ['Ide.tpNF', '--config', 'acbr.config.json'], 'USO_INVALIDO'],
  ['forbidden-revision', ['Ide.tpNF', '--revision', '48590'], 'USO_INVALIDO'],
  ['extra-target', ['Ide.tpNF', 'TNFe'], 'USO_INVALIDO'],
  ['unknown-option', ['Ide.tpNF', '--unknown-option'], 'USO_INVALIDO'],
]) await invoke(`describe-${name}`, ['describe', ...args, '--json'], failure(expected), 1);
await invoke('legacy-case-alias', ['HeLp', 'tag', 'Ide.tpNF', '--json'], result => assert.deepEqual(json(result), description));
await invoke('global-help', ['--help'], result => { assert.match(result.stdout, /describe/); assert.match(result.stdout, /--version/); });
await invoke('global-short-help', ['-h'], result => assert.match(result.stdout, /describe/));
await invoke('implicit-global-help', [], result => assert.match(result.stdout, /describe/));
for (const args of [['describe'], ['help', 'TAG'], ['init'], ['source'], ['source', 'update'], ['source', 'lock'], ['generate'], ['build'], ['check'], ['doctor']]) {
  await invoke(`subcommand-help-${args.join('-').toLowerCase()}`, [...args, '--help'], result => {
    assert.match(result.stdout, /Uso:/); assert.ok(result.stdout.includes(`acbr-node ${args.join(' ')}`));
  });
}
await invoke('version', ['--version'], (result, audit) => {
  assert.equal(result.stdout, `acbr-node ${pkg.version}\n`); assert.deepEqual(audit.metadataReads, ['package.json']);
});
await invoke('short-version', ['-V'], result => assert.equal(result.stdout, `acbr-node ${pkg.version}\n`));
await invoke('version-json', ['--version', '--json'], result => assert.deepEqual(json(result), { version: pkg.version }));
await invoke('describe-shim', ['describe', 'Ide.tpNF', '--json'], result => assert.deepEqual(json(result), description), 0, true);
assert.equal(await readFile(syntheticConfig, 'utf8'), sentinel);
assert.equal(await readFile(syntheticCertificate, 'utf8'), sentinel);
const summary = { platform: process.platform, node: process.version, sdkVersion: pkg.version, sourceRevision: description.sourceRevision,
  sourceHash: description.sourceHash, contractHash: description.contractHash, tarball: path.basename(tarball),
  tarballSha256: createHash('sha256').update(tarballBytes).digest('hex'), tarballIntegrity: integrity,
  optionalRuntimesInstalled: false, localTarballIntegrityVerified: true, checks: checks.length, passed: checks.length,
  legacyChecks: 6, cliShim: 'passed', auditReceipts: checks.length, subprocessesFromHelp: 0, networkFromHelp: 0,
  configOrCertificateReadsFromHelp: 0, filesystemMutationsFromHelp: 0, generatedContractValuesVerified: true, results: checks };
await writeFile(path.join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
