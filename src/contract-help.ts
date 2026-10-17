import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ACBR_CONTRACT } from '../generated/acbr/models.js';
import type { ModelIR, ModelProperty, ModelType } from './generator.js';

export interface ContractMetadata {
  formatVersion: 1;
  sourceRevision: number;
  sourceHash: string;
  contractHash: string;
  ir: ModelIR;
}
export interface FieldDescription {
  formatVersion: 1;
  sdkVersion: string;
  sourceRevision: number;
  sourceHash: string;
  contractHash: string;
  root: string;
  path: string;
  kind: ModelProperty['kind'];
  pascalType: string;
  typeReference?: string;
  inputType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  readonly: boolean;
  declaredDefault?: string;
  values?: string[];
  constraints?: { min?: number; max?: number; scale?: number };
  itemType?: string;
  members?: { name: string; kind: ModelProperty['kind']; pascalType: string; readonly: boolean }[];
}
export interface TypeDescription {
  formatVersion: 1;
  sdkVersion: string;
  sourceRevision: number;
  sourceHash: string;
  contractHash: string;
  root: string;
  name: string;
  kind: ModelType['kind'];
  pascalType: string;
  inputType: 'string' | 'object' | 'array';
  values?: string[];
  itemType?: string;
  members?: FieldDescription['members'];
}
export type TargetDescription = FieldDescription | TypeDescription;
export class FieldHelpError extends Error {
  constructor(public readonly code: string, message: string, public readonly details?: { segment?: string; ownerType?: string; candidates?: string[] }) { super(message); this.name = 'FieldHelpError'; }
}
const kinds = new Set(['string', 'integer', 'decimal', 'datetime', 'boolean', 'enum', 'object', 'list']);
const identifier = /^[A-Za-z_]\w*$/;
const sha256 = /^[a-f0-9]{64}$/;
const fail = (message = 'Os metadados do contrato são inválidos.'): never => { throw new FieldHelpError('CONTRATO_INVALIDO', message); };

export function validateContractMetadata(value: unknown): ContractMetadata {
  const metadata = value as ContractMetadata;
  if (!metadata || metadata.formatVersion !== 1 || !Number.isSafeInteger(metadata.sourceRevision) || metadata.sourceRevision < 1 ||
      !sha256.test(metadata.sourceHash ?? '') || !sha256.test(metadata.contractHash ?? '') || metadata.ir?.schemaVersion !== 1 ||
      !identifier.test(metadata.ir.root ?? '') || !Array.isArray(metadata.ir.types) || metadata.ir.types.length === 0) fail();
  const digest = createHash('sha256').update(JSON.stringify({ sourceRevision: metadata.sourceRevision, sourceHash: metadata.sourceHash, ir: metadata.ir })).digest('hex');
  if (digest !== metadata.contractHash) fail('O hash dos metadados diverge do contrato gerado.');
  const types = new Map<string, ModelType>();
  for (const node of metadata.ir.types) {
    if (!node || typeof node.name !== 'string' || !identifier.test(node.name) || types.has(node.name) || !['object', 'list', 'enum'].includes(node.kind)) fail();
    types.set(node.name, node);
  }
  if (types.get(metadata.ir.root)?.kind !== 'object') fail();
  for (const node of types.values()) {
    if (node.kind === 'enum') {
      if (!Array.isArray(node.values) || node.values.length === 0 || node.values.some(v => typeof v !== 'string' || !identifier.test(v)) || new Set(node.values).size !== node.values.length) fail();
    } else if (node.kind === 'list') {
      if (!node.item || types.get(node.item)?.kind !== 'object') fail();
    } else {
      if (!Array.isArray(node.properties)) fail();
      const names = new Set<string>();
      for (const property of node.properties!) {
        if (!property || typeof property.name !== 'string' || !identifier.test(property.name) || names.has(property.name.toLowerCase()) || !kinds.has(property.kind) || typeof property.type !== 'string' || typeof property.readonly !== 'boolean') fail();
        names.add(property.name.toLowerCase());
        if (['object', 'list', 'enum'].includes(property.kind) && (!property.ref || types.get(property.ref)?.kind !== property.kind)) fail();
        if (!['object', 'list', 'enum'].includes(property.kind) && property.ref !== undefined) fail();
        if (property.declaredDefault !== undefined && typeof property.declaredDefault !== 'string') fail();
        for (const key of ['min', 'max', 'scale'] as const) if (property[key] !== undefined && !Number.isFinite(property[key])) fail();
      }
    }
  }
  return metadata;
}

function matchingPaths(types: Map<string, ModelType>, root: string, field: string): string[] {
  const paths: string[] = [];
  let incomplete = false;
  function visit(name: string, prefix: string, trail: Set<string>): void {
    if (trail.has(name) || trail.size > 128 || paths.length > 1000) { incomplete = true; return; }
    const node = types.get(name)!;
    const next = new Set(trail).add(name);
    if (node.kind === 'list') { visit(node.item!, prefix + '[]', next); return; }
    if (node.kind !== 'object') return;
    for (const property of node.properties!) {
      const candidate = prefix ? prefix + '.' + property.name : property.name;
      if (property.name === field) paths.push(candidate);
      if (property.ref && property.kind !== 'enum') visit(property.ref, candidate, next);
    }
  }
  visit(root, '', new Set());
  if (incomplete) throw new FieldHelpError('CAMINHO_COMPLETO_NECESSARIO', 'O contrato contém caminhos recursivos ou extensos. Informe o caminho completo.');
  return paths.sort();
}

export function describeField(metadata: ContractMetadata, sdkVersion: string, query: string): FieldDescription {
  validateContractMetadata(metadata);
  if (typeof query !== 'string' || query.length > 512 || !/^[A-Za-z_]\w*(?:\[(?:\d*)\])?(?:\.[A-Za-z_]\w*(?:\[(?:\d*)\])?)*$/.test(query))
    throw new FieldHelpError('CAMINHO_INVALIDO', 'Use nomes de campos separados por ponto e [] para elementos de coleção.');
  const types = new Map(metadata.ir.types.map(node => [node.name, node]));
  const root = metadata.ir.root;
  const base = { formatVersion: 1 as const, sdkVersion, sourceRevision: metadata.sourceRevision, sourceHash: metadata.sourceHash, contractHash: metadata.contractHash, root };
  let relative = query === root ? '' : query.startsWith(root + '.') ? query.slice(root.length + 1) : query;
  if (identifier.test(relative) && !types.get(root)!.properties!.some(property => property.name === relative)) {
    const matches = matchingPaths(types, root, relative);
    if (matches.length > 1) throw new FieldHelpError('CAMPO_AMBIGUO', 'O nome aparece em mais de um caminho. Informe o caminho completo.', { candidates: matches });
    if (matches.length === 1) relative = matches[0]!;
  }
  let node = types.get(root)!;
  let property: ModelProperty | undefined;
  let readonly = false;
  const canonical: string[] = [];
  const parts = relative ? relative.split('.') : [];
  for (let index = 0; index < parts.length; index++) {
    const segment = parts[index]!;
    const parsed = /^([A-Za-z_]\w*)(\[(?:\d*)\])?$/.exec(segment)!;
    if (node.kind !== 'object') throw new FieldHelpError('CAMINHO_INVALIDO', 'O caminho tenta acessar um campo de um valor simples.');
    property = node.properties!.find(item => item.name === parsed[1]);
    if (!property) throw new FieldHelpError('CAMPO_INEXISTENTE', 'O campo não existe nesse objeto do contrato.', { segment: parsed[1], ownerType: node.name, candidates: node.properties!.map(item => item.name) });
    readonly ||= property.readonly;
    canonical.push(property.name);
    const selected = parsed[2] !== undefined;
    if (selected && property.kind !== 'list') throw new FieldHelpError('CAMPO_NAO_COLECAO', '[] ou índice foi usado em um campo que não é coleção.');
    if (property.kind === 'list') {
      node = types.get(property.ref!)!;
      if (selected) { canonical[canonical.length - 1] += '[]'; node = types.get(node.item!)!; }
      else if (index < parts.length - 1) throw new FieldHelpError('COLECAO_REQUER_INDICE', 'Use [] ou um índice para consultar campos do elemento da coleção.');
    } else if (property.ref) node = types.get(property.ref)!;
    else if (index < parts.length - 1) throw new FieldHelpError('CAMINHO_INVALIDO', 'Um valor simples não contém outros campos.');
  }
  const selectedListItem = property?.kind === 'list' && canonical[canonical.length - 1]?.endsWith('[]');
  const kind = selectedListItem ? 'object' : property?.kind ?? 'object';
  const description: FieldDescription = { ...base, path: [root, ...canonical].join('.'), kind,
    pascalType: selectedListItem ? node.name : property?.type ?? node.name,
    inputType: kind === 'integer' ? 'number' : kind === 'boolean' ? 'boolean' : kind === 'object' ? 'object' : kind === 'list' ? 'array' : 'string', readonly };
  if (property?.declaredDefault !== undefined) description.declaredDefault = property.declaredDefault;
  if (property?.ref) description.typeReference = selectedListItem ? node.name : property.ref;
  if (kind === 'enum') description.values = [...node.values!];
  const constraints = property && Object.fromEntries((['min', 'max', 'scale'] as const).filter(key => property![key] !== undefined).map(key => [key, property![key]]));
  if (constraints && Object.keys(constraints).length) description.constraints = constraints;
  if (kind === 'list') description.itemType = node.item;
  if (kind === 'object') description.members = node.properties!.map(item => ({ name: item.name, kind: item.kind, pascalType: item.type, readonly: readonly || item.readonly }));
  return description;
}

export function describeTarget(metadata: ContractMetadata, sdkVersion: string, query?: string): TargetDescription {
  validateContractMetadata(metadata);
  query ??= metadata.ir.root;
  const node = metadata.ir.types.find(type => type.name === query);
  if (!node) return describeField(metadata, sdkVersion, query);
  const description: TypeDescription = { formatVersion: 1, sdkVersion, sourceRevision: metadata.sourceRevision,
    sourceHash: metadata.sourceHash, contractHash: metadata.contractHash, root: metadata.ir.root,
    name: node.name, kind: node.kind, pascalType: node.name,
    inputType: node.kind === 'enum' ? 'string' : node.kind === 'list' ? 'array' : 'object' };
  if (node.kind === 'enum') description.values = [...node.values!];
  if (node.kind === 'list') description.itemType = node.item;
  if (node.kind === 'object') description.members = node.properties!.map(item => ({ name: item.name, kind: item.kind, pascalType: item.type, readonly: item.readonly }));
  return description;
}

async function installedContract(packageRoot: string): Promise<{ metadata: ContractMetadata; sdkVersion: string }> {
  let metadata: ContractMetadata, pkg: { version: string }, lock: { source: { revision: number; treeHash: string } };
  try {
    [metadata, pkg, lock] = await Promise.all(['dist/contract.json', 'package.json', 'acbr.lock.json'].map(async filename => JSON.parse(await readFile(path.join(packageRoot, filename), 'utf8')))) as [ContractMetadata, typeof pkg, typeof lock];
  } catch { throw new FieldHelpError('CONTRATO_INDISPONIVEL', 'Os metadados empacotados não estão disponíveis. Reinstale o pacote ou gere e compile o checkout.'); }
  validateContractMetadata(metadata);
  if (typeof pkg.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version) ||
      metadata.sourceRevision !== lock.source?.revision || metadata.sourceHash !== lock.source?.treeHash ||
      metadata.sourceRevision !== ACBR_CONTRACT.sourceRevision || metadata.contractHash !== ACBR_CONTRACT.contractHash)
    throw new FieldHelpError('CONTRATO_INCOMPATIVEL', 'Os metadados divergem da versão instalada, do lock ou do validador gerado.');
  return { metadata, sdkVersion: pkg.version };
}

export async function describeInstalledField(query: string, packageRoot: string): Promise<FieldDescription> {
  const { metadata, sdkVersion } = await installedContract(packageRoot);
  return describeField(metadata, sdkVersion, query);
}

export async function describeInstalledTarget(query: string | undefined, packageRoot: string): Promise<TargetDescription> {
  const { metadata, sdkVersion } = await installedContract(packageRoot);
  return describeTarget(metadata, sdkVersion, query);
}

export async function installedSdkVersion(packageRoot: string): Promise<string> {
  let pkg: { version?: unknown };
  try { pkg = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8')); }
  catch { throw new FieldHelpError('VERSAO_INDISPONIVEL', 'Não foi possível ler a versão do pacote instalado.'); }
  if (!pkg || typeof pkg.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version))
    throw new FieldHelpError('VERSAO_INDISPONIVEL', 'A versão do pacote instalado é inválida.');
  return pkg.version;
}

export function formatFieldDescription(description: FieldDescription): string {
  const lines = [description.path, `Tipo: ${description.pascalType}${description.typeReference && description.typeReference !== description.pascalType ? ` [${description.typeReference}]` : ''} (${description.kind}; entrada ${description.inputType})`,
    `Somente leitura: ${description.readonly ? 'sim' : 'não'}`];
  if (description.values) lines.push(`Valores permitidos na API: ${description.values.join(', ')}`);
  if (description.declaredDefault !== undefined) lines.push(`Padrão declarado no Pascal: ${description.declaredDefault} (não substitui regras fiscais ou o construtor nativo).`);
  if (description.constraints) lines.push(`Limites do tipo: ${JSON.stringify(description.constraints)}`);
  if (description.itemType) lines.push(`Tipo do elemento: ${description.itemType}`);
  if (description.members) lines.push(`Campos: ${description.members.map(member => member.name).join(', ')}`);
  lines.push(`SDK: ${description.sdkVersion}; revisão ACBr: ${description.sourceRevision}`, `Contrato: ${description.contractHash}`);
  return lines.join('\n');
}

export function formatTargetDescription(description: TargetDescription): string {
  if ('path' in description) return formatFieldDescription(description);
  const lines = [`Tipo: ${description.name} (${description.kind}; entrada ${description.inputType})`];
  if (description.values) lines.push(`Valores permitidos na API: ${description.values.join(', ')}`);
  if (description.itemType) lines.push(`Tipo do elemento: ${description.itemType}`);
  if (description.members) lines.push(`Campos: ${description.members.map(member => member.name).join(', ')}`);
  lines.push(`SDK: ${description.sdkVersion}; revisão ACBr: ${description.sourceRevision}`, `Contrato: ${description.contractHash}`);
  return lines.join('\n');
}
