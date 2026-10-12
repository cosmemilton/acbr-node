import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect} from 'node:util';
import {ErroAcbrNode,diagnosticarErro,diagnosticarResultado,criarEmissor} from '../src/runtime.ts';
import {TNFe,ErroValidacaoModelo,diagnosticarErro as diagnosticarErroCliente} from '../src/index.ts';

const contract={sourceRevision:48590,contractHash:'a'.repeat(64)};
const config={cnpj:'12345678000195',uf:'PE',modelo:55,ambiente:2,contrato:contract};
const result=(estado,extra={})=>({versao:1,id:'synthetic',...contract,sucesso:true,estado,...extra});
const secret='SYNTHETIC_PRIVATE_VALUE';

test('fiscal diagnosis keeps confirmed, rejected, local and uncertain outcomes distinct',()=>{
 for(const [estado,comando] of [['XML_GERADO','gerarXml'],['VALIDADO','validar'],['ASSINADO','assinar']])assert.equal(diagnosticarResultado(result(estado),comando).statusEnvio,'nao_enviado');
 const evidence={chave:'1'.repeat(44),protocolo:'1'.repeat(15),envioIniciado:true};
 for(const cStat of [100,150])assert.equal(diagnosticarResultado(result('AUTORIZADO',{cStat,...evidence}),'transmitir').statusEnvio,'autorizado');
 for(const [estado,comando,cStat] of [['CANCELADO','cancelar',135],['EVENTO_REGISTRADO','cartaCorrecao',135],['INUTILIZADO','inutilizar',102]])assert.equal(diagnosticarResultado(result(estado,{cStat,...evidence}),comando).statusEnvio,'autorizado');
 for(const [estado,cStat] of [['REJEITADO',999],['DENEGADO',110]])assert.equal(diagnosticarResultado(result(estado,{sucesso:false,cStat}),'transmitir').statusEnvio,'rejeitado');
 assert.match(diagnosticarResultado(result('DENEGADO',{sucesso:false,cStat:110}),'transmitir').acao,/numeração/);
 for(const cStat of [103,104,105,108,109,204,539,573])assert.equal(diagnosticarResultado(result('PENDENTE',{cStat}),'transmitir').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('CONSULTADO',{cStat:217}),'consultar').statusEnvio,'resultado_incerto');
 for(const extra of [{},{envioIniciado:true},{envioIniciado:'false'}])assert.equal(diagnosticarResultado(result('ERRO',{sucesso:false,...extra}),'transmitir').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('ERRO',{sucesso:false,envioIniciado:false}),'transmitir').statusEnvio,'nao_enviado');
 assert.equal(diagnosticarResultado(result('AUTORIZADO',{sucesso:false,cStat:100}),'transmitir').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('AUTORIZADO',{cStat:217}),'transmitir').statusEnvio,'resultado_incerto');
});

test('missing or contradictory evidence never claims authorization or no transmission',()=>{
 const evidence={cStat:100,chave:'1'.repeat(44),protocolo:'1'.repeat(15),envioIniciado:true};
 for(const missing of ['cStat','chave','protocolo']){const data={...evidence};delete data[missing];assert.equal(diagnosticarResultado(result('AUTORIZADO',data),'transmitir').statusEnvio,'resultado_incerto');}
 for(const extra of [{cStat:217},{protocolo:'1'},{chave:'1'},{envioIniciado:false},{sucesso:false}])assert.equal(diagnosticarResultado(result('AUTORIZADO',{...evidence,...extra}),'transmitir').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('AUTORIZADO',evidence),'gerarXml').statusEnvio,'resultado_incerto');
 for(const estado of ['XML_GERADO','VALIDADO','ASSINADO']){
  assert.equal(diagnosticarResultado(result(estado),'transmitir').statusEnvio,'resultado_incerto');
  assert.equal(diagnosticarResultado(result(estado),'consultar').statusEnvio,'resultado_incerto');
 }
 for(const envioIniciado of [true,'false'])assert.equal(diagnosticarResultado(result('XML_GERADO',{envioIniciado}),'gerarXml').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('CANCELADO',{cStat:135}),'cancelar').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('REJEITADO',{cStat:100}),'transmitir').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('REJEITADO',{cStat:999}),'validar').statusEnvio,'resultado_incerto');
 assert.equal(diagnosticarResultado(result('DENEGADO'),'transmitir').statusEnvio,'resultado_incerto');
 for(const [estado,cStat] of [['REJEITADO',999],['DENEGADO',110]]){
  assert.equal(diagnosticarResultado(result(estado,{sucesso:true,cStat,envioIniciado:true}),'transmitir').statusEnvio,'resultado_incerto');
  for(const comando of ['transmitir','cancelar','cartaCorrecao','inutilizar'])assert.equal(diagnosticarResultado(result(estado,{sucesso:false,cStat,envioIniciado:false}),comando).statusEnvio,'resultado_incerto');
  assert.equal(diagnosticarResultado(result(estado,{sucesso:false,cStat,envioIniciado:false}),'consultar').statusEnvio,'rejeitado');
 }
});

test('safe diagnostics omit XML, paths, arbitrary codes, raw motive and original cause',()=>{
 const error=new ErroAcbrNode('TIMEOUT_MOTOR','Prazo excedido.',true,Buffer.from(secret).toString('base64'),{etapa:'transmissao',campo:secret});
 assert.equal(error.resultadoDesconhecido,true);assert.equal(Buffer.from(error.xmlBase64,'base64').toString(),secret);
 assert.equal(diagnosticarErro(error).statusEnvio,'resultado_incerto');assert.equal(error.diagnostico.etapa,'transmissao');
 assert(!JSON.stringify(error).includes(secret));assert(!JSON.stringify(error).includes(error.xmlBase64));assert(!inspect(error).includes(error.xmlBase64));
 assert(!JSON.stringify(new ErroAcbrNode(secret,secret)).includes(secret));
 const raw=new Error(secret,{cause:{password:secret}});
 assert(!JSON.stringify(diagnosticarErro(raw)).includes(secret));assert.equal(diagnosticarErro(raw).statusEnvio,'resultado_incerto');
 const diagnostic=diagnosticarResultado(result('REJEITADO',{codigo:secret,xMotivo:secret,chave:secret,xmlBase64:secret,cStat:999}),'transmitir');
 assert.equal(diagnostic.cStat,999);assert(!JSON.stringify(diagnostic).includes(secret));assert(Object.isFrozen(diagnostic));
});

test('native signing failures retain only known safe codes and do not claim transmission',()=>{
 for(const codigo of ['CERTIFICADO_INVALIDO','CERTIFICADO_DIVERGENTE','DEPENDENCIA_AUSENTE','XML_SCHEMA_INVALIDO','OPERACAO_FISCAL_FALHOU']){
  const d=diagnosticarResultado(result('ERRO',{sucesso:false,envioIniciado:false,codigo,xMotivo:secret}),'assinar');
  assert.equal(d.codigo,codigo);assert.equal(d.etapa,'assinatura');assert.equal(d.statusEnvio,'nao_enviado');assert(d.acao.length>20);assert(!JSON.stringify(d).includes(secret));assert.equal(d.causa.codigo,codigo);
 }
 const unknown=diagnosticarResultado(result('ERRO',{sucesso:false,envioIniciado:false,codigo:secret,xMotivo:secret}),'assinar');
 assert.equal(unknown.codigo,'FALHA_ANTES_ENVIO');assert(!JSON.stringify(unknown).includes(secret));
 assert.equal(diagnosticarResultado(result('ERRO',{sucesso:false,envioIniciado:true,codigo:'CERTIFICADO_INVALIDO'}),'transmitir').statusEnvio,'resultado_incerto');
});

test('date validation is actionable through constructor and high-level diagnosis',()=>{
 assert.throws(()=>new TNFe({Ide:{dEmi:'2026-10-12T02:00:00Z'}}),e=>{
  assert(e instanceof TypeError);assert(e instanceof ErroValidacaoModelo);
  const d=diagnosticarErroCliente(e);assert.equal(d.codigo,'DATA_HORA_INVALIDA');assert.equal(d.campo,'TNFe.Ide.dEmi');
  assert.equal(d.etapa,'documento');assert.equal(d.statusEnvio,'nao_enviado');assert.match(d.acao,/sem Z ou offset/);return true;
 });
});

test('configuration rejects wrong JSON types before launching and identifies safe fields',()=>{
 for(const [campo,value] of [['cnpj',12345678000195],['uf',null],['modelo','55'],['ambiente','2'],['timeoutMs','1000'],['limiteFila','1'],['runtimeDirectory',123]]){
  assert.throws(()=>criarEmissor({...config,[campo]:value}),e=>e instanceof ErroAcbrNode&&e.codigo==='CONFIGURACAO_INVALIDA'&&e.diagnostico.campo===campo&&e.diagnostico.statusEnvio==='nao_enviado');
 }
 for(const value of [null,[],secret])assert.throws(()=>criarEmissor(value),e=>e instanceof ErroAcbrNode&&!JSON.stringify(e).includes(secret));
 assert.throws(()=>criarEmissor({...config,certificado:{arquivo:123,senha:secret}}),e=>e.codigo==='CERTIFICADO_INVALIDO'&&!JSON.stringify(e).includes(secret));
 assert.throws(()=>criarEmissor({...config,csc:{id:1,valor:secret}}),e=>e.codigo==='CSC_INVALIDO'&&!JSON.stringify(e).includes(secret));
});

test('invalid operation object receives useful feedback without reading certificate files',async()=>{
 const emitter=criarEmissor(config);
 try{
  for(const operation of ['consultar','cancelar','cartaCorrecao','inutilizar'])assert.throws(()=>emitter[operation](null),e=>e.codigo==='OPERACAO_INVALIDA'&&e.diagnostico.statusEnvio==='nao_enviado');
  await assert.rejects(emitter.gerarXml({},null),e=>e.codigo==='OPERACAO_INVALIDA');
  await assert.rejects(emitter.gerarXml({},{signal:null}),e=>e.codigo==='OPERACAO_INVALIDA');
 }finally{await emitter.fechar();}
});
