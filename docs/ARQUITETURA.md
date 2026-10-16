# Arquitetura

O projeto contém quatro partes: cliente TypeScript (`src/runtime.ts`), CLI (`src/cli.ts`), extractor FCL-passrc (`tools/extract-model.lpr`) e motor `TACBrNFe` (`native/acbr-worker.lpr`).

1. SVN resolve uma revisão explícita ou HEAD e exporta os componentes públicos necessários. A revisão exata e hashes de todos os arquivos ficam no lock.
2. FCL-passrc analisa unidades Pascal com includes e condicionais. A resolução alcança herança, aliases, propriedades, campos públicos e coleções do modelo TNFe.
3. A representação intermediária única gera classes/inputs/enums/validadores TypeScript e loaders Pascal. O relatório de compatibilidade compara contratos anteriores.
4. FPC compila os loaders junto do motor fiscal. Schemas, serviços e dependências seguem a revisão travada; o runtime recebe manifesto com hashes.
5. Node verifica arquivos, revisão e contrato, envia uma operação JSONL por processo e entrega o resultado assíncrono.

Não há FFI nem addon vinculado a uma versão específica do ABI do Node. As duas plataformas usam o mesmo protocolo e modelos. Recursos que antes exigiam APIs Windows, como confiança TLS e lifecycle do processo, possuem implementação específica por plataforma.

O código do Integrador existente não foi alterado ou incorporado como dependência. Regras comerciais, persistência, impostos e orquestração do documento continuam no aplicativo consumidor.

`consultar` entrega o retorno do serviço. `recuperarXml` é um comando adicional: carrega uma NFe assinada, valida documento, assinatura e identidade da NFe original, consulta a chave e correlaciona o protocolo recebido, incluindo o digest obrigatório. Somente a recuperação que atende aos critérios documentados com `cStat=100` produz `XML_RECUPERADO` e o `nfeProc`, preservando o conteúdo assinado; não há nova emissão, assinatura ou persistência fiscal automática. O supervisor exige a capacidade `recuperarXml` no manifesto antes de iniciar esse comando, para não encaminhá-lo a motores antigos. Uma chamada anterior a `validar` não carrega notas para uma chamada seguinte: cada operação usa seu próprio processo fiscal.

Na versão 0.2.0, `protNFe` com assinatura XMLDSig (`ds:Signature`) é recusado com `RECUPERACAO_NAO_COMPROVADA`, sem XML ou protocolo no resultado. O verificador do ACBr fixado nesta versão resolve `SignedInfo` globalmente e não comprova de forma independente as duas assinaturas em um mesmo processo. O contexto de namespaces do envelope também pode alterar a canonicalização (C14N). A recuperação, portanto, não oferece preservação ou verificação da assinatura adicional da SEFAZ no protocolo. Para os protocolos aceitos, usa os dados da resposta real e exige `digVal` exatamente igual ao digest assinado. A assinatura original da NFe é preservada e verificada antes da consulta e depois da composição do `nfeProc`.

Uma release principal contém ESM, CommonJS, declarações, fontes do extractor/motor, lock e documentos. Os pacotes `cosmemilton-acbr-node-linux-x64` e `cosmemilton-acbr-node-win32-x64` incluem runtime, fontes fiscais correspondentes, licenças e instruções de reconstrução. Gerar uma revisão própria exige SVN, Free Pascal e Lazarus gratuitos; consumir a release pronta exige apenas Node e a plataforma suportada.
