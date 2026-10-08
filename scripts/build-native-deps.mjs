#!/usr/bin/env node
// Build only freely available Windows x64 dependencies. Run on Linux/WSL.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sources = [
  {
    name: 'openssl', version: '3.5.9', file: 'openssl-3.5.9.tar.gz',
    url: 'https://github.com/openssl/openssl/releases/download/openssl-3.5.9/openssl-3.5.9.tar.gz',
    checksumUrl: 'https://github.com/openssl/openssl/releases/download/openssl-3.5.9/openssl-3.5.9.tar.gz.sha256',
    sha256: '603f5602e2eef00d77fbd429d34dcd5822bb301757a1bc9cdb24c670f1eb859a',
    license: 'Apache-2.0',
  },
  {
    name: 'libxml2', version: '2.15.4', file: 'libxml2-2.15.4.tar.xz',
    url: 'https://download.gnome.org/sources/libxml2/2.15/libxml2-2.15.4.tar.xz',
    checksumUrl: 'https://download.gnome.org/sources/libxml2/2.15/libxml2-2.15.4.sha256sum',
    sha256: '98087fd181d9070724f3fbc65c7377db03038eb92bd882374daff44940138821',
    license: 'MIT',
  },
];
const argumentsMap = new Map();
for (let index = 2; index < process.argv.length; index++) {
  const key = process.argv[index];
  if (key === '--resume') { argumentsMap.set(key, 'true'); continue; }
  if (key === '--help') {
    console.log('node scripts/build-native-deps.mjs [--project DIR] [--jobs N] [--resume] [--openssl-archive FILE] [--libxml2-archive FILE]\nRun on Ubuntu/WSL with gcc/g++-mingw-w64-x86-64, binutils-mingw-w64-x86-64, cmake, ninja-build, make, perl, curl, tar, xz-utils.');
    process.exit(0);
  }
  if (!['--project', '--jobs', '--openssl-archive', '--libxml2-archive'].includes(key) || !process.argv[index + 1])
    throw new Error('Unknown or incomplete option: ' + key);
  argumentsMap.set(key, process.argv[++index]);
}
if (process.platform !== 'linux') throw new Error('Run this cross compilation script on Linux/WSL.');
const projectRoot = resolve(argumentsMap.get('--project') ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
const jobs = Number(argumentsMap.get('--jobs') ?? Math.min(availableParallelism(), 12));
if (!Number.isInteger(jobs) || jobs < 1 || jobs > 64) throw new Error('--jobs must be an integer from 1 to 64.');
const depsRoot = join(projectRoot, '.acbr/deps');
const buildRoot = join(depsRoot, 'build/windows');
const sourceRoot = join(buildRoot, 'source');
const installRoot = join(buildRoot, 'install');
const downloads = join(depsRoot, 'downloads');
const output = join(depsRoot, 'win32-x64');
const staging = join(buildRoot, 'staging');
const logs = join(buildRoot, 'logs');
await Promise.all([buildRoot, sourceRoot, installRoot, downloads, staging, logs].map(path => mkdir(path, { recursive: true })));
const commands = [];
const baseEnv = { ...process.env, SOURCE_DATE_EPOCH: '0', LC_ALL: 'C', TZ: 'UTC' };
let commandNumber = 0;
async function run(command, args, { cwd = buildRoot, env = {}, quiet = true, record = true, captureAll = false } = {}) {
  const logfile = join(logs, String(++commandNumber).padStart(2, '0') + '-' + command.replaceAll(/[^a-zA-Z0-9_-]/g, '_') + '.log');
  if (record) commands.push({ command, args, cwd: relative(projectRoot, cwd), env });
  if (!quiet) console.log('> ' + command + ' ' + args.join(' '));
  return await new Promise((fulfill, reject) => {
    const sink = createWriteStream(logfile);
    const child = spawn(command, args, { cwd, env: { ...baseEnv, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = '';
    const append = data => {
      sink.write(data);
      tail = captureAll ? tail + data.toString() : (tail + data.toString()).slice(-24_000);
    };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', error => { sink.end(); reject(error); });
    child.on('close', code => {
      sink.end();
      if (code === 0) fulfill(tail);
      else reject(new Error(command + ' exited ' + code + '. Log: ' + logfile + '\n' + tail));
    });
  });
}
async function exists(path) { try { await access(path); return true; } catch { return false; } }
async function hash(path) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(path)) digest.update(chunk);
  return digest.digest('hex');
}
async function verifyArchive(path, source) {
  if (await hash(path) !== source.sha256) throw new Error('SHA-256 mismatch: ' + path);
}
async function archive(source) {
  const path = join(downloads, source.file);
  const provided = argumentsMap.get('--' + source.name + '-archive');
  if (provided) {
    await verifyArchive(resolve(provided), source);
    if (resolve(provided) !== path) await copyFile(resolve(provided), path);
  } else if (!(await exists(path))) {
    console.log('Downloading ' + source.file + ' from the official source.');
    const partial = path + '.partial';
    await run('curl', ['--fail', '--silent', '--show-error', '--location', '--retry', '3', '--connect-timeout', '30', '--output', partial, source.url]);
    await verifyArchive(partial, source);
    await rename(partial, path);
  }
  await verifyArchive(path, source);
  return path;
}
const compiler = 'x86_64-w64-mingw32-gcc-win32';
const cxx = 'x86_64-w64-mingw32-g++-win32';
const toolNames = [compiler, cxx, 'x86_64-w64-mingw32-objdump', 'x86_64-w64-mingw32-ar', 'x86_64-w64-mingw32-windres', 'cmake', 'ninja', 'make', 'perl', 'curl', 'tar'];
const tools = {};
for (const name of toolNames) {
  const text = await run(name, ['--version'], { record: false });
  tools[name] = text.trim().split('\n')[0];
}
tools.compilerVersion = (await run(compiler, ['-dumpfullversion'], { record: false })).trim();
tools.packages = (await run('dpkg-query', ['-W', '-f=' + String.fromCharCode(36) + '{binary:Package}=' + String.fromCharCode(36) + '{Version}' + String.fromCharCode(10), 'gcc-mingw-w64-x86-64-win32', 'mingw-w64-common'], { record: false })).trim().split(String.fromCharCode(10));
const archives = await Promise.all(sources.map(archive));
for (let index = 0; index < sources.length; index++) {
  const source = sources[index];
  // Only exact, checksum-verified upstream archives are extracted.
  await run('tar', ['-xf', archives[index], '-C', sourceRoot]);
  console.log(source.name + ' ' + source.version + ': source SHA-256 verified.');
}
const opensslDir = join(sourceRoot, 'openssl-3.5.9');
const opensslInstall = join(installRoot, 'openssl');
console.log('Building OpenSSL shared DLLs and the legacy provider (MinGW x64)...');
const opensslEnv = { CC: 'gcc-win32', CXX: 'g++-win32' };
const configureArgs = [
  'Configure', 'mingw64', 'shared', 'no-tests',
  '--cross-compile-prefix=x86_64-w64-mingw32-',
  '--prefix=' + opensslInstall,
  '--openssldir=C:/acbr-node/openssl',
  '--libdir=lib', '-static-libgcc', '-Wl,--no-insert-timestamp',
];
if (argumentsMap.has('--resume')) {
  const dump = JSON.parse(await run('perl', ['-I.', '-Mconfigdata', '-MJSON::PP', '-e', 'print JSON::PP::encode_json({args=>$configdata::config{perlargv},env=>$configdata::config{perlenv},version=>$configdata::config{full_version}})'], { cwd: opensslDir, record: false, captureAll: true }));
  const currentEnv = { ...baseEnv, ...opensslEnv };
  if (dump.version !== sources[0].version || JSON.stringify(dump.args) !== JSON.stringify(configureArgs.slice(1)) ||
    Object.entries(dump.env).some(([key,value]) => (currentEnv[key] ?? null) !== value))
    throw new Error('--resume requires the same pinned source, Configure arguments and environment as the previous build.');
  commands.push({ command: 'perl', args: configureArgs, cwd: relative(projectRoot, opensslDir), env: opensslEnv, reusedConfiguration: true });
  console.log('Resuming the matching OpenSSL configuration with the existing toolchain.');
} else {
  await run('perl', configureArgs, { cwd: opensslDir, env: opensslEnv });
}
await run('make', ['-j' + jobs, 'build_sw'], { cwd: opensslDir, env: opensslEnv });
await run('make', ['install_sw'], { cwd: opensslDir, env: opensslEnv });
console.log('Building libxml2 shared DLL with XML Schema and C14N support...');
const xmlBuild = join(buildRoot, 'libxml2');
const xmlInstall = join(installRoot, 'libxml2');
const toolchain = join(buildRoot, 'mingw-x64.cmake');
await writeFile(toolchain, [
  'set(CMAKE_SYSTEM_NAME Windows)',
  'set(CMAKE_SYSTEM_PROCESSOR x86_64)',
  'set(CMAKE_C_COMPILER ' + compiler + ')',
  'set(CMAKE_CXX_COMPILER ' + cxx + ')',
  'set(CMAKE_RC_COMPILER x86_64-w64-mingw32-windres)',
  'set(CMAKE_FIND_ROOT_PATH /usr/x86_64-w64-mingw32)',
  'set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)',
  'set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)',
  'set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)',
  'set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)',
  '',
].join('\n'));
await run('cmake', [
  '-S', join(sourceRoot, 'libxml2-2.15.4'), '-B', xmlBuild, '-G', 'Ninja',
  '-DCMAKE_TOOLCHAIN_FILE=' + toolchain,
  '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX=' + xmlInstall,
  '-DCMAKE_C_FLAGS=-static-libgcc',
  '-DCMAKE_SHARED_LINKER_FLAGS=-static-libgcc -static-libstdc++ -Wl,--no-insert-timestamp',
  '-DBUILD_SHARED_LIBS=ON',
  '-DLIBXML2_WITH_ICONV=OFF', '-DLIBXML2_WITH_ICU=OFF', '-DLIBXML2_WITH_ZLIB=OFF',
  '-DLIBXML2_WITH_PYTHON=OFF', '-DLIBXML2_WITH_PROGRAMS=OFF', '-DLIBXML2_WITH_TESTS=OFF',
  '-DLIBXML2_WITH_SCHEMAS=ON', '-DLIBXML2_WITH_C14N=ON', '-DLIBXML2_WITH_THREADS=ON',
  '-DLIBXML2_WITH_LEGACY=OFF', '-DLIBXML2_WITH_HTTP=OFF',
]);
await run('cmake', ['--build', xmlBuild, '--parallel', String(jobs)]);
await run('cmake', ['--install', xmlBuild]);
const dlls = [
  { name: 'libcrypto-3-x64.dll', path: join(opensslInstall, 'bin/libcrypto-3-x64.dll'), source: 'openssl' },
  { name: 'libssl-3-x64.dll', path: join(opensslInstall, 'bin/libssl-3-x64.dll'), source: 'openssl' },
  { name: 'legacy.dll', path: join(opensslInstall, 'lib/ossl-modules/legacy.dll'), source: 'openssl' },
  { name: 'libxml2.dll', path: join(xmlInstall, 'bin/libxml2.dll'), source: 'libxml2' },
];
const systemDlls = new Set([
  'advapi32.dll', 'bcrypt.dll', 'crypt32.dll', 'gdi32.dll', 'kernel32.dll', 'msvcrt.dll',
  'ntdll.dll', 'ole32.dll', 'secur32.dll', 'shell32.dll', 'user32.dll', 'version.dll', 'ws2_32.dll',
]);
const bundledDlls = new Set(dlls.map(dll => dll.name.toLowerCase()));
const artifacts = [];
for (const dll of dlls) {
  const table = await run('x86_64-w64-mingw32-objdump', ['-p', dll.path], { record: false, captureAll: true });
  if (!table.includes('pei-x86-64')) throw new Error('Expected a PE x64 DLL: ' + dll.path);
  const imports = [...table.matchAll(/DLL Name:\s*(\S+)/g)].map(match => match[1]).sort();
  for (const imported of imports)
    if (!systemDlls.has(imported.toLowerCase()) && !bundledDlls.has(imported.toLowerCase()))
      throw new Error(dll.name + ' imports an unbundled/non-system library: ' + imported);
  if (dll.source === 'libxml2')
    for (const symbol of ['xmlReadMemory', 'xmlFreeDoc', 'xmlC14NDocDumpMemory', 'xmlSchemaNewParserCtxt', 'xmlSchemaParse', 'xmlSchemaValidateDoc'])
      if (!new RegExp('\\]\\s+' + symbol + '(?:\\s|$)').test(table))
        throw new Error('Required XML function is missing: ' + symbol);
  await copyFile(dll.path, join(staging, dll.name));
  const license = dll.source === 'openssl' ? join(opensslDir, 'LICENSE.txt') : join(sourceRoot, 'libxml2-2.15.4/Copyright');
  await copyFile(license, join(staging, dll.name + '.LICENSE'));
  artifacts.push({ name: dll.name, source: dll.source, sha256: await hash(dll.path), imports });
  console.log(dll.name + ': ' + imports.join(', '));
}
// Static GCC/MinGW runtime code still requires its applicable license notices.
// Ubuntu packages contain the full GCC runtime exception and MinGW notices.
await copyFile('/usr/share/doc/gcc-13/copyright', join(staging, 'GCC-Runtime.LICENSE'));
await copyFile('/usr/share/common-licenses/GPL-3', join(staging, 'GCC-GPL-3.LICENSE'));
await copyFile('/usr/share/doc/mingw-w64-common/copyright', join(staging, 'MinGW-w64.LICENSE'));
const manifest = {
  format: 1,
  platform: 'win32', arch: 'x64',
  buildHost: 'Linux/WSL', sharedLibraries: true, vcRedistributable: false,
  sourceDateEpoch: 0,
  sources,
  tools,
  buildCommands: commands,
  artifacts,
  runtimeNotices: ['GCC-Runtime.LICENSE', 'GCC-GPL-3.LICENSE', 'MinGW-w64.LICENSE'],
  validation: {
    crossCompiled: true, peImportAudit: true,
    requiredLibxml2Exports: true,
    upstreamTestsRun: false,
    reason: 'Windows target executables cannot run natively on the Linux build host. Run offline worker smoke tests on Windows.',
  },
};
await writeFile(join(staging, 'SOURCE.json'), JSON.stringify(manifest, null, 2) + '\n');
// Update only the task's fixed dependency directory after all builds and audits pass.
await mkdir(output, { recursive: true });
const files = [
  ...dlls.flatMap(dll => [dll.name, dll.name + '.LICENSE']),
  'GCC-Runtime.LICENSE', 'GCC-GPL-3.LICENSE', 'MinGW-w64.LICENSE', 'SOURCE.json',
];
for (const name of files) await copyFile(join(staging, name), join(output, name));
// Remove only known artifacts from the earlier MSVC-based dependency staging.
for (const name of ['vcruntime140.dll', 'vcruntime140.dll.LICENSE', 'upstream-manifest.json'])
  await rm(join(output, name), { force: true });
console.log('Windows x64 dependencies ready: ' + output);
console.log('Provenance, command line and DLL hashes: ' + join(output, 'SOURCE.json'));
