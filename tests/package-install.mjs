// Standalone package smoke test; never runs as part of npm test and never sends to SEFAZ.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const execute = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  if (!['--main', '--runtime', '--directory', '--node', '--npm-cli'].includes(process.argv[i]) || !process.argv[i + 1])
    throw Error('Use --main MAIN.tgz --runtime RUNTIME.tgz --directory EMPTY_DIR [--node NODE] [--npm-cli npm-cli.js].');
  args.set(process.argv[i], process.argv[i + 1]);
}
const main = resolve(args.get('--main') ?? join(root, '.acbr/artifacts/cosmemilton-acbr-node-0.1.0.tgz'));
const native = resolve(args.get('--runtime') ?? join(root, '.acbr/artifacts/cosmemilton-acbr-node-' + process.platform + '-x64-0.1.0.tgz'));
const directory = resolve(args.get('--directory') ?? join(root, '../acbr-node-runtime-consumer-' + process.platform));
const fromRoot=relative(root,directory);
assert.ok(fromRoot && (fromRoot==='..'||fromRoot.startsWith('..'+sep)||isAbsolute(fromRoot)),'Consumer must be outside the source project.');
const node = resolve(args.get('--node') ?? process.execPath);
const npmCli = args.get('--npm-cli') ?? process.env.npm_execpath ?? join(dirname(node), '../lib/node_modules/npm/bin/npm-cli.js');
await mkdir(directory, { recursive: true });
try {
  await readFile(join(directory, 'package.json'));
  throw Error('Consumer directory already has package.json; choose a fresh directory.');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(join(directory, 'package.json'), JSON.stringify({ name: 'acbr-runtime-offline-consumer', version: '1.0.0', private: true, type: 'module' }, null, 2));
await execute(node, [resolve(npmCli), 'install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', main, native], {
  cwd: directory, windowsHide: true, maxBuffer: 1024 * 1024,
});
// Fixture generation happens in this maintainer checkout. The consumer has only the two installed npm packages.
const { certificado, objetoDocumento } = await import(new URL('../test/native-fixtures.mjs', import.meta.url));
const fixtures = [];
for (const cnpj of ['11222333000181', '12345678000195']) {
  const cert = certificado({ cnpj });
  for (const modelo of [55, 65]) {
    const documento = objetoDocumento(modelo);
    documento.Emit.CNPJCPF = cnpj;
    documento.Emit.xNome = 'Café São José EMITENTE SINTÉTICO ' + cnpj;
    fixtures.push({
      config: { cnpj, uf: 'CE', modelo, ambiente: 2, certificado: cert,
        ...(modelo === 65 ? { csc: { id: '000001', valor: 'CSC-SINTETICO-OFFLINE-NAO-TRANSMITIR' } } : {}) },
      documento,
    });
  }
}
await writeFile(join(directory, 'fixtures.json'), JSON.stringify(fixtures), { mode: 0o600 });
const runner = String.raw`
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
(async()=>{
 const kind=process.argv[2];
 const sdk=kind==='esm'?await import('@cosmemilton/acbr-node'):require('@cosmemilton/acbr-node');
 const nativeName='@cosmemilton/acbr-node-'+process.platform+'-x64';
 const runtime=path.join(path.dirname(require.resolve(nativeName+'/package.json')),'runtime');
 const worker=path.join(runtime,process.platform==='win32'?'acbr-worker.exe':'acbr-worker');
 const nodeBin=path.dirname(process.execPath);
 assert.equal(process.env.PATH,nodeBin);
 assert.equal(process.env.ACBR_NODE_RUNTIME_DIR,undefined);
 const fixtures=JSON.parse(fs.readFileSync('fixtures.json','utf8'));
 const executions=[],loaded=new Set();let audited=0;
 const allowedGlibc=/^(?:ld-linux-x86-64\.so\.2|lib(?:c|m|dl|pthread|rt|resolv)\.so(?:\.\d+)*)$/;
 for(const fixture of fixtures) {
  const cert=fixture.config.certificado;
  const emitter=sdk.criarEmissor({...fixture.config,
   certificado:{pfx:Buffer.from(cert.pfxBase64,'base64'),senha:cert.senha},
   criaProcesso:(exe,args,options)=>{
    assert.equal(exe,worker,'The installed npm runtime must provide the worker.');
    assert.equal(options.shell,false);
    const expectedChildPath=process.platform==='win32'?[path.join(runtime,'lib'),runtime,nodeBin].join(path.delimiter):nodeBin;
    assert.equal(options.env.PATH,expectedChildPath,'Only installed runtime DLL paths and Node may be in PATH; compilation tools must be absent.');
    if(process.platform==='win32')assert.equal(options.env.Path,undefined,'Windows must have a single canonical PATH key.');
    assert.equal(options.env.OPENSSL_MODULES,path.join(runtime,'ossl-modules'));
    assert.equal(options.env.OPENSSL_CONF,path.join(runtime,'openssl.cnf'));
    executions.push(exe);
    const child=cp.spawn(exe,args,{...options,env:{...options.env,...(process.platform==='linux'?{LD_DEBUG:'libs'}:{})}});
    let stderr='';
    child.stderr.on('data',chunk=>{stderr+=chunk.toString('utf8');});
    child.on('close',()=>{
     if(process.platform==='linux') {
      const libraries=[...stderr.matchAll(/calling init:\s+([^\r\n]+)/g)].map(m=>m[1].trim());
      assert.ok(libraries.length,'Linux loader trace must contain loaded libraries.');
      for(const lib of libraries) {
       loaded.add(lib);
       assert.ok(lib.startsWith(runtime+path.sep)||allowedGlibc.test(path.basename(lib))||/^\/usr\/lib\/x86_64-linux-gnu\/gconv\/UTF-16\.so$/.test(lib),
        'A non-system dependency was loaded outside the installed runtime: '+lib);
      }
      audited++;
     }
    });
    return child;
   }
  });
  try {
   const model=new sdk.TNFe(fixture.documento);
   const generated=await emitter.gerarXml(model);
   assert.equal(generated.estado,'XML_GERADO');
   let xml=Buffer.from(generated.xmlBase64,'base64').toString('utf8');
   assert.match(xml,/Café São José/);
   assert.match(xml,new RegExp('<CNPJ>'+fixture.config.cnpj+'</CNPJ>'));
   assert.match(xml,new RegExp('<dhEmi>'+fixture.documento.Ide.dEmi+'-03:00</dhEmi>'));
   const signed=await emitter.assinar(xml);
   assert.equal(signed.estado,'ASSINADO');
   xml=Buffer.from(signed.xmlBase64,'base64').toString('utf8');
   assert.match(xml,/<Signature/);
   if(fixture.config.modelo===65)assert.match(xml,/<qrCode>/);
   const validated=await emitter.validar(xml);
   assert.equal(validated.estado,'VALIDADO');
   assert.equal(validated.envioIniciado,false);
  } finally { await emitter.fechar(); }
 }
 assert.equal(executions.length,12,'Only three offline operations for each synthetic fixture.');
 if(process.platform==='linux') {
  assert.equal(audited,executions.length);
  for(const library of ['libcrypto','libssl','libxml2'])
   assert.ok([...loaded].some(file=>path.basename(file).startsWith(library)),library+' must have been loaded from the installed runtime');
 }
 console.log(JSON.stringify({kind,platform:process.platform,node:process.version,fixtures:fixtures.length,executions:executions.length,
  runtime,loadedLibraries:[...loaded].sort(),compilerPathAbsent:true,sourceCheckoutUnused:true}));
})().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
`;
await writeFile(join(directory, 'consumer.cjs'), runner);
const minimalEnv = { PATH: dirname(node), HOME: directory, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' };
for (const key of ['SystemRoot', 'WINDIR', 'TEMP', 'TMP']) if (process.env[key]) minimalEnv[key] = process.env[key];
for (const kind of ['esm', 'cjs']) {
  const result = await execute(node, [join(directory, 'consumer.cjs'), kind], {
    cwd: directory, env: minimalEnv, windowsHide: true, maxBuffer: 8 * 1024 * 1024, timeout: 180_000,
  });
  const report = JSON.parse(result.stdout.trim());
  await writeFile(join(directory, 'report-' + kind + '.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
console.log('Installed-package consumer passed: ' + directory);
