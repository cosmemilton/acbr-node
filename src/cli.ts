#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeConfig, loadConfig } from './config.js';
import { checkBuild, buildNative, doctor, runtimeDirectory } from './native-build.js';
import { lockExistingSource, updateSource, verifySource } from './source.js';
import { checkOffline } from './offline-check.js';

export const HELP = `acbr-node — compilação e contrato Node/ACBr NF-e

Uso:
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
export async function main(args = process.argv.slice(2), io: CliIO = process): Promise<number> {
  try {
    const options = parseArguments(args);
    const command = options.command.join(' ');
    if (options.help || !command) { io.stdout.write(HELP); return 0; }
    const output = (value: unknown, text: string) => io.stdout.write(options.json ? `${JSON.stringify(value, null, 2)}\n` : `${text}\n`);
    if (command === 'init') {
      const config = await initializeConfig(options.config, options.revision, fileURLToPath(new URL('../', import.meta.url)));
      output({ configPath: config.configPath }, `Configuração criada: ${config.configPath}\nPróximo passo: acbr-node source update.`);
      return 0;
    }
    if (!['source update', 'source lock', 'generate', 'build', 'check', 'doctor'].includes(command)) throw new Error(`Comando desconhecido: ${command}. Use --help.`);
    if (options.revision !== undefined && !command.startsWith('source ')) throw new Error('--revision é aceito somente em init e source.');
    if (command === 'doctor') {
      let config;
      try { await access(resolve(options.config)); config = await loadConfig(options.config); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      const report = await doctor(config);
      output(report, report.map(item => `${item.ok ? 'OK' : 'FALHA'} ${item.name}: ${item.detail}`).join('\n'));
      return report.every(item => item.ok) ? 0 : 1;
    }
    const config = await loadConfig(options.config);
    if (command === 'source update') {
      const lock = await updateSource(config, options.revision);
      output(lock, `Fontes oficiais registradas na revisão ${lock.source.revision}.\nSHA256 da árvore: ${lock.source.treeHash}\nExecute generate para atualizar o contrato.`);
    } else if (command === 'source lock') {
      if (typeof options.revision !== 'number') throw new Error('source lock exige --revision com o número verificado do export SVN.');
      if (config.source.revision !== 'HEAD' && config.source.revision !== options.revision) throw new Error('Revisão do export diverge da configuração.');
      const lock = await lockExistingSource(config, options.revision);
      output(lock, `Export existente registrado na revisão ${lock.source.revision}; ${Object.keys(lock.source.files).length} arquivos protegidos por SHA256.`);
    } else if (command === 'generate') {
      const lock = await verifySource(config);
      const { generateModel } = await import('./generator.js');
      const result = await generateModel({ acbrRoot: config.source.directory, outputDir: config.generator.outputDir, revision: String(lock.source.revision), sourceHash: lock.source.treeHash, fpcPath: config.native.fpc });
      output(result, `Contrato ${result.contractHash}; ${result.models} modelos gerados.\nRevise o relatório: ${result.reportPath}`);
    } else if (command === 'build') {
      const result = await buildNative(config);
      output(result, `Runtime compilado: ${runtimeDirectory(config)}\nACBr revisão ${result.sourceRevision}; contrato ${result.contractHash}.`);
    } else {
      const result = await checkBuild(config);
      const offlineChecks = await checkOffline(config, result);
      output({ ...result, offlineChecks }, `Fontes, contrato e ${Object.keys(result.files).length} arquivos do runtime conferidos por SHA256.\n${offlineChecks.length} verificações offline do motor aprovadas; nenhuma transmissão.`);
    }
    return 0;
  } catch (error) {
    io.stderr.write(`Erro: ${(error as Error).message}\n`);
    return 1;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => { process.exitCode = code; });
}
