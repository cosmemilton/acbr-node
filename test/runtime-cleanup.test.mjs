import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {Writable,PassThrough} from 'node:stream';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {criarEmissor,ErroAcbrNode} from '../src/runtime.ts';

const contract={sourceRevision:48590,contractHash:'a'.repeat(64)};
const secret='SYNTHETIC_PRIVATE_VALUE';

async function setupFake(t,mode,extra={}){
 const directory=await mkdtemp(path.join(tmpdir(),'acbr-cleanup-'));
 t.after(()=>rm(directory,{recursive:true,force:true}));
 const payload='synthetic fake worker';
 await writeFile(path.join(directory,'fixture.txt'),payload);
 await writeFile(path.join(directory,'manifest.json'),JSON.stringify({formatVersion:1,...contract,platform:process.platform,arch:process.arch,executable:'fixture.txt',files:{'fixture.txt':createHash('sha256').update(payload).digest('hex')}}));
 let readyResolve,launches=0,kills=0,unrefs=0,destroyAttempts=0,requestBytes,child;
 const ready=new Promise(resolve=>{readyResolve=resolve;});
 const emitter=criarEmissor({cnpj:'12345678000195',uf:'PE',modelo:55,ambiente:2,certificado:{pfx:Buffer.from('synthetic'),senha:secret},contrato:contract,runtimeDirectory:directory,timeoutMs:25,limiteFila:1,
  criaProcesso(){
   launches++;child=new EventEmitter();child.pid=424242; // Identidade simulada; nenhuma chamada ao sistema operacional.
   child.stdin=new Writable({autoDestroy:false,write(chunk,_encoding,done){requestBytes=chunk;done();}});
   child.stdout=new PassThrough({autoDestroy:false});child.stderr=new PassThrough({autoDestroy:false});
   child.stdin.on('finish',()=>readyResolve());
   child.kill=(signal)=>{
    assert.equal(signal,'SIGKILL');kills++;
    if(mode==='false')return false;
    if(mode==='throw')throw new Error(secret);
    if(mode==='errorFalse'){child.emit('error',new Error(secret));return false;}
    if(mode==='closeSync'){child.emit('close',0);return true;}
    return true; // No modo noClose, o encerramento nunca é notificado.
   };
   child.unref=()=>{unrefs++;if(mode==='destroyThrow')throw new Error(secret);};
   if(mode==='destroyThrow'||mode==='destroyClose'){
    for(const pipe of [child.stdin,child.stdout,child.stderr]){
     const original=pipe.destroy;
     t.after(()=>original.call(pipe));
     pipe.destroy=()=>{destroyAttempts++;if(mode==='destroyClose'){child.emit('close',0);return original.call(pipe);}child.emit('error',new Error(secret));throw new Error(secret);};
    }
   }
   return child;
  },...extra});
 t.after(()=>emitter.fechar());
 return {emitter,ready,get child(){return child;},get launches(){return launches;},get kills(){return kills;},get unrefs(){return unrefs;},get destroyAttempts(){return destroyAttempts;},get requestBytes(){return requestBytes;}};
}

function checkPrimary(error,codigo,unknown){
 assert(error instanceof ErroAcbrNode);assert.equal(error.codigo,codigo);assert.equal(error.resultadoDesconhecido,unknown);
 assert.equal(error.diagnostico.statusEnvio,unknown?'resultado_incerto':'nao_enviado');
 assert.equal(error.diagnostico.limpeza.codigo,'ENCERRAMENTO_MOTOR_NAO_CONFIRMADO');assert.equal(error.diagnostico.limpeza.etapa,'limpeza');
 assert(!JSON.stringify(error).includes(secret));assert(!error.stack.includes(secret));
 assert.match(error.diagnostico.acao,/Encerre esta aplicação/);
 return true;
}

test('kill falso ou exception não mascara timeout e libera somente os handles próprios',async t=>{
 for(const mode of ['false','throw','errorFalse']){
  const a=await setupFake(t,mode),start=Date.now(),operation=a.emitter.transmitir('<NFe/>');
  const rejected=assert.rejects(operation,error=>{
   checkPrimary(error,'TIMEOUT_MOTOR',true);assert.equal(error.xmlBase64,Buffer.from('<NFe/>').toString('base64'));assert(!JSON.stringify(error).includes(error.xmlBase64));return true;
  });
  await a.ready;await rejected;await a.emitter.fechar();
  assert(Date.now()-start<2500);assert.equal(a.kills,1);assert.equal(a.unrefs,1);
  for(const pipe of [a.child.stdin,a.child.stdout,a.child.stderr])assert.equal(pipe.destroyed,true);
  assert(a.requestBytes.every(value=>value===0));assert.equal(a.launches,1);
 }
});

test('kill aceito sem close tem espera limitada e bloqueia a fila antes de outro motor',async t=>{
 const a=await setupFake(t,'noClose'),start=Date.now(),first=a.emitter.transmitir('<NFe/>');
 const rejected=assert.rejects(first,error=>checkPrimary(error,'TIMEOUT_MOTOR',true));
 await a.ready;
 const queued=a.emitter.gerarXml({});
 const rejectedQueued=assert.rejects(queued,error=>error.codigo==='EMISSOR_FECHADO'&&error.diagnostico.limpeza.codigo==='ENCERRAMENTO_MOTOR_NAO_CONFIRMADO'&&error.resultadoDesconhecido===false);
 await Promise.all([rejected,rejectedQueued]);
 assert(Date.now()-start<3000);assert.equal(a.launches,1);assert.equal(a.kills,1);assert.equal(a.unrefs,1);
 await assert.rejects(a.emitter.gerarXml({}),error=>error.codigo==='EMISSOR_FECHADO'&&error.diagnostico.limpeza.etapa==='limpeza');
 a.child.emit('close',0);a.child.emit('error',new Error(secret));a.child.stdout.emit('data',Buffer.from(secret));
 for(const pipe of [a.child.stdin,a.child.stdout,a.child.stderr])pipe.emit('error',new Error(secret));
 assert.equal(a.launches,1);
});

test('fechar concorrente aguarda o mesmo encerramento limitado e preserva estado do envio',async t=>{
 const a=await setupFake(t,'noClose',{timeoutMs:10000}),operation=a.emitter.transmitir('<NFe/>');
 const rejected=assert.rejects(operation,error=>checkPrimary(error,'EMISSOR_FECHADO',true));
 await a.ready;
 const start=Date.now(),firstClose=a.emitter.fechar(),secondClose=a.emitter.fechar();
 let secondFinished=false;secondClose.then(()=>{secondFinished=true;});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(secondFinished,false);
 await Promise.all([firstClose,secondClose,rejected]);assert(Date.now()-start<3000);assert.equal(a.kills,1);assert.equal(a.unrefs,1);
});

test('destroy/unref com exception ou close síncrono não reentra nem troca o erro original',async t=>{
 for(const mode of ['destroyThrow','destroyClose']){
  const a=await setupFake(t,mode),operation=a.emitter.assinar('<NFe/>');
  await assert.rejects(operation,error=>checkPrimary(error,'TIMEOUT_MOTOR',false));
  assert.equal(a.destroyAttempts,3);assert.equal(a.unrefs,1);assert.equal(a.kills,1);assert.equal(a.launches,1);
 }
});

test('close síncrono após kill confirma encerramento sem falso aviso de limpeza',async t=>{
 const a=await setupFake(t,'closeSync');
 await assert.rejects(a.emitter.transmitir('<NFe/>'),error=>error.codigo==='TIMEOUT_MOTOR'&&error.resultadoDesconhecido===true&&error.diagnostico.limpeza===undefined);
 assert.equal(a.kills,1);assert.equal(a.unrefs,0);await a.emitter.fechar();
});
