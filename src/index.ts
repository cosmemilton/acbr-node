import { criarEmissor as criarRuntime, type OpcoesEmissor, type OpcoesOperacao } from './runtime.js';
import { ACBR_CONTRACT, validateTNFe, type TNFeInput } from '../generated/acbr/models.js';
export * from './runtime.js';
export * from '../generated/acbr/models.js';
export type OpcoesCriarEmissor = Omit<OpcoesEmissor,'contrato'|'validaDocumento'>;
export function criarEmissor(options: OpcoesCriarEmissor) {
  const emissor=criarRuntime({...options,contrato:ACBR_CONTRACT,validaDocumento:validateTNFe});
  return {...emissor, gerarXml(documento:TNFeInput,operacao?:OpcoesOperacao){return emissor.gerarXml(documento,operacao);}};
}
