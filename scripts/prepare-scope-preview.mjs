// Local previews only: verify official source artifacts before changing npm metadata.
import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { auditGenerated, auditRuntime, auditMainInventory, GENERATED_FILES, sha256 } from './audit-release.mjs';
const root=process.cwd();
const target=path.join(root,'.acbr/scope-preview');
await mkdir(target);
const pkg=JSON.parse(await readFile('package.json','utf8'));
const lock=JSON.parse(await readFile('acbr.lock.json','utf8'));
const release=JSON.parse(await readFile('release/0.2.2/manifest.json','utf8'));
const originalRelease=JSON.parse(await readFile('release/0.2.1/manifest.json','utf8'));
const generated=structuredClone(release.generated);
const artifacts=[];
for(const platform of ['linux','win32']) {
 const name='cosmemilton-acbr-node-'+platform+'-x64';
 const reference=release.artifacts.find(entry=>entry.name===name);
 const original=originalRelease.artifacts.find(entry=>entry.name===name);
 const archive=path.join(root,'.acbr/official',reference.file);
 if (!original || original.sha256!==reference.sha256 || original.bytes!==reference.bytes ||
     await sha256(archive)!==reference.sha256 || (await readFile(archive)).length!==reference.bytes)
   throw Error('Official runtime artifact differs from preserved release hashes: '+name);
 const extraction=path.join(target,'official-'+platform);
 execFileSync('python3',['scripts/unpack-npm-tarball.py',archive,extraction]);
 const official=path.join(extraction,'package');
 const officialPkg=JSON.parse(await readFile(path.join(official,'package.json'),'utf8'));
 if (officialPkg.name!==name || officialPkg.version!==reference.version) throw Error('Official package identity mismatch');
 const stage=path.join(target,platform+'-x64');
 await cp(path.join(root,'packages/acbr-node-'+platform+'-x64'),stage,{recursive:true});
 await cp(path.join(official,'runtime'),path.join(stage,'runtime'),{recursive:true});
 const manifestPath=path.join(stage,'runtime/manifest.json');
 const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
 const previousGeneratedFileHashes=manifest.generatedFileHashes;
 if(platform==='linux') {
   await mkdir('native/generated',{recursive:true});
   await cp(path.join(official,'runtime/sources/native/generated/AcbrModels.pas'),'native/generated/AcbrModels.pas');
 }
 for (const file of GENERATED_FILES) {
   const data=await readFile(file);
   const originalData=file==='generated/acbr/index.ts'
     ? Buffer.from(data.toString().replace('@cosmemilton/acbr-node/runtime','cosmemilton-acbr-node/runtime')) : data;
   if(createHash('sha256').update(originalData).digest('hex')!==previousGeneratedFileHashes[file] ||
      previousGeneratedFileHashes[file]!==release.generated.fileHashes[file])
     throw Error('Generated provenance mismatch: '+platform+': '+file);
   generated.fileHashes[file]=createHash('sha256').update(data).digest('hex');
 }
 await auditGenerated(root,generated,lock);
 manifest.generatedFileHashes=generated.fileHashes;
 await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 await auditRuntime(root,stage,platform,pkg.optionalDependencies['@'+name.replace('cosmemilton-','cosmemilton/')],generated,lock);
 const packed=JSON.parse(execFileSync('npm',['pack','--json','--ignore-scripts','--pack-destination',target],{cwd:stage,encoding:'utf8'}))[0];
 artifacts.push({name:packed.name,version:packed.version,file:packed.filename,sha256:await sha256(path.join(target,packed.filename)),originalTarballSha256:reference.sha256,previousGeneratedFileHashes,
 nativeExecutableSha256:manifest.files[manifest.executable],nativeBuildSha256:manifest.files['sources/build.json']});
}
await mkdir('.acbr/generated',{recursive:true});
await writeFile('.acbr/generated/manifest.json',JSON.stringify(generated,null,2)+'\n');
execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
const preview=JSON.parse(execFileSync('npm',['pack','--json','--dry-run','--ignore-scripts'],{cwd:root,encoding:'utf8'}))[0];
auditMainInventory(preview.files);
const packed=JSON.parse(execFileSync('npm',['pack','--json','--ignore-scripts','--pack-destination',target],{cwd:root,encoding:'utf8'}))[0];
artifacts.push({name:packed.name,version:packed.version,file:packed.filename,sha256:await sha256(path.join(target,packed.filename))});
await writeFile(path.join(target,'preview.json'),JSON.stringify({publication:'not-authorized-by-this-preview',version:pkg.version,generated,artifacts},null,2)+'\n');
console.log(target);
