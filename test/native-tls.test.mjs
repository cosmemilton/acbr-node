import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm,mkdir,access} from 'node:fs/promises';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import tls from 'node:tls';
import {tlsCertificates} from './native-fixtures.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const enabled=process.env.ACBR_NATIVE_TEST==='1';
const runtime=process.env.ACBR_NODE_RUNTIME_DIR??path.join(root,'.acbr','runtime',process.platform+'-'+process.arch);
const nativeEnv={...process.env,OPENSSL_CONF:path.join(runtime,'openssl.cnf'),OPENSSL_MODULES:path.join(runtime,'ossl-modules')};
if(process.platform==='linux')nativeEnv.LD_LIBRARY_PATH=path.join(runtime,'lib');
if(process.platform==='win32')nativeEnv.PATH=path.join(runtime,'lib')+path.delimiter+(process.env.PATH??'');
const runFile=promisify(execFile);
async function compileProbe(){
 const out=path.join(root,'.acbr','tls-test');await mkdir(out,{recursive:true});
 const source=path.join(root,'.acbr','source','Fontes');
 const includes=[path.join(root,'native'),path.join(source,'Terceiros','synalist'),path.join(source,'ACBrComum')];
 if(process.platform==='win32')includes.push(path.join(source,'Terceiros','CodeGear'));
 const lazarus=process.env.ACBR_NODE_LAZARUS_ROOT??(process.platform==='linux'?'/usr/lib/lazarus/3.0':'');
 if(lazarus)includes.push(path.join(lazarus,'components','lazutils','lib',process.platform==='linux'?'x86_64-linux':'x86_64-win64'));
 const executable=path.join(out,process.platform==='win32'?'native-tls-probe.exe':'native-tls-probe');
 const flags=['-Mobjfpc','-Scghi','-O1','-g-','-dNOGUI','-dNOREPORT',...includes.map(p=>'-Fu'+p),'-Fi'+path.join(source,'ACBrComum'),'-FU'+out,'-FE'+out,'-o'+executable,path.join(root,'fixtures','native-tls-probe.lpr')];
 await runFile(process.env.ACBR_NODE_FPC??'fpc',flags,{cwd:root,timeout:60000,maxBuffer:4*1024*1024,windowsHide:true});
 return executable;
}
async function probe(executable,input){
 return new Promise((resolve,reject)=>{
  const child=spawn(executable,[],{cwd:path.dirname(executable),env:nativeEnv,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
  const chunks=[];const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('TLS probe timeout'));},10000);
  child.stdout.on('data',chunk=>chunks.push(chunk));child.stderr.on('data',()=>{});child.on('error',e=>{clearTimeout(timer);reject(e);});
  child.on('close',code=>{clearTimeout(timer);if(code!==0){reject(new Error('TLS probe failed, code '+code));return;}try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch(e){reject(e);}});
  child.stdin.end(JSON.stringify(input)+'\n');
 });
}
test('TLS nativo verifica cadeia, hostname, validade e finalidade antes de enviar dados',{skip:!enabled,timeout:180000},async t=>{
 assert.ok(['linux','win32'].includes(process.platform));const executable=await compileProbe();const tmp=await mkdtemp(path.join(os.tmpdir(),'acbr-node-tls-'));t.after(()=>rm(tmp,{recursive:true,force:true}));
 const cases=[{label:'cadeia e hostname válidos',accept:true},{label:'CA não confiável',untrusted:true,accept:false},{label:'hostname divergente',host:'wrong-host.invalid',accept:false},{label:'certificado expirado',expired:true,accept:false},{label:'certificado futuro',future:true,accept:false},{label:'finalidade exclusiva clientAuth',clientOnly:true,accept:false}];
 for(const [index,item]of cases.entries())await t.test(item.label,async()=>{
  const certs=tlsCertificates(item);const caFile=path.join(tmp,'ca-'+index+'.pem');await writeFile(caFile,certs.ca);
  let received='';const sockets=new Set();const server=tls.createServer({key:certs.key,cert:certs.cert+certs.ca,minVersion:'TLSv1.2'},socket=>{sockets.add(socket);socket.on('data',data=>{received+=data;});socket.on('close',()=>sockets.delete(socket));socket.on('error',()=>{});});
  server.on('tlsClientError',()=>{});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
   const result=await probe(executable,{port:String(server.address().port),host:item.host??'localhost',caFile:item.untrusted?'':caFile});
   assert.equal(result.accepted,item.accept);
   await new Promise(resolve=>setTimeout(resolve,30));
   assert.equal(received,item.accept?'SYNTHETIC-OFFLINE-PROBE':'','no application bytes may be sent on an invalid TLS connection');
  }finally{for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));}
 });
});
