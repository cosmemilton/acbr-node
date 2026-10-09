import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { auditGenerated, auditRuntime, auditMainInventory, sha256 } from '../scripts/audit-release.mjs';
async function fixture(t, platform = 'linux') {
 const root = await mkdtemp(path.join(tmpdir(), 'acbr-release-audit-'));
 t.after(() => rm(root, { recursive: true, force: true }));
 async function put(name, content = name) { await mkdir(path.dirname(path.join(root, name)), { recursive: true }); await writeFile(path.join(root, name), content); }
 const lock = { source: { revision: 48590, treeHash: 'b'.repeat(64) } };
 const generated = { sourceRevision: 48590, sourceHash: lock.source.treeHash, contractHash: 'c'.repeat(64), fileHashes: {} };
 for (const name of ['generated/acbr/models.ts','generated/acbr/index.ts','native/generated/AcbrModels.pas']) { await put(name); generated.fileHashes[name] = await sha256(path.join(root,name)); }
 await put('native/acbr-worker.lpr');
 const relative = 'packages/acbr-node-' + platform + '-x64';
 const directory = path.join(root, relative); const runtime = path.join(directory,'runtime');
 await put(relative+'/package.json', JSON.stringify({ name:'cosmemilton-acbr-node-'+platform+'-x64', version:'0.1.0' }));
 const build = { sourceRevision:48590, sourceTreeHash:lock.source.treeHash, testOnly:false };
 const files = {};
 const required = ['acbr-worker','licenses/ACBr-LICENSE.TXT','licenses/FPC-COPYING.GPL.txt','licenses/FPC-COPYING.LGPL.txt','licenses/FPC-COPYING.FPC','licenses/Lazarus-COPYING.txt','licenses/Lazarus-COPYING.LGPL.txt','licenses/Lazarus-COPYING.modifiedLGPL.txt','licenses/toolchain-notices.json','sources/acbr-source.tar.gz','sources/native-dependencies.json','ACBrNFeServicos.ini','openssl.cnf','schemas/nfe.xsd'];
 if(platform==='win32')required.push('licenses/GCC-Runtime.LICENSE','licenses/GCC-GPL-3.LICENSE','licenses/MinGW-w64.LICENSE','licenses/libcrypto-3-x64.dll.LICENSE','licenses/libssl-3-x64.dll.LICENSE','licenses/libxml2.dll.LICENSE','licenses/legacy.dll.LICENSE','ossl-modules/legacy.dll','lib/libxml2.dll');
 else required.push('ossl-modules/legacy.so');
 for(const name of required)await put(relative+'/runtime/'+name);
 await put(relative+'/runtime/sources/build.json',JSON.stringify(build));required.push('sources/build.json');
 if(platform==='win32'){
  await put(relative+'/runtime/sources/win32-x64-SOURCE.json',JSON.stringify({platform:'win32',arch:'x64',vcRedistributable:false,validation:{peImportAudit:true},artifacts:[{name:'libxml2.dll',sha256:await sha256(path.join(runtime,'lib/libxml2.dll'))}]}));
  required.push('sources/win32-x64-SOURCE.json');
 }
 for(const name of ['acbr-worker.lpr','generated/AcbrModels.pas']){await put(relative+'/runtime/sources/native/'+name,await readFile(path.join(root,'native',name)));required.push('sources/native/'+name);}
 for(const name of required)files[name]=await sha256(path.join(runtime,name));
 const manifest={formatVersion:1,sourceRevision:48590,contractHash:generated.contractHash,platform,arch:'x64',executable:'acbr-worker',generatedFileHashes:generated.fileHashes,files};
 async function saveManifest(){await writeFile(path.join(runtime,'manifest.json'),JSON.stringify(manifest));}
 await saveManifest();
 return{root,directory,runtime,lock,generated,manifest,saveManifest,audit:()=>auditRuntime(root,directory,platform,'0.1.0',generated,lock)};
}
test('release accepts complete matching Linux and Windows source/notices',async t=>{
 for(const platform of ['linux','win32']){const f=await fixture(t,platform);await auditGenerated(f.root,f.generated,f.lock);await f.audit();}
});
test('release refuses modified generated helper despite equal contract',async t=>{
 const f=await fixture(t);await writeFile(path.join(f.root,'native/generated/AcbrModels.pas'),'changed helper');await assert.rejects(auditGenerated(f.root,f.generated,f.lock),/Arquivo gerado alterado/);
});
test('release requires all three generated hashes',async t=>{
 const f=await fixture(t);f.generated.fileHashes={};await assert.rejects(auditGenerated(f.root,f.generated,f.lock),/três arquivos/);
});
test('release refuses test worker and tampered runtime file',async t=>{
 const f=await fixture(t);f.manifest.testOnly=true;await f.saveManifest();await assert.rejects(f.audit(),/testes/);
 delete f.manifest.testOnly;await f.saveManifest();await writeFile(path.join(f.runtime,'acbr-worker'),'tampered');await assert.rejects(f.audit(),/Hash inválido/);
});
test('release refuses untracked runtime files and missing license notices',async t=>{
 const f=await fixture(t);await writeFile(path.join(f.runtime,'untracked.txt'),'extra');await assert.rejects(f.audit(),/fora do manifesto/);await rm(path.join(f.runtime,'untracked.txt'));
 delete f.manifest.files['licenses/FPC-COPYING.FPC'];await rm(path.join(f.runtime,'licenses/FPC-COPYING.FPC'));await f.saveManifest();await assert.rejects(f.audit(),/notice ausente/);
});
test('release refuses native source drift with matching model contract',async t=>{
 const f=await fixture(t);await writeFile(path.join(f.root,'native/acbr-worker.lpr'),'new engine');await assert.rejects(f.audit(),/Fonte do motor diverge/);
});
test('main npm inventory excludes credentials and machine config',()=>{
 const paths=['native/acbr-worker.lpr','tools/extract-model.lpr','dist/cli.js','dist/index.js','dist/index.cjs','LICENSE','NOTICE'];
 auditMainInventory(paths.map(path=>({path})));
 for(const denied of ['certificado.pfx','acbr.windows.config.json','.acbr/secret.json','node_modules/dev/package.json'])assert.throws(()=>auditMainInventory([...paths,denied].map(path=>({path}))),/Arquivo indevido/);
});
