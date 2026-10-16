// Every key, certificate and document is synthetic. No fixture may be transmitted.
import forge from 'node-forge';
import {mkdir,readdir,writeFile}from'node:fs/promises';
import {spawn,execFile}from'node:child_process';
import {promisify}from'node:util';
import path from'node:path';
export const CNPJ='11222333000181';
export const PASSWORD=' acbr-node-synthetic-offline ';
let keyPair;
export function certificado({cnpj=CNPJ,expirado=false,futuro=false,algorithm='aes256'}={}){
 keyPair??=forge.pki.rsa.generateKeyPair({bits:2048,e:0x10001});
 const cert=forge.pki.createCertificate();cert.publicKey=keyPair.publicKey;cert.serialNumber='01';
 cert.validity.notBefore=new Date(Date.now()+(futuro?86400000:-2*86400000));
 cert.validity.notAfter=new Date(Date.now()+(expirado?-86400000:365*86400000));
 const attrs=[{name:'commonName',value:'ACBR NODE SYNTHETIC:'+cnpj},{name:'countryName',value:'BR'},{name:'organizationName',value:'SYNTHETIC OFFLINE TEST'}];
 cert.setSubject(attrs);cert.setIssuer(attrs);const a=forge.asn1;
 const san=a.create(a.Class.UNIVERSAL,a.Type.SEQUENCE,true,[a.create(a.Class.CONTEXT_SPECIFIC,0,true,[a.create(a.Class.UNIVERSAL,a.Type.OID,false,a.oidToDer('2.16.76.1.3.3').getBytes()),a.create(a.Class.CONTEXT_SPECIFIC,0,true,[a.create(a.Class.UNIVERSAL,a.Type.UTF8,false,cnpj)])])]);
 cert.setExtensions([{name:'basicConstraints',cA:false},{name:'keyUsage',digitalSignature:true,nonRepudiation:true,keyEncipherment:true},{name:'extKeyUsage',clientAuth:true},{id:'2.5.29.17',value:a.toDer(san).getBytes()}]);
 cert.sign(keyPair.privateKey,forge.md.sha256.create());
 const pfx=forge.pkcs12.toPkcs12Asn1(keyPair.privateKey,[cert],PASSWORD,{algorithm,friendlyName:'acbr-node synthetic offline',generateLocalKeyId:true});
 return{pfxBase64:Buffer.from(a.toDer(pfx).getBytes(),'binary').toString('base64'),senha:PASSWORD};
}
export function documento(modelo=55){
 const day=new Date().toISOString().slice(0,10);const prefix='23'+day.slice(2,4)+day.slice(5,7)+CNPJ+modelo+'001000000001112345678';let sum=0,weight=2;
 for(let i=prefix.length-1;i>=0;i--){sum+=Number(prefix[i])*weight;weight=weight===9?2:weight+1;}const rem=sum%11,dv=rem<2?0:11-rem,chave=prefix+dv;
 const xml=`<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe${chave}" versao="4.00"><ide><cUF>23</cUF><cNF>12345678</cNF><natOp>VENDA TESTE OFFLINE</natOp><mod>${modelo}</mod><serie>1</serie><nNF>1</nNF><dhEmi>${day}T12:00:00-03:00</dhEmi><tpNF>1</tpNF><idDest>1</idDest><cMunFG>2304400</cMunFG><tpImp>${modelo===65?4:1}</tpImp><tpEmis>1</tpEmis><cDV>${dv}</cDV><tpAmb>2</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>ACBR-NODE-OFFLINE</verProc></ide>
<emit><CNPJ>${CNPJ}</CNPJ><xNome>Café São José TESTE SINTÉTICO SEM VALOR FISCAL</xNome><enderEmit><xLgr>RUA DE TESTE</xLgr><nro>1</nro><xBairro>TESTE</xBairro><cMun>2304400</cMun><xMun>FORTALEZA</xMun><UF>CE</UF><CEP>60000000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit><IE>123456789</IE><CRT>1</CRT></emit>
<dest><CPF>12345678909</CPF><xNome>NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL</xNome><enderDest><xLgr>RUA TESTE</xLgr><nro>2</nro><xBairro>TESTE</xBairro><cMun>2304400</cMun><xMun>FORTALEZA</xMun><UF>CE</UF><CEP>60000000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderDest><indIEDest>9</indIEDest></dest>
<det nItem="1"><prod><cProd>TESTE</cProd><cEAN>SEM GTIN</cEAN><xProd>Café São José PRODUTO SINTÉTICO OFFLINE</xProd><NCM>22021000</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>1.0000</qCom><vUnCom>10.0000000000</vUnCom><vProd>10.00</vProd><cEANTrib>SEM GTIN</cEANTrib><uTrib>UN</uTrib><qTrib>1.0000</qTrib><vUnTrib>10.0000000000</vUnTrib><indTot>1</indTot></prod><imposto><ICMS><ICMSSN102><orig>0</orig><CSOSN>102</CSOSN></ICMSSN102></ICMS><PIS><PISNT><CST>07</CST></PISNT></PIS><COFINS><COFINSNT><CST>07</CST></COFINSNT></COFINS></imposto></det>
<total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet><vProd>10.00</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro><vNF>10.00</vNF></ICMSTot></total><transp><modFrete>9</modFrete></transp><pag><detPag><indPag>0</indPag><tPag>01</tPag><vPag>10.00</vPag></detPag></pag><infAdic><infCpl>TESTE SINTETICO OFFLINE. NAO TRANSMITIR.</infCpl></infAdic></infNFe></NFe>`;
 return{xmlBase64:Buffer.from(xml).toString('base64'),chave};
}
export function tlsCertificates({expired=false,future=false,clientOnly=false}={}){
 const rootKeys=forge.pki.rsa.generateKeyPair({bits:2048,e:0x10001}),leafKeys=forge.pki.rsa.generateKeyPair({bits:2048,e:0x10001});
 const root=forge.pki.createCertificate();root.publicKey=rootKeys.publicKey;root.serialNumber='10';root.validity.notBefore=new Date(Date.now()-86400000);root.validity.notAfter=new Date(Date.now()+365*86400000);
 const attrs=[{name:'commonName',value:'ACBR NODE SYNTHETIC TLS CA'}];root.setSubject(attrs);root.setIssuer(attrs);root.setExtensions([{name:'basicConstraints',cA:true},{name:'keyUsage',keyCertSign:true,cRLSign:true}]);root.sign(rootKeys.privateKey,forge.md.sha256.create());
 const leaf=forge.pki.createCertificate();leaf.publicKey=leafKeys.publicKey;leaf.serialNumber='11';leaf.validity.notBefore=new Date(Date.now()+(future?86400000:-3600000));leaf.validity.notAfter=new Date(Date.now()+(expired?-1800000:86400000));leaf.setSubject([{name:'commonName',value:'localhost'}]);leaf.setIssuer(attrs);leaf.setExtensions([{name:'basicConstraints',cA:false},{name:'keyUsage',digitalSignature:true,keyEncipherment:true},{name:'extKeyUsage',serverAuth:!clientOnly,clientAuth:clientOnly},{name:'subjectAltName',altNames:[{type:2,value:'localhost'}]}]);leaf.sign(rootKeys.privateKey,forge.md.sha256.create());
 return{ca:forge.pki.certificateToPem(root),cert:forge.pki.certificateToPem(leaf),key:forge.pki.privateKeyToPem(leafKeys.privateKey)};
}

export function objetoDocumento(modelo=55){
 const day=new Date().toISOString().slice(0,10);
 return{
  infNFe:{Versao:'4.00'},
  Ide:{cUF:23,cNF:12345678,natOp:'VENDA TESTE OFFLINE',modelo,serie:1,nNF:1,dEmi:day+'T12:00:00',tpNF:'tnSaida',idDest:'doInterna',cMunFG:2304400,tpImp:modelo===65?'tiNFCe':'tiRetrato',tpEmis:'teNormal',tpAmb:'taHomologacao',finNFe:'fnNormal',indFinal:'cfConsumidorFinal',indPres:'pcPresencial',procEmi:'peAplicativoContribuinte',verProc:'ACBR-NODE-OFFLINE'},
  Emit:{CNPJCPF:CNPJ,xNome:'Café São José TESTE SINTÉTICO SEM VALOR FISCAL',IE:'123456789',CRT:'crtSimplesNacional',EnderEmit:{xLgr:'RUA TESTE',nro:'1',xBairro:'TESTE',cMun:2304400,xMun:'FORTALEZA',UF:'CE',CEP:60000000,cPais:1058,xPais:'BRASIL'}},
  Dest:{CNPJCPF:'12345678909',xNome:'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',indIEDest:'inNaoContribuinte',EnderDest:{xLgr:'RUA TESTE',nro:'2',xBairro:'TESTE',cMun:2304400,xMun:'FORTALEZA',UF:'CE',CEP:60000000,cPais:1058,xPais:'BRASIL'}},
  Det:[{Prod:{nItem:1,cProd:'TESTE',cEAN:'SEM GTIN',xProd:'Café São José PRODUTO SINTÉTICO OFFLINE',NCM:'22021000',CFOP:'5102',uCom:'UN',qCom:'1',vUnCom:'10',vProd:'10',cEANTrib:'SEM GTIN',uTrib:'UN',qTrib:'1',vUnTrib:'10',IndTot:'itSomaTotalNFe'},Imposto:{ICMS:{orig:'oeNacional',CSOSN:'csosn102'},PIS:{CST:'pis07'},COFINS:{CST:'cof07'}}}],
  Total:{ICMSTot:{vProd:'10',vNF:'10'}},Transp:{modFrete:'mfSemFrete'},pag:[{tPag:'fpDinheiro',indPag:'ipVista',vPag:'10'}]
 };
}

// Recovery fixtures remain synthetic and are served only by the localhost SOAP mock.
export function partesAssinadas(xmlBase64){
 const xml=Buffer.from(xmlBase64,'base64').toString('utf8');
 const nfe=xml.match(/<(?:[A-Za-z_][\w.-]*:)?NFe\b[\s\S]*?<\/(?:[A-Za-z_][\w.-]*:)?NFe>/)?.[0];
 const assinatura=xml.match(/<(?:[A-Za-z_][\w.-]*:)?Signature(?:\s|>)[\s\S]*?<\/(?:[A-Za-z_][\w.-]*:)?Signature>/)?.[0];
 const digest=xml.match(/<(?:[A-Za-z_][\w.-]*:)?DigestValue>([^<]+)<\/(?:[A-Za-z_][\w.-]*:)?DigestValue>/)?.[1];
 if(!nfe||!assinatura||!digest)throw new Error('Synthetic signed fixture is incomplete');
 return{xml,nfe,assinatura,digest};
}

export function comAspasSimples(xmlBase64){
 const xml=Buffer.from(xmlBase64,'base64').toString('utf8');
 // Delimiters do not change the XML infoset or canonical signature input.
 return Buffer.from(xml.replace(/="([^"]*)"/g,(attribute,value)=>value.includes("'")?attribute:"='"+value+"'")).toString('base64');
}

export function comComplemento(fixture,texto){
 const xml=Buffer.from(fixture.xmlBase64,'base64').toString('utf8');
 if(!/<infCpl>[\s\S]*?<\/infCpl>/.test(xml))throw new Error('Synthetic infCpl fixture is absent');
 const escaped=texto.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 return{chave:fixture.chave,xmlBase64:Buffer.from(xml.replace(/<infCpl>[\s\S]*?<\/infCpl>/,()=>'<infCpl>'+escaped+'</infCpl>')).toString('base64')};
}

export function comPrefixo(fixture,prefixo='n'){
 if(!/^[A-Za-z_][\w.-]*$/.test(prefixo))throw new Error('Invalid synthetic namespace prefix');
 // The low-level ACBr signer removes line breaks after signing. Compact only
 // this unsigned fixture beforehand, so no signed content is ever changed.
 const xml=Buffer.from(fixture.xmlBase64,'base64').toString('utf8')
  .replace(/>\r?\n[ \t]*(?=<)/g,'>');
 if(/<(?:[A-Za-z_][\w.-]*:)?Signature(?:\s|>)/.test(xml))throw new Error('Prefix fixture must be unsigned');
 const namespace='http://www.portalfiscal.inf.br/nfe';
 if(!xml.includes('xmlns="'+namespace+'"'))throw new Error('Synthetic default namespace absent');
 const prefixed=xml.replace('xmlns="'+namespace+'"','xmlns:'+prefixo+'="'+namespace+'"')
  .replace(/<(\/?)([A-Za-z_][\w.-]*)(?=[\s/>])/g,(_tag,close,name)=>'<'+close+prefixo+':'+name);
 return{chave:fixture.chave,xmlBase64:Buffer.from(prefixed).toString('base64')};
}

// Same free-toolchain approach as the TLS probe. The harness signs only inputs
// created by these tests; synthetic PFX/password always travel through stdin.
export async function criarAssinadorSintetico({root,runtime}){
 const source=path.join(process.env.ACBR_NODE_SOURCE_DIR??path.join(root,'.acbr','source'),'Fontes');
 const directories=async folder=>{
  const result=[folder];
  for(const entry of(await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name)))
   if(entry.isDirectory())result.push(...await directories(path.join(folder,entry.name)));
  return result;
 };
 const fonts=await directories(source),target=process.platform==='win32'?'x86_64-win64':'x86_64-linux';
 const out=path.join(root,'.acbr','recovery-sign-test',process.platform+'-'+process.arch);await mkdir(out,{recursive:true});
 const lazarus=process.env.ACBR_NODE_LAZARUS_ROOT??process.env.LAZARUS_ROOT??(process.platform==='linux'?'/usr/lib/lazarus/3.0':'');
 const includes=[path.join(root,'native'),...fonts];
 if(lazarus)includes.push(path.join(lazarus,'components','lazutils','lib',target),path.join(lazarus,'lcl','units',target),
  path.join(lazarus,'lcl','units',target,'nogui'),path.join(lazarus,'packager','units',target));
 const executable=path.join(out,process.platform==='win32'?'native-recovery-sign.exe':'native-recovery-sign');
 const flags=['-vew','-Mdelphi','-Scghi','-O1','-g-','-dNOGUI','-dNOREPORT',...includes.map(p=>'-Fu'+p),
  ...fonts.map(p=>'-Fi'+p),'-FU'+out,'-FE'+out,'-o'+executable];
 if(flags.some(flag=>/["\r\n]/.test(flag)))throw new Error('Invalid recovery fixture compiler path');
 const responseFile=path.join(out,'compiler.rsp');await writeFile(responseFile,flags.join('\n')+'\n');
 await promisify(execFile)(process.env.ACBR_NODE_FPC??'fpc',['@'+responseFile,path.join(root,'test','native-recovery-sign.lpr')],
  {cwd:root,timeout:120000,maxBuffer:4*1024*1024,windowsHide:true});
 const env={...process.env,OPENSSL_CONF:path.join(runtime,'openssl.cnf'),OPENSSL_MODULES:path.join(runtime,'ossl-modules')};
 if(process.platform==='linux')env.LD_LIBRARY_PATH=path.join(runtime,'lib');
 else env.PATH=path.join(runtime,'lib')+path.delimiter+(process.env.PATH??'');
 return input=>new Promise((resolve,reject)=>{
  const child=spawn(executable,[],{cwd:runtime,env,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
  const chunks=[];let size=0;
  const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Synthetic signer timeout'));},15000);
  child.on('error',error=>{clearTimeout(timer);reject(error);});
  child.stdout.on('data',chunk=>{size+=chunk.length;if(size>8*1024*1024){child.kill('SIGKILL');reject(new Error('Synthetic signer output limit'));return;}chunks.push(chunk);});
  child.stderr.on('data',()=>{});
  child.on('close',code=>{clearTimeout(timer);if(code!==0){reject(new Error('Synthetic signer exit '+code));return;}
   try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch(error){reject(error);}});
  child.stdin.on('error',error=>{if(error.code!=='EPIPE'){clearTimeout(timer);reject(error);}});
  child.stdin.end(JSON.stringify(input)+'\n');
 });
}

export function respostaConsulta({chave,digest,cStat=100,ambiente=2,cUF=23,incluirProtocolo=true,
 protocolo='123456789012345',chaveRetorno=chave,chaveProtocolo=chave,ambienteProtocolo=ambiente,
 statusProtocolo=cStat,prefixo='',namespace='http://www.portalfiscal.inf.br/nfe'}={}){
 const name=tag=>prefixo?prefixo+':'+tag:tag;
 const tag=(key,value)=>'<'+name(key)+'>'+value+'</'+name(key)+'>';
 const received=new Date().toISOString().replace(/\.\d{3}Z$/,'-00:00');
 const protocol=incluirProtocolo?'<'+name('protNFe')+' versao="4.00"><'+name('infProt')+'>'
  +tag('tpAmb',ambienteProtocolo)+tag('verAplic','SYNTHETIC')+tag('chNFe',chaveProtocolo)
  +tag('dhRecbto',received)+(protocolo===null?'':tag('nProt',protocolo))
  +(digest===undefined?'':tag('digVal',digest))+tag('cStat',statusProtocolo)
  +tag('xMotivo',"RESPOSTA D'EXEMPLO SINTETICO")+'</'+name('infProt')+'></'+name('protNFe')+'>':'';
 return'<'+name('retConsSitNFe')+' xmlns'+(prefixo?':'+prefixo:'')+'="'+namespace+'" versao="4.00">'
  +tag('tpAmb',ambiente)+tag('verAplic','SYNTHETIC')+tag('cStat',cStat)
  +tag('xMotivo','RESPOSTA SINTETICA LOCAL')+tag('cUF',cUF)+tag('dhRecbto',received)
  +tag('chNFe',chaveRetorno)+protocol+'</'+name('retConsSitNFe')+'>';
}
