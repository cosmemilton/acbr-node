# Arquitetura

O projeto contém quatro partes: cliente TypeScript (`src/runtime.ts`), CLI (`src/cli.ts`), extractor FCL-passrc (`tools/extract-model.lpr`) e motor `TACBrNFe` (`native/acbr-worker.lpr`).

1. SVN resolve uma revisão explícita ou HEAD e exporta os componentes públicos necessários. A revisão exata e hashes de todos os arquivos ficam no lock.
2. FCL-passrc analisa unidades Pascal com includes e condicionais. A resolução alcança herança, aliases, propriedades, campos públicos e coleções do modelo TNFe.
3. A representação intermediária única gera classes/inputs/enums/validadores TypeScript e loaders Pascal. O relatório de compatibilidade compara contratos anteriores.
4. FPC compila os loaders junto do motor fiscal. Schemas, serviços e dependências seguem a revisão travada; o runtime recebe manifesto com hashes.
5. Node verifica arquivos, revisão e contrato, envia uma operação JSONL por processo e entrega o resultado assíncrono.

Não há FFI nem addon vinculado a uma versão específica do ABI do Node. As duas plataformas usam o mesmo protocolo e modelos. Recursos que antes exigiam APIs Windows, como confiança TLS e lifecycle do processo, possuem implementação específica por plataforma.

O código do Integrador existente não foi alterado ou incorporado como dependência. Regras comerciais, persistência, impostos e orquestração do documento continuam no aplicativo consumidor.

Uma release principal contém ESM, CommonJS, declarações, fontes do extractor/motor, lock e documentos. Os pacotes `cosmemilton-acbr-node-linux-x64` e `cosmemilton-acbr-node-win32-x64` incluem runtime, fontes fiscais correspondentes, licenças e instruções de reconstrução. Gerar uma revisão própria exige SVN, Free Pascal e Lazarus gratuitos; consumir a release pronta exige apenas Node e a plataforma suportada.
