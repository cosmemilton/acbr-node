import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { describeField, describeInstalledField, describeTarget, describeInstalledTarget, formatTargetDescription, installedSdkVersion, validateContractMetadata, FieldHelpError, type ContractMetadata } from '../src/contract-help.js';
import { renderContractMetadata } from '../src/generator.js';
import { main } from '../src/cli.js';

const metadata = JSON.parse(await readFile(new URL('../generated/acbr/contract.json', import.meta.url), 'utf8')) as ContractMetadata;
function rebind(value: ContractMetadata): ContractMetadata {
  value.contractHash = createHash('sha256').update(JSON.stringify({ sourceRevision: value.sourceRevision, sourceHash: value.sourceHash, ir: value.ir })).digest('hex');
  return value;
}
function code(expected: string) { return (error: unknown) => error instanceof FieldHelpError && error.code === expected; }
function capture() {
  let stdout = '', stderr = '';
  return { io: { stdout: { write(text: string) { stdout += text; } }, stderr: { write(text: string) { stderr += text; } } }, result: () => ({ stdout, stderr }) };
}
async function installedFixture(t: any) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'acbr-field-help-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'dist'));
  await writeFile(path.join(root, 'dist/contract.json'), JSON.stringify(metadata));
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ version: '9.9.9-synthetic' }));
  await writeFile(path.join(root, 'acbr.lock.json'), JSON.stringify({ source: { revision: metadata.sourceRevision, treeHash: metadata.sourceHash } }));
  return root;
}

test('field values and provenance come from generated metadata and update with the IR', () => {
  assert.equal(metadata.ir.types.length, 204);
  const field = describeField(metadata, '0.1.1', 'Ide.tpNF');
  assert.equal(field.path, 'TNFe.Ide.tpNF'); assert.equal(field.pascalType, 'TTipoNFe');
  assert.deepEqual(field.values, ['tnEntrada', 'tnSaida']); assert.equal(field.declaredDefault, 'tnSaida');
  assert.equal(field.sourceRevision, metadata.sourceRevision); assert.equal(field.contractHash, metadata.contractHash);
  const changed = structuredClone(metadata);
  changed.ir.types.find(node => node.name === 'TTipoNFe')!.values!.push('tnValorSinteticoNovo');
  rebind(changed);
  const emitted = JSON.parse(renderContractMetadata(changed.ir, changed.sourceRevision, changed.sourceHash, changed.contractHash));
  assert.deepEqual(describeField(emitted, '9.9.9', 'Ide.tpNF').values, ['tnEntrada', 'tnSaida', 'tnValorSinteticoNovo']);
  assert.throws(() => renderContractMetadata(changed.ir, changed.sourceRevision, changed.sourceHash, metadata.contractHash), /Hash/);
});

test('nested fields, arrays, numeric indexes and aliases resolve through refs and item types', () => {
  const pis = describeField(metadata, '0.1.1', 'Det[].Imposto.PIS.CST');
  assert.equal(pis.typeReference, 'TCSTPis'); assert.equal(pis.pascalType, 'TCstPis');
  assert.equal(pis.values!.length, 33); assert.ok(pis.values!.includes('pis99'));
  assert.deepEqual(describeField(metadata, '0.1.1', 'TNFe.Det[17].Imposto.PIS.CST'), pis);
  const nested = describeField(metadata, '0.1.1', 'Det[0].Prod.DI[].adi[2].nAdicao');
  assert.equal(nested.path, 'TNFe.Det[].Prod.DI[].adi[].nAdicao'); assert.equal(nested.inputType, 'number');
  assert.equal(describeField(metadata, '0.1.1', 'Det').itemType, 'TDetCollectionItem');
  assert.equal(describeField(metadata, '0.1.1', 'Det[]').kind, 'object');
});

test('primitive representation, collection members and readonly ancestors are described', () => {
  assert.deepEqual(describeField(metadata, '0.1.1', 'Det[].Prod.vProd').constraints, { scale: 4 });
  assert.equal(describeField(metadata, '0.1.1', 'Ide.dEmi').inputType, 'string');
  assert.ok(describeField(metadata, '0.1.1', 'TNFe').members!.some(member => member.name === 'Det'));
  const signature = describeField(metadata, '0.1.1', 'signature'); assert.equal(signature.readonly, true);
  const first = signature.members![0]!;
  assert.equal(describeField(metadata, '0.1.1', `signature.${first.name}`).readonly, true);
});

test('short names require a unique path and ambiguity lists all known CST contexts', () => {
  assert.equal(describeField(metadata, '0.1.1', 'tpNF').path, 'TNFe.Ide.tpNF');
  assert.throws(() => describeField(metadata, '0.1.1', 'CST'), error => {
    assert.ok(code('CAMPO_AMBIGUO')(error));
    const paths = (error as FieldHelpError).details!.candidates!;
    assert.equal(paths.length, 5); assert.ok(paths.includes('Det[].Imposto.PIS.CST')); return true;
  });
  const recursive = structuredClone(metadata);
  recursive.ir.types.find(node => node.name === 'TNFe')!.properties!.push({ name: 'Loop', type: 'TNFe', kind: 'object', ref: 'TNFe', readonly: false });
  rebind(recursive);
  assert.throws(() => describeField(recursive, '9.9.9', 'tpNF'), code('CAMINHO_COMPLETO_NECESSARIO'));
  assert.equal(describeField(recursive, '9.9.9', 'Loop.Ide.tpNF').kind, 'enum');
});

test('invalid syntax, missing fields and incorrect collection selectors have distinct errors', () => {
  for (const value of ['../config.json', 'Det[-1].Imposto', 'Det[x]', 'Ide..tpNF', 'Ide.tpNF()', 'A'.repeat(513)])
    assert.throws(() => describeField(metadata, '0.1.1', value), code('CAMINHO_INVALIDO'));
  for (const value of ['Ide.dhEmi', 'ide.tpNF', '__proto__', 'constructor.prototype'])
    assert.throws(() => describeField(metadata, '0.1.1', value), code('CAMPO_INEXISTENTE'));
  assert.throws(() => describeField(metadata, '0.1.1', 'Ide[]'), code('CAMPO_NAO_COLECAO'));
  assert.throws(() => describeField(metadata, '0.1.1', 'Det.Imposto'), code('COLECAO_REQUER_INDICE'));
  assert.throws(() => describeField(metadata, '0.1.1', 'Ide.tpNF.Extra'), code('CAMINHO_INVALIDO'));
});

test('metadata corruption and structurally invalid but rehashed graphs are rejected', () => {
  const changed = structuredClone(metadata); changed.ir.root = 'Other';
  assert.throws(() => validateContractMetadata(changed), code('CONTRATO_INVALIDO'));
  const missing = structuredClone(metadata); missing.ir.types.find(node => node.name === 'TNFe')!.properties![0]!.ref = 'Missing';
  assert.throws(() => validateContractMetadata(rebind(missing)), code('CONTRATO_INVALIDO'));
  const duplicate = structuredClone(metadata); duplicate.ir.types.push(duplicate.ir.types[0]!);
  assert.throws(() => validateContractMetadata(rebind(duplicate)), code('CONTRATO_INVALIDO'));
});

test('installed help reads its own package version and rejects a mismatched lock', async t => {
  const root = await installedFixture(t);
  assert.equal((await describeInstalledField('Ide.tpNF', root)).sdkVersion, '9.9.9-synthetic');
  await writeFile(path.join(root, 'acbr.lock.json'), JSON.stringify({ source: { revision: 1, treeHash: metadata.sourceHash } }));
  await assert.rejects(describeInstalledField('Ide.tpNF', root), code('CONTRATO_INCOMPATIVEL'));
  await rm(path.join(root, 'dist/contract.json'));
  await assert.rejects(describeInstalledField('Ide.tpNF', root), code('CONTRATO_INDISPONIVEL'));
});

test('CLI emits text or JSON and structured failures without reading caller configuration', async t => {
  const root = await installedFixture(t);
  await writeFile(path.join(root, 'acbr.config.json'), 'SYNTHETIC_INVALID_CONFIG_MUST_NOT_BE_READ');
  const human = capture(); assert.equal(await main(['help', 'TAG', 'Ide.tpNF'], human.io, { contractRoot: root }), 0);
  assert.match(human.result().stdout, /tnEntrada, tnSaida/); assert.equal(human.result().stderr, '');
  const json = capture(); assert.equal(await main(['help', 'tag', 'Det[].Imposto.PIS.CST', '--json'], json.io, { contractRoot: root }), 0);
  assert.equal(JSON.parse(json.result().stdout).sdkVersion, '9.9.9-synthetic');
  for (const [args, expected] of [
    [['help', 'TAG', 'CST', '--json'], 'CAMPO_AMBIGUO'],
    [['help', 'TAG', 'Ide.dhEmi', '--json'], 'CAMPO_INEXISTENTE'],
    [['help', 'TAG', 'Ide.tpNF', '--config', 'never-read.json', '--json'], 'USO_INVALIDO'],
    [['help', 'TAG', '--json'], 'USO_INVALIDO'],
    [['help', 'TAG', 'Ide.tpNF', '--unknown-option', '--json'], 'USO_INVALIDO'],
    [['--json', 'help', 'TAG', 'Ide.tpNF', '--json'], 'USO_INVALIDO'],
  ] as const) {
    const report = capture(); assert.equal(await main([...args], report.io, { contractRoot: root }), 1);
    assert.equal(report.result().stdout, ''); assert.equal(JSON.parse(report.result().stderr).error.code, expected);
  }
});

test('describe resolves named types without borrowing a default from a field', () => {
  const field = describeTarget(metadata, '9.9.9', 'Ide.tpNF');
  assert.deepEqual(field, describeField(metadata, '9.9.9', 'Ide.tpNF'));
  const type = describeTarget(metadata, '9.9.9', 'TTipoNFe');
  assert.ok('name' in type);
  assert.equal(type.name, 'TTipoNFe'); assert.equal(type.kind, 'enum');
  assert.deepEqual(type.values, field.values);
  for (const key of ['path', 'readonly', 'declaredDefault']) assert.equal(Object.hasOwn(type, key), false);
  assert.match(formatTargetDescription(type), /Tipo: TTipoNFe/);
  assert.doesNotMatch(formatTargetDescription(type), /Padrão declarado/);
  const changed = structuredClone(metadata);
  changed.ir.types.find(node => node.name === 'TTipoNFe')!.values!.push('tnNovoSintetico');
  rebind(changed);
  assert.deepEqual(describeTarget(changed, '9.9.9', 'TTipoNFe').values, ['tnEntrada', 'tnSaida', 'tnNovoSintetico']);
});

test('describe defaults to the IR root and resolves object and collection types', () => {
  const root = describeTarget(metadata, '9.9.9');
  assert.ok('name' in root); assert.equal(root.name, metadata.ir.root);
  assert.ok(root.members!.some(member => member.name === 'Ide'));
  const collection = metadata.ir.types.find(node => node.kind === 'list')!;
  const description = describeTarget(metadata, '9.9.9', collection.name);
  assert.ok('name' in description); assert.equal(description.kind, 'list');
  assert.equal(description.itemType, collection.item); assert.equal(description.inputType, 'array');
  assert.match(formatTargetDescription(description), new RegExp(`Tipo do elemento: ${collection.item}`));
  assert.throws(() => describeTarget(metadata, '9.9.9', 'NoSuchType'), code('CAMPO_INEXISTENTE'));
  const corrupt = structuredClone(metadata); corrupt.ir.root = 'Missing';
  assert.throws(() => describeTarget(corrupt, '9.9.9'), code('CONTRATO_INVALIDO'));
});

test('installed describe preserves field output and validates contract metadata for named types', async t => {
  const root = await installedFixture(t);
  assert.deepEqual(await describeInstalledTarget('Ide.tpNF', root), await describeInstalledField('Ide.tpNF', root));
  const type = await describeInstalledTarget('TTipoNFe', root);
  assert.equal(type.sdkVersion, '9.9.9-synthetic'); assert.equal(type.contractHash, metadata.contractHash);
  await writeFile(path.join(root, 'acbr.lock.json'), JSON.stringify({ source: { revision: 1, treeHash: metadata.sourceHash } }));
  await assert.rejects(describeInstalledTarget('TTipoNFe', root), code('CONTRATO_INCOMPATIVEL'));
});

test('describe CLI supports fields, types, default root and structured usage errors', async t => {
  const root = await installedFixture(t);
  for (const target of ['Ide.tpNF', 'TTipoNFe', undefined]) {
    const report = capture();
    const args = target ? ['describe', target, '--json'] : ['describe', '--json'];
    assert.equal(await main(args, report.io, { contractRoot: root }), 0);
    assert.equal(report.result().stderr, '');
    assert.deepEqual(JSON.parse(report.result().stdout), await describeInstalledTarget(target, root));
  }
  const field = capture(), legacy = capture(), type = capture();
  assert.equal(await main(['describe', 'Ide.tpNF'], field.io, { contractRoot: root }), 0);
  assert.equal(await main(['help', 'TAG', 'Ide.tpNF'], legacy.io, { contractRoot: root }), 0);
  assert.deepEqual(field.result(), legacy.result());
  assert.equal(await main(['describe', 'TTipoNFe'], type.io, { contractRoot: root }), 0);
  assert.match(type.result().stdout, /Valores permitidos na API: tnEntrada, tnSaida/);
  assert.doesNotMatch(type.result().stdout, /Padrão declarado/);
  for (const [args, expected] of [
    [['describe', 'CST', '--json'], 'CAMPO_AMBIGUO'],
    [['describe', 'Ide.dhEmi', '--json'], 'CAMPO_INEXISTENTE'],
    [['describe', 'Ide.tpNF', '--config', 'never-read.json', '--json'], 'USO_INVALIDO'],
    [['describe', 'TTipoNFe', '--revision', '48590', '--json'], 'USO_INVALIDO'],
    [['describe', 'TTipoNFe', 'extra', '--json'], 'USO_INVALIDO'],
    [['describe', '--unknown-option', '--json'], 'USO_INVALIDO'],
    [['describe', '--json', '--json'], 'USO_INVALIDO'],
  ] as const) {
    const report = capture(); assert.equal(await main([...args], report.io, { contractRoot: root }), 1);
    assert.equal(report.result().stdout, ''); assert.equal(JSON.parse(report.result().stderr).error.code, expected);
  }
});

test('version reads only the installed package and does not require contract or lock files', async t => {
  const root = await installedFixture(t);
  await rm(path.join(root, 'dist'), { recursive: true });
  await rm(path.join(root, 'acbr.lock.json'));
  assert.equal(await installedSdkVersion(root), '9.9.9-synthetic');
  for (const flag of ['--version', '-V']) {
    const report = capture(); assert.equal(await main([flag], report.io, { contractRoot: root }), 0);
    assert.equal(report.result().stdout, 'acbr-node 9.9.9-synthetic\n'); assert.equal(report.result().stderr, '');
  }
  const json = capture(); assert.equal(await main(['--version', '--json'], json.io, { contractRoot: root }), 0);
  assert.deepEqual(JSON.parse(json.result().stdout), { version: '9.9.9-synthetic' });
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ version: 'invalid' }));
  await assert.rejects(installedSdkVersion(root), code('VERSAO_INDISPONIVEL'));
});
