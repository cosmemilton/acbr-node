import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect} from 'node:util';
import {diagnosticarErro,diagnosticarResultado,ErroAcbrNode,type Comando,type ResultadoFiscal} from '../src/runtime.js';

const contract={sourceRevision:48590,contractHash:'a'.repeat(64)};
const privateValue='FICTITIOUS_PRIVATE_XML_PASSWORD_PATH';
const fiscal=(patch:Partial<ResultadoFiscal>={}):ResultadoFiscal=>({versao:1,id:'fictitious',...contract,sucesso:true,estado:'XML_RECUPERADO',cStat:100,chave:'1'.repeat(44),protocolo:'2'.repeat(15),envioIniciado:false,xmlBase64:Buffer.from('<nfeProc>FICTITIOUS_ONLY</nfeProc>').toString('base64'),...patch});

test('recovery diagnosis names a successful consultation without claiming this operation transmitted a note',()=>{
  const diagnostic=diagnosticarResultado(fiscal(),'recuperarXml');
  assert.equal(diagnostic.codigo,'XML_RECUPERADO');assert.equal(diagnostic.etapa,'consulta');assert.equal(diagnostic.statusEnvio,'autorizado');assert.equal(diagnostic.cStat,100);
  assert.match(diagnostic.mensagem,/recuperado por consulta.*não transmitiu/);assert.match(diagnostic.acao,/Guarde o XML recuperado/);assert.ok(Object.isFrozen(diagnostic));
});

test('a recovered state cannot prove another operation and consultar keeps its previous100/150 behavior',()=>{
  const commands:Comando[]=['gerarXml','validar','assinar','transmitir','consultar','cancelar','cartaCorrecao','inutilizar'];
  for(const command of commands)assert.notEqual(diagnosticarResultado(fiscal(),command).statusEnvio,'autorizado');
  for(const cStat of [100,150])assert.equal(diagnosticarResultado(fiscal({estado:'AUTORIZADO',cStat}),'consultar').statusEnvio,'autorizado');
  assert.equal(diagnosticarResultado(fiscal({estado:'AUTORIZADO'}),'recuperarXml').statusEnvio,'resultado_incerto');
});

test('missing proof,150,217,malformed base64 and sending evidence never claim a recovered XML',()=>{
  for(const patch of [{cStat:150},{cStat:217},{chave:undefined},{protocolo:undefined},{xmlBase64:undefined},{xmlBase64:''},{xmlBase64:'%%%INVALID'},{sucesso:false},{envioIniciado:true}]){
    const diagnostic=diagnosticarResultado(fiscal(patch),'recuperarXml');assert.notEqual(diagnostic.codigo,'XML_RECUPERADO');assert.notEqual(diagnostic.statusEnvio,'autorizado');assert.equal(diagnostic.etapa,'consulta');
  }
});

test('unproved native responses keep their real cStat and safe no-transmission guidance without becoming success',()=>{
  for(const estado of ['CONSULTADO','ERRO'] as const)for(const cStat of [100,150,217,999]){
    const diagnostic=diagnosticarResultado(fiscal({estado,sucesso:false,codigo:'RECUPERACAO_NAO_COMPROVADA',cStat,chave:undefined,protocolo:undefined,xmlBase64:undefined,xMotivo:privateValue}),'recuperarXml');
    assert.equal(diagnostic.codigo,'RECUPERACAO_NAO_COMPROVADA');assert.equal(diagnostic.cStat,cStat);assert.equal(diagnostic.etapa,'consulta');assert.equal(diagnostic.statusEnvio,'nao_enviado');assert.match(diagnostic.acao,/Preserve o XML assinado original/);assert.match(diagnostic.acao,/Não transmita/);assert.equal(JSON.stringify(diagnostic).includes(privateValue),false);
  }
  assert.equal(diagnosticarResultado(fiscal({estado:'CONSULTADO',sucesso:false,codigo:'RECUPERACAO_NAO_COMPROVADA',envioIniciado:true}),'recuperarXml').statusEnvio,'resultado_incerto');
});

test('capability and native recovery errors use safe catalog text and omit original XML or error details',()=>{
  for(const codigo of ['RUNTIME_SEM_CAPACIDADE','RECUPERACAO_NAO_COMPROVADA']){
    const error=new ErroAcbrNode(codigo,privateValue,false,Buffer.from(privateValue).toString('base64'));
    const diagnostic=diagnosticarErro(error);assert.equal(diagnostic.codigo,codigo);assert.equal(diagnostic.statusEnvio,'nao_enviado');
    for(const view of [JSON.stringify(error),JSON.stringify(diagnostic),inspect(error)])assert.ok(!view.includes(Buffer.from(privateValue).toString('base64')));
    assert.equal(JSON.stringify(diagnostic).includes(privateValue),false);
  }
  const capability=diagnosticarErro(new ErroAcbrNode('RUNTIME_SEM_CAPACIDADE','FICTITIOUS'));
  assert.equal(capability.etapa,'runtime');assert.match(capability.acao,/Atualize o pacote principal e o runtime/);
});

test('recovered envelope diagnosis accepts over2MiB through exactly4MiB and rejects even one decoded byte above4MiB',()=>{
  const max=4*1024*1024,open='<nfeProc>',close='</nfeProc>';
  const payload=(size:number)=>Buffer.from(open+'x'.repeat(size-open.length-close.length)+close).toString('base64');
  for(const size of [2*1024*1024+1,max-1,max]){
    const xmlBase64=payload(size);assert.equal(Buffer.from(xmlBase64,'base64').length,size);
    const diagnostic=diagnosticarResultado(fiscal({xmlBase64}),'recuperarXml');
    assert.equal(diagnostic.codigo,'XML_RECUPERADO');assert.equal(diagnostic.statusEnvio,'autorizado');
  }
  for(const size of [max+1,max+2,max+3]){
    const xmlBase64=payload(size);
    if(size<=max+2)assert.equal(xmlBase64.length,payload(max).length,'base64 length alone cannot enforce this boundary');
    const diagnostic=diagnosticarResultado(fiscal({xmlBase64}),'recuperarXml');
    assert.notEqual(diagnostic.codigo,'XML_RECUPERADO');assert.equal(diagnostic.statusEnvio,'resultado_incerto');
  }
});
