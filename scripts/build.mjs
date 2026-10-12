import { build } from 'esbuild';
import { mkdir, chmod, readFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/cli.ts'],bundle:true,platform:'node',target:'node22',format:'esm',outfile:'dist/cli.js',packages:'external',sourcemap:true});
await chmod('dist/cli.js',0o755);
if(!process.argv.includes('--cli-only')){
  const metadata=JSON.parse(await readFile('generated/acbr/contract.json','utf8'));
  const lock=JSON.parse(await readFile('acbr.lock.json','utf8'));
  const digest=createHash('sha256').update(JSON.stringify({sourceRevision:metadata.sourceRevision,sourceHash:metadata.sourceHash,ir:metadata.ir})).digest('hex');
  if(metadata.formatVersion!==1||digest!==metadata.contractHash||metadata.sourceRevision!==lock.source.revision||metadata.sourceHash!==lock.source.treeHash)throw Error('Metadados do contrato inválidos ou incompatíveis com o lock. Execute generate.');
  await copyFile('generated/acbr/contract.json','dist/contract.json');
  for(const name of ['index','runtime'])for(const format of ['esm','cjs'])await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',target:'node22',format,outfile:'dist/'+name+(format==='esm'?'.js':'.cjs'),packages:'external',sourcemap:true});
  execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--emitDeclarationOnly'],{stdio:'inherit'});
}
