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
}
export interface RuntimeManifest extends Contrato {
  formatVersion: 1; platform: string; arch: string; executable: string; files: Record<string, string>;
}
export interface OpcoesOperacao { signal?: AbortSignal }
export interface Consulta { chave: string; recibo?: string }
export interface Cancelamento { chave: string; protocolo: string; justificativa: string }
export interface CartaCorrecao { chave: string; correcao: string; sequenciaEvento?: number }
export interface Inutilizacao { ano: number; serie: number; numeroInicial: number; numeroFinal: number; justificativa: string }
export class ErroAcbrNode extends Error {
  readonly name = 'ErroAcbrNode';
  constructor(readonly codigo: string, mensagem: string, readonly resultadoDesconhecido = false, readonly xmlBase64?: string) { super(mensagem); }
}
