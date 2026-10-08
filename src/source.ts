import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { SOURCE_PARTS, type AcbrConfig } from './config.js';

export interface SourceSnapshot { treeHash: string; files: Record<string, string>; }
export interface SourceLock {
  formatVersion: 1;
  source: { url: string; revision: number; parts: string[]; treeHash: string; files: Record<string, string> };
}
export interface CommandResult { stdout: string; stderr: string; }
export async function runCommand(command: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv; maxOutputBytes?: number } = {}): Promise<CommandResult> {
  return new Promise((done, fail) => {
    const child = spawn(command, args, { cwd: options.cwd, env: options.env ?? process.env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: false });
    let stdout = ''; let stderr = ''; let overflow = false;
    const maximum = options.maxOutputBytes ?? 16 * 1024 * 1024;
    const append = (kind: 'stdout' | 'stderr', data: Buffer) => {
      if (overflow) return;
      if (kind === 'stdout') stdout += data.toString('utf8'); else stderr += data.toString('utf8');
      if (Buffer.byteLength(stdout) + Buffer.byteLength(stderr) > maximum) { overflow = true; child.kill(); }
    };
    child.stdout.on('data', data => append('stdout', data)); child.stderr.on('data', data => append('stderr', data));
    child.on('error', error => fail(new Error(`Não foi possível executar ${command}: ${error.message}`, { cause: error })));
    child.on('close', code => {
      if (overflow) fail(new Error(`Saída de ${command} excedeu o limite de ${maximum} bytes.`));
      else if (code !== 0) {
        const diagnostic = (stderr || stdout).split('\n').slice(-80).join('\n').slice(-16000);
        fail(Object.assign(new Error(`${command} terminou com código ${code}:\n${diagnostic}`), { stdout, stderr }));
      }
      else done({ stdout, stderr });
    });
  });
}
export async function fileHash(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
export async function snapshotSource(directory: string): Promise<SourceSnapshot> {
  const files: Record<string, string> = Object.create(null);
  async function scan(current: string): Promise<void> {
    const entries = (await readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const entry of entries) {
      if (entry.name === '.svn') continue;
      const path = join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Fonte ACBr contém link simbólico: ${path}.`);
      if (entry.isDirectory()) await scan(path);
      else if (entry.isFile()) files[relative(directory, path).split(sep).join('/')] = await fileHash(path);
      else throw new Error(`Fonte ACBr contém arquivo especial: ${path}.`);
    }
  }
  await scan(resolve(directory));
  const sortedFiles = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  const treeHash = createHash('sha256').update(JSON.stringify(sortedFiles)).digest('hex');
  return { treeHash, files: sortedFiles };
}
function validateLock(value: unknown): SourceLock {
  if (!value || typeof value !== 'object') throw new Error('Lock ACBr inválido.');
  const lock = value as SourceLock;
  if (lock.formatVersion !== 1 || !lock.source || !Number.isSafeInteger(lock.source.revision) || lock.source.revision < 1 ||
      !Array.isArray(lock.source.parts) || !lock.source.files || typeof lock.source.files !== 'object' || Array.isArray(lock.source.files) ||
      !/^[a-f0-9]{64}$/.test(lock.source.treeHash)) throw new Error('Formato inválido em acbr.lock.json.');
  for (const [path, hash] of Object.entries(lock.source.files)) {
    if (path.startsWith('/') || path.includes('\\') || path.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('Caminho ou hash inválido no lock ACBr.');
  }
  if (lock.source.parts.join('\n') !== SOURCE_PARTS.join('\n')) throw new Error('Partes ACBr divergentes no lock.');
  return lock;
}
export async function readSourceLock(config: AcbrConfig): Promise<SourceLock> {
  let lock: SourceLock;
  try { lock = validateLock(JSON.parse(await readFile(config.lockPath, 'utf8'))); }
  catch (error) { throw new Error(`Não foi possível ler ${config.lockPath}. Execute acbr-node source update.`, { cause: error }); }
  if (lock.source.url !== config.source.url) throw new Error('URL ACBr do lock diverge da configuração.');
  if (config.source.revision !== 'HEAD' && lock.source.revision !== config.source.revision) throw new Error('Revisão ACBr do lock diverge da configuração. Execute source update explicitamente.');
  return lock;
}
export async function verifySource(config: AcbrConfig): Promise<SourceLock> {
  try {
    await access(`${config.lockPath}.operation`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return verifySourceContents(config);
    throw error;
  }
  throw new Error('Atualização de fontes ACBr em andamento. Aguarde o CLI concluir.');
}
async function verifySourceContents(config: AcbrConfig): Promise<SourceLock> {
  const lock = await readSourceLock(config);
  const snapshot = await snapshotSource(config.source.directory);
  if (snapshot.treeHash !== lock.source.treeHash) {
    const names = new Set([...Object.keys(snapshot.files), ...Object.keys(lock.source.files)]);
    const changed = [...names].filter(path => snapshot.files[path] !== lock.source.files[path]);
    throw new Error(`Fontes ACBr divergem do lock (${changed.length} arquivo(s)): ${changed.slice(0, 10).join(', ')}. Preserve as alterações antes de atualizar.`);
  }
  return lock;
}
async function writeLock(config: AcbrConfig, snapshot: SourceSnapshot, revision: number): Promise<SourceLock> {
  const lock: SourceLock = { formatVersion: 1, source: { url: config.source.url, revision, parts: [...SOURCE_PARTS], ...snapshot } };
  await mkdir(dirname(config.lockPath), { recursive: true });
  const temporary = `${config.lockPath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(lock, null, 2)}\n`, { flag: 'wx' });
  try { await rename(temporary, config.lockPath); } finally { await rm(temporary, { force: true }); }
  return lock;
}
export async function lockExistingSource(config: AcbrConfig, revision: number): Promise<SourceLock> {
  return withSourceOperation(config, () => performLockExistingSource(config, revision));
}
async function performLockExistingSource(config: AcbrConfig, revision: number): Promise<SourceLock> {
  if (!Number.isSafeInteger(revision) || revision < 1) throw new Error('Uma revisão SVN positiva é obrigatória para registrar fontes existentes.');
  try { await access(config.lockPath); } catch { return writeLock(config, await snapshotSource(config.source.directory), revision); }
  throw new Error('O lock já existe. Use source update para atualizar fontes e lock em conjunto.');
}
export async function resolveSourceRevision(url: string, revision: 'HEAD' | number, runner: typeof runCommand = runCommand): Promise<number> {
  const { stdout } = await runner('svn', ['info', '--non-interactive', '--show-item', 'revision', '-r', String(revision), url]);
  const resolved = Number(stdout.trim());
  if (!Number.isSafeInteger(resolved) || resolved < 1) throw new Error('SVN não retornou uma revisão válida.');
  return resolved;
}
async function withSourceOperation<T>(config: AcbrConfig, operation: () => Promise<T>): Promise<T> {
  const marker = `${config.lockPath}.operation`;
  try { await writeFile(marker, `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`, { flag: 'wx' }); }
  catch (error) { throw new Error('Outra operação de fontes ACBr está em andamento. Se o processo anterior terminou abruptamente, confira o PID do arquivo acbr.lock.json.operation antes de removê-lo.', { cause: error }); }
  try { return await operation(); } finally { await rm(marker, { force: true }); }
}
export async function updateSource(config: AcbrConfig, revision: 'HEAD' | number = 'HEAD', runner: typeof runCommand = runCommand): Promise<SourceLock> {
  return withSourceOperation(config, () => performUpdateSource(config, revision, runner));
}
async function performUpdateSource(config: AcbrConfig, revision: 'HEAD' | number, runner: typeof runCommand): Promise<SourceLock> {
  const source = resolve(config.source.directory);
  if (source === config.projectRoot || source === dirname(source)) throw new Error('O diretório das fontes deve ser exclusivo e não pode ser a raiz do projeto ou do sistema.');
  let exists = false;
  try { const details = await stat(source); exists = true; if (!details.isDirectory()) throw new Error('O caminho das fontes não é um diretório.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  if (exists && (await readdir(source)).length) await verifySourceContents({ ...config, source: { ...config.source, revision: 'HEAD' } });
  const resolvedRevision = await resolveSourceRevision(config.source.url, revision, runner);
  const stage = join(dirname(source), `.acbr-source-stage-${randomUUID()}`);
  const backup = join(dirname(source), `.acbr-source-backup-${randomUUID()}`);
  await mkdir(stage, { recursive: true });
  let previousLock: string | undefined;
  try { previousLock = await readFile(config.lockPath, 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  let backedUp = false; let replaced = false; let lockWritten = false;
  try {
    for (const part of SOURCE_PARTS) {
      const destination = join(stage, ...part.split('/'));
      await mkdir(dirname(destination), { recursive: true });
      await runner('svn', ['export', '--non-interactive', '-q', '-r', String(resolvedRevision), `${config.source.url}/${part}`, destination], { maxOutputBytes: 4 * 1024 * 1024 });
    }
    const snapshot = await snapshotSource(stage);
    if (exists) { await rename(source, backup); backedUp = true; }
    await rename(stage, source); replaced = true;
    const lock = await writeLock(config, snapshot, resolvedRevision); lockWritten = true;
    await persistRevision(config, resolvedRevision);
    config.source.revision = resolvedRevision;
    if (backedUp) await rm(backup, { recursive: true, force: true }).catch(() => undefined);
    return lock;
  } catch (error) {
    if (lockWritten) {
      if (previousLock === undefined) await rm(config.lockPath, { force: true });
      else await writeFile(config.lockPath, previousLock);
    }
    if (replaced) await rm(source, { recursive: true, force: true });
    if (backedUp) await rename(backup, source);
    throw error;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

async function persistRevision(config: AcbrConfig, revision: number): Promise<void> {
  const original = JSON.parse(await readFile(config.configPath, 'utf8')) as { source: { revision: number } };
  original.source.revision = revision;
  const temporary = `${config.configPath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(original, null, 2)}\n`, { flag: 'wx' });
  try { await rename(temporary, config.configPath); } finally { await rm(temporary, { force: true }); }
}
