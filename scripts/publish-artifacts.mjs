import { spawn } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditGenerated, auditRuntime, auditMainInventory } from './audit-release.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(process.argv.slice(2).some(value=>value!=='--publish'))throw Error('Opção inválida. Use sem opções para dry run ou --publish para publicação.');
const publish=process.argv.includes('--publish');
const artifactDirectory=path.join(root,'.acbr/release-artifacts');await mkdir(artifactDirectory,{recursive:true});
async function run(command,args,cwd=root,capture=false){
 return new Promise((done,fail)=>{const child=spawn(command,args,{cwd,stdio:['ignore','pipe','pipe'],shell:false,windowsHide:true});let out='';child.stdout.on('data',chunk=>{out+=chunk;if(!capture)process.stdout.write(chunk);});child.stderr.pipe(process.stderr);child.on('error',fail);child.on('close',code=>code===0?done(out):fail(Error(command+' exit '+code)));});
}
const main=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const generated=JSON.parse(await readFile(path.join(root,'.acbr/generated/manifest.json'),'utf8'));
const lock=JSON.parse(await readFile(path.join(root,'acbr.lock.json'),'utf8'));
await auditGenerated(root,generated,lock);
const directories=[];
for(const platform of ['linux','win32']){
 const directory=path.join(root,'packages','acbr-node-'+platform+'-x64');
 await auditRuntime(root,directory,platform,main.version,generated,lock);
 directories.push(directory);
}
const preview=JSON.parse(await run('npm',['pack','--json','--dry-run'],root,true))[0];
auditMainInventory(preview.files);
directories.push(root);
// Complete every audit and prepare all tarballs before the first publication.
const tarballs=[];
for(const directory of directories){
 const packed=JSON.parse(await run('npm',['pack','--json','--pack-destination',artifactDirectory],directory,true))[0];
 tarballs.push(path.join(artifactDirectory,packed.filename));
}
if(publish)await run('npm',['whoami']);
for(const tarball of tarballs){
 console.log((publish?'Publicando':'Conferindo dry run')+': '+tarball);
 await run('npm',['publish',tarball,'--access','public',...(publish?[]:['--dry-run'])]);
}
console.log(publish?'Pacotes publicados.':'Artefatos preparados; nenhuma publicação executada. Use --publish somente após revisar artefatos, licenças e validações.');
