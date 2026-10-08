import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm}from'node:fs/promises';
import {spawn}from'node:child_process';
import {fileURLToPath}from'node:url';
import path from'node:path';
import os from'node:os';
import {certificado,documento,objetoDocumento,CNPJ,PASSWORD}from'./native-fixtures.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const enabled=process.env.ACBR_NATIVE_TEST==='1';
const runtime=process.env.ACBR_NODE_RUNTIME_DIR??path.join(root,'.acbr','runtime',process.platform+'-'+process.arch);
const executable=path.join(runtime,process.platform==='win32'?'acbr-worker.exe':'acbr-worker');
const nativeEnv={...process.env,OPENSSL_CONF:path.join(runtime,'openssl.cnf'),OPENSSL_MODULES:path.join(runtime,'ossl-modules')};
if(process.platform==='linux')nativeEnv.LD_LIBRARY_PATH=path.join(runtime,'lib');
if(process.platform==='win32')nativeEnv.PATH=path.join(runtime,'lib')+path.delimiter+(process.env.PATH??'');
async function worker(request,{args=[],raw}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn(executable,args,{cwd:runtime,env:nativeEnv,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});const chunks=[];let size=0;const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Native timeout'));},15000);
  child.on('error',error=>{clearTimeout(timer);reject(error);});child.stdout.on('data',chunk=>{size+=chunk.length;if(size>8*1024*1024){child.kill('SIGKILL');reject(new Error('Native output limit'));return;}chunks.push(chunk);});child.stderr.on('data',()=>{});
  child.on('close',code=>{clearTimeout(timer);if(code!==0){reject(new Error('Native exit '+code));return;}const text=Buffer.concat(chunks).toString('utf8');try{const frames=text.trim().split('\n').map(s=>JSON.parse(s));resolve({result:frames.at(-1),frames,text});}catch(error){reject(error);}});
  child.stdin.end(raw??JSON.stringify(request)+'\n');
 });
}
test('ACBr real offline NF-e/NFC-e: A1, XML, identidade e protocolo',{skip:!enabled,timeout:180000},async t=>{
 const manifest=JSON.parse(await readFile(path.join(runtime,'manifest.json'),'utf8'));
 const config={cnpj:CNPJ,uf:'CE',ambiente:2,modelo:55};const base={versao:1,id:'synthetic-offline',comando:'validar',sourceRevision:manifest.sourceRevision,contractHash:manifest.contractHash,config};
 const offline=async(comando,modelo=55,extra={})=>{
  assert.ok(['gerarXml','assinar','validar'].includes(comando),'Native tests must never call SEFAZ commands.');
  const input={...base,comando,config:{...config,modelo,...(comando==='assinar'?{certificado:certificado()}:{}),...(modelo===65?{csc:{id:'000001',valor:'CODIGO-SINTETICO-OFFLINE-NAO-TRANSMITIR'}}:{})},...documento(modelo),...extra};
  const output=await worker(input);assert.equal(output.result.id,base.id);assert.equal(output.result.sourceRevision,manifest.sourceRevision);assert.equal(output.result.contractHash,manifest.contractHash);assert.equal(output.frames.length,1);assert.equal(output.result.envioIniciado,false);return output.result;
 };
 for(const modelo of[55,65])await t.test('gera XML de objeto ACBr modelo '+modelo,async()=>{
  const doc=objetoDocumento(modelo);doc.Det[0].Prod={...doc.Det[0].Prod,qCom:'0.25',vUnCom:'10.12',vProd:'2.53',qTrib:'0.25',vUnTrib:'10.12'};
  const item=structuredClone(doc.Det[0]);item.Prod={...item.Prod,nItem:2,cProd:'TESTE2',qCom:'1.5',vUnCom:'4.98',vProd:'7.47',qTrib:'1.5',vUnTrib:'4.98'};doc.Det.push(item);
  const generated=await offline('gerarXml',modelo,{documento:doc});assert.equal(generated.estado,'XML_GERADO',generated.codigo);
  const xml=Buffer.from(generated.xmlBase64,'base64').toString('utf8');
  assert.match(xml,/Café São José/);assert.equal((xml.match(/<det nItem=/g)??[]).length,2);assert.match(xml,/<det nItem="1">/);assert.match(xml,/<det nItem="2">/);assert.equal((xml.match(/<detPag>/g)??[]).length,1);
  assert.match(xml,/<qCom>0\.2500<\/qCom>/);assert.match(xml,/<vUnCom>10\.1200000000<\/vUnCom>/);assert.match(xml,/<vProd>2\.53<\/vProd>/);assert.match(xml,/<vProd>7\.47<\/vProd>/);assert.match(xml,/<vNF>10\.00<\/vNF>/);
  assert.match(xml,new RegExp('<dhEmi>'+doc.Ide.dEmi+'-03:00</dhEmi>'));assert.equal(generated.chave.slice(2,6),doc.Ide.dEmi.slice(2,4)+doc.Ide.dEmi.slice(5,7));
  assert.match(xml,new RegExp('<mod>'+modelo+'</mod>'));assert.match(xml,/<CSOSN>102<\/CSOSN>/);assert.match(xml,/<modFrete>9<\/modFrete>/);
  const signed=await offline('assinar',modelo,{xmlBase64:generated.xmlBase64,chave:generated.chave});assert.equal(signed.estado,'ASSINADO',signed.codigo);
  const valid=await offline('validar',modelo,{xmlBase64:signed.xmlBase64,chave:signed.chave});assert.equal(valid.estado,'VALIDADO',valid.codigo);
 });
 await t.test('recusa campo de modelo desconhecido em vez de ignorar',async()=>{
  const result=await offline('gerarXml',55,{documento:{...objetoDocumento(55),UnknownField:'must not be ignored'}});assert.equal(result.codigo,'DOCUMENTO_INVALIDO');
 });
 for(const modelo of[55,65])await t.test('assina e valida modelo '+modelo,async()=>{
  const signed=await offline('assinar',modelo);assert.equal(signed.estado,'ASSINADO',signed.codigo);assert.equal(signed.sucesso,true);
  const xml=Buffer.from(signed.xmlBase64,'base64').toString('utf8');assert.match(xml,/Café São José/);assert.match(xml,/<Signature/);assert.equal(signed.chave,documento(modelo).chave);
  const valid=await offline('validar',modelo,{xmlBase64:signed.xmlBase64});assert.equal(valid.estado,'VALIDADO',valid.codigo);
 });
 await t.test('assina PFX sintetico 3DES com providers privados',async()=>{
  const result=await offline('assinar',55,{config:{...config,certificado:certificado({algorithm:'3des'})}});assert.equal(result.estado,'ASSINADO',result.codigo);
 });
 await t.test('CSC diferente altera hash do QRCode NFC-e e NF-e nao recebe suplemento',async()=>{
  const cert=certificado();const qrs=[];
  for(const valor of['CSC-SINTETICO-OFFLINE-UM','CSC-SINTETICO-OFFLINE-DOIS']){
   const signed=await offline('assinar',65,{config:{...config,modelo:65,certificado:cert,csc:{id:'000001',valor}}});assert.equal(signed.estado,'ASSINADO',signed.codigo);
   const xml=Buffer.from(signed.xmlBase64,'base64').toString('utf8');const qr=xml.match(/<qrCode>(.*?)<\/qrCode>/s)?.[1];assert.ok(qr,'NFC-e signed XML requires its QRCode');assert.match(xml,/<infNFeSupl>/);qrs.push(qr);
   assert.doesNotMatch(qr,new RegExp(valor));
  }
  assert.notEqual(qrs[0],qrs[1]);
  const nfe=await offline('assinar',55);assert.doesNotMatch(Buffer.from(nfe.xmlBase64,'base64').toString('utf8'),/<infNFeSupl>|<qrCode>/);
 });
 await t.test('recusa NFC-e sem CSC',async()=>{
  const result=await offline('assinar',65,{config:{...config,modelo:65,certificado:certificado()}});assert.equal(result.codigo,'CSC_AUSENTE');
 });
 await t.test('recusa assinatura adulterada sem iniciar envio',async()=>{
  const signed=await offline('assinar',55);
  const xml=Buffer.from(signed.xmlBase64,'base64').toString('utf8').replace('Café São José','Café São João');
  const invalid=await offline('validar',55,{xmlBase64:Buffer.from(xml).toString('base64')});assert.equal(invalid.codigo,'ASSINATURA_INVALIDA');
 });
 await t.test('recusa senha errada e nunca a devolve',async()=>{
  const cert=certificado();cert.senha='secret-password-must-not-appear';const result=await offline('assinar',55,{config:{...config,certificado:cert}});
  assert.equal(result.codigo,'CERTIFICADO_INVALIDO');assert.doesNotMatch(JSON.stringify(result),/secret-password|BEGIN|pfxBase64/);
 });
 for(const options of[{expirado:true},{futuro:true},{cnpj:'12345678000195'}])await t.test('recusa certificado '+JSON.stringify(options),async()=>{
  const result=await offline('assinar',55,{config:{...config,certificado:certificado(options)}});assert.ok(['CERTIFICADO_INVALIDO','CERTIFICADO_DIVERGENTE'].includes(result.codigo));
 });
 await t.test('recusa DV incorreto e chave divergente dos campos sem substituir identidade',async()=>{
  const d=documento(55),wrong=d.chave.slice(0,-1)+(d.chave.endsWith('0')?'1':'0');
  const badDV=Buffer.from(d.xmlBase64,'base64').toString('utf8').replace(d.chave,wrong);
  const signed=await offline('assinar',55,{chave:wrong,xmlBase64:Buffer.from(badDV).toString('base64')});assert.equal(signed.codigo,'IDENTIDADE_DIVERGENTE');assert.equal(signed.xmlBase64,undefined);
  const badNumber=Buffer.from(d.xmlBase64,'base64').toString('utf8').replace('<nNF>1</nNF>','<nNF>2</nNF>');
  const valid=await offline('validar',55,{xmlBase64:Buffer.from(badNumber).toString('base64')});assert.equal(valid.codigo,'IDENTIDADE_DIVERGENTE');assert.equal(valid.xmlBase64,undefined);
 });
 await t.test('recusa XML com identidade diferente',async()=>{
  const xml=Buffer.from(documento(55).xmlBase64,'base64').toString('utf8').replaceAll(CNPJ,'12345678000195');const result=await offline('validar',55,{xmlBase64:Buffer.from(xml).toString('base64')});assert.equal(result.codigo,'IDENTIDADE_DIVERGENTE');
 });
 await t.test('recusa DTD e entidade externa sem acesso ao arquivo',async()=>{
  const xml='<!DOCTYPE NFe [<!ENTITY secret SYSTEM "file:///etc/passwd">]><NFe>&secret;</NFe>';const result=await offline('validar',55,{xmlBase64:Buffer.from(xml).toString('base64')});assert.equal(result.codigo,'XML_INVALIDO');assert.doesNotMatch(JSON.stringify(result),/root:|passwd/);
 });
 await t.test('recusa revisão e hash incompatíveis antes de carregar o motor',async()=>{
  for(const change of[{sourceRevision:1},{contractHash:'f'.repeat(64)}]){const {result}=await worker({...base,...documento(55),...change});assert.equal(result.codigo,'CONTRATO_INCOMPATIVEL');assert.equal(result.envioIniciado,false);}
 });
 await t.test('recusa XML mal formado e schema inválido',async()=>{
  for(const xml of['<NFe/>',Buffer.from(documento().xmlBase64,'base64').toString('utf8').replace('<NCM>22021000</NCM>','<NCM>INVALIDO</NCM>')]){
   const result=await offline('validar',55,{xmlBase64:Buffer.from(xml).toString('base64')});assert.ok(['XML_INVALIDO','XML_SCHEMA_INVALIDO','IDENTIDADE_DIVERGENTE','OPERACAO_FISCAL_FALHOU'].includes(result.codigo));
  }
 });
});
test('watchdog nativo encerra quando supervisor real morre',{skip:!enabled,timeout:30000},async t=>{
 const tmp=await mkdtemp(path.join(os.tmpdir(),'acbr-node-parent-'));t.after(()=>rm(tmp,{recursive:true,force:true}));
 const helper=path.join(tmp,'parent.cjs');await writeFile(helper,`const{spawn}=require('node:child_process');const c=spawn(process.argv[2],['--parent-pid',String(process.pid)],{stdio:['pipe','ignore','ignore']});console.log(c.pid);setInterval(()=>{},1000);`);
 const parent=spawn(process.execPath,[helper,executable],{stdio:['ignore','pipe','ignore'],windowsHide:true,env:nativeEnv});
 const pid=await new Promise((resolve,reject)=>{parent.once('error',reject);parent.stdout.once('data',data=>resolve(Number(data.toString().trim())));});
 t.after(()=>parent.kill('SIGKILL'));assert.ok(pid>0);await new Promise(resolve=>setTimeout(resolve,500));process.kill(pid,0);parent.kill('SIGKILL');
 let alive=true;for(let i=0;i<50;i++){try{process.kill(pid,0);}catch{alive=false;break;}if(process.platform==='linux'){try{const status=await readFile('/proc/'+pid+'/stat','utf8');if(status.split(' ')[2]==='Z'){alive=false;break;}}catch{alive=false;break;}}await new Promise(resolve=>setTimeout(resolve,100));}
 assert.equal(alive,false,'native process must not remain alive after supervisor exits');
});
