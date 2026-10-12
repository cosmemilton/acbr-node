# Fontes, contrato e build

## Help de tipos e campos — implementação de desenvolvimento

O help TAG faz parte da release 0.1.2. A documentação pública só anuncia disponibilidade após a confirmação dessa versão no registry npm.

```sh
node dist/cli.js help TAG Ide.tpNF
node dist/cli.js help TAG 'Det[].Imposto.PIS.CST' --json
node dist/cli.js help TAG 'TNFe.Det[0].Prod.DI[].adi[2].nAdicao' --json
```

`Ide.tpNF` resolve para `TTipoNFe` e apresenta `tnEntrada` e `tnSaida`. O caminho PIS resolve para `TCSTPis`, com seus valores textuais, incluindo `pis99`. Os valores são obtidos do contrato gerado; não há catálogo de enums mantido manualmente.

O prefixo `TNFe.` é opcional. Os nomes dos campos respeitam maiúsculas e minúsculas; `TAG` aceita ambas. `[]` consulta o tipo do elemento de uma coleção. Um índice não negativo, como `[0]`, é normalizado para `[]`: a consulta não lê uma nota nem confere a quantidade de itens. Um nome curto só é aceito quando identifica um caminho único; `CST` retorna `CAMPO_AMBIGUO` com os caminhos possíveis. `Det.Imposto` pede um seletor de coleção, enquanto `Ide[]` é recusado por não ser coleção.

O help lê somente `dist/contract.json`, `package.json` e `acbr.lock.json` da própria instalação. Não consulta configuração do consumidor, runtime, certificado, SVN ou rede e funciona sem dependências opcionais. `--config` e `--revision` não se aplicam a esse comando. Saída JSON contém versão do SDK, revisão ACBr, hashes, caminho canônico, tipo, referências, valores, limites do tipo e indicação de somente leitura. Erros JSON vão para `stderr`, com código de saída 1; uma consulta válida termina com 0.

Os caminhos pertencem ao modelo de entrada do SDK, não são XPath/XML. Por exemplo, o modelo usa `Ide.dEmi`; `Ide.dhEmi` é inexistente. `declaredDefault` é a declaração Pascal, não uma garantia sobre o construtor nativo. Limites primitivos, enums e campos opcionais do TypeScript não substituem regras fiscais, códigos XML, obrigatoriedade ou orientação tributária.

`generate` também emite `generated/acbr/contract.json` a partir do mesmo IR usado pelo validador. O build confere o hash e o lock e distribui esses metadados em `dist/contract.json`, separados dos três arquivos gerados que vinculam o motor.

`init` cria a configuração e copia os fontes do motor e extractor distribuídos no pacote para o projeto do consumidor, preservando arquivos existentes. O CLI usa `acbr.config.json`. Todos os caminhos relativos são resolvidos pelo diretório desse arquivo, independentemente do diretório atual do terminal. Campos desconhecidos, revisão inválida ou outra origem SVN são rejeitados.

```sh
acbr-node init
acbr-node source update
acbr-node generate
acbr-node build
acbr-node check
acbr-node doctor
```

`source update` é a única operação que busca alterações do SVN. Primeiro resolve `HEAD` para um número, exporta `Fontes`, schemas NF-e e licença para uma área temporária e registra a revisão e SHA256 de cada arquivo em `acbr.lock.json`. Se já houver fontes, precisa de um lock válido e recusa arquivos alterados, adicionados ou removidos. A geração, compilação e execução não atualizam fontes automaticamente.

`source update` sem `--revision` consulta a revisão mais recente (`HEAD`), mesmo quando a configuração registra uma revisão anterior. `source update --revision 48590` seleciona explicitamente uma revisão. Após download e lock bem-sucedidos, o CLI persiste a revisão numérica resolvida na configuração, preservando os caminhos e demais campos. Falhas restauram fontes e lock; nenhuma atualização acontece na execução normal. Um export previamente obtido e conferido pelo operador pode ser registrado com `source lock --revision 48590`; esse comando confia na origem declarada pelo operador e calcula os hashes locais, sem comparar o conteúdo com o SVN remoto.

`generate` recria os tipos em `generated/acbr/models.ts`, o mapper Pascal em `native/generated/AcbrModels.pas` e os manifestos/relatórios em `.acbr/generated`. Revise o relatório após cada atualização para detectar campos novos, removidos, enums e partes que o gerador não suporta.

`build` confere fontes/contrato antes de invocar o Free Pascal. Usa os defines `NOGUI` e `NOREPORT`, unidades Lazarus sem interface gráfica, ACBr original e mapper gerado. Linux x64 e Windows x64 são os alvos iniciais. A compilação precisa ocorrer no sistema do alvo; não há cross-compilation implícita.

No Linux, instale Free Pascal 3.2.2, Lazarus 3.0, SVN, OpenSSL 3, libxml2, tar/gzip e certificados CA do sistema. `native.lazarusRoot` ou `LAZARUS_ROOT` podem indicar outra instalação. O staging copia OpenSSL/libxml2 e suas dependências transitivas como bibliotecas dinâmicas com suas licenças e origem/versionamento dos pacotes fonte. Inclui o provider legacy e configuração de providers OpenSSL. glibc e o loader permanecem requisitos do sistema. O Linux usa glibc: o runtime não equivale a um binário portátil para qualquer distribuição ou Alpine.

No Windows, configure `native.lazarusRoot`, `native.fpc`, `native.providerFiles` (incluindo `legacy.dll`) e `native.libraryFiles` para as DLLs x64 de TLS/XML. Cada DLL exige um arquivo de licença adjacente `<DLL>.LICENSE`; `<DLL>.SOURCE.json` registra opcionalmente origem e versão do código correspondente e é incluído na proveniência do runtime. As dependências também podem ser compiladas no WSL com MinGW, conforme [Dependências nativas](DEPENDENCIAS-NATIVAS.md). O motor Pascal é compilado no Windows pelo CLI; a compilação não substitui a homologação fiscal. A [receita de CI](CI.md) documenta instalação oficial gratuita, `FPC_ROOT`/`LAZARUS_ROOT` e criação de um `fpc.cfg` exclusivo com `PPC_CONFIG_PATH`, sem alterar a instalação do compilador.

No Windows, execute comandos `npm` em uma pasta local, por exemplo `C:\Projetos\MinhaAplicacao`. O launcher `npm.cmd` usa `cmd.exe`, que não mantém um caminho UNC como diretório atual. Para trabalhar com um checkout WSL acessado por `\\wsl.localhost\...`, execute a CLI por `node caminho\dist\cli.js` e, quando necessário, invoque `npm-cli.js` diretamente por Node, indicando o caminho da instalação. Na compilação Pascal, fontes em uma pasta Windows local evitam o custo de leitura por UNC; `source.directory` pode apontar para essa cópia e o lock confere os mesmos hashes.

O runtime fica em `.acbr/runtime/<platform>-<arch>`, contendo executável, bibliotecas dinâmicas, schemas, serviços NF-e, licenças, fontes correspondentes e `manifest.json`. O manifesto registra revisão ACBr, contrato, plataforma e SHA256 de cada arquivo. `check` verifica todos esses vínculos e arquivos e depois inicia o motor real em quatro probes locais: gera uma NF-e55 sintética para conferir mapper/chave/UTF-8, valida uma fixture XML assinada com certificado público sintético e recusa XML malformado e DTD/entidade externa. O smoke não recebe PFX, chave privada ou senha e não transmite documentos; `--json` inclui `offlineChecks`. A fixture assinada fica embutida no CLI, pois o schema exige `Signature` e o XML gerado sem A1 ainda não é assinado. O builder confere SHA256 dos três arquivos gerados antes e depois da compilação; uma alteração de mapper/helper invalida o build mesmo quando o hash do contrato permanece igual. O staging inclui notices FPC (GPL do compilador, LGPL e exceção da RTL), Lazarus e das bibliotecas dinâmicas, além da proveniência das cópias usadas. `doctor` informa ferramentas e dependências encontradas; ele não instala ferramentas nem transmite documentos.

Atualizações concorrentes são recusadas com `acbr.lock.json.operation`. Se um processo encerrar abruptamente, confira o PID registrado antes de remover o marcador. Uma alteração de revisão durante a compilação invalida o resultado. O log FPC completo fica em `.acbr/build.log`.

Use `--config caminho` para escolher a configuração e `--json` para obter saída estruturada. Nunca inclua senhas ou certificados nesse arquivo de build: a API recebe essas credenciais separadamente em memória.
