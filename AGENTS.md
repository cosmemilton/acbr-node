# ACBr Node

Projeto independente em /home/milton/acbr-node. Biblioteca npm gratuita LGPL-2.1-or-later, TypeScript e Free Pascal/Lazarus, sem Delphi ou binários ACBr Pro.

- Escopo: NF-e/NFC-e, A1, Linux/Windows x64. Sem DANFE, impressão, A3, outros documentos ou cálculo comercial.
- Fontes oficiais ACBr/SVN fixadas em acbr.lock.json; atualizações explícitas. Gerador FCL-passrc deve falhar diante de tipos desconhecidos, sem perder campos.
- Nunca transmitir notas reais à SEFAZ durante desenvolvimento/testes. Usar certificados sintéticos e endpoints locais simulados.
- Segredos somente pelas pipes para o filho fiscal, nunca em argumentos ou logs. TLS precisa verificar cadeia e hostname.
- Nenhuma alteração no Integrador ou fontes Delphi existentes está autorizada por este projeto.
- Testar pacote instalado fora do repositório, geração determinística, quebras de contrato e motores Linux/Windows. Registrar homologação fiscal real separadamente.

- Decisão do usuário em 09/10/2026: publicação npm autorizada após revisão, com automação pela branch `release`. O secret `NPM_TOKEN` pertence ao repositório GitHub; não ler, registrar nem copiar seu valor. Publicar somente os tarballs auditados e identificados por hashes em `release/<versão>/manifest.json`.
