import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HASH = /^[a-f0-9]{64}$/;
const NAME = /^[A-Za-z0-9][A-Za-z0-9.+_-]*$/;
const MAX_TEXT_BYTES = 4 * 1024 * 1024;
const COMMON = 'licenses/common/';
const INVENTORY = COMMON + 'INVENTORY.json';
const defaultPolicy = fileURLToPath(new URL('../docs/licenses/common/', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw Error('Licenças do runtime: ' + message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

async function regularFile(root, name) {
  if (!name || path.posix.isAbsolute(name) || name.includes('\\') || name.split('/').some(p => !p || p === '.' || p === '..')) fail('caminho inválido.');
  const parts = name.split('/');
  let file = root;
  for (let i = 0; i < parts.length; i++) {
    file = path.join(file, parts[i]);
    const info = await lstat(file);
    if (info.isSymbolicLink() || (i < parts.length - 1 ? !info.isDirectory() : !info.isFile())) fail('arquivo não regular: ' + name);
    if (i === parts.length - 1 && info.size > MAX_TEXT_BYTES) fail('texto excede o limite: ' + name);
  }
  return readFile(file);
}

function references(bytes, notice) {
  const names = new Set();
  for (const match of bytes.toString('utf8').matchAll(/\/usr\/share\/common-licenses\/([^\s"'<>`\u2018\u2019\u201c\u201d]+)/g)) {
    // Sentence punctuation is not part of the Debian license filename.
    const name = match[1].replace(/[.,;:)\]}]+$/, '');
    if (!NAME.test(name)) fail('referência common-licenses inválida em ' + notice);
    names.add(name);
  }
  return [...names].sort();
}

async function policyAt(directory) {
  const raw = await regularFile(directory, 'ORIGIN.json');
  let policy;
  try { policy = JSON.parse(raw.toString('utf8')); } catch { fail('ORIGIN.json inválido.'); }
  if (policy.formatVersion !== 1 || !object(policy.files) || !Object.hasOwn(policy.files, 'Apache-2.0')) fail('política canônica incompleta.');
  const files = new Map();
  for (const name of Object.keys(policy.files).sort()) {
    const entry = policy.files[name];
    if (!NAME.test(name) || !object(entry) || entry.file !== name + '.txt' || !HASH.test(entry.sha256) || !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || entry.bytes > MAX_TEXT_BYTES) fail('registro canônico inválido: ' + name);
    const bytes = await regularFile(directory, entry.file);
    if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) fail('texto canônico diverge da origem aprovada: ' + name);
    files.set(name, { entry, bytes });
  }
  return { sha256: digest(raw), files };
}

/** The SDK tarball must carry the same reviewed policy and canonical bytes as checkout. */
export async function auditLicensePolicy(directory, { policyDirectory = defaultPolicy } = {}) {
  const approved = await policyAt(policyDirectory);
  const actual = await policyAt(directory);
  if (actual.sha256 !== approved.sha256) fail('política do SDK diverge da origem aprovada.');
  return actual.sha256;
}

async function noticesAt(runtime) {
  const notices = [];
  async function visit(prefix) {
    for (const entry of (await readdir(path.join(runtime, prefix), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = prefix + '/' + entry.name;
      if (entry.isSymbolicLink()) fail('link em avisos: ' + name);
      if (entry.isDirectory()) { if (name !== 'licenses/common') await visit(name); }
      else if (entry.isFile()) notices.push({ name, bytes: await regularFile(runtime, name) });
      else fail('aviso não regular: ' + name);
    }
  }
  await visit('licenses');
  return notices;
}

async function expectedInventory(runtime, policyDirectory) {
  const policy = await policyAt(policyDirectory);
  const notices = await noticesAt(runtime);
  const required = new Map([['Apache-2.0', new Set(['policy:OpenSSL'])]]);
  const add = (name, source) => {
    if (!policy.files.has(name)) fail('referência common-licenses não aprovada: ' + name);
    if (!required.has(name)) required.set(name, new Set());
    required.get(name).add(source);
  };
  for (const notice of notices) for (const name of references(notice.bytes, notice.name)) add(name, notice.name);
  const scanned = new Set();
  while (scanned.size < required.size) {
    const name = [...required.keys()].find(name => !scanned.has(name));
    scanned.add(name);
    const aliasOf = policy.files.get(name).entry.aliasOf;
    if (aliasOf !== undefined) {
      if (typeof aliasOf !== 'string') fail('alias canônico inválido: ' + name);
      add(aliasOf, COMMON + name + '.txt');
      if (policy.files.get(aliasOf).entry.sha256 !== policy.files.get(name).entry.sha256) fail('alias diverge do texto canônico: ' + name);
    }
    for (const referenced of references(policy.files.get(name).bytes, COMMON + name + '.txt')) add(referenced, COMMON + name + '.txt');
  }
  const files = {};
  for (const name of [...required.keys()].sort()) {
    const { entry } = policy.files.get(name);
    files[name] = { file: COMMON + entry.file, sha256: entry.sha256, bytes: entry.bytes, requiredBy: [...required.get(name)].sort(), origin: entry };
  }
  return { inventory: { formatVersion: 1, policySha256: policy.sha256, files }, policy, notices };
}

async function writeExact(file, bytes) {
  try { await writeFile(file, bytes, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || !(await readFile(file)).equals(bytes)) fail('recusa substituir material existente divergente.');
  }
}

/** Complete a NEW/staged runtime before its manifest is generated. Never edits notices. */
export async function completeRuntimeLicenses(runtime, { policyDirectory = defaultPolicy } = {}) {
  const { inventory, policy } = await expectedInventory(runtime, policyDirectory);
  const directory = path.join(runtime, 'licenses/common');
  try { if (!(await lstat(directory)).isDirectory() || (await lstat(directory)).isSymbolicLink()) fail('diretório common não regular.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; await mkdir(directory); }
  for (const [name, entry] of Object.entries(inventory.files)) await writeExact(path.join(runtime, entry.file), policy.files.get(name).bytes);
  await writeExact(path.join(runtime, INVENTORY), Buffer.from(JSON.stringify(inventory, null, 2) + '\n'));
  return inventory;
}

/** Check canonical bytes and reference closure independently of mutable runtime hashes. */
export async function auditRuntimeLicenses(runtime, manifest, { policyDirectory = defaultPolicy } = {}) {
  const { inventory, notices } = await expectedInventory(runtime, policyDirectory);
  if (!object(manifest?.files)) fail('manifesto sem inventário.');
  const dependencyFiles = [];
  if (manifest.platform === 'linux') {
    const source = 'sources/native-dependencies.json';
    let dependencies;
    try { dependencies = JSON.parse((await regularFile(runtime, source)).toString('utf8')); } catch { fail('proveniência Linux ausente ou inválida.'); }
    if (!object(dependencies) || Object.keys(dependencies).length === 0) fail('proveniência Linux sem dependências.');
    dependencyFiles.push(source);
    for (const dependency of Object.values(dependencies)) {
      const name = dependency?.copyright;
      if (typeof name !== 'string' || !name.startsWith('licenses/') || name.startsWith(COMMON)) fail('aviso de dependência Linux ausente da proveniência.');
      dependencyFiles.push(name);
    }
  }
  let actual;
  try { actual = JSON.parse((await regularFile(runtime, INVENTORY)).toString('utf8')); } catch { fail('inventário common-licenses ausente ou inválido.'); }
  if (JSON.stringify(actual) !== JSON.stringify(inventory)) fail('inventário common-licenses diverge da política e dos avisos.');
  const expectedFiles = [INVENTORY, ...Object.values(inventory.files).map(entry => entry.file)].sort();
  const commonFiles = (await readdir(path.join(runtime, 'licenses/common'))).map(name => COMMON + name).sort();
  if (JSON.stringify(commonFiles) !== JSON.stringify(expectedFiles)) fail('inventário common-licenses incompleto ou com arquivos extras.');
  for (const name of [...notices.map(notice => notice.name), ...dependencyFiles, ...expectedFiles]) {
    const bytes = await regularFile(runtime, name);
    if (!Object.hasOwn(manifest.files, name) || manifest.files[name] !== digest(bytes)) fail('material de licença ausente do manifesto ou hash divergente: ' + name);
  }
  for (const entry of Object.values(inventory.files)) {
    const bytes = await regularFile(runtime, entry.file);
    if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) fail('texto integral diverge da origem aprovada: ' + entry.file);
  }
  return inventory;
}
