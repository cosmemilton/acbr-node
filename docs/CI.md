# Validação e preparação npm

Os workflows de validação são acionados manualmente e não publicam no npm. O workflow `publish.yml` publica os tarballs revisados quando há um push na branch `release`; o acionamento manual também exige essa branch. Nenhum workflow transmite à SEFAZ. A revisão ACBr é entrada explícita, registrada no lock e nos manifestos. Os testes fiscais usam respostas locais simuladas e certificados sintéticos; a homologação fiscal continua separada.

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

## Publicação automática de artefatos revisados

A publicação npm foi autorizada pelo usuário em **09/10/2026**. O workflow `.github/workflows/publish.yml` usa o secret GitHub `NPM_TOKEN` somente no passo de publicação. O token precisa permitir publicação pública dos três pacotes. Seu valor não pertence ao repositório, aos manifests ou aos tarballs.

A automação publica os artefatos prontos; a compilação dos motores e a revisão dos testes acontecem antes de preparar uma nova versão. Depois das validações Linux/Windows e da autorização para publicar, prepare e fixe os hashes:

```bash
npm run release:prepare
node scripts/prepare-npm-release.mjs --authorized-on AAAA-MM-DD
node scripts/npm-release-bundle.mjs --dry-run .acbr/release-artifacts
```

Envie os três `.tgz`, `SHA256SUMS` e `VALIDATION.json` de `.acbr/release-artifacts` para `https://miltonjunior.dev.br/acbr-node/releases/<versão>/`. Preserve esses assets por versão. Versione somente `.github/npm-release.json` e os documentos em `release/<versão>/`; os binários não vão para o git. Depois envie a alteração revisada à branch `release`.

O runner usa HTTPS com verificação de certificado/hostname e recusa redirecionamentos. Confere os downloads contra hashes fixados no git, lê os metadados npm dos tarballs, audita inventários/fontes/licenças e executa um dry run antes de disponibilizar o token ao passo de publicação npm. Não recompila os motores nesse processo.

A ordem é Linux, Windows e SDK. Antes de publicar qualquer pacote ausente, o script compara os hashes npm de todas as versões que já existem. Uma reexecução pula somente tarballs idênticos e continua uma publicação parcial. Qualquer versão existente com conteúdo diferente interrompe a operação; publique uma nova versão depois de revisar a diferença. A fila de workflows impede duas publicações simultâneas.

O npm também pode manter uma versão em staging, aguardando aprovação com 2FA. Antes de enviar qualquer pacote, a automação consulta os estágios dos três nomes, verifica identidade, versão, tag `latest` e SHA-1 e baixa os tarballs pendentes em diretórios temporários para conferir os bytes contra os aprovados. Uma versão pendente idêntica é preservada e não é enviada novamente. Um conflito interrompe a execução antes de novas publicações. Quando o npm recusa publicação direta com `E_STAGE_REQUIRED`, a automação envia somente o mesmo tarball aprovado para staging.

O resultado `awaiting-2fa` indica que a versão ainda não está disponível para instalação. O resumo do workflow e o artifact `npm-publication-result` registram os identificadores e os hashes conferidos. O mantenedor deve aprovar os estágios em `npmjs.com`, na aba **Staged Packages**, ou executar `npm stage approve <identificador>` em uma sessão npm local autenticada. Essa confirmação com 2FA é exigida pelo npm; o workflow não altera a política de publicação ou autenticação. Aprove primeiro os runtimes Linux/Windows e depois o SDK, e reexecute o workflow para confirmar os hashes públicos dos três pacotes. [Fluxo oficial de staging npm](https://docs.npmjs.com/staged-publishing/).
