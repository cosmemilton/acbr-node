import { readFile, writeFile, mkdir, readdir, access, copyFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';

export const OFFICIAL_ACBR_URL = 'https://svn.code.sf.net/p/acbr/code/trunk2';
export const SOURCE_PARTS = ['Fontes', 'Exemplos/ACBrDFe/Schemas/NFe', 'Doctos/LICENSE.TXT'] as const;
export interface AcbrConfigFile {
  formatVersion: 1;
  source: { url: string; revision: 'HEAD' | number; directory: string };
  generator: { outputDir: string };
  native: { project: string; outputDir: string; fpc: string; lazarusRoot?: string; libraryFiles?: string[]; providerFiles?: string[] };
}
export interface AcbrConfig extends AcbrConfigFile {
  configPath: string;
  projectRoot: string;
  lockPath: string;
}
const DEFAULT: AcbrConfigFile = {
  formatVersion: 1,
  source: { url: OFFICIAL_ACBR_URL, revision: 'HEAD', directory: '.acbr/source' },
  generator: { outputDir: '.' },
  native: { project: 'native/acbr-worker.lpr', outputDir: '.acbr/runtime', fpc: 'fpc' },
};
export function defaultConfig(): AcbrConfigFile { return structuredClone(DEFAULT); }
function record(value: unknown, name: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name} deve ser um objeto.`);
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[], name: string): void {
  const unexpected = Object.keys(value).filter(key => !allowed.includes(key));
  if (unexpected.length) throw new Error(`Campo desconhecido em ${name}: ${unexpected.join(', ')}.`);
}
function string(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0')) throw new Error(`${name} deve ser um texto não vazio.`);
  return value;
}
export function parseConfig(input: unknown, configPath: string): AcbrConfig {
  const root = record(input, 'configuração');
  keys(root, ['formatVersion', 'source', 'generator', 'native'], 'configuração');
  if (root.formatVersion !== 1) throw new Error('formatVersion deve ser 1.');
  const source = record(root.source, 'source'); keys(source, ['url', 'revision', 'directory'], 'source');
  const generator = record(root.generator, 'generator'); keys(generator, ['outputDir'], 'generator');
  const native = record(root.native, 'native'); keys(native, ['project', 'outputDir', 'fpc', 'lazarusRoot', 'libraryFiles', 'providerFiles'], 'native');
  const url = string(source.url, 'source.url').replace(/\/+$/, '');
  if (url !== OFFICIAL_ACBR_URL) throw new Error(`source.url deve apontar ao repositório oficial ${OFFICIAL_ACBR_URL}.`);
  const revision = source.revision;
  if (revision !== 'HEAD' && (!Number.isSafeInteger(revision) || Number(revision) < 1)) throw new Error('source.revision deve ser HEAD ou uma revisão SVN positiva.');
  const absoluteConfig = resolve(configPath);
  const projectRoot = dirname(absoluteConfig);
  const localPath = (value: unknown, label: string) => resolve(projectRoot, string(value, label));
  const fpcInput = string(native.fpc, 'native.fpc');
  const fpc = isAbsolute(fpcInput) || /[\\/]/.test(fpcInput) ? resolve(projectRoot, fpcInput) : fpcInput;
  let libraryFiles: string[] | undefined;
  if (native.libraryFiles !== undefined) {
    if (!Array.isArray(native.libraryFiles)) throw new Error('native.libraryFiles deve ser uma lista de caminhos.');
    libraryFiles = native.libraryFiles.map((item, i) => localPath(item, `native.libraryFiles[${i}]`));
  }
  let providerFiles: string[] | undefined;
  if (native.providerFiles !== undefined) {
    if (!Array.isArray(native.providerFiles)) throw new Error('native.providerFiles deve ser uma lista de caminhos.');
    providerFiles = native.providerFiles.map((item, i) => localPath(item, `native.providerFiles[${i}]`));
  }
  return {
    formatVersion: 1, configPath: absoluteConfig, projectRoot, lockPath: resolve(projectRoot, 'acbr.lock.json'),
    source: { url, revision: revision as 'HEAD' | number, directory: localPath(source.directory, 'source.directory') },
    generator: { outputDir: localPath(generator.outputDir, 'generator.outputDir') },
    native: { project: localPath(native.project, 'native.project'), outputDir: localPath(native.outputDir, 'native.outputDir'), fpc,
      ...(native.lazarusRoot !== undefined ? { lazarusRoot: localPath(native.lazarusRoot, 'native.lazarusRoot') } : {}),
      ...(libraryFiles !== undefined ? { libraryFiles } : {}),
      ...(providerFiles !== undefined ? { providerFiles } : {}),
    },
  };
}
export async function loadConfig(path = 'acbr.config.json'): Promise<AcbrConfig> {
  const configPath = resolve(path);
  let contents: string;
  try { contents = await readFile(configPath, 'utf8'); }
  catch (error) { throw new Error(`Não foi possível ler ${configPath}. Execute acbr-node init.`, { cause: error }); }
  let value: unknown;
  try { value = JSON.parse(contents); } catch (error) { throw new Error(`JSON inválido em ${configPath}.`, { cause: error }); }
  return parseConfig(value, configPath);
}
export async function initializeConfig(path = 'acbr.config.json', revision: 'HEAD' | number = 'HEAD', assetRoot?: string): Promise<AcbrConfig> {
  const configPath = resolve(path);
  const config = defaultConfig(); config.source.revision = revision;
  parseConfig(config, configPath);
  await mkdir(dirname(configPath), { recursive: true });
  try { await access(configPath); throw Object.assign(new Error(`EEXIST: configuração já existe: ${configPath}`), { code: 'EEXIST' }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const resolved = parseConfig(config, configPath);
  if (assetRoot) await copyInitAssets(assetRoot, resolved.projectRoot);
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
  await mkdir(resolve(resolved.projectRoot, '.acbr/generated'), { recursive: true });
  await mkdir(resolve(resolved.projectRoot, 'generated/acbr'), { recursive: true });
  return resolved;
}

async function copyInitAssets(assetRoot: string, targetRoot: string): Promise<void> {
  const entries: { source: string; destination: string; content: Buffer }[] = [];
  async function scan(current: string, target: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.name === 'generated' || entry.name.startsWith('.')) continue;
      const source = resolve(current, entry.name); const destination = resolve(target, entry.name);
      if (entry.isDirectory()) await scan(source, destination);
      else if (entry.isFile() && /\.(pas|lpr|inc|lpi)$/i.test(entry.name)) entries.push({ source, destination, content: await readFile(source) });
    }
  }
  await scan(resolve(assetRoot, 'native'), resolve(targetRoot, 'native'));
  if (!entries.some(entry => entry.source.endsWith('acbr-worker.lpr'))) throw new Error('Assets do pacote não contêm native/acbr-worker.lpr.');
  entries.push({ source: resolve(assetRoot, 'tools/extract-model.lpr'), destination: resolve(targetRoot, 'tools/extract-model.lpr'), content: await readFile(resolve(assetRoot, 'tools/extract-model.lpr')) });
  for (const entry of entries) {
    try {
      const existing = await readFile(entry.destination);
      if (!existing.equals(entry.content)) throw new Error(`init preservou arquivo existente divergente: ${entry.destination}.`);
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  for (const entry of entries) {
    await mkdir(dirname(entry.destination), { recursive: true });
    try { await writeFile(entry.destination, entry.content, { flag: 'wx' }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  }
}
