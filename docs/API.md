# API e protocolo

`criarEmissor` retorna operações assíncronas; cada chamada inicia um processo fiscal isolado. Uma instância processa uma operação por vez, com fila limitada. Emitentes diferentes não compartilham o componente Pascal.

## Configuração

Campos obrigatórios: `cnpj` (14 dígitos), `uf`, `modelo` (55/65), `ambiente` (1 produção, 2 homologação). Certificado A1: `certificado: { pfx: Uint8Array, senha: string }` ou `{ arquivo: string, senha: string }`. NFC-e requer `csc: { id: string, valor: string }` para os recursos que dependem do CSC.

`timeoutMs` tem padrão/máximo de 120.000 ms; `limiteFila` tem padrão 32. `runtimeDirectory` seleciona um runtime próprio cujo contrato deve coincidir com o cliente. Cada operação aceita `{ signal: AbortSignal }` como último argumento. `fechar()` cancela a fila, encerra e aguarda o processo em execução.

## Operações

| Método | Entrada |
| --- | --- |
| `gerarXml` | Objeto TNFe/TNFeInput com nomes ACBr |
| `assinar`, `validar`, `transmitir` | XML UTF-8 como string |
| `consultar` | `{ chave, recibo? }` |
| `cancelar` | `{ chave, protocolo, justificativa }` |
| `cartaCorrecao` | `{ chave, correcao, sequenciaEvento? }`; modelo 55 |
| `inutilizar` | `{ ano, serie, numeroInicial, numeroFinal, justificativa }`; ano com 2 dígitos |

A resposta `ResultadoFiscal` contém `sucesso`, `estado`, revisão/hash do contrato e, quando disponíveis, `cStat`, `xMotivo`, `chave`, `protocolo`, `recibo` e `xmlBase64`. `sucesso` deve ser conferido antes de usar o resultado. XML é devolvido em base64 para preservar os bytes UTF-8.

Rejeições fiscais e recibos pendentes são resultados, sem retry automático. Falhas no supervisor lançam `ErroAcbrNode` com `codigo` e `resultadoDesconhecido`. Em falha/timeout de uma operação que pode ter iniciado envio, consulte a situação fiscal antes de decidir uma nova transmissão. O erro de transmissão conserva `xmlBase64` para recuperação.

## Processo auxiliar

Protocolo JSONL versão 1 em stdin/stdout. Certificado e senha são enviados pelas pipes, nunca como argumentos. O ambiente herdado é restrito a variáveis de sistema; stderr bruto não é apresentado como erro público. Limites de mensagem, timeout, checks de hash e validações de identidade protegem a comunicação. O processo acompanha o PID do pai e termina quando o pai encerra.

Cada pedido tem `id`, `versao`, `sourceRevision`, `contractHash`, `comando`, `config` e parâmetros da operação. Antes de enviar uma operação com efeitos fiscais, o motor escreve `{ tipo: "envioIniciado", id }`. A resposta final precisa repetir identidade e contrato. O supervisor aguarda o fechamento do processo antes de liberar a próxima operação.

TLS usa OpenSSL com verificação de cadeia, validade, finalidade e hostname antes de enviar bytes de aplicação. No Linux usa as CAs do sistema; no Windows exporta raízes públicas confiáveis para um bundle temporário. Esta versão não implementa consulta de revogação CRL/OCSP.
