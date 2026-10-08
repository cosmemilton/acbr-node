import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {criarEmissor,ErroAcbrNode} from '../src/runtime.ts';
const contract={sourceRevision:48590,contractHash:'a'.repeat(64)};
const worker=String.raw`const chunks=[];process.stdin.on('data',b=>chunks.push(b));process.stdin.on('end',()=>{const r=JSON.parse(Buffer.concat(chunks).toString());const mode=process.argv[2];const out={versao:1,id:r.id,sourceRevision:r.sourceRevision,contractHash:r.contractHash,sucesso:true,estado:r.comando==='gerarXml'?'XML_GERADO':'AUTORIZADO',xmlBase64:r.xmlBase64??Buffer.from('<NFe>João</NFe>').toString('base64'),xMotivo:r.config.cnpj};if(mode==='crash'){console.error(r.config.certificado?.senha);process.exit(2);}if(mode==='timeout'){setInterval(()=>{},1000);return;}if(mode==='bad')out.id='bad';if(mode==='env')out.xMotivo=process.env.ACBR_PARENT_TEST_SECRET??'clean';if(mode==='marker')console.log(JSON.stringify({tipo:'envioIniciado',id:r.id}));setTimeout(()=>console.log(JSON.stringify(out)),mode==='slow'?150:5);});`;
async function setup(t,mode='ok',extra={}){
 const directory=await mkdtemp(path.join(tmpdir(),'acbr-node-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 await writeFile(path.join(directory,'fixture.cjs'),worker);
 await writeFile(path.join(directory,'manifest.json'),JSON.stringify({formatVersion:1,...contract,platform:process.platform,arch:process.arch,executable:'fixture.cjs',files:{'fixture.cjs':createHash('sha256').update(worker).digest('hex')}}));
 let launches=0;
 const emitter=criarEmissor({cnpj:'12345678000195',uf:'CE',modelo:55,ambiente:2,certificado:{pfx:Buffer.from('synthetic'),senha:'SECRET_PFX'},contrato:contract,runtimeDirectory:directory,criaProcesso:(_e,_a,o)=>{launches++;return spawn(process.execPath,[path.join(directory,'fixture.cjs'),mode],{...o,stdio:['pipe','pipe','pipe']});},...extra});
 t.after(()=>emitter.fechar());return{emitter,directory,get launches(){return launches;}};
}
test('UTF-8 e isolamento de emitentes',async t=>{
 const a=await setup(t),b=await setup(t,'ok',{cnpj:'98765432000198'});
 const[x,y]=await Promise.all([a.emitter.gerarXml({}),b.emitter.gerarXml({})]);
 assert.equal(Buffer.from(x.xmlBase64,'base64').toString(),'<NFe>João</NFe>');assert.equal(x.xMotivo,'12345678000195');assert.equal(y.xMotivo,'98765432000198');
});
test('contrato divergente e arquivo adulterado bloqueiam spawn',async t=>{
 const a=await setup(t,'ok',{contrato:{...contract,contractHash:'b'.repeat(64)}});await assert.rejects(a.emitter.gerarXml({}),e=>e.codigo==='CONTRATO_DIVERGENTE');assert.equal(a.launches,0);
 const b=await setup(t);await writeFile(path.join(b.directory,'fixture.cjs'),'altered');await assert.rejects(b.emitter.gerarXml({}),e=>e.codigo==='RUNTIME_ALTERADO');assert.equal(b.launches,0);
});
test('crash, timeout e identidade inválida preservam incerteza e XML sem retry',async t=>{
 for(const mode of ['crash','timeout','bad']){
  const a=await setup(t,mode,{timeoutMs:200});await assert.rejects(a.emitter.transmitir('<NFe/>'),e=>{assert(e instanceof ErroAcbrNode);if(mode==='timeout')assert.equal(e.codigo,'TIMEOUT_MOTOR');assert.equal(e.resultadoDesconhecido,true);assert.equal(e.xmlBase64,Buffer.from('<NFe/>').toString('base64'));assert(!e.message.includes('SECRET_PFX'));return true;});assert.equal(a.launches,1);
 }
});
test('marcador de envio e ambiente sanitizado',async t=>{
 process.env.ACBR_PARENT_TEST_SECRET='SECRET_SERVER';t.after(()=>delete process.env.ACBR_PARENT_TEST_SECRET);
 const a=await setup(t,'env');assert.equal((await a.emitter.gerarXml({})).xMotivo,'clean');
 const b=await setup(t,'marker');assert.equal((await b.emitter.transmitir('<NFe/>')).estado,'AUTORIZADO');
});
test('cancelamento em fila não inicia filho e libera capacidade',async t=>{
 const a=await setup(t,'slow',{limiteFila:1}),first=a.emitter.gerarXml({});await new Promise(r=>setTimeout(r,15));
 const c=new AbortController(),second=a.emitter.gerarXml({},{signal:c.signal}),rejected=assert.rejects(second,e=>e.codigo==='OPERACAO_CANCELADA');c.abort();await rejected;
 await Promise.all([first,a.emitter.gerarXml({})]);assert.equal(a.launches,2);
});
test('fila cheia e fechamento bloqueiam novas operações',async t=>{
 const a=await setup(t,'slow',{limiteFila:0}),first=a.emitter.gerarXml({}),rejected=assert.rejects(first,e=>e.codigo==='EMISSOR_FECHADO');await new Promise(r=>setTimeout(r,20));
 await assert.rejects(a.emitter.gerarXml({}),e=>e.codigo==='FILA_CHEIA');await a.emitter.fechar();await rejected;await assert.rejects(a.emitter.gerarXml({}),e=>e.codigo==='EMISSOR_FECHADO');
});
test('config e CCe incompatível rejeitadas antes do motor',async t=>{
 assert.throws(()=>criarEmissor({cnpj:'1',uf:'CE',modelo:55,ambiente:2,contrato:contract}),e=>e.codigo==='CONFIGURACAO_INVALIDA');
 const a=await setup(t,'ok',{modelo:65});assert.throws(()=>a.emitter.cartaCorrecao({chave:'1'.repeat(44),correcao:'Correção válida para teste.'}),e=>e.codigo==='OPERACAO_NAO_SUPORTADA');assert.equal(a.launches,0);
});

test('limites de payload e A1 rejeitam antes de iniciar o motor',async t=>{
 assert.throws(()=>criarEmissor({cnpj:'12345678000195',uf:'CE',modelo:55,ambiente:2,contrato:contract,limiteBytes:8*1024*1024+1}),e=>e.codigo==='CONFIGURACAO_INVALIDA');
 const a=await setup(t,'ok',{certificado:{pfx:Buffer.alloc(2*1024*1024+1),senha:'SECRET_PFX'}});
 await assert.rejects(a.emitter.assinar('<NFe/>'),e=>e.codigo==='CERTIFICADO_EXCESSIVO');assert.equal(a.launches,0);
 const b=await setup(t,'ok',{limiteBytes:1024});
 await assert.rejects(b.emitter.gerarXml({texto:'x'.repeat(1024)}),e=>e.codigo==='REQUISICAO_INVALIDA');assert.equal(b.launches,0);
});
