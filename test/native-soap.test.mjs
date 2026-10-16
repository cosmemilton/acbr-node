import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm}from'node:fs/promises';
import {spawn}from'node:child_process';
import {fileURLToPath}from'node:url';
import path from'node:path';
import os from'node:os';
import https from'node:https';
import {certificado,documento,CNPJ,tlsCertificates,partesAssinadas,comAspasSimples,comComplemento,comPrefixo,criarAssinadorSintetico,respostaConsulta}from'./native-fixtures.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const enabled=process.env.ACBR_NATIVE_TEST==='1';
const runtime=process.env.ACBR_NODE_TEST_RUNTIME_DIR??path.join(root,'.acbr','test-runtime',process.platform+'-'+process.arch);
const executable=path.join(runtime,process.platform==='win32'?'acbr-worker.exe':'acbr-worker');
function envFor(extra={}){const env={...process.env,OPENSSL_CONF:path.join(runtime,'openssl.cnf'),OPENSSL_MODULES:path.join(runtime,'ossl-modules'),...extra};if(process.platform==='linux')env.LD_LIBRARY_PATH=path.join(runtime,'lib');else env.PATH=path.join(runtime,'lib')+path.delimiter+(process.env.PATH??'');return env;}
function run(request,extra={}){
 return new Promise((resolve,reject)=>{const c=spawn(executable,[],{cwd:runtime,windowsHide:true,shell:false,env:envFor(extra),stdio:['pipe','pipe','pipe']});const chunks=[];const timer=setTimeout(()=>{c.kill('SIGKILL');reject(new Error('Mock SOAP worker timeout'));},15000);c.stdout.on('data',b=>chunks.push(b));c.stderr.on('data',()=>{});c.on('error',e=>{clearTimeout(timer);reject(e);});c.on('close',code=>{clearTimeout(timer);if(code!==0){reject(new Error('Worker exit '+code));return;}try{const frames=Buffer.concat(chunks).toString('utf8').trim().split('\n').map(s=>JSON.parse(s));resolve({result:frames.at(-1),frames});}catch(e){reject(e);}});c.stdin.end(JSON.stringify(request)+'\n');});
}
const date=()=>new Date().toISOString().replace(/\.\d{3}Z$/,'-00:00');
const wrap=(body,service)=>`<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body><nfeResultMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/${service}">${body}</nfeResultMsg></soap:Body></soap:Envelope>`;
const prot=(key,code=100,digest='')=>`<protNFe versao="4.00"><infProt><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><chNFe>${key}</chNFe><dhRecbto>${date()}</dhRecbto><nProt>123456789012345</nProt>${digest?'<digVal>'+digest+'</digVal>':''}<cStat>${code}</cStat><xMotivo>SYNTHETIC OFFLINE RESPONSE</xMotivo></infProt></protNFe>`;
const envio=(code,key,digest)=>`<retEnviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><cStat>${code}</cStat><xMotivo>SYNTHETIC OFFLINE RESPONSE</xMotivo><cUF>23</cUF><dhRecbto>${date()}</dhRecbto>${code===104?prot(key,100,digest):code===103?'<infRec><nRec>123456789012345</nRec><tMed>1</tMed></infRec>':''}</retEnviNFe>`;
test('ACBr real usa SOAP localhost simulado sem recompor XML assinado',{skip:!enabled,timeout:300000},async t=>{
 const manifest=JSON.parse(await readFile(path.join(runtime,'manifest.json'),'utf8'));assert.equal(manifest.testOnly,true,'network simulations require the isolated test build');
 const tmp=await mkdtemp(path.join(os.tmpdir(),'acbr-node-soap-'));t.after(()=>rm(tmp,{recursive:true,force:true}));
 const certs=tlsCertificates();const caFile=path.join(tmp,'ca.pem');await writeFile(caFile,certs.ca);
 let handler;let bodies=[];const sockets=new Set();const server=https.createServer({key:certs.key,cert:certs.cert+certs.ca,minVersion:'TLSv1.2'},(req,res)=>{let body='';req.setEncoding('utf8');req.on('data',s=>body+=s);req.on('end',()=>{bodies.push(body);handler(req,res,body);});});server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));});server.on('tlsClientError',()=>{});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{for(const s of sockets)s.destroy();await new Promise(resolve=>server.close(resolve));});
 const services=(await readFile(path.join(runtime,'ACBrNFeServicos.ini'),'utf8')).split(/\r?\n/).map(line=>{const i=line.indexOf('=');if(i<0)return line;const value=line.slice(i+1).trim();return /^(https?:\/\/|www\.)/.test(value)?line.slice(0,i+1)+'https://localhost:'+server.address().port+'/mock':line;}).join('\n');const servicesFile=path.join(tmp,'services.ini');await writeFile(servicesFile,services);
 const env={ACBR_NODE_TEST_CA_FILE:caFile,ACBR_NODE_TEST_SERVICES:servicesFile};
 const config={cnpj:CNPJ,uf:'CE',modelo:55,ambiente:2,certificado:certificado()};
 const base={versao:1,id:'synthetic-soap',sourceRevision:manifest.sourceRevision,contractHash:manifest.contractHash,config};
 const unsigned=documento(55);const signed=(await run({...base,comando:'assinar',...unsigned},env)).result;assert.equal(signed.estado,'ASSINADO',signed.codigo);
 const xml=Buffer.from(signed.xmlBase64,'base64').toString('utf8');const digest=xml.match(/<DigestValue>(.*?)<\/DigestValue>/s)?.[1]??'';
 const transmit=()=>run({...base,comando:'transmitir',xmlBase64:signed.xmlBase64,chave:signed.chave},env);
 const respond=(res,body,service='NFeAutorizacao4')=>{res.writeHead(200,{'content-type':'application/soap+xml; charset=utf-8'});res.end(wrap(body,service));};
 await t.test('autorização 104/prot100 e XML idêntico no SOAP',async()=>{bodies=[];handler=(_req,res)=>respond(res,envio(104,signed.chave,digest));const{result,frames}=await transmit();assert.equal(result.estado,'AUTORIZADO',result.codigo);assert.equal(result.cStat,100);assert.equal(result.protocolo,'123456789012345');assert.deepEqual(frames[0],{tipo:'envioIniciado',id:base.id});assert.equal(bodies.length,1);assert.ok(bodies[0].includes(xml.replace(/^<\?xml[^>]*>\s*/,'')),'the signed XML bytes must reach the envelope without regeneration');assert.match(Buffer.from(result.xmlBase64,'base64').toString(),/<nfeProc/);});
 await t.test('NFC-e65 autoriza sincrono preservando assinatura QRCode e UTF8 no SOAP',async()=>{
  const nfceBase={...base,id:'synthetic-soap-nfce',config:{...config,modelo:65,csc:{id:'000001',valor:'CSC-SINTETICO-OFFLINE-NFCE'}}};
  const signed65=(await run({...nfceBase,comando:'assinar',...documento(65)},env)).result;assert.equal(signed65.estado,'ASSINADO',signed65.codigo);
  const xml65=Buffer.from(signed65.xmlBase64,'base64').toString('utf8'),digest65=xml65.match(/<DigestValue>(.*?)<\/DigestValue>/s)?.[1]??'',qr65=xml65.match(/<qrCode>(.*?)<\/qrCode>/s)?.[1];assert.ok(qr65);
  bodies=[];handler=(_req,res)=>respond(res,envio(104,signed65.chave,digest65));
  const{result,frames}=await run({...nfceBase,comando:'transmitir',xmlBase64:signed65.xmlBase64,chave:signed65.chave},env);
  assert.equal(result.estado,'AUTORIZADO',result.codigo);assert.equal(result.cStat,100);assert.equal(result.protocolo,'123456789012345');assert.equal(result.chave,signed65.chave);assert.deepEqual(frames[0],{tipo:'envioIniciado',id:nfceBase.id});
  assert.equal(bodies.length,1);assert.match(bodies[0],/<indSinc>1<\/indSinc>/);const expected65=xml65.replace(/^<\?xml[^>]*>\s*/,'').trim();const actual65=bodies[0].match(/<NFe\b[\s\S]*?<\/NFe>/)?.[0]??'';let diff=0;while(diff<expected65.length&&actual65[diff]===expected65[diff])diff++;assert.ok(actual65===expected65,'NFC-e root XML including QRCode must not be regenerated; first difference '+diff+' expected '+JSON.stringify(expected65.slice(diff,diff+60))+' actual '+JSON.stringify(actual65.slice(diff,diff+60)));
  const authorized=Buffer.from(result.xmlBase64,'base64').toString('utf8');assert.match(authorized,/<nfeProc/);assert.match(authorized,/Café São José/);assert.equal(authorized.match(/<qrCode>(.*?)<\/qrCode>/s)?.[1],qr65);
 });
 for(const code of[225,204,103])await t.test('retorno de transmissão '+code,async()=>{handler=(_req,res)=>respond(res,envio(code,signed.chave,digest));const{result}=await transmit();assert.equal(result.cStat,code);assert.equal(result.estado,code===225?'REJEITADO':'PENDENTE');assert.equal(result.xmlBase64,signed.xmlBase64);if(code===103)assert.equal(result.recibo,'123456789012345');});
 await t.test('autorização de outra chave fica indeterminada',async()=>{handler=(_req,res)=>respond(res,envio(104,signed.chave.slice(0,-1)+(signed.chave.endsWith('0')?'1':'0'),digest));const{result}=await transmit();assert.equal(result.estado,'INDETERMINADO');assert.equal(result.xmlBase64,signed.xmlBase64);assert.equal(result.cStat,undefined);});
 await t.test('timeout preserva XML e exige consulta',async()=>{handler=(_req,res)=>setTimeout(()=>respond(res,envio(104,signed.chave,digest)),1800);const{result}=await transmit();assert.equal(result.estado,'INDETERMINADO');assert.equal(result.xmlBase64,signed.xmlBase64);assert.equal(result.chave,signed.chave);assert.equal(result.envioIniciado,true);assert.equal(result.protocolo,undefined);});
 await t.test('consulta por chave identifica a mesma nota',async()=>{handler=(_req,res)=>respond(res,`<retConsSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><cStat>100</cStat><xMotivo>AUTORIZADO SINTETICO</xMotivo><cUF>23</cUF>${prot(signed.chave,100,digest)}</retConsSitNFe>`,'NFeConsultaProtocolo4');const{result,frames}=await run({...base,comando:'consultar',chave:signed.chave},env);assert.equal(result.estado,'AUTORIZADO',result.codigo);assert.equal(result.chave,signed.chave);assert.equal(frames.length,1);});
 await t.test('recuperarXml exige assinatura local e protocolo correlacionado sem transmitir',async recovery=>{
  const original=partesAssinadas(signed.xmlBase64);
  const recover=(xmlBase64=signed.xmlBase64,extra={})=>run({...base,comando:'recuperarXml',xmlBase64,...extra},env);
  const mockConsulta=(options={})=>{
   bodies=[];
   handler=(_req,res)=>respond(res,respostaConsulta({chave:signed.chave,digest:original.digest,...options}),'NFeConsultaProtocolo4');
  };
  const readonly=({result,frames})=>{
   assert.equal(result.envioIniciado,false);
   assert.equal(frames.length,1,'read-only recovery must not emit an envioIniciado frame');
   assert.ok(frames.every(frame=>frame.tipo!=='envioIniciado'));
   assert.ok(bodies.length<=1,'recovery must never repeat the consultation');
   for(const body of bodies){
    assert.match(body,/<(?:[A-Za-z_][\w.-]*:)?consSitNFe(?:\s|>)/);
    assert.doesNotMatch(body,/<(?:[A-Za-z_][\w.-]*:)?(?:NFe|enviNFe|Signature|emit)(?:\s|>)/,
     'the query must never contain the invoice, its signature or an authorization batch');
   }
  };
  const rejected=(output,codes)=>{
   readonly(output);
   assert.equal(output.result.sucesso,false);
   assert.notEqual(output.result.estado,'XML_RECUPERADO');
   assert.equal(output.result.xmlBase64,undefined,'unproven recovery must not return an XML process');
   assert.equal(output.result.protocolo,undefined);
   assert.ok(codes.includes(output.result.codigo),output.result.codigo);
  };
  const recovered=(output,input=signed)=>{
   readonly(output);
   assert.equal(output.result.sucesso,true,output.result.codigo);
   assert.equal(output.result.estado,'XML_RECUPERADO',output.result.codigo);
   assert.equal(output.result.cStat,100);
   assert.equal(output.result.chave,input.chave);
   assert.equal(output.result.protocolo,'123456789012345');
   const supplied=partesAssinadas(input.xmlBase64),processed=partesAssinadas(output.result.xmlBase64);
   assert.match(processed.xml,/<(?:[A-Za-z_][\w.-]*:)?nfeProc(?:\s|>)/);
   assert.equal(processed.nfe,supplied.nfe,'the original NFe bytes must be preserved inside nfeProc');
   assert.equal(processed.assinatura,supplied.assinatura,'the original Signature bytes must be preserved');
   assert.equal(processed.digest,supplied.digest);
   assert.equal((processed.xml.match(/<(?:[A-Za-z_][\w.-]*:)?protNFe(?:\s|>)/g)??[]).length,1);
   assert.match(processed.xml,/<(?:[A-Za-z_][\w.-]*:)?xMotivo>RESPOSTA D'EXEMPLO SINTETICO<\/(?:[A-Za-z_][\w.-]*:)?xMotivo>/,
    'the protocol apostrophe must remain unchanged by the recovery compositor');
   assert.equal(bodies.length,1,'recovery performs exactly one consultation');
   assert.ok(bodies[0].includes('<chNFe>'+input.chave+'</chNFe>'));
  };
  await recovery.test('100 recupera nfeProc com NFe e Signature originais',async()=>{
   mockConsulta();recovered(await recover());
  });
  let prefixedFixture;
  const originalPrefixado=()=>prefixedFixture??= (async()=>{
   const signer=await criarAssinadorSintetico({root,runtime});
   const unsignedPrefixed=comPrefixo(unsigned,'n');
   const output=await signer({xmlBase64:unsignedPrefixed.xmlBase64,...config.certificado});
   assert.equal(output.assinaturaValida,true,[output.codigo,output.etapa].filter(Boolean).join(': '));
   const input={chave:unsignedPrefixed.chave,xmlBase64:output.xmlBase64},parts=partesAssinadas(input.xmlBase64);
   assert.match(parts.nfe,/^<n:NFe\b/);
   assert.doesNotMatch(parts.nfe.match(/^<[^>]+>/)?.[0]??'',/\sxmlns\s*=/,
    'the original invoice must have no default namespace declaration');
   assert.deepEqual(await signer({xmlBase64:input.xmlBase64,verificarOnly:true}),{assinaturaValida:true});
   return{signer,input,parts};
  })();
  await recovery.test('original prefixado sem namespace default mantém crypto válida no processo final',async()=>{
   const{signer,input,parts}=await originalPrefixado();
   mockConsulta({chave:input.chave,digest:parts.digest});
   const output=await recover(input.xmlBase64);recovered(output,input);
   assert.match(Buffer.from(output.result.xmlBase64,'base64').toString('utf8'),/<n:nfeProc\b/);
   assert.deepEqual(await signer({xmlBase64:output.result.xmlBase64,verificarOnly:true}),{assinaturaValida:true},
    'verify the complete nfeProc context, not an extracted standalone NFe');
  });
  for(const prefixed of[false,true])await recovery.test(
   'original '+(prefixed?'prefixado':'com namespace default')+' com protocolo DSig é recusado sem produzir processo',async()=>{
   const fixture=await originalPrefixado(),{signer}=fixture;
   const{input,parts}=prefixed?fixture:{input:signed,parts:original};
   const protocol=prot(input.chave,100,parts.digest)
    .replace('<protNFe versao=', '<protNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao=')
    .replace('<infProt>','<infProt Id="ID123456789012345">');
   const signedProtocol=await signer({xmlBase64:Buffer.from(protocol).toString('base64'),
    ...config.certificado,documento:'protNFe'});
   assert.equal(signedProtocol.assinaturaValida,true,[signedProtocol.codigo,signedProtocol.etapa].filter(Boolean).join(': '));
   const signedRoot=Buffer.from(signedProtocol.xmlBase64,'base64').toString('utf8')
    .match(/<protNFe\b[\s\S]*?<\/protNFe>/)?.[0];
   assert.ok(signedRoot);assert.match(signedRoot,/<(?:[A-Za-z_][\w.-]*:)?Signature(?:\s|>)/);
   const response=respostaConsulta({chave:input.chave,digest:parts.digest})
    .replace(/<protNFe\b[\s\S]*?<\/protNFe>/,()=>signedRoot);
   bodies=[];handler=(_req,res)=>respond(res,response,'NFeConsultaProtocolo4');
   rejected(await recover(input.xmlBase64),['RECUPERACAO_NAO_COMPROVADA']);assert.equal(bodies.length,1);
  });
  await recovery.test('NFC-e preserva também suplemento e QRCode originais',async()=>{
   const nfceConfig={...config,modelo:65,csc:{id:'000001',valor:'CSC-SINTETICO-RECUPERACAO-OFFLINE'}};
   const nfce=(await run({...base,config:nfceConfig,comando:'assinar',...documento(65)},env)).result;
   assert.equal(nfce.estado,'ASSINADO',nfce.codigo);
   const input=partesAssinadas(nfce.xmlBase64);assert.match(input.nfe,/<infNFeSupl>/);
   mockConsulta({chave:nfce.chave,digest:input.digest});
   recovered(await recover(nfce.xmlBase64,{config:nfceConfig}),nfce);
  });
  await recovery.test('aspas simples e apóstrofo em texto preservam o XML assinado byte a byte',async()=>{
   const quoted=(await run({...base,comando:'assinar',...comComplemento(unsigned,"TESTE D'AGUA SINTETICO & OFFLINE")},env)).result;
   assert.equal(quoted.estado,'ASSINADO',quoted.codigo);
   const input={chave:quoted.chave,xmlBase64:comAspasSimples(quoted.xmlBase64)};
   assert.match(partesAssinadas(input.xmlBase64).assinatura,/='/);
   mockConsulta({digest:partesAssinadas(input.xmlBase64).digest});
   recovered(await recover(input.xmlBase64),input);
  });
  await recovery.test('namespace prefixado no retorno de consulta é lido sem alterar a assinatura',async()=>{
   mockConsulta({prefixo:'nfe'});recovered(await recover());
  });
  for(const[description,xmlBase64,extra,codes]of[
   ['XML mal formado',Buffer.from('<NFe>').toString('base64'),{},['XML_INVALIDO','OPERACAO_FISCAL_FALHOU']],
   ['processo já envelopado',Buffer.from('<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">'+original.nfe+'</nfeProc>').toString('base64'),{},['XML_INVALIDO']],
   ['processo prefixado já envelopado',Buffer.from('<p:nfeProc xmlns:p="http://www.portalfiscal.inf.br/nfe" versao="4.00">'+original.nfe+'</p:nfeProc>').toString('base64'),{},['XML_INVALIDO']],
   ['infNFe duplicado',Buffer.from(original.xml.replace(/(<infNFe\b[\s\S]*?<\/infNFe>)/,(_match,info)=>info+info)).toString('base64'),{},['XML_INVALIDO']],
   ['DTD',Buffer.from('<!DOCTYPE NFe [<!ENTITY test "SYNTHETIC">]><NFe>&test;</NFe>').toString('base64'),{},['XML_INVALIDO']],
   ['XML não assinado',unsigned.xmlBase64,{},['XML_NAO_ASSINADO']],
   ['conteúdo adulterado',comComplemento(signed,'CONTEUDO ADULTERADO SINTETICO').xmlBase64,{},['ASSINATURA_INVALIDA']],
   ['schema inválido',Buffer.from(original.xml.replace('<NCM>22021000</NCM>','<NCM>INVALIDO</NCM>')).toString('base64'),{},['XML_SCHEMA_INVALIDO']],
   ['DV incorreto na chave',Buffer.from(original.xml.replaceAll(signed.chave,signed.chave.slice(0,-1)+(signed.chave.endsWith('0')?'1':'0'))).toString('base64'),{},['IDENTIDADE_DIVERGENTE']],
   ['ambiente diferente da configuração',signed.xmlBase64,{config:{...config,ambiente:1}},['IDENTIDADE_DIVERGENTE']],
   ['modelo diferente da configuração',signed.xmlBase64,{config:{...config,modelo:65}},['IDENTIDADE_DIVERGENTE']]
  ])await recovery.test(description+' falha antes de qualquer consulta',async()=>{
   mockConsulta();rejected(await recover(xmlBase64,extra),codes);assert.equal(bodies.length,0);
  });
  for(const field of['chave','recibo','protocolo'])await recovery.test('contrato recusa parâmetro extra '+field,async()=>{
   mockConsulta();rejected(await recover(signed.xmlBase64,{[field]:field==='chave'?signed.chave:'123456789012345'}),['REQUISICAO_INVALIDA']);assert.equal(bodies.length,0);
  });
  for(const cStat of[150,217,101,110])await recovery.test('consulta '+cStat+' não fornece processo autorizado',async()=>{
   mockConsulta({cStat,incluirProtocolo:cStat===150});
   const output=await recover();rejected(output,['RECUPERACAO_NAO_COMPROVADA']);
   assert.equal(output.result.estado,'CONSULTADO');assert.equal(output.result.cStat,cStat);assert.equal(bodies.length,1);
  });
  for(const[description,options,codes]of[
   ['protocolo ausente',{incluirProtocolo:false},['RECUPERACAO_NAO_COMPROVADA']],
   ['digVal ausente',{digest:undefined},['RECUPERACAO_NAO_COMPROVADA']],
   ['digVal vazio',{digest:''},['RECUPERACAO_NAO_COMPROVADA','XML_SCHEMA_INVALIDO']],
   ['digVal divergente',{digest:Buffer.alloc(Buffer.from(original.digest,'base64').length,1).toString('base64')},['IDENTIDADE_DIVERGENTE']],
   ['digVal com diferença somente de caixa',{digest:original.digest.replace(/[A-Za-z]/,c=>c===c.toLowerCase()?c.toUpperCase():c.toLowerCase())},['IDENTIDADE_DIVERGENTE']],
   ['chave externa de outro documento',{chaveRetorno:documento(65).chave},['IDENTIDADE_DIVERGENTE']],
   ['chave de outro documento',{chaveProtocolo:documento(65).chave},['IDENTIDADE_DIVERGENTE']],
   ['ambiente do retorno divergente',{ambiente:1},['IDENTIDADE_DIVERGENTE']],
   ['ambiente do protocolo divergente',{ambienteProtocolo:1},['IDENTIDADE_DIVERGENTE']],
   ['UF divergente',{cUF:35},['IDENTIDADE_DIVERGENTE']],
   ['status interno diferente de 100',{statusProtocolo:150},['IDENTIDADE_DIVERGENTE']],
   ['nProt ausente',{protocolo:null},['RECUPERACAO_NAO_COMPROVADA','XML_SCHEMA_INVALIDO']],
   ['nProt não numérico',{protocolo:'ABCDEFGHIJKLMNO'},['XML_SCHEMA_INVALIDO','RETORNO_INVALIDO']],
   ['nProt curto',{protocolo:'12345678901234'},['XML_SCHEMA_INVALIDO','RETORNO_INVALIDO','RECUPERACAO_NAO_COMPROVADA']],
   ['nProt longo',{protocolo:'1234567890123456'},['XML_SCHEMA_INVALIDO','RETORNO_INVALIDO','RECUPERACAO_NAO_COMPROVADA']],
   ['namespace incorreto',{namespace:'urn:acbr-node:synthetic-invalid'},['XML_SCHEMA_INVALIDO','RETORNO_INVALIDO']]
  ])await recovery.test(description+' nunca produz nfeProc',async()=>{
   mockConsulta(options);rejected(await recover(),codes);assert.equal(bodies.length,1);
  });
  await recovery.test('mesma chave e assinatura nova não podem reutilizar digest do documento anterior',async()=>{
   const other=(await run({...base,comando:'assinar',...comComplemento(unsigned,'OUTRO CONTEUDO SINTETICO COM A MESMA CHAVE')},env)).result;
   assert.equal(other.estado,'ASSINADO',other.codigo);assert.equal(other.chave,signed.chave);
   assert.notEqual(partesAssinadas(other.xmlBase64).digest,original.digest);
   mockConsulta();rejected(await recover(other.xmlBase64),['IDENTIDADE_DIVERGENTE']);assert.equal(bodies.length,1);
  });
  for(const variant of['malformed','duplicate'])await recovery.test('resposta '+variant+' nunca produz nfeProc',async()=>{
   bodies=[];
   const response=variant==='malformed'?'<retConsSitNFe>':respostaConsulta({chave:signed.chave,digest:original.digest})
    .replace('</retConsSitNFe>',prot(signed.chave,100,original.digest)+'</retConsSitNFe>');
   handler=(_req,res)=>respond(res,response,'NFeConsultaProtocolo4');
   rejected(await recover(),['RETORNO_INVALIDO','XML_SCHEMA_INVALIDO','OPERACAO_FISCAL_FALHOU']);assert.equal(bodies.length,1);
  });
 });
 await t.test('consulta por recibo 105 continua pendente',async()=>{handler=(_req,res)=>respond(res,`<retConsReciNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><nRec>123456789012345</nRec><cStat>105</cStat><xMotivo>LOTE EM PROCESSAMENTO SINTETICO</xMotivo><cUF>23</cUF></retConsReciNFe>`,'NFeRetAutorizacao4');const{result}=await run({...base,comando:'consultar',chave:signed.chave,recibo:'123456789012345'},env);assert.equal(result.estado,'PENDENTE',result.codigo);assert.equal(result.cStat,105);});
 for(const cmd of['cancelar','cartaCorrecao'])await t.test('evento '+cmd+' retorna protocolo correlacionado',async()=>{const code=cmd==='cancelar'?110111:110110;handler=(_req,res)=>respond(res,`<retEnvEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><idLote>1</idLote><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><cOrgao>23</cOrgao><cStat>128</cStat><xMotivo>LOTE SINTETICO PROCESSADO</xMotivo><retEvento versao="1.00"><infEvento><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><cOrgao>23</cOrgao><cStat>135</cStat><xMotivo>EVENTO SINTETICO REGISTRADO</xMotivo><chNFe>${signed.chave}</chNFe><tpEvento>${code}</tpEvento><xEvento>SYNTHETIC</xEvento><nSeqEvento>1</nSeqEvento><dhRegEvento>${date()}</dhRegEvento><nProt>123456789012345</nProt></infEvento></retEvento></retEnvEvento>`,'NFeRecepcaoEvento4');const{result}=await run({...base,comando:cmd,chave:signed.chave,protocolo:'123456789012345',justificativa:'JUSTIFICATIVA SINTETICA OFFLINE',correcao:'CORRECAO SINTETICA OFFLINE PARA TESTE',sequenciaEvento:1},env);assert.equal(result.estado,cmd==='cancelar'?'CANCELADO':'EVENTO_REGISTRADO',result.codigo);assert.equal(result.protocolo,'123456789012345');});
 await t.test('inutilização registra faixa sem executar produção',async()=>{handler=(_req,res)=>respond(res,`<retInutNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><infInut><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><cStat>102</cStat><xMotivo>FAIXA SINTETICA INUTILIZADA</xMotivo><cUF>23</cUF><ano>${new Date().getFullYear()%100}</ano><CNPJ>${CNPJ}</CNPJ><mod>55</mod><serie>1</serie><nNFIni>10</nNFIni><nNFFin>11</nNFFin><dhRecbto>${date()}</dhRecbto><nProt>123456789012345</nProt></infInut></retInutNFe>`,'NFeInutilizacao4');const{result}=await run({...base,comando:'inutilizar',inutilizacao:{ano:new Date().getFullYear()%100,serie:1,numeroInicial:10,numeroFinal:11},justificativa:'JUSTIFICATIVA SINTETICA OFFLINE'},env);assert.equal(result.estado,'INUTILIZADO',result.codigo);assert.equal(result.cStat,102);});
 for(const alteration of['tipo','ambiente','sequencia'])await t.test('evento divergente em '+alteration+' fica indeterminado',async()=>{
  const type=alteration==='tipo'?110110:110111,amb=alteration==='ambiente'?1:2,seq=alteration==='sequencia'?2:1;
  handler=(_req,res)=>respond(res,`<retEnvEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><idLote>1</idLote><tpAmb>2</tpAmb><verAplic>SYNTHETIC</verAplic><cOrgao>23</cOrgao><cStat>128</cStat><xMotivo>LOTE SINTETICO PROCESSADO</xMotivo><retEvento versao="1.00"><infEvento><tpAmb>${amb}</tpAmb><verAplic>SYNTHETIC</verAplic><cOrgao>23</cOrgao><cStat>135</cStat><xMotivo>EVENTO SINTETICO REGISTRADO</xMotivo><chNFe>${signed.chave}</chNFe><tpEvento>${type}</tpEvento><xEvento>SYNTHETIC</xEvento><nSeqEvento>${seq}</nSeqEvento><dhRegEvento>${date()}</dhRegEvento><nProt>123456789012345</nProt></infEvento></retEvento></retEnvEvento>`,'NFeRecepcaoEvento4');
  const{result}=await run({...base,comando:'cancelar',chave:signed.chave,protocolo:'123456789012345',justificativa:'JUSTIFICATIVA SINTETICA OFFLINE'},env);assert.equal(result.estado,'INDETERMINADO');assert.equal(result.protocolo,undefined);assert.equal(result.cStat,undefined);
 });
 for(const field of['CNPJ','mod','serie','ano','nNFIni','nNFFin','tpAmb','cUF'])await t.test('inutilizacao divergente em '+field+' fica indeterminada',async()=>{
  const values={tpAmb:2,cUF:23,ano:new Date().getFullYear()%100,CNPJ,mod:55,serie:1,nNFIni:10,nNFFin:11};values[field]=field==='CNPJ'?'12345678000195':Number(values[field])+1;
  const tags=Object.entries(values).map(([k,v])=>`<${k}>${v}</${k}>`).join('');
  handler=(_req,res)=>respond(res,`<retInutNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><infInut>${tags}<verAplic>SYNTHETIC</verAplic><cStat>102</cStat><xMotivo>FAIXA SINTETICA INUTILIZADA</xMotivo><dhRecbto>${date()}</dhRecbto><nProt>123456789012345</nProt></infInut></retInutNFe>`,'NFeInutilizacao4');
  const{result}=await run({...base,comando:'inutilizar',inutilizacao:{ano:new Date().getFullYear()%100,serie:1,numeroInicial:10,numeroFinal:11},justificativa:'JUSTIFICATIVA SINTETICA OFFLINE'},env);assert.equal(result.estado,'INDETERMINADO');assert.equal(result.protocolo,undefined);assert.equal(result.cStat,undefined);
 });
 await t.test('variante de teste recusa INI com qualquer URL externa',async()=>{const invalid=path.join(tmp,'unsafe.ini');await writeFile(invalid,'[NFe_CE_H]\nNfeAutorizacao_4.00=https://invalid.example/no-network\n');const{result}=await run({...base,comando:'consultar',chave:signed.chave},{...env,ACBR_NODE_TEST_SERVICES:invalid});assert.equal(result.codigo,'TEST_CONFIG_INVALIDA');assert.equal(result.envioIniciado,false);});
});
