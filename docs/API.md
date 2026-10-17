# API e protocolo

`criarEmissor` retorna operações assíncronas; cada chamada inicia um processo fiscal isolado. Uma instância processa uma operação por vez, com fila limitada. Emitentes diferentes não compartilham o componente Pascal.

## Consultar campos e tipos pela CLI

O SDK 0.2.2 acrescenta `acbr-node describe TARGET`, com saída legível em português, e `--json` para consultar os mesmos metadados em formato estruturado:

```bash
npx acbr-node describe Ide.tpNF
npx acbr-node describe TTipoNFe --json
npx acbr-node describe 'Det[].Imposto.PIS.CST' --json
npx acbr-node describe --help
npx acbr-node --version
```

Os valores de enums, nomes, tipos e padrões declarados vêm do contrato gerado que acompanha o SDK. A consulta funciona sem runtime, certificado ou rede, não cria emissor e não inicia processo fiscal. `help TAG caminho [--json]` conserva o comportamento anterior. A API fiscal e seu contrato permanecem iguais; o SDK 0.2.2 utiliza os runtimes 0.2.1. Veja [Ajuda de campos e tipos](ajuda.md) para caminhos, coleções, formato JSON e canais de saída.

## Configuração

Campos obrigatórios: `cnpj` (14 dígitos), `uf`, `modelo` (55/65), `ambiente` (1 produção, 2 homologação). Certificado A1: `certificado: { pfx: Uint8Array, senha: string }` ou `{ arquivo: string, senha: string }`. NFC-e requer `csc: { id: string, valor: string }` para os recursos que dependem do CSC.

`timeoutMs` tem padrão/máximo de 120.000 ms; `limiteFila` tem padrão 32. `runtimeDirectory` seleciona um runtime próprio cujo contrato deve coincidir com o cliente. Cada operação aceita `{ signal: AbortSignal }` como último argumento. `fechar()` cancela a fila, encerra e aguarda o processo em execução.

Com `limiteFila: 0`, uma operação pode executar e chamadas concorrentes recebem
`FILA_CHEIA`. Após o `await` dessa operação, a fila já está disponível para a
próxima chamada; isso também vale quando a operação termina com erro, salvo
quando o emissor foi fechado ou o encerramento do motor não foi confirmado.

## Operações

| Método | Entrada |
| --- | --- |
| `gerarXml` | Objeto TNFe/TNFeInput com nomes ACBr |
| `assinar`, `validar`, `transmitir` | XML UTF-8 como string |
| `consultar` | `{ chave, recibo? }` |
| `recuperarXml` | XML UTF-8 de uma única NFe 4.00 já assinada; faz uma consulta externa pela chave do XML |
| `cancelar` | `{ chave, protocolo, justificativa }` |
| `cartaCorrecao` | `{ chave, correcao, sequenciaEvento? }`; modelo 55 |
| `inutilizar` | `{ ano, serie, numeroInicial, numeroFinal, justificativa }`; ano com 2 dígitos |

A resposta `ResultadoFiscal` contém `sucesso`, `estado`, revisão/hash do contrato e, quando disponíveis, `cStat`, `xMotivo`, `chave`, `protocolo`, `recibo` e `xmlBase64`. `sucesso` deve ser conferido antes de usar o resultado. XML é devolvido em base64 para preservar os bytes UTF-8.

Rejeições fiscais e recibos pendentes são resultados, sem retry automático. Falhas no supervisor lançam `ErroAcbrNode` com `codigo` e `resultadoDesconhecido`. Em falha/timeout de uma operação que pode ter iniciado envio, consulte a situação fiscal antes de decidir uma nova transmissão. O erro de transmissão conserva `xmlBase64` para recuperação.

## Consulta e recuperação do XML

As duas operações têm contratos distintos e não compartilham uma coleção nativa de notas entre chamadas:

| Operação | Entrada e saída |
| --- | --- |
| `consultar({ chave })` | Consulta a situação. `xmlBase64`, quando presente, contém o retorno do serviço (`retConsSitNFe`), não o arquivo original da NFe. O comportamento anterior permanece disponível. |
| `recuperarXml(xmlAssinado, opcoes?)` | Recebe o original assinado e retorna `Promise<ResultadoFiscal>`. Usa uma nova consulta para obter o protocolo e devolver o `nfeProc` completo, somente quando a recuperação foi comprovada. |

O segundo argumento, `opcoes?: OpcoesOperacao`, é opcional: pode ser omitido, como em `emissor.recuperarXml(xmlAssinado)`. `OpcoesOperacao` aceita somente `signal?: AbortSignal`. Para permitir um pedido de cancelamento, passe `{ signal: controlador.signal }`, obtido de um `AbortController`, e chame `controlador.abort()` quando necessário. O sinal solicita o cancelamento da operação do SDK; não cancela a autorização fiscal. A consulta pode já ter sido enviada quando o sinal é acionado.

A operação exige A1 para a consulta e XML de uma única NFe 4.00, sem envelope, DTD ou entidades externas. A chave é derivada do documento, não de um parâmetro separado. O motor valida o schema e a assinatura da NFe de entrada antes da consulta e confere emitente, UF, modelo e ambiente contra a configuração do emissor.

O sucesso exige cumulativamente `sucesso=true`, `estado='XML_RECUPERADO'`, `cStat=100` e `xmlBase64` contendo o processo completo. O protocolo deve ter 15 dígitos, pertencer à mesma chave e ambiente e vir da resposta desta consulta. O `digVal` do protocolo é obrigatório e precisa ser exatamente igual ao `DigestValue` da referência assinada da NFe verificada; a comparação de base64 diferencia maiúsculas de minúsculas. O motor preserva o corpo da NFe e sua assinatura original, compõe com o protocolo recebido, valida o schema do processo resultante e verifica novamente a assinatura da NFe. Não reconstrói um protocolo a partir apenas dos campos escalares.

Na versão 0.2.0, um `protNFe` com assinatura XMLDSig (`ds:Signature`) é recusado com `RECUPERACAO_NAO_COMPROVADA`, sem `xmlBase64` ou `protocolo`, independentemente da validade dessa assinatura e mesmo quando o status é `100`. O verificador disponível nesta versão não comprova de forma independente essa assinatura adicional da SEFAZ; mudanças no contexto de namespaces do envelope também podem afetar a canonicalização. A operação não oferece preservação ou verificação de uma assinatura do protocolo. A assinatura original da NFe é preservada e verificada antes e depois da composição. Os protocolos aceitos mantêm os dados da resposta real e exigem a correlação por `digVal` descrita acima.

Para status diferente de `100`, inclusive `150` e `217`, a nova operação devolve `sucesso=false`, estado `CONSULTADO`, código `RECUPERACAO_NAO_COMPROVADA` e o `cStat`/motivo recebido, sem `protocolo` ou `xmlBase64` de recuperação. Uma resposta `100` incompleta ou divergente também falha, sem XML ou protocolo, com o diagnóstico correspondente: divergências de chave, ambiente ou digest usam `IDENTIDADE_DIVERGENTE`; falhas de schema usam `XML_SCHEMA_INVALIDO`. Isso não altera os estados e resultados de `consultar`, inclusive seu tratamento anterior de `150`. O diagnóstico sanitizado de uma recuperação concluída usa `XML_RECUPERADO` e explica que a autorização foi consultada, sem nova transmissão.

Essa consulta é uma operação de rede. `envioIniciado=false` informa que não se iniciou transmissão de nota ou evento; não informa que a operação foi offline. A recuperação não chama `assinar`, `transmitir`, eventos ou inutilização, não tenta emitir novamente e não persiste nem substitui arquivos fiscais. A aplicação decide onde salvar os bytes devolvidos e deve preservar o arquivo assinado original. O exemplo em [examples/recuperar-xml.mjs](examples/recuperar-xml.mjs) deixa essa gravação para o chamador e não inicia consulta ao ser importado.

Use SDK e runtime compatíveis; o SDK 0.2.2 utiliza os runtimes 0.2.1. Para essa operação, o manifesto precisa incluir `capabilities: ['recuperarXml']`, além dos demais campos e hashes. Um motor sem essa capacidade é recusado com `RUNTIME_SEM_CAPACIDADE` antes de iniciar o processo; não basta reaproveitar um binário antigo com o mesmo contrato dos modelos. A adição mantém a versão 1 do protocolo JSONL e não muda `consultar`.

`validar(xml)` continua recebendo uma NFe sem envelope. Para verificar um `nfeProc` recebido ou salvo pela aplicação, use seu schema de processo (`procNFe_v4.00.xsd`), não `validar(nfeProc)`. Na recuperação, a validação do processo e a conferência da assinatura original da NFe já são responsabilidade do motor, com a limitação sobre assinatura adicional do protocolo descrita acima.

## Feedback seguro para o usuário

Os resultados incluem `diagnostico`, com `codigo`, `etapa`, `mensagem`, `acao`,
`statusEnvio` e, quando disponíveis, `campo` e `cStat`. Também estão disponíveis
os helpers `diagnosticarErro(erro)` e `diagnosticarResultado(resultado, comando)`.
Use esse resumo nas interfaces e nos logs. Ele não copia XML, identidade fiscal,
caminhos, senha, `xMotivo`, stderr, stack ou causa bruta.

```ts
import { TNFe, diagnosticarErro, diagnosticarResultado } from 'cosmemilton-acbr-node';

try {
  const resultado = await emissor.gerarXml(new TNFe(dados));
  const d = resultado.diagnostico ?? diagnosticarResultado(resultado, 'gerarXml');
  mostrarAoUsuario(d); // Apresente mensagem, campo, ação e statusEnvio.
} catch (erro) {
  mostrarAoUsuario(diagnosticarErro(erro)); // Não registre o erro bruto.
}
```

As validações dos modelos continuam lançando uma subclasse de `TypeError`
(`ErroValidacaoModelo`). Por exemplo, uma data com fuso em `TNFe.Ide.dEmi`
informa `DATA_HORA_INVALIDA`, o campo e a orientação de usar a data/hora civil
da UF em `AAAA-MM-DDTHH:mm:ss`, sem `Z` ou offset. Nenhum valor informado é
incluído no diagnóstico. Uma chave desconhecida aponta o grupo conhecido,
evitando registrar chaves que possam conter dados privados.

`statusEnvio` refere-se à operação atual:

| Status | Significado |
| --- | --- |
| `nao_enviado` | Etapa local confirmada ou falha comprovadamente anterior ao envio desta operação. Não prova ausência de envios anteriores. |
| `rejeitado` | Resultado fiscal de rejeição ou denegação; confira `cStat` e a orientação. |
| `autorizado` | Autorização confirmada com identidade/protocolo; em eventos, a mensagem identifica cancelamento, registro ou inutilização. |
| `resultado_incerto` | Resultado pendente, evidência incompleta/contraditória ou interrupção após possível envio. Consulte antes de repetir. |

Os campos e os estados anteriores da API permanecem disponíveis. O XML de
recuperação de `ErroAcbrNode` ainda pode ser lido explicitamente em `xmlBase64`,
mas não é enumerável; `JSON.stringify(erro)` devolve apenas o diagnóstico
sanitizado. `cause` contém somente código, etapa e campo conhecidos. Nenhum
helper retransmite ou altera o resultado fiscal.

O encerramento de um filho fiscal iniciado aguarda `close` por até 1000 ms após
o pedido de parada. Se `kill` falha ou o filho não confirma o encerramento, a
operação termina com seu erro original e um aviso adicional em
`diagnostico.limpeza`, com código `ENCERRAMENTO_MOTOR_NAO_CONFIRMADO` e etapa
`limpeza`. O supervisor libera somente os pipes e handles desse filho,
bloqueia a fila e novas operações do emissor e não afirma que o processo
terminou. Encerre a aplicação antes de iniciar outro motor; se havia envio
possível, consulte a situação fiscal antes de repetir. Chamadas concorrentes
de `fechar()` aguardam o mesmo encerramento limitado. O watcher nativo
acompanha o processo pai e encerra o filho quando o pai termina.

## Processo auxiliar

Protocolo JSONL versão 1 em stdin/stdout. Certificado e senha são enviados pelas pipes, nunca como argumentos. O ambiente herdado é restrito a variáveis de sistema; stderr bruto não é apresentado como erro público. Limites de mensagem, timeout, checks de hash e validações de identidade protegem a comunicação. O processo acompanha o PID do pai e termina quando o pai encerra.

Cada pedido tem `id`, `versao`, `sourceRevision`, `contractHash`, `comando`, `config` e parâmetros da operação. Antes de enviar uma operação com efeitos fiscais, o motor escreve `{ tipo: "envioIniciado", id }`. A resposta final precisa repetir identidade e contrato. O supervisor aguarda o fechamento do processo antes de liberar a próxima operação.

TLS usa OpenSSL com verificação de cadeia, validade, finalidade e hostname antes de enviar bytes de aplicação. No Linux usa as CAs do sistema; no Windows exporta raízes públicas confiáveis para um bundle temporário. Esta versão não implementa consulta de revogação CRL/OCSP.
