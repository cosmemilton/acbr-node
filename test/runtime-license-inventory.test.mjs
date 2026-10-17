import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { auditLicensePolicy, auditRuntimeLicenses, completeRuntimeLicenses } from '../scripts/runtime-license-inventory.mjs';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function fixture(t,notice='License: Apache-2.0\nSee /usr/share/common-licenses/Apache-2.0.\n'){
 const directory=await mkdtemp(path.join(tmpdir(),'acbr-license-closure-'));
 t.after(()=>rm(directory,{recursive:true,force:true}));
 const runtime=path.join(directory,'runtime'),policyDirectory=path.join(directory,'approved');
 await mkdir(path.join(runtime,'licenses'),{recursive:true});
 await cp(new URL('../docs/licenses/common/',import.meta.url),policyDirectory,{recursive:true});
 const noticeFile=path.join(runtime,'licenses/dependency-copyright.txt');
 await writeFile(noticeFile,notice);
 const options={policyDirectory};
 async function manifest(){
  const files={};
  async function visit(prefix=''){
   for(const entry of await readdir(path.join(runtime,prefix),{withFileTypes:true})){
    const name=prefix?prefix+'/'+entry.name:entry.name;
    if(entry.isDirectory())await visit(name);
    else files[name]=digest(await readFile(path.join(runtime,name)));
   }
  }
  await visit();return{files};
 }
 return{runtime,policyDirectory,noticeFile,options,manifest};
}

test('copies complete canonical texts, resolves aliases and preserves original notices',async t=>{
 const f=await fixture(t,'See /usr/share/common-licenses/GPL, /usr/share/common-licenses/LGPL\nand /usr/share/common-licenses/Artistic.\n');
 const before=await readFile(f.noticeFile);
 const inventory=await completeRuntimeLicenses(f.runtime,f.options);
 assert.ok(inventory.files['Apache-2.0']);
 assert.ok(inventory.files.GPL);assert.ok(inventory.files.LGPL);assert.ok(inventory.files.Artistic);
 assert.ok(inventory.files['GPL-3']);assert.ok(inventory.files['LGPL-3']);
 for(const entry of Object.values(inventory.files)){
  assert.equal((await lstat(path.join(f.runtime,entry.file))).isFile(),true);
  assert.equal((await readFile(path.join(f.runtime,entry.file))).length,entry.bytes);
 }
 assert.deepEqual(await readFile(f.noticeFile),before);
 await auditRuntimeLicenses(f.runtime,await f.manifest(),f.options);
 await completeRuntimeLicenses(f.runtime,f.options); // Identical staging is idempotent.
});

test('an omitted common license fails with an otherwise self-consistent regenerated manifest',async t=>{
 const f=await fixture(t,'See /usr/share/common-licenses/GPL-2\n');
 await completeRuntimeLicenses(f.runtime,f.options);
 await rm(path.join(f.runtime,'licenses/common/GPL-2.txt'));
 await assert.rejects(auditRuntimeLicenses(f.runtime,await f.manifest(),f.options),/common-licenses incompleto/);
});

test('an omitted inventory and both-platform mandatory Apache text cannot be hidden by rehashing',async t=>{
 const f=await fixture(t,'A Windows upstream copyright notice with no common-license reference.\n');
 await completeRuntimeLicenses(f.runtime,f.options);
 await rm(path.join(f.runtime,'licenses/common/Apache-2.0.txt'));
 await assert.rejects(auditRuntimeLicenses(f.runtime,await f.manifest(),f.options),/common-licenses incompleto/);
 await rm(path.join(f.runtime,'licenses/common/INVENTORY.json'));
 await assert.rejects(auditRuntimeLicenses(f.runtime,await f.manifest(),f.options),/inventário common-licenses ausente/);
});

test('truncated or SPDX-only text fails even after runtime inventory and manifest hashes are rewritten',async t=>{
 const f=await fixture(t);await completeRuntimeLicenses(f.runtime,f.options);
 const name='licenses/common/Apache-2.0.txt',bytes=Buffer.from('SPDX-License-Identifier: Apache-2.0\n');
 await writeFile(path.join(f.runtime,name),bytes);
 await assert.rejects(auditRuntimeLicenses(f.runtime,await f.manifest(),f.options),/texto integral diverge/);
 const file=path.join(f.runtime,'licenses/common/INVENTORY.json');
 const inventory=JSON.parse(await readFile(file,'utf8'));
 inventory.files['Apache-2.0'].sha256=digest(bytes);inventory.files['Apache-2.0'].bytes=bytes.length;
 inventory.files['Apache-2.0'].origin.sha256=digest(bytes);inventory.files['Apache-2.0'].origin.bytes=bytes.length;
 await writeFile(file,JSON.stringify(inventory));
 await assert.rejects(auditRuntimeLicenses(f.runtime,await f.manifest(),f.options),/diverge da política/);
});

test('all required text and inventory entries must be hashed in the runtime manifest',async t=>{
 const f=await fixture(t);await completeRuntimeLicenses(f.runtime,f.options);
 for(const name of ['licenses/dependency-copyright.txt','licenses/common/Apache-2.0.txt','licenses/common/INVENTORY.json']){
  const manifest=await f.manifest();delete manifest.files[name];
  await assert.rejects(auditRuntimeLicenses(f.runtime,manifest,f.options),/ausente do manifesto/);
 }
});

test('new and unsafe references fail closed instead of silently skipping the required license',async t=>{
 for(const reference of ['Future-License-9','../Apache-2.0','GPL-3/extra','../GPL-2\u2019']){
  const f=await fixture(t,'See /usr/share/common-licenses/'+reference+'\n');
  await assert.rejects(completeRuntimeLicenses(f.runtime,f.options),/não aprovada|referência common-licenses inválida/);
 }
});

test('the Debian liblzma notice uses Unicode quote delimiters without changing license names or notice bytes',async t=>{
 // Exact reference lines from the original Ubuntu liblzma.so.5 copyright notice.
 const notice=[
  ' License version 2 can be found in \u2018/usr/share/common-licenses/GPL-2\u2019.',
  ' gettext-runtime 0.12 can be found in \u2018/usr/share/common-licenses/LGPL-2\u2019',
  ' \u2018/usr/share/common-licenses/LGPL-2.1\u2019.',
  ' License version 2.1 can be found in \u2018/usr/share/common-licenses/LGPL-2.1\u2019.',
  ' \u2018/usr/share/common-licenses/GPL-2\u2019.',
  ' version 2 can be found in \u2018/usr/share/common-licenses/GPL-2\u2019.',
  ' License version 3 can be found in \u2018/usr/share/common-licenses/GPL-3\u2019.'
 ].join('\n')+'\n';
 const f=await fixture(t,notice),before=await readFile(f.noticeFile);
 const inventory=await completeRuntimeLicenses(f.runtime,f.options);
 assert.deepEqual(Object.keys(inventory.files),['Apache-2.0','GPL-2','GPL-3','LGPL-2','LGPL-2.1']);
 assert.deepEqual(await readFile(f.noticeFile),before);
 await auditRuntimeLicenses(f.runtime,await f.manifest(),f.options);
});

test('an approved canonical asset that is truncated is rejected before staging',async t=>{
 const f=await fixture(t);await writeFile(path.join(f.policyDirectory,'Apache-2.0.txt'),'short');
 await assert.rejects(completeRuntimeLicenses(f.runtime,f.options),/texto canônico diverge/);
});

test('completion refuses to overwrite a changed existing canonical text',async t=>{
 const f=await fixture(t);await completeRuntimeLicenses(f.runtime,f.options);
 await writeFile(path.join(f.runtime,'licenses/common/Apache-2.0.txt'),'changed');
 await assert.rejects(completeRuntimeLicenses(f.runtime,f.options),/recusa substituir/);
});

test('an SDK policy with rewritten hashes cannot replace the approved checkout policy',async t=>{
 const f=await fixture(t);
 const actual=path.join(f.policyDirectory,'sdk-copy');
 await cp(new URL('../docs/licenses/common/',import.meta.url),actual,{recursive:true});
 await auditLicensePolicy(actual,f.options);
 const file=path.join(actual,'ORIGIN.json');
 const policy=JSON.parse(await readFile(file,'utf8'));
 const bytes=Buffer.from('short but self-consistent');
 await writeFile(path.join(actual,'Apache-2.0.txt'),bytes);
 policy.files['Apache-2.0'].sha256=digest(bytes);policy.files['Apache-2.0'].bytes=bytes.length;
 await writeFile(file,JSON.stringify(policy));
 await assert.rejects(auditLicensePolicy(actual,f.options),/política do SDK diverge/);
});
