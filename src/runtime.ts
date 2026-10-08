import { spawn, type ChildProcessWithoutNullStreams, type SpawnOptionsWithoutStdio } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { TextDecoder } from 'node:util';
import { ErroAcbrNode, type ConfiguracaoEmissor, type Contrato, type ConfiguracaoMotor, type RequisicaoMotor, type ResultadoFiscal, type RuntimeManifest, type OpcoesOperacao, type Consulta, type Cancelamento, type CartaCorrecao, type Inutilizacao } from './types.js';
export * from './types.js';
type Launch = (exe: string, args: string[], config: SpawnOptionsWithoutStdio) => ChildProcessWithoutNullStreams;
export interface OpcoesEmissor extends ConfiguracaoEmissor {
  contrato: Contrato; runtimeDirectory?: string; timeoutMs?: number; limiteFila?: number; limiteBytes?: number;
  validaDocumento?: (documento: unknown) => void;
  /** Injeção para testes offline. O padrão sempre inicia o motor distribuído. */
  criaProcesso?: Launch;
}
const STATES = new Set(['DENEGADO','XML_GERADO','VALIDADO','ASSINADO','AUTORIZADO','REJEITADO','PENDENTE','INDETERMINADO','CONSULTADO','CANCELADO','EVENTO_REGISTRADO','INUTILIZADO','ERRO']);
const UFS = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));
const MAX_BYTES = 8 * 1024 * 1024;
const plain = (v: unknown): v is Record<string,unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const validContract = (v: unknown): v is Contrato => plain(v) && Number.isInteger(v.sourceRevision) && Number(v.sourceRevision)>0 && typeof v.contractHash==='string' && /^[a-f0-9]{64}$/.test(v.contractHash);
const fail = (code: string, message: string, req?: RequisicaoMotor, unknown=false) => new ErroAcbrNode(code,message,unknown,req?.comando==='transmitir'?req.xmlBase64:undefined);
function confined(root: string, relative: string): string {
  const file=path.resolve(root,relative), part=path.relative(root,file);
  if(!relative || path.isAbsolute(relative) || part==='..' || part.startsWith('..'+path.sep)) throw fail('RUNTIME_INVALIDO','Caminho inválido no runtime.');
  return file;
}
async function resolveRuntime(directory: string | undefined, contract: Contrato): Promise<{directory:string;executable:string}> {
  if(!validContract(contract)) throw fail('CONTRATO_INVALIDO','Contrato gerado inválido.');
  let root=directory;
  if(!root) {
    if(!['linux','win32'].includes(process.platform) || process.arch!=='x64') throw fail('PLATAFORMA_NAO_SUPORTADA','Esta versão exige Linux ou Windows x64.');
    try { const require=createRequire(typeof __filename!=='undefined'?__filename:import.meta.url); root=path.join(path.dirname(require.resolve('@cosmemilton/acbr-node-'+process.platform+'-x64/package.json')),'runtime'); }
    catch { throw fail('RUNTIME_AUSENTE','Instale o pacote de runtime da plataforma ou informe runtimeDirectory.'); }
  }
  root=path.resolve(root);
  let m: RuntimeManifest;
  try { m=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8')); } catch { throw fail('RUNTIME_AUSENTE','Manifesto do runtime não encontrado.'); }
  if(!validContract(m) || m.formatVersion!==1 || !plain(m.files) || typeof m.executable!=='string' || m.platform!==process.platform || m.arch!==process.arch) throw fail('RUNTIME_INVALIDO','Manifesto ou plataforma do runtime inválidos.');
  if(m.sourceRevision!==contract.sourceRevision || m.contractHash!==contract.contractHash) throw fail('CONTRATO_DIVERGENTE','Cliente e motor foram gerados de contratos diferentes; regenere e recompile.');
  for(const [name,hash] of Object.entries(m.files)) {
    if(typeof hash!=='string'||!/^[a-f0-9]{64}$/.test(hash)) throw fail('RUNTIME_INVALIDO','Hash inválido no runtime.');
    const file=confined(root,name); let data:Buffer;
    try { if(!(await stat(file)).isFile()) throw Error(); data=await readFile(file); } catch { throw fail('RUNTIME_INCOMPLETO','Arquivo do runtime ausente.'); }
    if(createHash('sha256').update(data).digest('hex')!==hash) throw fail('RUNTIME_ALTERADO','O runtime não corresponde ao manifesto distribuído.');
  }
  if(!m.files[m.executable]) throw fail('RUNTIME_INVALIDO','O executável não consta no inventário.');
  return {directory:root,executable:confined(root,m.executable)};
}
interface Pending { req:RequisicaoMotor; bytes:Buffer; signal?:AbortSignal; resolve:(v:ResultadoFiscal)=>void; reject:(e:unknown)=>void; abort?:()=>void }
export function criarEmissor(options: OpcoesEmissor) {
  if(!/^\d{14}$/.test(options.cnpj)||!UFS.has(options.uf)||![55,65].includes(options.modelo)||![1,2].includes(options.ambiente)) throw fail('CONFIGURACAO_INVALIDA','Informe CNPJ, UF, modelo e ambiente válidos.');
  if(!validContract(options.contrato)) throw fail('CONTRATO_INVALIDO','Contrato gerado inválido.');
  const cert=options.certificado;
  if(cert && (typeof cert.senha!=='string' || !!cert.pfx===!!cert.arquivo || cert.pfx && !(cert.pfx instanceof Uint8Array))) throw fail('CERTIFICADO_INVALIDO','Informe A1 em pfx ou arquivo e sua senha.');
  if(options.csc && (!/^\d{1,6}$/.test(options.csc.id) || typeof options.csc.valor!=='string' || !options.csc.valor || options.csc.valor.length>256)) throw fail('CSC_INVALIDO','CSC inválido.');
  const cfg:Omit<ConfiguracaoEmissor, 'certificado'>={cnpj:options.cnpj,uf:options.uf,modelo:options.modelo,ambiente:options.ambiente,csc:options.csc?{...options.csc}:undefined};
  const certificate=cert?{...cert,pfx:cert.pfx?Buffer.from(cert.pfx):undefined}:undefined;
  const contract={...options.contrato};
  const timeout=options.timeoutMs??120_000, capacity=options.limiteFila??32, bytesLimit=options.limiteBytes??MAX_BYTES;
  if(!Number.isInteger(timeout)||timeout<1||timeout>120000||!Number.isInteger(capacity)||capacity<0||capacity>1000||!Number.isInteger(bytesLimit)||bytesLimit<256||bytesLimit>MAX_BYTES) throw fail('CONFIGURACAO_INVALIDA','Limites de execução inválidos.');
  const launch:Launch=options.criaProcesso??((exe,args,config)=>spawn(exe,args,{...config,stdio:['pipe','pipe','pipe']}));
  let runtimePromise:ReturnType<typeof resolveRuntime>|undefined, closed=false, current:{stop:()=>void;done:Promise<void>}|undefined;
  const queue:Pending[]=[];
  async function execute(item:Pending) {
    if(closed||item.signal?.aborted) throw fail('OPERACAO_CANCELADA','Operação cancelada antes da execução.');
    const runtime=await (runtimePromise??=resolveRuntime(options.runtimeDirectory,contract));
    if(closed||item.signal?.aborted) throw fail('OPERACAO_CANCELADA','Operação cancelada antes da execução.');
    await new Promise<void>((done)=>{
      let stopError:unknown; let child:ChildProcessWithoutNullStreams|undefined, finished=false, started=false, sending=false, total=0, rest=Buffer.alloc(0), result:ResultadoFiscal|undefined;
      let finishCurrent!:()=>void; const doneCurrent=new Promise<void>(r=>{finishCurrent=r;});
      const uncertain=()=>['transmitir','cancelar','cartaCorrecao','inutilizar'].includes(item.req.comando)&&started || sending;
      const finish=(error?:unknown)=>{
        if(finished)return; finished=true;clearTimeout(timer);item.signal?.removeEventListener('abort',abort);
        item.bytes.fill(0);if(current?.done===doneCurrent)current=undefined;finishCurrent();error?item.reject(error):item.resolve(result!);done();
      };
      const stop=(code:string,message:string)=>{ if(finished||stopError)return; stopError=fail(code,message,item.req,uncertain()); if(child?.pid)child.kill('SIGKILL');else finish(stopError); };
      const abort=()=>stop('OPERACAO_CANCELADA','Operação cancelada; confira a situação fiscal quando o envio foi iniciado.');
      const timer=setTimeout(()=>stop('TIMEOUT_MOTOR','O motor excedeu o prazo; consulte a situação antes de transmitir novamente.'),timeout);
      current={stop:()=>stop('EMISSOR_FECHADO','Emissor encerrado.'),done:doneCurrent};
      const env:NodeJS.ProcessEnv={};
      for(const key of ['PATH','Path','SystemRoot','WINDIR','TEMP','TMP','HOME','LANG','LC_ALL']) if(process.env[key]!==undefined)env[key]=process.env[key];
      if(process.platform==='linux')env.LD_LIBRARY_PATH=path.join(runtime.directory,'lib');
      if(process.platform==='win32'){const inheritedPath=env.Path??env.PATH??'';delete env.Path;env.PATH=path.join(runtime.directory,'lib')+';'+runtime.directory+';'+inheritedPath;}
      const modules=path.join(runtime.directory,'ossl-modules'); env.OPENSSL_MODULES=modules; env.OPENSSL_CONF=path.join(runtime.directory,'openssl.cnf');
      try { child=launch(runtime.executable,['--parent-pid',String(process.pid)],{cwd:runtime.directory,env,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']}); started=typeof child.pid==='number'; }
      catch { finish(fail('FALHA_INICIAR_MOTOR','Não foi possível iniciar o motor.',item.req)); return; }
      item.signal?.addEventListener('abort',abort,{once:true});
      child.on('spawn',()=>{started=true;});
      child.on('error',()=>finish(fail('FALHA_INICIAR_MOTOR','Não foi possível iniciar o motor.',item.req,uncertain())));
      child.stdin.on('error',()=>stop('FALHA_PIPE','Não foi possível comunicar com o motor.'));
      child.stderr.on('data',()=>{}); // stderr bruto nunca é exposto: pode conter mensagens de dependências.
      child.stdout.on('data',(chunk:Buffer)=>{
        if(finished||stopError)return;total+=chunk.length;if(total>bytesLimit){stop('RESPOSTA_EXCESSIVA','Resposta do motor excede o limite.');return;}
        rest=Buffer.concat([rest,chunk]);let end:number;
        while((end=rest.indexOf(10))>=0) {
          const line=rest.subarray(0,end);rest=rest.subarray(end+1);if(!line.length)continue;
          try {
            const frame=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(line));
            if(!plain(frame)||frame.id!==item.req.id)throw Error();
            if(frame.tipo==='envioIniciado'){sending=true;continue;}
            if(result||frame.versao!==1||frame.sourceRevision!==contract.sourceRevision||frame.contractHash!==contract.contractHash||typeof frame.sucesso!=='boolean'||!STATES.has(String(frame.estado)))throw Error();
            if(frame.xmlBase64!==undefined&&(typeof frame.xmlBase64!=='string'||!frame.xmlBase64.length||Buffer.from(frame.xmlBase64,'base64').toString('base64')!==frame.xmlBase64))throw Error();
            if(frame.cStat!==undefined&&(!Number.isInteger(frame.cStat)||Number(frame.cStat)<1||Number(frame.cStat)>9999))throw Error();
            result=frame as unknown as ResultadoFiscal;
          }catch{stop('RESPOSTA_INVALIDA','O motor retornou uma resposta inválida.');return;}
        }
      });
      child.on('close',(code)=>{
        if(finished)return;
        if(stopError){finish(stopError);return;}
        if(code!==0||rest.length||!result){finish(fail('FALHA_MOTOR','O motor encerrou sem resposta fiscal válida.',item.req,uncertain()));return;}
        finish();
      });
      child.stdin.end(item.bytes);
      if(item.signal?.aborted)abort();
    });
  }
  let busy=false;
  async function next(){if(busy)return;const item=queue.shift();if(!item)return;busy=true;item.signal?.removeEventListener('abort',item.abort!);try{await execute(item);}catch(e){item.bytes.fill(0);item.reject(e);}finally{busy=false;void next();}}
  async function request(command:RequisicaoMotor['comando'],data:Partial<RequisicaoMotor>,operation:OpcoesOperacao={}):Promise<ResultadoFiscal> {
    if(closed)throw fail('EMISSOR_FECHADO','Emissor encerrado.');
    if(operation.signal?.aborted)throw fail('OPERACAO_CANCELADA','Operação cancelada antes da execução.');
    if(['assinar','transmitir','consultar','cancelar','cartaCorrecao','inutilizar'].includes(command)&&!certificate)throw fail('CERTIFICADO_AUSENTE','A operação exige um certificado A1.');
    if(command==='gerarXml')options.validaDocumento?.(data.documento);
    const config:ConfiguracaoMotor={...cfg};
    if(certificate){let pfx:Buffer;try{pfx=certificate.pfx??await readFile(certificate.arquivo!);}catch{throw fail('CERTIFICADO_AUSENTE','Não foi possível ler o A1 configurado.');}if(pfx.length>2*1024*1024)throw fail('CERTIFICADO_EXCESSIVO','Certificado excede o limite.');config.certificado={pfxBase64:pfx.toString('base64'),senha:certificate.senha};}
    let bytes:Buffer, req:RequisicaoMotor;
    try{bytes=Buffer.from(JSON.stringify({versao:1,id:randomUUID(),...contract,comando:command,config,...data})+'\n','utf8');if(bytes.length>bytesLimit)throw Error();req=JSON.parse(bytes.toString('utf8'));}catch{throw fail('REQUISICAO_INVALIDA','Dados da operação inválidos ou acima do limite.');}
    return new Promise((resolve,reject)=>{
      if(closed){bytes.fill(0);reject(fail('EMISSOR_FECHADO','Emissor encerrado.'));return;}
      if(busy&&queue.length>=capacity){bytes.fill(0);reject(fail('FILA_CHEIA','A fila fiscal está cheia.'));return;}
      const item:Pending={req,bytes,signal:operation.signal,resolve,reject};
      item.abort=()=>{const i=queue.indexOf(item);if(i>=0){queue.splice(i,1);bytes.fill(0);operation.signal?.removeEventListener('abort',item.abort!);reject(fail('OPERACAO_CANCELADA','Operação cancelada antes da execução.'));}};
      operation.signal?.addEventListener('abort',item.abort,{once:true});queue.push(item);if(operation.signal?.aborted)item.abort();void next();
    });
  }
  const xmlData=(xml:string)=>{if(typeof xml!=='string'||!xml.trim()||Buffer.byteLength(xml,'utf8')>2*1024*1024)throw fail('XML_INVALIDO','XML vazio ou acima do limite.');return {xmlBase64:Buffer.from(xml,'utf8').toString('base64')};};
  const checkKey=(key:string)=>{if(!/^\d{44}$/.test(key))throw fail('CHAVE_INVALIDA','Chave fiscal inválida.');};
  const reason=(value:string)=>{if(typeof value!=='string'||value.length<15||value.length>255)throw fail('JUSTIFICATIVA_INVALIDA','Justificativa deve ter de 15 a 255 caracteres.');};
  return {
    gerarXml:(documento:object,op?:OpcoesOperacao)=>request('gerarXml',{documento},op),
    validar:(xml:string,op?:OpcoesOperacao)=>request('validar',xmlData(xml),op),
    assinar:(xml:string,op?:OpcoesOperacao)=>request('assinar',xmlData(xml),op),
    transmitir:(xml:string,op?:OpcoesOperacao)=>request('transmitir',xmlData(xml),op),
    consultar:(consulta:Consulta,op?:OpcoesOperacao)=>{checkKey(consulta.chave);if(consulta.recibo&&!/^\d{15}$/.test(consulta.recibo))throw fail('RECIBO_INVALIDO','Recibo inválido.');return request('consultar',consulta,op);},
    cancelar:(data:Cancelamento,op?:OpcoesOperacao)=>{checkKey(data.chave);reason(data.justificativa);if(!/^\d{15}$/.test(data.protocolo))throw fail('PROTOCOLO_INVALIDO','Protocolo inválido.');return request('cancelar',data,op);},
    cartaCorrecao:(data:CartaCorrecao,op?:OpcoesOperacao)=>{if(cfg.modelo!==55)throw fail('OPERACAO_NAO_SUPORTADA','Carta de correção exige NF-e modelo 55.');checkKey(data.chave);if(typeof data.correcao!=='string'||data.correcao.length<15||data.correcao.length>1000||!Number.isInteger(data.sequenciaEvento??1)||(data.sequenciaEvento??1)<1||(data.sequenciaEvento??1)>20)throw fail('CORRECAO_INVALIDA','Dados da carta de correção inválidos.');return request('cartaCorrecao',{...data,sequenciaEvento:data.sequenciaEvento??1},op);},
    inutilizar:(data:Inutilizacao,op?:OpcoesOperacao)=>{reason(data.justificativa);if(!Number.isInteger(data.ano)||data.ano<0||data.ano>99||!Number.isInteger(data.serie)||data.serie<0||data.serie>999||!Number.isInteger(data.numeroInicial)||data.numeroInicial<1||!Number.isInteger(data.numeroFinal)||data.numeroFinal<data.numeroInicial||data.numeroFinal>999999999)throw fail('INUTILIZACAO_INVALIDA','Faixa de inutilização inválida.');return request('inutilizar',{inutilizacao:{ano:data.ano,serie:data.serie,numeroInicial:data.numeroInicial,numeroFinal:data.numeroFinal},justificativa:data.justificativa},op);},
    async fechar(){if(closed)return;closed=true;for(const item of queue.splice(0)){item.signal?.removeEventListener('abort',item.abort!);item.bytes.fill(0);item.reject(fail('EMISSOR_FECHADO','Emissor encerrado.'));}const running=current;running?.stop();if(running)await running.done;certificate?.pfx?.fill(0);}
  };
}
export type Emissor = ReturnType<typeof criarEmissor>;
