import { build } from 'esbuild';
import { mkdir, chmod } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/cli.ts'],bundle:true,platform:'node',target:'node22',format:'esm',outfile:'dist/cli.js',packages:'external',sourcemap:true});
await chmod('dist/cli.js',0o755);
if(!process.argv.includes('--cli-only')){
  for(const name of ['index','runtime'])for(const format of ['esm','cjs'])await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',target:'node22',format,outfile:'dist/'+name+(format==='esm'?'.js':'.cjs'),packages:'external',sourcemap:true});
  execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--emitDeclarationOnly'],{stdio:'inherit'});
}
