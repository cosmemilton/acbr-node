# Validação e preparação npm

Os workflows são acionados manualmente. Não publicam no npm e não transmitem à SEFAZ. A revisão ACBr é entrada explícita, registrada no lock e nos manifestos. Os testes fiscais usam respostas locais simuladas e certificados sintéticos; a homologação fiscal continua separada.

## Linux

`validate-linux.yml` usa Ubuntu24.04, Node24 e pacotes livres FPC3.2.2/Lazarus3.0. Gera e compila o cliente/motor, verifica hashes, executa testes e instala tarballs em consumidor externo ao repositório. A revisão própria desse consumidor é outra entrada. O diretório padrão fica em `~/.acbr-node-validation/consumer-REV`; uma pasta já existente precisa ser preservada e outro `--directory` selecionado.

## Windows

`validate-windows.yml` primeiro compila OpenSSL/libxml2 no Ubuntu com MinGW, usando arquivos oficiais fixados por SHA256 em `build-native-deps.mjs`. Transfere DLLs, notices e proveniência como artifact. O segundo job usa um runner próprio Windows x64 com label `acbr-toolchain`; a preparação do runner é manual e ainda precisa ser validada ao instalar esse workflow no repositório remoto.

Instale Free Pascal3.2.2 x64 e Lazarus com LCL/LazUtils compilados pelo [download oficial Free Pascal](https://www.freepascal.org/download.html) e pelos [downloads oficiais Lazarus](https://www.lazarus-ide.org/index.php?page=downloads). Instale SVN e tar no PATH do runner. O Windows moderno oferece `tar.exe`; confira antes do job. As ferramentas e o compilador são gratuitos. Nenhum instalador é baixado por URL não verificada e nenhuma action de terceiros configura Pascal.

Configure as variáveis do repositório `FPC_ROOT` (raiz da instalação3.2.2, contendo `bin/x86_64-win64/ppcx64.exe` e `fpcmkcfg.exe`) e `LAZARUS_ROOT` (raiz contendo `components/lazutils`, `lcl/units` e as unidades x64). A instalação deve conter RTL/FCL, unidades de rede e fontes/licenças. A receita Windows local foi validada com FPC3.2.2/Lazarus4.8; Linux com Lazarus3.0.

`prepare-windows-build.ps1` cria um `fpc.cfg` exclusivo em `.acbr/fpc/windows`, define `PPC_CONFIG_PATH` e escreve `acbr.ci.windows.config.json`. A configuração original e a instalação do compilador são preservadas. Para executar a mesma preparação localmente, com as dependências já compiladas:

```powershell
$env:FPC_ROOT = 'C:\Ferramentas\lazarus\fpc\3.2.2'
$env:LAZARUS_ROOT = 'C:\Ferramentas\lazarus'
./scripts/prepare-windows-build.ps1 -Revision 48590
npm ci --omit=optional
npm run build:cli
node dist/cli.js --config acbr.ci.windows.config.json source update --revision 48590
node dist/cli.js --config acbr.ci.windows.config.json generate
npm run build
node dist/cli.js --config acbr.ci.windows.config.json build
node dist/cli.js --config acbr.ci.windows.config.json check
```

## Gate de publicação

Depois de validar os dois sistemas, use `npm run build`, `node scripts/pack-runtimes.mjs --all` e `node scripts/publish-artifacts.mjs`. O último comando prepara os três tarballs e executa somente `npm publish --dry-run`. Confere hashes dos três arquivos gerados e de cada arquivo runtime, revisão/contrato, fontes do motor correspondentes ao pacote principal, licenças, schemas, proveniência das DLLs e ausência de arquivos pessoais no pacote principal. Recusa binários de teste e arquivos fora do manifesto. Todos os pacotes são auditados e empacotados antes da primeira operação de publicação.

A publicação exige autenticação npm válida e a opção explícita `--publish`. A autenticação é conferida antes do primeiro pacote. Publique primeiro os dois runtimes e depois o pacote principal; o script mantém essa ordem. Nunca coloque token npm no repositório, configuração de build ou tarballs. Os artifacts de Linux e Windows continuam sujeitos à mesma auditoria local antes de publicar uma versão conjunta.
