export const PROTOCOL_VERSION = 1 as const;
export type Modelo = 55 | 65;
export type Ambiente = 1 | 2;
export type Comando = 'gerarXml' | 'validar' | 'assinar' | 'transmitir' | 'consultar' | 'cancelar' | 'cartaCorrecao' | 'inutilizar';
export interface Contrato { sourceRevision: number; contractHash: string }
export interface CertificadoA1 { pfx?: Uint8Array; arquivo?: string; senha: string }
export interface ConfiguracaoEmissor { cnpj: string; uf: string; modelo: Modelo; ambiente: Ambiente; certificado?: CertificadoA1; csc?: { id: string; valor: string } }
export interface ConfiguracaoMotor extends Omit<ConfiguracaoEmissor, 'certificado'> { certificado?: { pfxBase64: string; senha: string } }
export interface RequisicaoMotor extends Contrato {
  versao: 1; id: string; comando: Comando; config: ConfiguracaoMotor;
  documento?: object; xmlBase64?: string; chave?: string; recibo?: string;
  protocolo?: string; justificativa?: string; correcao?: string; sequenciaEvento?: number;
  inutilizacao?: { ano: number; serie: number; numeroInicial: number; numeroFinal: number };
}
export type Estado = 'DENEGADO' | 'XML_GERADO' | 'VALIDADO' | 'ASSINADO' | 'AUTORIZADO' | 'REJEITADO' | 'PENDENTE' | 'INDETERMINADO' | 'CONSULTADO' | 'CANCELADO' | 'EVENTO_REGISTRADO' | 'INUTILIZADO' | 'ERRO';
export interface ResultadoFiscal extends Contrato {
  versao: 1; id: string; sucesso: boolean; estado: Estado; codigo?: string;
  cStat?: number; xMotivo?: string; chave?: string; protocolo?: string; recibo?: string;
  xmlBase64?: string; envioIniciado?: boolean;
  /** Resumo seguro para interfaces e logs; não contém XML, identidade fiscal ou xMotivo bruto. */
  diagnostico?: DiagnosticoAcbr;
}
export interface RuntimeManifest extends Contrato {
  formatVersion: 1; platform: string; arch: string; executable: string; files: Record<string, string>;
}
export interface OpcoesOperacao { signal?: AbortSignal }
export interface Consulta { chave: string; recibo?: string }
export interface Cancelamento { chave: string; protocolo: string; justificativa: string }
export interface CartaCorrecao { chave: string; correcao: string; sequenciaEvento?: number }
export interface Inutilizacao { ano: number; serie: number; numeroInicial: number; numeroFinal: number; justificativa: string }
export type StatusEnvio = 'nao_enviado' | 'rejeitado' | 'autorizado' | 'resultado_incerto';
export type EtapaAcbr = 'configuracao' | 'documento' | 'runtime' | 'geracao' | 'validacao' | 'assinatura' | 'transmissao' | 'consulta' | 'cancelamento' | 'carta_correcao' | 'inutilizacao' | 'operacao' | 'limpeza';
export interface DiagnosticoAcbr {
  readonly codigo: string; readonly etapa: EtapaAcbr; readonly campo?: string;
  readonly mensagem: string; readonly acao: string; readonly statusEnvio: StatusEnvio;
  readonly cStat?: number;
  readonly causa?: Readonly<{ codigo: string; etapa: EtapaAcbr; campo?: string }>;
  readonly limpeza?: Readonly<{codigo:'ENCERRAMENTO_MOTOR_NAO_CONFIRMADO';etapa:'limpeza';mensagem:string;acao:string}>;
}
export interface DetalhesErroAcbr { etapa?: EtapaAcbr; campo?: string }
export class ErroAcbrNode extends Error {
  readonly name = 'ErroAcbrNode';
  #diagnostico: DiagnosticoAcbr;
  get diagnostico(): DiagnosticoAcbr { return this.#diagnostico; }
  constructor(readonly codigo: string, mensagem: string, readonly resultadoDesconhecido = false, readonly xmlBase64?: string, detalhes?: DetalhesErroAcbr) {
    super(mensagem);
    this.#diagnostico = criarDiagnosticoErro(codigo, resultadoDesconhecido, detalhes);
    // Recuperação permanece disponível por acesso explícito, sem vazar XML em console/JSON.
    Object.defineProperty(this, 'xmlBase64', { value: xmlBase64, enumerable: false });
    Object.defineProperty(this, 'cause', { value: this.diagnostico.causa, enumerable: false });
  }
  /** Acrescenta apenas o aviso estático de limpeza, preservando o erro da operação. */
  anotarFalhaLimpeza(): void { this.#diagnostico = adicionarDiagnosticoLimpeza(this.#diagnostico); }
  toJSON(): DiagnosticoAcbr { return this.diagnostico; }
}
import { criarDiagnosticoErro, adicionarDiagnosticoLimpeza } from './diagnostics.js';
