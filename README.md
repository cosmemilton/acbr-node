# cosmemilton-acbr-node

NF-e (55) e NFC-e (65) no Node.js, com modelos TypeScript gerados dos fontes públicos do ACBr e motor compilado com Free Pascal/Lazarus. Projeto independente; não é um produto oficial do ACBr. Não depende de Delphi nem dos binários ACBr Pro.

Documentação e exemplos: **[miltonjunior.dev.br/acbr-node](https://miltonjunior.dev.br/acbr-node/)**. Código e problemas: [GitHub](https://github.com/cosmemilton/acbr-node).

Requisitos de execução: Node.js 22.12 ou superior e Linux x64 Ubuntu 24.04/glibc ou Windows x64. A primeira versão usa certificado A1. Compiladores são necessários apenas para reconstruir o motor ou acompanhar uma revisão própria do ACBr.

## Instalação e uso

```bash
npm install cosmemilton-acbr-node
```

O npm instala o runtime opcional da sua plataforma. Não use `--omit=optional` na instalação final. Também é possível informar `runtimeDirectory` para um motor próprio.

Esta documentação descreve a versão 0.2.0, que adiciona `recuperarXml` e mantém o help TAG introduzido na 0.1.2. A disponibilidade da 0.2.0 no npm só é anunciada após a confirmação dessa versão no registry.

Para instalar tarballs revisados em um projeto separado, informe o SDK e o runtime da plataforma:

```bash
npm install --offline --ignore-scripts --no-audit --no-fund \
  /caminho/cosmemilton-acbr-node-0.2.0.tgz \
  /caminho/cosmemilton-acbr-node-linux-x64-0.2.0.tgz
```

No Windows, selecione `cosmemilton-acbr-node-win32-x64-0.2.0.tgz`.

```ts
import { writeFile } from 'node:fs/promises';
import { criarEmissor, TNFe, type TNFeInput } from 'cosmemilton-acbr-node';
import { nota } from './nota.js'; // nota: TNFeInput, com dados fiscais completos
import { lerA1Privado } from './credencial-local.js'; // função da aplicação

// A aplicação lê o PFX e pede a senha de forma oculta, sem argv, env ou logs.
const certificado = await lerA1Privado(); // { pfx: Uint8Array, senha: string }

const emissor = criarEmissor({
  cnpj: '11222333000181',
  uf: 'CE',
  modelo: 55,
  ambiente: 2,
  certificado,
  // Para NFC-e: modelo: 65, csc: { id: '000001', valor: 'seu CSC' }
});

try {
  const gerado = await emissor.gerarXml(new TNFe(nota satisfies TNFeInput));
  if (!gerado.sucesso || !gerado.xmlBase64) throw new Error(gerado.codigo);
  const xml = Buffer.from(gerado.xmlBase64, 'base64').toString('utf8');
  const assinado = await emissor.assinar(xml);
  if (!assinado.sucesso || !assinado.xmlBase64) throw new Error(assinado.codigo);
  const xmlAssinado = Buffer.from(assinado.xmlBase64, 'base64').toString('utf8');
  const validado = await emissor.validar(xmlAssinado);
  if (!validado.sucesso) throw new Error(validado.codigo);
  await writeFile('./nota-assinada.xml', Buffer.from(assinado.xmlBase64, 'base64'));
  // Transmissão explícita: await emissor.transmitir(xmlAssinado).
} finally {
  try { await emissor.fechar(); }
  finally { certificado.pfx.fill(0); certificado.senha = ''; }
}
```

A biblioteca também aceita XML pronto em `assinar`, `validar`, `transmitir` e `recuperarXml`. As operações fiscais incluem `consultar`, `recuperarXml`, `cancelar`, `cartaCorrecao` (somente modelo 55) e `inutilizar`. `lerA1Privado` acima pertence à aplicação, não ao SDK. [API e protocolo](docs/API.md).

## Recuperar o XML autorizado

`consultar({ chave })` continua devolvendo o XML de resposta da consulta em `xmlBase64`, normalmente `retConsSitNFe`. Para obter o processo completo a partir de uma NF-e já assinada e preservada, use `recuperarXml(xmlAssinado, opcoes?)`. O argumento `opcoes` pode ser omitido e aceita somente `signal?: AbortSignal`:

```ts
const controlador = new AbortController();
const opcoes = { signal: controlador.signal };
// A interface pode chamar controlador.abort() para solicitar cancelamento.
const resultado = await emissor.recuperarXml(xmlAssinado, opcoes);
if (resultado.sucesso === true && resultado.estado === 'XML_RECUPERADO'
    && resultado.cStat === 100 && resultado.xmlBase64) {
  const xmlProcessado = Buffer.from(resultado.xmlBase64, 'base64');
  // A aplicação decide onde guardar um arquivo NOVO; o original é preservado.
  await writeFile(arquivoProcessadoPrivado, xmlProcessado, { flag: 'wx', mode: 0o600 });
}
```

O sinal solicita o cancelamento da operação do SDK, sem cancelar a autorização fiscal. A consulta pode já ter sido enviada quando o sinal é acionado. Sem essa opção, chame `emissor.recuperarXml(xmlAssinado)`.

Essa operação faz uma consulta externa pela chave extraída do XML, com A1. O motor confere a assinatura da NFe original, seu schema, sua identidade e seu ambiente; só devolve `nfeProc` depois de confirmar `cStat=100`, protocolo correlacionado e `digVal` presente e exatamente igual ao `DigestValue` assinado. Não assina novamente, não emite, não transmite a nota nem grava arquivos fiscais automaticamente. A NFe e sua assinatura original são preservadas, e essa assinatura é verificada antes e depois da composição do processo; o arquivo original continua sob controle da aplicação.

Limitação da versão 0.2.0: se o `protNFe` recebido contiver uma assinatura XMLDSig (`ds:Signature`), a recuperação é recusada com `RECUPERACAO_NAO_COMPROVADA`, sem `xmlBase64` ou `protocolo`, mesmo com `cStat=100`. Esta versão não oferece verificação independente dessa assinatura adicional da SEFAZ. Nos protocolos aceitos, os dados vêm da resposta real da consulta e a prova por `digVal` continua obrigatória.

Sem digest, com divergência ou com outro status, inclusive `150` e `217`, a recuperação não retorna XML processado nem protocolo. Confira o diagnóstico; não repita nem emita uma nova nota automaticamente para obter o arquivo. `envioIniciado=false` nessa operação não significa ausência de rede: a consulta externa ocorreu sem transmissão de nota ou evento.

Atualize o pacote principal e o runtime da sua plataforma juntos. O manifesto do motor precisa anunciar `capabilities: ['recuperarXml']`; um runtime antigo é recusado com `RUNTIME_SEM_CAPACIDADE` antes de iniciar o processo. Veja o [contrato completo](docs/API.md#consulta-e-recuperação-do-xml) e o [exemplo de integração por arquivo](docs/examples/recuperar-xml.mjs), que não executa nenhuma operação ao ser importado. Os testes usam XML e A1 sintéticos com serviço SOAP local, sem SEFAZ real.

## Modelos e atualizações explícitas

Nomes, grupos e enums espelham o ACBr. Construtores recebem objetos; coleções são arrays tipados e oferecem `New()`. Valores decimais são strings, preservando escala e evitando conversão binária pelo JavaScript. Datas são strings ISO civis, por exemplo `2026-10-08T12:30:00`; o ACBr aplica o fuso da UF na escrita do XML. Campos omitidos preservam os padrões do componente. Assinatura, protocolo e informações suplementares produzidas pelo motor não são entradas editáveis.

A versão 0.2.0 mantém a revisão SVN **48590**, com **204 tipos gerados** e contrato `e5a497cefe8e0e350a30da5cc04e88b35c38a98535893d52f878890260d1346d`. Revisão, inventário e hashes estão em `acbr.lock.json`; cliente e motor recusam contratos diferentes. Não há atualização automática dos fontes ao instalar.

```bash
npx acbr-node init --revision 48590
npx acbr-node source update --revision 48590
npx acbr-node generate
npx acbr-node build
npx acbr-node check
npx acbr-node doctor
```

Use `npx cosmemilton-acbr-node init` sem instalação prévia. O comando `generate` produz `generated/acbr/models.ts` e `generated/acbr/index.ts`, além do carregador Pascal. Em uma aplicação com revisão própria, importe `criarEmissor` de `./generated/acbr/index.js` e indique o diretório do runtime compilado.

O relatório `.acbr/generated/changes.json` registra adições, remoções e alterações de tipos. Tipos desconhecidos interrompem a geração. Breaking changes do ACBr exigem acompanhamento, testes e versionamento do adaptador. TortoiseSVN é opcional; a CLI usa SVN. [Fluxo completo da CLI](docs/CLI.md).

## Reconstrução e validação

```bash
npm install
npm run acbr -- source update --revision 48590
npm run acbr -- generate
npm run acbr -- build
npm run build
npm test
ACBR_NATIVE_TEST=1 npm run test:native
npm run pack:runtimes -- --all
```

Consulte [arquitetura](docs/ARQUITETURA.md), [dependências nativas](docs/DEPENDENCIAS-NATIVAS.md) e [estado da validação](docs/VALIDACAO.md). Os runtimes incluem schemas, serviços, licenças, fontes correspondentes do ACBr e receita de reconstrução. O consumo dos tarballs com runtime não executa Free Pascal, Lazarus ou geração de código.

Linux e Windows passaram **52 testes do motor/TLS/SOAP local em cada plataforma**. TypeScript e build passaram; a suíte Node/CLI/gerador/auditoria passou 32 testes, com quatro suítes nativas opt-in ignoradas nessa execução e verificadas separadamente.

A instalação externa passou em ESM e CommonJS com Node 24.15.0 e 22.12.0 no Linux, e Node 22.12.0 no Windows, dois emitentes sintéticos e modelos 55/65, com compiladores fora do `PATH` e bibliotecas do runtime auditadas. Um consumidor externo completou o fluxo de fontes/geração/build em revisão própria 48589. A geração também foi executada nativamente no Windows, produzindo contrato e arquivos idênticos ao Linux.

Docker e CI remota de reconstrução dos motores não foram executados. A automação de publicação audita os tarballs já validados. Os detalhes e limites estão em [Validação](docs/VALIDACAO.md).

DANFE, impressão, A3, outros documentos e cálculos comerciais ficam para etapas posteriores. O preenchimento tributário continua sendo responsabilidade da aplicação. A homologação fiscal real é separada dos testes de implementação; os testes deste projeto usam dados sintéticos e serviços locais e não transmitem à SEFAZ.

## Licença e fontes

LGPL-2.1-or-later. Veja [LICENSE](LICENSE), [NOTICE](NOTICE) e as licenças incluídas nos runtimes. Fontes de referência: [ACBr público](https://projetoacbr.com.br/fontes/), [SVN oficial](https://svn.code.sf.net/p/acbr/code/trunk2/) e [FCL-passrc](https://www.freepascal.org/daily/packages/fcl-passrc/index.html).
