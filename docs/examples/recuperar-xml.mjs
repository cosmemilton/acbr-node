// Exemplo da aplicação, sem execução automática ao importar.
// Nos testes: XML/A1 sintéticos e serviço SOAP local, sem SEFAZ real.
// O chamador fornece caminhos privados, configuração, A1 e confirmação.
// Não receba senha/PFX por argv ou env e não registre esses valores.
// Apresente falhas ao usuário com diagnosticarErro, sem imprimir o erro bruto.
// opcoes é opcional e aceita somente signal?: AbortSignal, de um AbortController.
// abort() solicita cancelamento no SDK; a consulta pode já ter sido enviada.
// Isso não cancela a autorização fiscal.
import { readFile } from 'node:fs/promises';
import { criarEmissor, diagnosticarResultado } from 'cosmemilton-acbr-node';

export async function recuperarXmlDeArquivo({
  arquivoAssinado,
  configuracao,
  certificado,
  confirmarConsulta,
  opcoes
}) {
  if (configuracao?.ambiente !== 2 || typeof confirmarConsulta !== 'function') {
    throw new TypeError('Este exemplo exige homologação e confirmação da aplicação.');
  }
  const original = await readFile(arquivoAssinado);
  const xmlAssinado = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(original);
  if (!Buffer.from(xmlAssinado, 'utf8').equals(original)) {
    throw new TypeError('O arquivo assinado precisa estar em UTF-8.');
  }
  if (await confirmarConsulta('Consultar uma vez para recuperar o XML autorizado, sem emitir ou transmitir a nota?') !== true) {
    return { recuperado: false, confirmado: false };
  }

  const emissor = criarEmissor({ ...configuracao, ambiente: 2, certificado });
  try {
    // Única operação fiscal deste exemplo. É uma consulta externa com A1.
    const resultado = await emissor.recuperarXml(xmlAssinado, opcoes);
    const diagnostico = resultado.diagnostico ?? diagnosticarResultado(resultado, 'recuperarXml');
    if (!(await readFile(arquivoAssinado)).equals(original)) {
      throw new Error('O arquivo original mudou durante a operação; preserve os registros.');
    }
    if (resultado.sucesso !== true || resultado.estado !== 'XML_RECUPERADO'
        || resultado.cStat !== 100 || resultado.envioIniciado === true
        || typeof resultado.xmlBase64 !== 'string' || !resultado.xmlBase64) {
      return { recuperado: false, diagnostico };
    }
    const bytes = Buffer.from(resultado.xmlBase64, 'base64');
    if (bytes.toString('base64') !== resultado.xmlBase64) {
      throw new Error('O motor não devolveu o XML recuperado em base64 íntegro.');
    }
    // Dados fiscais privados: não imprima o objeto ou os bytes em logs.
    // O chamador pode salvar em um NOVO arquivo com writeFile(..., { flag: 'wx' }).
    return { recuperado: true, bytes, diagnostico };
  } finally {
    await emissor.fechar();
  }
}
