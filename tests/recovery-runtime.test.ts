import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { criarEmissor, ErroAcbrNode, type OpcoesEmissor, type RequisicaoMotor, type Consulta, type Contrato } from '../src/runtime.js';
import { criarEmissor as criarCliente } from '../src/index.js';

// An inert hashed file plus an injected in-memory child; no native SDK, A1 or network.
const contract = { sourceRevision: 48590, contractHash: 'a'.repeat(64) };
const signed = '\uFEFF<?xml version="1.0" encoding="UTF-8"?>\r\n<NFe>FICTÍCIO</NFe>';
const recovered = '<nfeProc>FICTITIOUS_RECOVERY_ONLY</nfeProc>';
interface SetupOptions { capabilities?: unknown; omitCapabilities?: boolean; mode?: 'normal' | 'timeout'; emitter?: Partial<OpcoesEmissor>; response?: Record<string, unknown>; sendingMarker?: boolean }
async function setup(t: TestContext, options: SetupOptions = {}) {
  const directory = path.resolve(await mkdtemp(path.join(tmpdir(), 'acbr-recovery-runtime-test-')));
  const permitted = path.resolve(tmpdir()) + path.sep;
  assert.ok(directory.startsWith(permitted));
  const bytes = Buffer.from('INERT_SYNTHETIC_WORKER_NOT_EXECUTABLE');
  await writeFile(path.join(directory, 'fixture.bin'), bytes);
  await writeFile(path.join(directory, 'manifest.json'), JSON.stringify({ formatVersion: 1, ...contract, platform: process.platform, arch: process.arch, executable: 'fixture.bin', files: { 'fixture.bin': createHash('sha256').update(bytes).digest('hex') }, ...(options.omitCapabilities ? {} : { capabilities: options.capabilities ?? ['recuperarXml'] }) }));
  const requests: RequisicaoMotor[] = [];
  let launches = 0;
  const emitter = criarEmissor({ cnpj: '12345678000195', uf: 'PE', modelo: 55, ambiente: 2, contrato: contract, certificado: { pfx: Buffer.from('SYNTHETIC_NOT_A_CERTIFICATE'), senha: 'SYNTHETIC_PASSWORD' }, runtimeDirectory: directory, timeoutMs: options.mode === 'timeout' ? 30 : 1000,
    criaProcesso(_executable, args, spawnOptions) {
      launches++;
      assert.equal(spawnOptions.shell, false);
      assert.equal(args.join(' ').includes('SYNTHETIC_PASSWORD'), false);
      const child = new EventEmitter() as ChildProcessWithoutNullStreams;
      const stdin = new PassThrough(), stdout = new PassThrough(), stderr = new PassThrough();
      Object.assign(child, { pid: 12345, stdin, stdout, stderr, kill: () => { queueMicrotask(() => child.emit('close', 1, null)); return true; }, unref: () => child });
      const chunks: Buffer[] = [];
      stdin.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stdin.on('finish', () => {
        const request = JSON.parse(Buffer.concat(chunks).toString('utf8')) as RequisicaoMotor;
        requests.push(request);
        if (options.mode === 'timeout') return;
        queueMicrotask(() => {
          if(options.sendingMarker)stdout.write(JSON.stringify({tipo:'envioIniciado',id:request.id})+'\n');
          stdout.write(JSON.stringify({ versao: 1, id: request.id, ...contract, sucesso: true, estado: request.comando==='recuperarXml'?'XML_RECUPERADO':'AUTORIZADO', cStat: 100, chave: '1'.repeat(44), protocolo: '1'.repeat(15), envioIniciado: false, xmlBase64: Buffer.from(recovered).toString('base64'), ...options.response }) + '\n');
          child.emit('close', 0, null);
        });
      });
      return child;
    }, ...options.emitter });
  t.after(async () => { await emitter.fechar(); assert.ok(directory.startsWith(permitted)); await rm(directory, { recursive: true, force: true }); });
  return { emitter, requests, get launches() { return launches; } };
}

test('recuperarXml forwards only exact UTF8/BOM XML to one supported worker and reports consultation recovery', async t => {
  const fixture = await setup(t);
  const result = await fixture.emitter.recuperarXml(signed, { signal: new AbortController().signal });
  assert.equal(fixture.launches, 1); assert.equal(fixture.requests.length, 1);
  const request = fixture.requests[0];
  assert.equal(request.comando, 'recuperarXml');
  assert.deepEqual(Buffer.from(request.xmlBase64!, 'base64'), Buffer.from(signed, 'utf8'));
  assert.deepEqual(Object.keys(request).sort(), ['xmlBase64', 'sourceRevision', 'contractHash', 'versao', 'id', 'comando', 'config'].sort());
  assert.equal(result.xmlBase64, Buffer.from(recovered).toString('base64'));
  assert.equal(result.diagnostico?.codigo, 'XML_RECUPERADO'); assert.equal(result.diagnostico?.etapa, 'consulta');
  assert.equal(result.diagnostico?.statusEnvio, 'autorizado'); assert.match(result.diagnostico!.mensagem, /consulta.*não transmitiu/);
  assert.equal(JSON.stringify(result.diagnostico).includes('SYNTHETIC_PASSWORD'), false);
});

test('signed XML input rejects wrong types, blank text and oversized content without starting a worker', async t => {
  const fixture = await setup(t);
  for (const value of [undefined, null, {}, '', '  ', 'x'.repeat(2 * 1024 * 1024 + 1)]) assert.throws(() => fixture.emitter.recuperarXml(value as string), error => error instanceof ErroAcbrNode && error.codigo === 'XML_INVALIDO' && error.diagnostico.campo === 'xml');
  assert.equal(fixture.launches, 0);
});

test('recuperarXml requires A1 and rejects before worker launch with a consultation diagnosis', async t => {
  const fixture = await setup(t, { emitter: { certificado: undefined } });
  await assert.rejects(fixture.emitter.recuperarXml(signed), error => error instanceof ErroAcbrNode && error.codigo === 'CERTIFICADO_AUSENTE' && error.diagnostico.etapa === 'consulta' && error.diagnostico.statusEnvio === 'nao_enviado');
  assert.equal(fixture.launches, 0);
});

test('old manifests and absent advertised capability fail clearly before spawn while consultar remains compatible', async t => {
  for (const options of [{ omitCapabilities: true }, { capabilities: [] }, { capabilities: ['otherOperation'] }]) {
    const fixture = await setup(t, options);
    await assert.rejects(fixture.emitter.recuperarXml(signed), error => error instanceof ErroAcbrNode && error.codigo === 'RUNTIME_SEM_CAPACIDADE' && error.resultadoDesconhecido === false && error.diagnostico.etapa === 'runtime' && /runtime/.test(error.diagnostico.acao));
    assert.equal(fixture.launches, 0);
    await fixture.emitter.consultar({ chave: '1'.repeat(44), recibo: '2'.repeat(15) });
    assert.equal(fixture.launches, 1); assert.equal(fixture.requests[0].comando, 'consultar'); assert.equal(fixture.requests[0].recibo, '2'.repeat(15));
  }
});

test('malformed capability metadata is rejected instead of launching any worker', async t => {
  for (const capabilities of ['recuperarXml', [1], ['../recuperarXml']]) {
    const fixture = await setup(t, { capabilities });
    await assert.rejects(fixture.emitter.recuperarXml(signed), error => error instanceof ErroAcbrNode && error.codigo === 'RUNTIME_INVALIDO');
    assert.equal(fixture.launches, 0);
  }
});

test('consultar cannot replace reserved envelope fields, issuer config or command through JavaScript extra properties', async t => {
  let toJSONCalls = 0;
  const injected = { versao: 999, id: 'ATTACKER_ID', sourceRevision: 1, contractHash: 'b'.repeat(64), comando: 'transmitir', config: { cnpj: '9'.repeat(14), ambiente: 1 }, xmlBase64: 'ATTACKER_XML', toJSON() { toJSONCalls++; return { comando: 'transmitir', config: { ambiente: 1 } }; } };
  const fixture = await setup(t, { emitter: { contrato: { ...contract, ...injected, sourceRevision: contract.sourceRevision, contractHash: contract.contractHash } as Contrato } });
  await fixture.emitter.consultar({ chave: '1'.repeat(44), recibo: '2'.repeat(15), ...injected } as Consulta);
  const request = fixture.requests[0];
  assert.equal(fixture.launches, 1); assert.equal(toJSONCalls, 0);
  assert.equal(request.comando, 'consultar'); assert.equal(request.versao, 1); assert.match(request.id, /^[a-f0-9-]{36}$/); assert.notEqual(request.id, injected.id);
  assert.equal(request.sourceRevision, contract.sourceRevision); assert.equal(request.contractHash, contract.contractHash);
  assert.equal(request.config.cnpj, '12345678000195'); assert.equal(request.config.ambiente, 2);
  assert.equal(request.xmlBase64, undefined); assert.equal(request.chave, '1'.repeat(44)); assert.equal(request.recibo, '2'.repeat(15));
});

test('preaborted, timeout and closed recovery operations never retry or become emission commands', async t => {
  const pre = await setup(t), controller = new AbortController(); controller.abort();
  await assert.rejects(pre.emitter.recuperarXml(signed, { signal: controller.signal }), error => error instanceof ErroAcbrNode && error.codigo === 'OPERACAO_CANCELADA');
  assert.equal(pre.launches, 0);
  const timeout = await setup(t, { mode: 'timeout' });
  await assert.rejects(timeout.emitter.recuperarXml(signed), error => error instanceof ErroAcbrNode && error.codigo === 'TIMEOUT_MOTOR' && error.resultadoDesconhecido === false && error.diagnostico.etapa === 'consulta' && error.xmlBase64 === undefined);
  assert.equal(timeout.launches, 1); assert.deepEqual(timeout.requests.map(request => request.comando), ['recuperarXml']);
  await timeout.emitter.fechar();
  await assert.rejects(timeout.emitter.recuperarXml(signed), error => error instanceof ErroAcbrNode && error.codigo === 'EMISSOR_FECHADO');
  assert.equal(timeout.launches, 1);
});

test('main package emitter exposes recuperarXml without changing consultar or gerarXml signatures', async () => {
  const emitter = criarCliente({ cnpj: '12345678000195', uf: 'PE', modelo: 55, ambiente: 2 });
  try { assert.equal(typeof emitter.recuperarXml, 'function'); assert.equal(typeof emitter.consultar, 'function'); assert.equal(typeof emitter.gerarXml, 'function'); }
  finally { await emitter.fechar(); }
});

test('recovery success requires its own complete100 non-sending state and cannot be reported by consultar', async t => {
  for(const response of [{estado:'AUTORIZADO'},{cStat:150},{cStat:217},{protocolo:undefined},{chave:undefined},{xmlBase64:undefined},{sucesso:false},{envioIniciado:true}]){
    const fixture=await setup(t,{response});
    await assert.rejects(fixture.emitter.recuperarXml(signed),error=>error instanceof ErroAcbrNode&&error.codigo==='RESPOSTA_INVALIDA');
    assert.equal(fixture.launches,1);
  }
  const other=await setup(t,{response:{estado:'XML_RECUPERADO'}});
  await assert.rejects(other.emitter.consultar({chave:'1'.repeat(44)}),error=>error instanceof ErroAcbrNode&&error.codigo==='RESPOSTA_INVALIDA');
  const marker=await setup(t,{sendingMarker:true,response:{envioIniciado:undefined}});
  await assert.rejects(marker.emitter.recuperarXml(signed),error=>error instanceof ErroAcbrNode&&error.codigo==='RESPOSTA_INVALIDA'&&error.resultadoDesconhecido===true);
});

test('unproved consultation remains distinct from recovery and preserves cStat without exposing raw motive in diagnosis',async t=>{
  const fixture=await setup(t,{response:{sucesso:false,estado:'CONSULTADO',codigo:'RECUPERACAO_NAO_COMPROVADA',cStat:217,protocolo:undefined,xmlBase64:undefined,xMotivo:'SYNTHETIC_PRIVATE_MOTIVE'}});
  const result=await fixture.emitter.recuperarXml(signed);
  assert.equal(result.sucesso,false);assert.equal(result.estado,'CONSULTADO');assert.equal(result.cStat,217);assert.equal(result.xmlBase64,undefined);
  assert.equal(result.diagnostico?.codigo,'RECUPERACAO_NAO_COMPROVADA');assert.equal(result.diagnostico?.etapa,'consulta');assert.equal(result.diagnostico?.statusEnvio,'nao_enviado');assert.equal(result.diagnostico?.cStat,217);
  assert.equal(JSON.stringify(result.diagnostico).includes('SYNTHETIC_PRIVATE_MOTIVE'),false);
  assert.match(result.diagnostico!.acao,/Não transmita/);assert.equal(fixture.launches,1);
});

test('worker recovery envelopes can exceed2MiB up to4MiB while decoded bytes over4MiB are rejected',async t=>{
  const max=4*1024*1024,open='<nfeProc>',close='</nfeProc>';
  const payload=(size:number)=>Buffer.from(open+'x'.repeat(size-open.length-close.length)+close).toString('base64');
  for(const size of [2*1024*1024+1,max]){
    const xmlBase64=payload(size),fixture=await setup(t,{response:{xmlBase64}});
    const result=await fixture.emitter.recuperarXml(signed);
    assert.equal(result.xmlBase64,xmlBase64);assert.equal(Buffer.from(result.xmlBase64!,'base64').length,size);assert.equal(result.diagnostico?.codigo,'XML_RECUPERADO');assert.equal(fixture.launches,1);
  }
  for(const size of [max+1,max+2,max+3]){
    const fixture=await setup(t,{response:{xmlBase64:payload(size)}});
    await assert.rejects(fixture.emitter.recuperarXml(signed),error=>error instanceof ErroAcbrNode&&error.codigo==='RESPOSTA_INVALIDA');assert.equal(fixture.launches,1);
  }
});
