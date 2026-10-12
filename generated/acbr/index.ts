// Generated client bound to its own ACBr contract. Do not edit.
import { criarEmissor as criarRuntime, diagnosticarErro as diagnosticarErroRuntime, diagnosticarResultado, type OpcoesEmissor, type OpcoesOperacao } from "cosmemilton-acbr-node/runtime";
import { ACBR_CONTRACT, validateTNFe, ErroValidacaoModelo, type TNFeInput } from "./models.js";
export * from "./models.js";
export { diagnosticarResultado };
export function diagnosticarErro(erro:unknown) { return erro instanceof ErroValidacaoModelo ? erro.diagnostico : diagnosticarErroRuntime(erro); }
export function criarEmissor(options: Omit<OpcoesEmissor, "contrato" | "validaDocumento">) {
 const emissor=criarRuntime({...options, contrato:ACBR_CONTRACT, validaDocumento:validateTNFe});
 return {...emissor, gerarXml(documento:TNFeInput, opcoes?:OpcoesOperacao) { return emissor.gerarXml(documento as unknown as Record<string,unknown>, opcoes); }};
}
