# API e protocolo

`criarEmissor` retorna operações assíncronas; cada chamada inicia um processo fiscal isolado. Uma instância processa uma operação por vez, com fila limitada. Emitentes diferentes não compartilham o componente Pascal.

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
| `cancelar` | `{ chave, protocolo, justificativa }` |
| `cartaCorrecao` | `{ chave, correcao, sequenciaEvento? }`; modelo 55 |
| `inutilizar` | `{ ano, serie, numeroInicial, numeroFinal, justificativa }`; ano com 2 dígitos |

A resposta `ResultadoFiscal` contém `sucesso`, `estado`, revisão/hash do contrato e, quando disponíveis, `cStat`, `xMotivo`, `chave`, `protocolo`, `recibo` e `xmlBase64`. `sucesso` deve ser conferido antes de usar o resultado. XML é devolvido em base64 para preservar os bytes UTF-8.

Rejeições fiscais e recibos pendentes são resultados, sem retry automático. Falhas no supervisor lançam `ErroAcbrNode` com `codigo` e `resultadoDesconhecido`. Em falha/timeout de uma operação que pode ter iniciado envio, consulte a situação fiscal antes de decidir uma nova transmissão. O erro de transmissão conserva `xmlBase64` para recuperação.

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
