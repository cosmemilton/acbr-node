import { ErroAcbrNode, type Comando, type DetalhesErroAcbr, type DiagnosticoAcbr, type EtapaAcbr, type ResultadoFiscal, type StatusEnvio } from './types.js';

const ETAPAS = new Set<EtapaAcbr>(['configuracao','documento','runtime','geracao','validacao','assinatura','transmissao','consulta','cancelamento','carta_correcao','inutilizacao','operacao','limpeza']);
const CAMPOS = new Set(['cnpj','uf','modelo','ambiente','contrato','certificado','certificado.senha','certificado.pfx','certificado.arquivo','csc','csc.id','csc.valor','timeoutMs','limiteFila','limiteBytes','runtimeDirectory','documento','xml','consulta','chave','recibo','cancelamento','protocolo','justificativa','cartaCorrecao','correcao','sequenciaEvento','inutilizacao','ano','serie','numeroInicial','numeroFinal','operacao','signal']);
const CATALOGO: Record<string, [EtapaAcbr, string, string]> = {
  CONFIGURACAO_INVALIDA: ['configuracao','A configuração contém um campo inválido.','Confira o campo indicado e seu tipo antes de continuar.'],
  CONTRATO_INVALIDO: ['configuracao','O contrato do cliente é inválido.','Use o contrato gerado junto com o cliente.'],
  CERTIFICADO_INVALIDO: ['configuracao','O certificado A1 ou sua configuração é inválido.','Confira formato e validade do A1, pfx ou arquivo e a senha digitada, sem registrar esses dados.'],
  CERTIFICADO_DIVERGENTE: ['assinatura','O certificado não corresponde à raiz CNPJ do emitente.','Confira o CNPJ configurado e selecione o A1 correspondente ao emitente.'],
  DEPENDENCIA_AUSENTE: ['runtime','Uma dependência do motor fiscal não está disponível.','Reinstale o runtime completo da plataforma; confira a disponibilidade do OpenSSL distribuído.'],
  SCHEMAS_AUSENTES: ['runtime','Os schemas fiscais não estão disponíveis.','Reinstale o runtime completo da plataforma.'],
  SERVICOS_AUSENTES: ['runtime','A configuração dos serviços fiscais não está disponível.','Reinstale o runtime completo da plataforma.'],
  CSC_AUSENTE: ['configuracao','A operação de NFC-e exige CSC.','Informe id e valor do CSC na configuração sem registrar seu conteúdo.'],
  IDENTIDADE_DIVERGENTE: ['documento','A identidade fiscal não corresponde à configuração ou ao retorno.','Confira emitente, UF, modelo, ambiente e chave do documento antes de continuar.'],
  XML_SCHEMA_INVALIDO: ['validacao','O XML não atende aos schemas fiscais.','Confira os campos obrigatórios e os tributos; a validação de XML assinado deve ocorrer após a assinatura.'],
  ASSINATURA_INVALIDA: ['assinatura','A assinatura do XML não foi validada.','Confira o A1 correspondente e use o XML assinado sem alterações.'],
  XML_NAO_ASSINADO: ['assinatura','A operação exige XML previamente assinado.','Conclua a assinatura e a validação antes de transmitir.'],
  XML_ALTERADO: ['assinatura','O XML assinado foi alterado.','Use exatamente o XML assinado e persistido; não edite seu conteúdo.'],
  RETORNO_INVALIDO: ['transmissao','A identidade ou o protocolo do retorno fiscal é inválido.','Consulte a situação fiscal antes de decidir repetir a operação.'],
  OPERACAO_FISCAL_FALHOU: ['operacao','O motor não conseguiu concluir a etapa fiscal.','Confira a configuração da etapa, os dados do XML e as dependências do runtime.'],
  TLS_SERVIDOR_INVALIDO: ['transmissao','A verificação TLS do serviço fiscal falhou.','Confira o serviço e a cadeia de confiança; mantenha a verificação TLS habilitada.'],
  CSC_INVALIDO: ['configuracao','A configuração do CSC é inválida.','Confira id e valor do CSC sem registrar seu conteúdo.'],
  PLATAFORMA_NAO_SUPORTADA: ['runtime','A plataforma não é suportada.','Execute em Windows ou Linux x64 com Node.js 22.12 ou superior.'],
  RUNTIME_AUSENTE: ['runtime','O motor fiscal não foi encontrado.','Instale o runtime da plataforma incluindo dependências opcionais.'],
  RUNTIME_INVALIDO: ['runtime','O runtime fiscal é inválido.','Use um runtime distribuído e compatível com a plataforma.'],
  RUNTIME_INCOMPLETO: ['runtime','Falta um arquivo do runtime fiscal.','Reinstale o runtime da plataforma.'],
  RUNTIME_ALTERADO: ['runtime','A integridade do runtime fiscal não foi confirmada.','Reinstale o runtime; não desative a verificação dos hashes.'],
  CONTRATO_DIVERGENTE: ['runtime','Cliente e motor usam contratos diferentes.','Use versões compatíveis ou regenere e recompile ambos.'],
  DOCUMENTO_INVALIDO: ['documento','O documento contém dados incompatíveis com o modelo.','Valide os campos e tipos do documento antes de gerar o XML.'],
  OPERACAO_INVALIDA: ['operacao','Os parâmetros da operação são inválidos.','Informe um objeto com os campos exigidos pela operação.'],
  OPERACAO_CANCELADA: ['operacao','A operação foi cancelada.','Confira o estado do envio antes de decidir continuar.'],
  TIMEOUT_MOTOR: ['runtime','O motor excedeu o tempo de espera.','Confira o estado do envio antes de repetir a operação.'],
  EMISSOR_FECHADO: ['operacao','O emissor foi encerrado.','Crie um novo emissor para continuar.'],
  FALHA_INICIAR_MOTOR: ['runtime','Não foi possível iniciar o motor fiscal.','Confira a instalação e as permissões de execução do runtime.'],
  FALHA_PIPE: ['runtime','A comunicação com o motor foi interrompida.','Confira a instalação e o estado do envio antes de continuar.'],
  RESPOSTA_EXCESSIVA: ['runtime','A resposta do motor excedeu o limite.','Confira o tamanho da operação e a versão do runtime.'],
  RESPOSTA_INVALIDA: ['runtime','O motor devolveu uma resposta inválida.','Confira a compatibilidade do runtime e o estado do envio.'],
  FALHA_MOTOR: ['runtime','O motor encerrou sem uma resposta fiscal válida.','Confira a instalação e o estado do envio antes de continuar.'],
  CERTIFICADO_AUSENTE: ['configuracao','O certificado A1 não está disponível para esta operação.','Configure um A1 acessível e sua senha sem registrar esses dados.'],
  CERTIFICADO_EXCESSIVO: ['configuracao','O certificado excede o limite de tamanho.','Use um arquivo A1 de até 2 MiB.'],
  REQUISICAO_INVALIDA: ['operacao','Os dados não puderam ser serializados ou excedem o limite.','Use dados JSON e reduza o tamanho da operação.'],
  FILA_CHEIA: ['operacao','A fila fiscal está cheia.','Aguarde a operação atual terminar antes de iniciar outra.'],
  XML_INVALIDO: ['documento','O XML está vazio, tem tipo inválido ou excede o limite.','Informe o XML como texto UTF-8 de até 2 MiB.'],
  CHAVE_INVALIDA: ['documento','A chave fiscal tem formato inválido.','Informe a chave como texto com 44 dígitos.'],
  RECIBO_INVALIDO: ['documento','O recibo tem formato inválido.','Informe o recibo como texto com 15 dígitos.'],
  JUSTIFICATIVA_INVALIDA: ['documento','A justificativa tem tamanho inválido.','Informe uma justificativa com 15 a 255 caracteres.'],
  PROTOCOLO_INVALIDO: ['documento','O protocolo tem formato inválido.','Informe o protocolo como texto com 15 dígitos.'],
  OPERACAO_NAO_SUPORTADA: ['operacao','A operação não é suportada para este modelo.','Carta de correção exige NF-e modelo 55.'],
  CORRECAO_INVALIDA: ['documento','Os dados da carta de correção são inválidos.','Confira a correção de 15 a 1000 caracteres e a sequência de 1 a 20.'],
  INUTILIZACAO_INVALIDA: ['documento','A faixa de inutilização é inválida.','Confira ano, série e números inicial e final.'],
  FALHA_LOCAL: ['operacao','Não foi possível concluir a operação local.','Confira a etapa e os tipos dos dados; não registre o erro bruto.']
};

export function etapaDaOperacao(comando: Comando): EtapaAcbr {
  return ({gerarXml:'geracao',validar:'validacao',assinar:'assinatura',transmitir:'transmissao',consultar:'consulta',cancelar:'cancelamento',cartaCorrecao:'carta_correcao',inutilizar:'inutilizacao'} as const)[comando]??'operacao';
}

/** Apenas catálogo e metadados conhecidos; nunca copia message, stack, stderr ou causa bruta. */
export function criarDiagnosticoErro(codigo: string, desconhecido = false, detalhes: DetalhesErroAcbr = {}): DiagnosticoAcbr {
  const safeCode = Object.hasOwn(CATALOGO, codigo) ? codigo : 'FALHA_LOCAL';
  const [defaultStage, mensagem, defaultAction] = CATALOGO[safeCode];
  const etapa = detalhes.etapa && ETAPAS.has(detalhes.etapa) ? detalhes.etapa : defaultStage;
  const campo = detalhes.campo && CAMPOS.has(detalhes.campo) ? detalhes.campo : undefined;
  const acoesConfig:Record<string,string>={cnpj:'Informe o CNPJ como texto com 14 dígitos.',uf:'Informe a sigla da UF em letras maiúsculas, por exemplo PE.',modelo:'Informe o número 55 para NF-e ou 65 para NFC-e, sem aspas.',ambiente:'Informe o número 2 para homologação ou 1 para produção, sem aspas.',timeoutMs:'Informe um número inteiro de 1 a 120000 milissegundos.',limiteFila:'Informe um número inteiro de 0 a 1000.',limiteBytes:'Informe um número inteiro de 256 a 8388608 bytes.',runtimeDirectory:'Informe o diretório do runtime como texto não vazio.'};
  const acao=safeCode==='CONFIGURACAO_INVALIDA'&&campo&&Object.hasOwn(acoesConfig,campo)?acoesConfig[campo]:defaultAction;
  const causa = Object.freeze({codigo:safeCode,etapa,...(campo ? {campo} : {})});
  return Object.freeze({codigo:safeCode,etapa,...(campo ? {campo} : {}),mensagem,
    acao:desconhecido ? 'Consulte a situação fiscal antes de repetir. O envio pode ter ocorrido; não retransmita automaticamente.' : acao,
    statusEnvio:desconhecido ? 'resultado_incerto' : 'nao_enviado',causa});
}

export function diagnosticarErro(erro: unknown): DiagnosticoAcbr {
  return erro instanceof ErroAcbrNode ? erro.diagnostico : criarDiagnosticoErro('FALHA_LOCAL',true);
}

export function adicionarDiagnosticoLimpeza(diagnostico: DiagnosticoAcbr): DiagnosticoAcbr {
  const acao=diagnostico.statusEnvio==='resultado_incerto'
    ? 'Encerre esta aplicação antes de iniciar outro motor e consulte a situação fiscal antes de repetir qualquer envio.'
    : 'Encerre esta aplicação antes de iniciar outro motor. As próximas operações deste emissor foram bloqueadas.';
  const limpeza=Object.freeze({codigo:'ENCERRAMENTO_MOTOR_NAO_CONFIRMADO' as const,etapa:'limpeza' as const,mensagem:'Não foi possível confirmar o encerramento do motor fiscal.',acao});
  return Object.freeze({...diagnostico,acao,limpeza});
}

/** Status refere-se à operação atual; uma etapa local não prova ausência de envios anteriores. */
export function diagnosticarResultado(resultado: ResultadoFiscal, comando: Comando): DiagnosticoAcbr {
  const etapa = etapaDaOperacao(comando);
  if(!resultado||typeof resultado!=='object')return criarDiagnosticoErro('FALHA_LOCAL',true,{etapa});
  if(resultado.envioIniciado!==undefined&&typeof resultado.envioIniciado!=='boolean')return criarDiagnosticoErro('RESPOSTA_INVALIDA',true,{etapa});
  let statusEnvio: StatusEnvio = 'resultado_incerto', codigo = 'RESULTADO_INCERTO';
  let mensagem = 'A situação fiscal ainda não foi confirmada.';
  let acao = 'Consulte a situação fiscal antes de repetir. Não retransmita automaticamente.';
  const local=(comando==='gerarXml'&&resultado.estado==='XML_GERADO')||(comando==='validar'&&resultado.estado==='VALIDADO')||(comando==='assinar'&&resultado.estado==='ASSINADO');
  const semEvento=resultado.envioIniciado===false||resultado.envioIniciado===undefined;
  const protocolo=typeof resultado.protocolo==='string'&&/^\d{15}$/.test(resultado.protocolo);
  const chave=typeof resultado.chave==='string'&&/^\d{44}$/.test(resultado.chave);
  const autorizacao=(comando==='transmitir'||comando==='consultar')&&resultado.estado==='AUTORIZADO'&&[100,150].includes(resultado.cStat!)&&protocolo&&chave&&(comando==='consultar'||resultado.envioIniciado!==false);
  const evento=(comando==='cancelar'&&resultado.estado==='CANCELADO'&&[135,136].includes(resultado.cStat!)&&chave)||(comando==='cartaCorrecao'&&resultado.estado==='EVENTO_REGISTRADO'&&resultado.cStat===135&&chave)||(comando==='inutilizar'&&resultado.estado==='INUTILIZADO'&&resultado.cStat===102);
  if (local && resultado.sucesso===true && semEvento) {
    statusEnvio='nao_enviado';codigo='ETAPA_LOCAL_CONCLUIDA';mensagem='A etapa local foi concluída; esta operação não transmitiu a nota.';acao='Confira o resultado antes de seguir para a próxima etapa.';
  } else if (resultado.sucesso===true && (autorizacao||evento&&protocolo&&resultado.envioIniciado!==false)) {
    statusEnvio='autorizado';codigo='OPERACAO_CONFIRMADA';
    mensagem=({AUTORIZADO:'A nota foi autorizada.',CANCELADO:'O cancelamento foi confirmado.',EVENTO_REGISTRADO:'O evento foi registrado.',INUTILIZADO:'A faixa foi inutilizada.'} as Record<string,string>)[resultado.estado];
    acao='Guarde o resultado fiscal. Não repita esta operação.';
  } else if (resultado.sucesso===false && (comando==='consultar'||resultado.envioIniciado!==false) && ['transmitir','consultar','cancelar','cartaCorrecao','inutilizar'].includes(comando) && Number.isInteger(resultado.cStat) && Number(resultado.cStat)>0 && Number(resultado.cStat)<=9999 && (resultado.estado==='DENEGADO'&&[110,301,302].includes(resultado.cStat!)||resultado.estado==='REJEITADO'&&![100,150,110,301,302,101,151,155,103,104,105,108,109,204,539,573,135,136,102,217].includes(resultado.cStat!))) {
    statusEnvio='rejeitado';codigo=resultado.estado==='DENEGADO'?'NOTA_DENEGADA':'OPERACAO_REJEITADA';
    mensagem=resultado.estado==='DENEGADO'?'A nota foi denegada.':'A operação foi rejeitada.';
    acao=resultado.estado==='DENEGADO'?'Consulte a situação fiscal e a orientação responsável antes de usar a numeração.':'Confira o cStat e revise os dados antes de decidir uma nova tentativa.';
  } else if (resultado.estado==='ERRO' && resultado.envioIniciado===false) {
    if(typeof resultado.codigo==='string'&&Object.hasOwn(CATALOGO,resultado.codigo))return criarDiagnosticoErro(resultado.codigo,false,{etapa});
    statusEnvio='nao_enviado';codigo='FALHA_ANTES_ENVIO';mensagem='O motor informou falha antes de iniciar o envio desta operação.';acao='Revise a configuração e os dados antes de continuar.';
  }
  const cStat=Number.isInteger(resultado.cStat)&&Number(resultado.cStat)>0&&Number(resultado.cStat)<=9999 ? resultado.cStat : undefined;
  return Object.freeze({codigo,etapa,mensagem,acao,statusEnvio,...(cStat!==undefined?{cStat}:{})});
}
