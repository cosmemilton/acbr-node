import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm, realpath } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';

const source=fileURLToPath(new URL('../src/cli.ts',import.meta.url));
const PREFIX='acbr-cli-entrypoint-test-';
async function fixture(t: any) {
  const root=await mkdtemp(path.join(os.tmpdir(),PREFIX));
  t.after(async()=>{
    const absolute=await realpath(root),temp=await realpath(os.tmpdir());
    assert.ok(absolute.toLowerCase().startsWith(temp.toLowerCase()+path.sep)&&path.basename(absolute).startsWith(PREFIX));
    await rm(root,{recursive:true,force:true});
  });
  const packageDirectory=path.join(root,'package');await mkdir(packageDirectory);
  await writeFile(path.join(packageDirectory,'package.json'),' {"type":"module"}\n','utf8');
  const cli=path.join(packageDirectory,'cli.js');
  await build({entryPoints:[source],bundle:true,platform:'node',target:'node22',format:'esm',outfile:cli,packages:'external'});
  return {root,cli,packageDirectory};
}
async function invoke(args: string[],cwd: string) {
  return new Promise<{code:number|null;stdout:string;stderr:string}>((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.on('data',bytes=>stdout+=bytes.toString('utf8'));
    child.stderr.on('data',bytes=>stderr+=bytes.toString('utf8'));
    child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));
  });
}
function assertHelp(result: {code:number|null;stdout:string;stderr:string}) {
  assert.equal(result.code,0);assert.match(result.stdout,/acbr-node/);assert.match(result.stdout,/source update/);assert.equal(result.stderr,'');
}

test('built CLI outside the repository executes its direct --help entrypoint',async t=>{
  const f=await fixture(t);assertHelp(await invoke([f.cli,'--help'],f.root));
});

test('npm-style file symlink executes help and propagates invalid-option exit code',async t=>{
  const f=await fixture(t),bin=path.join(f.root,'acbr-node.js');
  try{await symlink(f.cli,bin,'file');}
  catch(error){if(['EPERM','EACCES','ENOTSUP','ENOSYS'].includes((error as NodeJS.ErrnoException).code??'')){t.skip('File symlinks require privileges on this Windows host; this case runs on Linux.');return;}throw error;}
  assertHelp(await invoke([bin,'--help'],f.root));
  const invalid=await invoke([bin,'--unknown-option'],f.root);assert.equal(invalid.code,1);assert.equal(invalid.stdout,'');assert.match(invalid.stderr,/desconhecida/);
});

test('directory alias also resolves the physical CLI entrypoint',async t=>{
  const f=await fixture(t),alias=path.join(f.root,'package-alias');
  // The junction and its target are both inside this test's exclusive directory.
  // Windows junctions cover realpath handling without file-symlink privileges.
  await symlink(f.packageDirectory,alias,process.platform==='win32'?'junction':'dir');
  assertHelp(await invoke([path.join(alias,'cli.js'),'--help'],f.root));
});

test('importing the CLI from another entrypoint never runs main',async t=>{
  const f=await fixture(t),driver=path.join(f.root,'import-driver.mjs');
  await writeFile(driver,`await import(${JSON.stringify(pathToFileURL(f.cli).href)}); process.stdout.write('IMPORTED_ONLY\\n');\n`,'utf8');
  const result=await invoke([driver,'--help'],f.root);assert.equal(result.code,0);assert.equal(result.stdout,'IMPORTED_ONLY\n');assert.equal(result.stderr,'');
});

test('importing the CLI tolerates an absent host argv path without side effects',async t=>{
  const f=await fixture(t),driver=path.join(f.root,'absent-entry-driver.mjs'),missing=path.join(f.root,'missing-host.js');
  await writeFile(driver,`process.argv[1]=${JSON.stringify(missing)}; await import(${JSON.stringify(pathToFileURL(f.cli).href)}); process.stdout.write('IMPORTED_ONLY\\n');\n`,'utf8');
  const result=await invoke([driver,'--help'],f.root);assert.equal(result.code,0);assert.equal(result.stdout,'IMPORTED_ONLY\n');assert.equal(result.stderr,'');
});
