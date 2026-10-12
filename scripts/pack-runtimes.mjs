import { cp, mkdir, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root=process.cwd();
const pkg=JSON.parse(await readFile('package.json','utf8'));
const generated=JSON.parse(await readFile('.acbr/generated/manifest.json','utf8'));
for(const platform of ['linux','win32']){
 const runtime=path.resolve('.acbr/runtime/'+platform+'-x64');
 let manifest;try{manifest=JSON.parse(await readFile(path.join(runtime,'manifest.json'),'utf8'));}catch{if(process.argv.includes('--all'))throw Error('Runtime ausente: '+platform);console.log('Runtime ainda não disponível: '+platform);continue;}
 if(manifest.testOnly===true||manifest.formatVersion!==1||manifest.platform!==platform||manifest.arch!=='x64'||manifest.sourceRevision!==generated.sourceRevision||manifest.contractHash!==generated.contractHash||!manifest.files?.[manifest.executable])throw Error('Runtime divergente do cliente gerado: '+platform);
 for(const [name,hash] of Object.entries(manifest.files)){
  const file=path.resolve(runtime,name),relative=path.relative(runtime,file);
  if(!name||path.isAbsolute(name)||relative==='..'||relative.startsWith('..'+path.sep)||(await lstat(file)).isSymbolicLink())throw Error('Arquivo inválido no runtime.');
  if(createHash('sha256').update(await readFile(file)).digest('hex')!==hash)throw Error('Hash divergente: '+name);
 }
 const directory=path.resolve('packages/acbr-node-'+platform+'-x64');
 if(!directory.startsWith(path.join(root,'packages')+path.sep))throw Error('Destino fora do projeto.');
 await mkdir(directory,{recursive:true});
 await rm(path.join(directory,'runtime'),{recursive:true,force:true});
 await cp(runtime,path.join(directory,'runtime'),{recursive:true});
 const json={name:'cosmemilton-acbr-node-'+platform+'-x64',version:pkg.version,license:pkg.license,description:'Motor ACBr '+platform+' x64 para '+pkg.name,os:[platform],cpu:['x64'],...(platform==='linux'?{libc:['glibc']}:{}),engines:pkg.engines,files:['runtime','LICENSE','NOTICE','README.md'],exports:{'./package.json':'./package.json'},publishConfig:{access:'public'},repository:{...pkg.repository,directory:'packages/acbr-node-'+platform+'-x64'},homepage:pkg.homepage,bugs:pkg.bugs};
 await writeFile(path.join(directory,'package.json'),JSON.stringify(json,null,2)+'\n');
 for(const name of ['LICENSE','NOTICE'])await cp(name,path.join(directory,name));
 const readme=path.join(directory,'README.md');
 try{await readFile(readme);}catch(error){if(error.code!=='ENOENT')throw error;await writeFile(readme,'# '+json.name+'\n\nRuntime fiscal Free Pascal/ACBr. Revisão '+manifest.sourceRevision+'. Use pelo pacote principal. Fontes e licenças em runtime/sources e runtime/licenses. Plataforma: '+(platform==='linux'?'Linux x64 Ubuntu24.04/glibc':'Windows x64')+'. Homologação fiscal real é separada dos testes offline.\n');}
 console.log(directory);
}
