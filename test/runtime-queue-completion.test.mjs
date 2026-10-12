import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import { mkdtemp, writeFile, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { criarEmissor } from '../src/runtime.ts';

const PREFIX='acbr-queue-completion-test-';
const contract={sourceRevision:48590,contractHash:'a'.repeat(64)};
const executableBytes=Buffer.from('OFFLINE MOCK EXECUTABLE: never spawned');
function mockChild({manual=false,invalid=false}={}) {
  const child=new EventEmitter(),chunks=[];
  child.pid=424242;child.stdout=new PassThrough();child.stderr=new PassThrough();
  child.stdin=new Writable({write(bytes,_encoding,callback){chunks.push(Buffer.from(bytes));callback();}});
  let request,closed=false,resolveReady;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  function close(code=0){if(closed)return;closed=true;child.emit('close',code);}
  child.kill=()=>{queueMicrotask(()=>close(null));return true;};
  child.unref=()=>child;
  async function respond() {
    await ready;
    const reply={versao:1,id:invalid?'invalid-id':request.id,...contract,sucesso:true,estado:'XML_GERADO',xmlBase64:Buffer.from('<NFe>OFFLINE MOCK</NFe>').toString('base64')};
    child.stdout.write(JSON.stringify(reply)+'\n');child.stdout.end();child.stderr.end();
    if(!closed)close(0);
  }
  child.stdin.on('finish',()=>{request=JSON.parse(Buffer.concat(chunks).toString('utf8'));resolveReady();if(!manual)void respond();});
  return {child,respond,ready,get request(){return request;}};
}
async function fixture(t,{firstInvalid=false,firstLaunchThrows=false}={}) {
  const directory=await mkdtemp(path.join(os.tmpdir(),PREFIX));
  t.after(async()=>{
    const absolute=await realpath(directory),temp=await realpath(os.tmpdir());
    assert.ok(absolute.toLowerCase().startsWith(temp.toLowerCase()+path.sep)&&path.basename(absolute).startsWith(PREFIX));
    await rm(directory,{recursive:true,force:true});
  });
  await writeFile(path.join(directory,'worker-mock'),executableBytes);
  await writeFile(path.join(directory,'manifest.json'),JSON.stringify({formatVersion:1,...contract,platform:process.platform,arch:process.arch,executable:'worker-mock',files:{'worker-mock':createHash('sha256').update(executableBytes).digest('hex')}}));
  const launches=[],waiters=[];let launchCalls=0;
  const emitter=criarEmissor({cnpj:'11222333000181',uf:'PE',modelo:55,ambiente:2,contrato:contract,runtimeDirectory:directory,limiteFila:0,timeoutMs:2000,
    criaProcesso:()=>{
      launchCalls++;
      if(firstLaunchThrows&&launchCalls===1)throw new Error('MOCK_LAUNCH_FAILURE');
      const launched=mockChild({manual:launches.length===0&&!firstLaunchThrows,invalid:firstInvalid&&launches.length===0});
      launches.push(launched);for(const resolve of waiters.splice(0))resolve();return launched.child;
    }});
  t.after(()=>emitter.fechar());
  async function firstLaunch(){if(!launches.length)await new Promise(resolve=>waiters.push(resolve));return launches[0];}
  return {emitter,launches,firstLaunch,get launchCalls(){return launchCalls;}};
}

test('limiteFila 0 admits the first operation and refuses concurrent work before spawn',async t=>{
  const f=await fixture(t),first=f.emitter.gerarXml({mock:'first'});
  await assert.rejects(f.emitter.gerarXml({mock:'concurrent'}),error=>error.codigo==='FILA_CHEIA');
  const launched=await f.firstLaunch();await launched.respond();
  assert.equal((await first).estado,'XML_GERADO');assert.equal(f.launchCalls,1);assert.equal(f.launches.length,1);
});

test('limiteFila 0 immediately admits the next operation after await without a workaround delay',async t=>{
  const f=await fixture(t),first=f.emitter.gerarXml({mock:'first'});
  const launched=await f.firstLaunch();void launched.respond();assert.equal((await first).sucesso,true);
  for(let index=0;index<3;index++)assert.equal((await f.emitter.gerarXml({mock:'after-await',index})).estado,'XML_GERADO');
  assert.equal(f.launchCalls,4);assert.equal(f.launches.length,4);
});

test('limiteFila 0 is already released in an operation promise observer',async t=>{
  const f=await fixture(t),first=f.emitter.gerarXml({mock:'first'}),observed=first.then(()=>f.emitter.gerarXml({mock:'from-then'}));
  const launched=await f.firstLaunch();await launched.respond();assert.equal((await observed).estado,'XML_GERADO');
  assert.equal(f.launchCalls,2);
});

test('limiteFila 0 is released before a rejected operation is observed',async t=>{
  const f=await fixture(t,{firstInvalid:true}),first=f.emitter.gerarXml({mock:'invalid-response'});
  const launched=await f.firstLaunch();void launched.respond();let failure;
  try{await first;}catch(error){failure=error;}
  assert.equal(failure?.codigo,'RESPOSTA_INVALIDA');
  assert.equal((await f.emitter.gerarXml({mock:'after-rejection'})).estado,'XML_GERADO');assert.equal(f.launchCalls,2);
});

test('failed process launch releases limiteFila 0 for a later explicitly requested operation',async t=>{
  const f=await fixture(t,{firstLaunchThrows:true});
  let failure;try{await f.emitter.gerarXml({mock:'launch-fails'});}catch(error){failure=error;}
  assert.equal(failure?.codigo,'FALHA_INICIAR_MOTOR');
  assert.equal((await f.emitter.gerarXml({mock:'new-operation'})).estado,'XML_GERADO');assert.equal(f.launchCalls,2);assert.equal(f.launches.length,1);
});
