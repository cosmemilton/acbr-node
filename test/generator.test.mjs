import test from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { transform } from 'esbuild';
import { buildModelIR, compareContracts, renderTypeScript, renderPascal, renderClientIndex, generateModel } from '../src/generator.ts';
const execute=promisify(execFile);
const p=(name,type,extra={})=>({name,type,indexed:false,readable:true,writable:true,default:'',line:1,...extra});
const cls=(name,properties=[],extra={})=>({name,kind:'class',ancestor:'TObject',properties,methods:[],line:1,...extra});
const raw=()=>({schemaVersion:1,root:'TNFe',units:[
 {name:'Main',file:'Main.pas',uses:['First','Last'],types:[
  cls('TNFe',[p('Amount','Currency'),p('Date','TDateTime'),p('Choice','EChoice'),p('Children','TChildren'),p('Computed','string',{writable:false})]),
  cls('TChild',[p('Label','string')]),
  cls('TChildren',[p('Items','TChild',{indexed:true})],{ancestor:'TACBrObjectList',methods:[{name:'New',result:'TChild',arguments:0}]}),
 ]},
 {name:'First',file:'First.pas',uses:[],types:[{name:'EChoice',kind:'enum',values:[{name:'first',assigned:''}],line:1}]},
 {name:'Last',file:'Last.pas',uses:[],types:[{name:'EChoice',kind:'enum',values:[{name:'last',assigned:''}],line:1}]},
]});
async function loadRendered(ir,t){
 const dir=await mkdtemp(path.join(os.tmpdir(),'acbr-generator-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const code=await transform(renderTypeScript(ir,48590,'a'.repeat(64)),{loader:'ts',format:'esm',target:'es2022'});
 const file=path.join(dir,'models.mjs');await writeFile(file,code.code);return import(pathToFileURL(file).href);
}
test('resolve Pascal uses precedence and typed New/Items instead of enum ordinals',()=>{
 const ir=buildModelIR(raw()),choice=ir.types.find(t=>t.name==='EChoice'),list=ir.types.find(t=>t.name==='TChildren');
 assert.equal(choice.unit,'Last');assert.deepEqual(choice.values,['last']);assert.equal(list.item,'TChild');
 const pas=renderPascal(ir,48590,'a'.repeat(64));
 assert.match(pas,/destino\.Choice:=Last\.last/);assert.doesNotMatch(pas,/case Text/);assert.match(pas,/destino\.Children\.New/);
});
test('unknown reachable Pascal kinds stop with a concrete diagnostic',()=>{
 const model=raw();model.units[0].types[0].properties.push(p('NewShape','TMystery'));
 model.units[0].types.push({name:'TMystery',kind:'unsupported',declarationKind:'TPasRecordType',line:42});
 assert.throws(()=>buildModelIR(model),/Main\.TMystery.*TPasRecordType/);
});
test('change report separates additions and breaking removals/types',()=>{
 const previous=buildModelIR(raw()),after=structuredClone(previous),root=after.types.find(t=>t.name==='TNFe');
 root.properties=root.properties.filter(p=>p.name!=='Date');root.properties.push({name:'Extra',type:'string',kind:'string',readonly:false});
 root.properties.find(p=>p.name==='Amount').scale=2;
 const report=compareContracts(previous,after);
 assert.deepEqual(report.removals,['TNFe.Date']);assert.deepEqual(report.additions,['TNFe.Extra']);assert.deepEqual(report.changes,['TNFe.Amount']);assert.equal(report.breaking,true);
});
test('generated client binds its own contract and validates inputs',()=>{
 const text=renderClientIndex();assert.ok(text.split('\n').length>6);assert.match(text,/contrato:ACBR_CONTRACT/);assert.match(text,/validaDocumento:validateTNFe/);assert.match(text,/\.\/models\.js/);
});
test('generated models preserve decimal strings, readonly fields and nested lists',async t=>{
 const m=await loadRendered(buildModelIR(raw()),t),n=new m.TNFe({Amount:'12.3400',Choice:'last',Date:'2026-10-08T12:00:00'});
 const child=n.Children.New({Label:'ACBr'});assert.equal(child.Label,'ACBr');m.validateTNFe(n);
 assert.throws(()=>m.validateTNFe({Amount:12.34}),/decimal/);
 assert.throws(()=>m.validateTNFe({Amount:'1.00001'}),/decimal/);
 assert.throws(()=>m.validateTNFe({Choice:0}),/enum/);
 assert.throws(()=>m.validateTNFe({Computed:'forged'}),/somente leitura/);
 assert.throws(()=>m.validateTNFe({Date:'2026-02-30'}),/data inválida/);
 assert.throws(()=>m.validateTNFe({Date:'2026-10-08T12:00:00-03:00'}),/timezone/);
 assert.throws(()=>m.validateTNFe({Children:[{Unknown:1}]}),/TNFe.Children\[0\].Unknown/);
});
test('real FCL-passrc ACBr closure is deterministic, includes RTC and matches Windows declarations',async t=>{
 const source=path.resolve('.acbr/source');try{await access(source);}catch{t.skip('requires the source fetched by CLI');return;}
 const dir=await mkdtemp(path.join(os.tmpdir(),'acbr-generator-source-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const options={acbrRoot:source,outputDir:dir,revision:48590,sourceHash:'a'.repeat(64),extractorPath:path.resolve('tools/extract-model.lpr')};
 const one=await generateModel(options),ir=JSON.parse(await readFile(path.join(dir,'.acbr/generated/model.ir.json'),'utf8'));
 assert.ok(ir.types.length>180);assert.ok(ir.types.some(t=>t.unit==='ACBrDFe.RTC.Classes'));
 const second=await generateModel(options);assert.equal(one.contractHash,second.contractHash);
 const manifest=JSON.parse(await readFile(second.manifestPath,'utf8'));
 assert.equal(manifest.files.length,3);assert.deepEqual(Object.keys(manifest.fileHashes),manifest.files);
 for(const file of manifest.files)assert.equal(manifest.fileHashes[file],createHash('sha256').update(await readFile(path.join(dir,file))).digest('hex'));
 const changes=JSON.parse(await readFile(second.reportPath,'utf8'));assert.deepEqual(changes,{additions:[],removals:[],changes:[],breaking:false});
 const windows=path.join(dir,'windows.json');await execute(path.join(dir,'.acbr/bin/extract-model'),[source,windows,'win64']);
 assert.deepEqual(buildModelIR(JSON.parse(await readFile(windows,'utf8'))),ir);
 const models=await loadRendered(ir,t),documento=new models.TNFe();models.validateTNFe(documento);
 for(const field of ['signature','procNFe','infNFeSupl'])assert.throws(()=>models.validateTNFe({[field]:{}}),/somente leitura/);
});
