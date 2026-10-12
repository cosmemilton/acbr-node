#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeInstalledField, formatFieldDescription, FieldHelpError } from './contract-help.js';

export const HELP = `acbr-node — compilação e contrato Node/ACBr NF-e

Uso:
  acbr-node help TAG Ide.tpNF [--json]
  acbr-node help TAG 'Det[].Imposto.PIS.CST' [--json]
  acbr-node init [--config caminho] [--revision HEAD|número]
  acbr-node source update [--config caminho] [--revision HEAD|número]
  acbr-node source lock --revision número [--config caminho]
  acbr-node generate [--config caminho]
  acbr-node build [--config caminho]
  acbr-node check [--config caminho]
  acbr-node doctor [--config caminho]

source update consulta o SVN oficial e substitui apenas fontes verificadas pelo lock.
source lock registra um export existente cuja origem/revisão o operador já conferiu.
generate/build/check nunca atualizam fontes. Nenhum comando transmite NF-e.
help TAG consulta somente o contrato da versão instalada, offline e sem runtime ou certificado.
`;
export interface CliIO { stdout: { write(text: string): unknown }; stderr: { write(text: string): unknown }; }
function revision(value: string | undefined): 'HEAD' | number | undefined {
  if (value === undefined) return undefined;
  if (value === 'HEAD') return value;
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('--revision deve ser HEAD ou um número SVN positivo.');
  return Number(value);
}
interface Args { command: string[]; config: string; revision?: 'HEAD' | number; json: boolean; help: boolean; }
export function parseArguments(args: string[]): Args {
  const result: Args = { command: [], config: 'acbr.config.json', json: false, help: false };
  const used = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (!arg.startsWith('-')) { result.command.push(arg); continue; }
    if (used.has(arg)) throw new Error(`Opção repetida: ${arg}.`);
    used.add(arg);
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--json') result.json = true;
    else if (arg === '--config' || arg === '--revision') {
      const value = args[++i];
      if (value === undefined || value.startsWith('--')) throw new Error(`Valor obrigatório para ${arg}.`);
      if (arg === '--config') result.config = value;
      else result.revision = revision(value);
    } else throw new Error(`Opção desconhecida: ${arg}.`);
  }
  return result;
}
export async function main(args = process.argv.slice(2), io: CliIO = process, dependencies: { contractRoot?: string } = {}): Promise<number> {
  const initialCommand = args.filter(arg => !['--json', '--help', '-h'].includes(arg));
  let jsonTag = args.includes('--json') && initialCommand[0]?.toLowerCase() === 'help' && initialCommand[1]?.toLowerCase() === 'tag';
  try {
    let options: Args;
    try { options = parseArguments(args); } catch (error) {
      if (jsonTag) throw new FieldHelpError('USO_INVALIDO', 'Argumentos inválidos. Use acbr-node help TAG caminho [--json].');
      throw error;
    }
    const command = options.command.join(' ');
    if (options.help || !command) { io.stdout.write(HELP); return 0; }
    const output = (value: unknown, text: string) => io.stdout.write(options.json ? `${JSON.stringify(value, null, 2)}\n` : `${text}\n`);
    if (options.command[0]?.toLowerCase() === 'help' && options.command[1]?.toLowerCase() === 'tag') {
      jsonTag = options.json;
      if (options.command.length !== 3) throw new FieldHelpError('USO_INVALIDO', 'Use acbr-node help TAG caminho [--json].');
      if (options.revision !== undefined || args.includes('--config')) throw new FieldHelpError('USO_INVALIDO', 'help TAG usa o contrato instalado e não aceita --config ou --revision.');
      const description = await describeInstalledField(options.command[2]!, dependencies.contractRoot ?? fileURLToPath(new URL('../', import.meta.url)));
      output(description, formatFieldDescription(description)); return 0;
    }
    if (command === 'init') {
      const { initializeConfig } = await import('./config.js');
      const config = await initializeConfig(options.config, options.revision, fileURLToPath(new URL('../', import.meta.url)));
      output({ configPath: config.configPath }, `Configuração criada: ${config.configPath}\nPróximo passo: acbr-node source update.`);
      return 0;
    }
    if (!['source update', 'source lock', 'generate', 'build', 'check', 'doctor'].includes(command)) throw new Error(`Comando desconhecido: ${command}. Use --help.`);
    if (options.revision !== undefined && !command.startsWith('source ')) throw new Error('--revision é aceito somente em init e source.');
    if (command === 'doctor') {
      const { loadConfig } = await import('./config.js');
      const { doctor } = await import('./native-build.js');
      let config;
      try { await access(resolve(options.config)); config = await loadConfig(options.config); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      const report = await doctor(config);
      output(report, report.map(item => `${item.ok ? 'OK' : 'FALHA'} ${item.name}: ${item.detail}`).join('\n'));
      return report.every(item => item.ok) ? 0 : 1;
    }
    const { loadConfig } = await import('./config.js');
    const config = await loadConfig(options.config);
    if (command === 'source update') {
      const { updateSource } = await import('./source.js');
      const lock = await updateSource(config, options.revision);
      output(lock, `Fontes oficiais registradas na revisão ${lock.source.revision}.\nSHA256 da árvore: ${lock.source.treeHash}\nExecute generate para atualizar o contrato.`);
    } else if (command === 'source lock') {
      const { lockExistingSource } = await import('./source.js');
      if (typeof options.revision !== 'number') throw new Error('source lock exige --revision com o número verificado do export SVN.');
      if (config.source.revision !== 'HEAD' && config.source.revision !== options.revision) throw new Error('Revisão do export diverge da configuração.');
      const lock = await lockExistingSource(config, options.revision);
      output(lock, `Export existente registrado na revisão ${lock.source.revision}; ${Object.keys(lock.source.files).length} arquivos protegidos por SHA256.`);
    } else if (command === 'generate') {
      const { verifySource } = await import('./source.js');
      const lock = await verifySource(config);
      const { generateModel } = await import('./generator.js');
      const result = await generateModel({ acbrRoot: config.source.directory, outputDir: config.generator.outputDir, revision: String(lock.source.revision), sourceHash: lock.source.treeHash, fpcPath: config.native.fpc });
      output(result, `Contrato ${result.contractHash}; ${result.models} modelos gerados.\nRevise o relatório: ${result.reportPath}`);
    } else if (command === 'build') {
      const { buildNative, runtimeDirectory } = await import('./native-build.js');
      const result = await buildNative(config);
      output(result, `Runtime compilado: ${runtimeDirectory(config)}\nACBr revisão ${result.sourceRevision}; contrato ${result.contractHash}.`);
    } else {
      const { checkBuild } = await import('./native-build.js');
      const { checkOffline } = await import('./offline-check.js');
      const result = await checkBuild(config);
      const offlineChecks = await checkOffline(config, result);
      output({ ...result, offlineChecks }, `Fontes, contrato e ${Object.keys(result.files).length} arquivos do runtime conferidos por SHA256.\n${offlineChecks.length} verificações offline do motor aprovadas; nenhuma transmissão.`);
    }
    return 0;
  } catch (error) {
    if (jsonTag) {
      const problem = error instanceof FieldHelpError ? { code: error.code, message: error.message, ...error.details } : { code: 'HELP_INDISPONIVEL', message: 'Não foi possível consultar o contrato instalado.' };
      io.stderr.write(`${JSON.stringify({ ok: false, error: problem }, null, 2)}\n`); return 1;
    }
    io.stderr.write(`Erro: ${(error as Error).message}\n`);
    return 1;
  }
}
function isDirectInvocation(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    // npm's Unix bin is a symlink; resolve both sides before deciding to run.
    return realpathSync(resolve(entry)) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    // Importing the CLI must remain inert even if the host's argv path is absent.
    return false;
  }
}
if (isDirectInvocation()) {
  main().then(code => { process.exitCode = code; });
}
