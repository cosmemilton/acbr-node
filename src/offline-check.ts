import type { AcbrConfig } from './config.js';
import { runtimeDirectory, type BuiltRuntimeManifest } from './native-build.js';
import { criarEmissor, type ResultadoFiscal } from './runtime.js';
import { OFFLINE_DOCUMENT, OFFLINE_SIGNED_XML } from './offline-fixture.js';
export interface OfflineCheck { name: string; estado: string; codigo?: string; envioIniciado: false; }
/** Local synthetic probes only: no certificate credentials, connection or fiscal transmission. */
export async function checkOffline(config: AcbrConfig, manifest: BuiltRuntimeManifest): Promise<OfflineCheck[]> {
  const emitter = criarEmissor({ cnpj: '11222333000181', uf: 'CE', modelo: 55, ambiente: 2,
    contrato: { sourceRevision: manifest.sourceRevision, contractHash: manifest.contractHash },
    runtimeDirectory: runtimeDirectory(config), timeoutMs: 30_000 });
  const report: OfflineCheck[] = [];
  function expect(name: string, result: ResultadoFiscal, estado: string, codigo?: string): void {
    if (result.estado !== estado || result.sucesso !== (estado !== 'ERRO') || result.envioIniciado !== false ||
        result.sourceRevision !== manifest.sourceRevision || (codigo !== undefined && result.codigo !== codigo)) {
      throw new Error(`Smoke offline ${name} falhou: ${result.estado}/${result.codigo ?? 'sem código'}.`);
    }
    report.push({ name, estado: result.estado, codigo: result.codigo, envioIniciado: false });
  }
  try {
    const generated = await emitter.gerarXml(OFFLINE_DOCUMENT);
    expect('gerarXml sintético', generated, 'XML_GERADO');
    const xml = generated.xmlBase64 ? Buffer.from(generated.xmlBase64, 'base64').toString('utf8') : '';
    const generatedKey = /Id="NFe(\d{44})"/.exec(xml)?.[1];
    if (!generatedKey || !xml.includes('Café São José TESTE OFFLINE') || !xml.includes('<CNPJ>11222333000181</CNPJ>')) throw new Error('Smoke offline gerarXml perdeu chave, identidade ou UTF-8.');
    const validated = await emitter.validar(OFFLINE_SIGNED_XML);
    expect('validar XML assinado público', validated, 'VALIDADO');
    const signedKey = /Id="NFe(\d{44})"/.exec(OFFLINE_SIGNED_XML)?.[1];
    if (validated.chave !== signedKey || generatedKey !== signedKey) throw new Error('Smoke offline validar retornou outra chave fiscal.');
    expect('recusar XML malformado', await emitter.validar('<NFe><infNFe></NFe>'), 'ERRO', 'OPERACAO_FISCAL_FALHOU');
    expect('recusar DTD/entidade externa', await emitter.validar('<!DOCTYPE NFe [<!ENTITY probe SYSTEM "file:///acbr-node-offline-check-does-not-exist">]><NFe>&probe;</NFe>'), 'ERRO', 'XML_INVALIDO');
    return report;
  } finally { await emitter.fechar(); }
}
