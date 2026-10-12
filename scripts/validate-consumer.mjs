import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
function option(name,fallback){const index=args.indexOf(name);return index<0?fallback:args[index+1];}
const revision=Number(option('--revision','48589'));
if(!Number.isSafeInteger(revision)||revision<1)throw Error('--revision exige número SVN positivo.');
if(process.platform!=='linux'||process.arch!=='x64')throw Error('Validação externa deste script usa Linux x64.');
const consumer=path.resolve(option('--directory',path.join(homedir(),'.acbr-node-validation',`consumer-${revision}`)));
if(consumer===root||consumer.startsWith(root+path.sep))throw Error('A validação exige consumidor fora do repositório; selecione --directory externo.');
const artifacts=path.join(root,'.acbr/artifacts');await mkdir(artifacts,{recursive:true});
async function run(command,args,cwd=root,{capture=false}={}){
 console.log('$',command,...args,'[cwd='+cwd+']');
 return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd,stdio:['ignore','pipe','pipe'],shell:false,windowsHide:true});let stdout='',stderr='';
 child.stdout.on('data',chunk=>{stdout+=chunk;if(!capture)process.stdout.write(chunk);});child.stderr.on('data',chunk=>{stderr+=chunk;process.stderr.write(chunk);});
 child.on('error',reject);child.on('close',code=>code===0?resolve(stdout):reject(Error(command+' exit '+code+'\n'+stderr.slice(-8000))));});
}
try{await access(consumer);throw Error('Diretório consumidor já existe; selecione --directory novo para preservar resultados.');}catch(error){if(error.code!=='ENOENT')throw error;}
await run('npm',['run','build']);
await run('node',['scripts/pack-runtimes.mjs']);
const mainPack=JSON.parse(await run('npm',['pack','--json','--pack-destination',artifacts],root,{capture:true}))[0];
const runtimePack=JSON.parse(await run('npm',['pack','--json','--pack-destination',artifacts],path.join(root,'packages/acbr-node-linux-x64'),{capture:true}))[0];
await mkdir(consumer,{recursive:true});await writeFile(path.join(consumer,'package.json'),JSON.stringify({name:'acbr-node-external-consumer',version:'1.0.0',private:true,type:'module'})+'\n');
await run('npm',['install','--offline','--ignore-scripts','--no-audit','--no-fund','--omit=optional',path.join(artifacts,mainPack.filename),path.join(artifacts,runtimePack.filename)],consumer);
const cli=path.join(consumer,'node_modules/cosmemilton-acbr-node/dist/cli.js');
for(const command of [['init','--revision',String(revision)],['source','update','--revision',String(revision)],['generate'],['build'],['check'],['doctor']])await run('node',[cli,...command],consumer);
const {CNPJ,objetoDocumento}=await import(path.join(root,'test/native-fixtures.mjs'));
await writeFile(path.join(consumer,'fixture.json'),JSON.stringify({cnpj:CNPJ,documento:objetoDocumento(55)})+'\n');
await writeFile(path.join(consumer,'verify-factory.ts'),`import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';
import {criarEmissor,ACBR_CONTRACT} from './generated/acbr/index.js';
import {criarEmissor as criarPublicado} from 'cosmemilton-acbr-node';
import {createRequire} from 'node:module';
assert.equal(typeof criarPublicado,'function');assert.equal(typeof createRequire(import.meta.url)('cosmemilton-acbr-node').criarEmissor,'function');
const fixture=JSON.parse(await readFile('fixture.json','utf8'));
assert.equal(ACBR_CONTRACT.sourceRevision,${revision});
const options={cnpj:fixture.cnpj,uf:'CE',modelo:55 as const,ambiente:2 as const};
const local=criarEmissor({...options,runtimeDirectory:path.resolve('.acbr/runtime/linux-x64')});
const generated=await local.gerarXml(fixture.documento);
assert.equal(generated.estado,'XML_GERADO');assert.equal(generated.sourceRevision,${revision});assert.equal(generated.envioIniciado,false);
assert.match(Buffer.from(generated.xmlBase64!,'base64').toString('utf8'),/<NFe/);
const packaged=criarEmissor(options);
const packagedManifest=JSON.parse(await readFile('node_modules/cosmemilton-acbr-node-linux-x64/runtime/manifest.json','utf8'));
if(packagedManifest.sourceRevision!==ACBR_CONTRACT.sourceRevision||packagedManifest.contractHash!==ACBR_CONTRACT.contractHash){
 await assert.rejects(packaged.gerarXml(fixture.documento),error=>typeof error==='object'&&error!==null&&'codigo' in error&&/CONTRATO/.test(String(error.codigo)));
}else{assert.equal((await packaged.gerarXml(fixture.documento)).estado,'XML_GERADO');}
console.log(JSON.stringify({revision:ACBR_CONTRACT.sourceRevision,contractHash:ACBR_CONTRACT.contractHash,estado:generated.estado,envioIniciado:generated.envioIniciado},null,2));
`);
await run('node',[path.join(root,'node_modules/typescript/bin/tsc'),'--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022','--strict','--types','node','--typeRoots',path.join(root,'node_modules/@types'),'--outDir','build','verify-factory.ts'],consumer);
await run('node',['build/verify-factory.js'],consumer);
await writeFile(path.join(consumer,'validation.json'),JSON.stringify({formatVersion:1,revision,consumer,mainTarball:mainPack.filename,runtimeTarball:runtimePack.filename,commands:['init','source update','generate','build','check','doctor','factory gerarXml'],sefazTransmission:false},null,2)+'\n');
console.log('Consumidor externo validado:',consumer);
