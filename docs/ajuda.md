# Ajuda de campos e tipos

A ajuda consulta o contrato ACBr incluído no SDK Node. Ela funciona sem
runtime instalado, certificado A1 ou acesso à rede e não executa o motor.
Os exemplos abaixo consultam metadados, sem iniciar operações fiscais.

## Versão e comandos

O SDK **0.2.2** acrescenta `describe`, `--version` e ajuda por subcomando.
Ele utiliza os runtimes **0.2.1**. A mudança de ajuda pertence ao SDK;
não exige recompilação ou nova versão do motor.

Com o pacote instalado no projeto:

```console
npx acbr-node --version
npx acbr-node --help
npx acbr-node describe --help
npx acbr-node describe Ide.tpNF
npx acbr-node describe TTipoNFe
npx acbr-node describe TTipoNFe --json
```

`--version` mostra `acbr-node 0.2.2` nesta versão. `-V` é um alias;
`--version --json` retorna `{ "version": "0.2.2" }`. `--help` e `-h`
mostram a ajuda global ou a ajuda do subcomando selecionado:

```console
npx acbr-node init --help
npx acbr-node source --help
npx acbr-node source update --help
npx acbr-node generate --help
npx acbr-node build --help
npx acbr-node check --help
npx acbr-node doctor --help
```

Essas consultas de uso não executam a operação descrita. Para garantir que
uma consulta permaneça offline, use a CLI já instalada. `npx` pode buscar o
pacote pela rede quando ele não está instalado no projeto. No checkout,
depois do build TypeScript, os mesmos comandos podem ser executados com
`node dist/cli.js` no lugar de `npx acbr-node`.

## Campo e tipo

`describe TARGET` mostra texto em português. Um TARGET pode ser um caminho
de campo, como `Ide.tpNF`, ou um nome de tipo do contrato, como `TTipoNFe`.
Sem TARGET, `describe` consulta a raiz `TNFe`.

O campo `Ide.tpNF` resolve para `TNFe.Ide.tpNF`, de tipo `TTipoNFe`, e
apresenta os valores `tnEntrada` e `tnSaida`. Seu padrão declarado no
Pascal é `tnSaida`. A consulta direta ao tipo apresenta os mesmos valores,
sem atribuir a ele o padrão ou a condição de somente leitura de um campo.
Nomes, valores e padrões são lidos exclusivamente do contrato gerado.

```console
npx acbr-node describe TNFe.Ide.tpNF
npx acbr-node describe TProd
npx acbr-node describe TDetCollection
npx acbr-node describe
```

A ajuda não converte os nomes do enum em códigos XML ou fiscais, nem
determina qual valor usar na operação. O padrão declarado é um metadado
Pascal, não uma garantia sobre o construtor nativo ou sobre as regras
fiscais. A consulta não preenche campos de uma nota.

## Caminhos e coleções

Os nomes de campos e tipos distinguem maiúsculas de minúsculas. O prefixo
`TNFe.` é opcional nos caminhos de campos. Um nome curto, como `tpNF`, é
aceito quando identifica um único caminho; `CST` é ambíguo e pede um
caminho completo.

```console
npx acbr-node describe tpNF
npx acbr-node describe Det
npx acbr-node describe 'Det[].Prod.vProd'
npx acbr-node describe 'Det[0].Prod.vProd'
npx acbr-node describe 'Det[].Imposto.PIS.CST' --json
```

`Det` descreve a coleção e seu tipo de item. `[]` seleciona o tipo do
elemento para percorrer uma coleção. Índices numéricos não negativos,
como `[0]`, são normalizados para `[]` no resultado: a consulta não lê uma
nota nem verifica quantos itens ela contém. `Det.Imposto` exige seleção
de coleção, e `Ide[]` é recusado porque `Ide` não é uma coleção.

Objetos listam seus campos, tipos e indicadores de somente leitura.
Listas informam o tipo de item; enums mostram os nomes textuais aceitos.
Limites numéricos e escala aparecem quando declarados para o campo.
Esses caminhos pertencem ao modelo de entrada do SDK, não são XPath/XML.
Por exemplo, o campo é `Ide.dEmi`; `Ide.dhEmi` não existe no contrato.

## JSON e compatibilidade

Use `--json` para obter um objeto estruturado, inclusive para automação:

```console
npx acbr-node describe Ide.tpNF --json
npx acbr-node describe TTipoNFe --json
npx acbr-node describe Ide.tpNF --json > campo.json
```

O JSON de campo conserva o formato anterior de `help TAG`: inclui
`formatVersion`, `sdkVersion`, `sourceRevision`, `sourceHash`,
`contractHash`, `root`, `path`, `kind`, `pascalType`, `inputType` e
`readonly`. Conforme o campo, inclui também `typeReference`, `values`,
`declaredDefault`, `constraints`, `itemType` ou `members`.

O JSON de tipo usa `name` para identificar o tipo, além da proveniência,
de `kind`, `pascalType` e `inputType`. Conforme o tipo, inclui `values`,
`itemType` ou `members`. Não inclui `path`, `readonly` ou `declaredDefault`
de um campo. `inputType` descreve o transporte JSON; decimais, por
exemplo, são strings.

O comando legado permanece disponível com seu comportamento e formato:

```console
npx acbr-node help TAG Ide.tpNF
npx acbr-node help TAG 'Det[].Imposto.PIS.CST' --json
npx acbr-node help TAG --help
```

`help TAG` exige um caminho e não passa a aceitar nomes de tipos como
`TTipoNFe`. `help` e `TAG` continuam aceitando variação de maiúsculas e
minúsculas nesse comando. Os aliases de campos e índices anteriores
também continuam válidos. Use `describe` para consultar tipos.

## Canais e códigos de saída

| Consulta | Sucesso | Erro de consulta ou uso |
| --- | --- | --- |
| `describe TARGET` | Texto em stdout, saída 0 | Mensagem em stderr, saída 1; stdout vazio |
| `describe TARGET --json` | Objeto JSON em stdout, saída 0 | Objeto JSON em stderr, saída 1; stdout vazio |
| `help TAG caminho [--json]` | Texto ou JSON em stdout, saída 0 | Texto ou JSON em stderr, saída 1; stdout vazio |
| `--help` ou `--version` | Texto em stdout, saída 0 | Não iniciam consulta fiscal nem execução do motor |

Erros JSON usam o envelope `{ "ok": false, "error": { "code": "...", "message": "..." } }`,
com detalhes conhecidos quando disponíveis. Exemplos de códigos:
`CAMPO_AMBIGUO`, `CAMPO_INEXISTENTE`, `CAMPO_NAO_COLECAO`,
`COLECAO_REQUER_INDICE` e `USO_INVALIDO`.

O comando consulta `dist/contract.json`, `package.json` e `acbr.lock.json`
da própria instalação e confere seus vínculos com o validador gerado.
Não lê a configuração do consumidor. `--config` e `--revision` não se
aplicam a `describe` ou `help TAG`. Metadados ausentes, inválidos ou
incompatíveis são recusados em vez de produzir uma descrição presumida.

Esses metadados não substituem validação de documento, schema,
obrigatoriedade ou orientação tributária. Para operações fiscais, veja a
[API e protocolo](API.md); para acompanhar uma revisão própria do ACBr,
veja o [fluxo de fontes, contrato e build](CLI.md).
