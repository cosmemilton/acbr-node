# Validação da implementação

Validações registradas em 08/10/2026 para a versão **0.1.0**. A publicação npm e sua automação pela branch `release` foram autorizadas pelo usuário em **09/10/2026**. Os artefatos estão preparados; a publicação ainda não foi executada neste registro.

O snapshot principal usa ACBr SVN **48590** e **204 tipos gerados**. O contrato é:

```text
e5a497cefe8e0e350a30da5cc04e88b35c38a98535893d52f878890260d1346d
```

Revisão e inventário dos fontes constam em `acbr.lock.json`. O manifesto `.acbr/generated/manifest.json` vincula fonte, contrato e SHA-256 dos modelos TypeScript, fábrica do cliente e mapper Pascal. O build verifica esses três arquivos antes e depois da compilação. Cada runtime inventaria e verifica os seus arquivos; revisão ou contrato divergentes são recusados.

## Resultado das verificações

| Verificação | Estado e evidência |
| --- | --- |
| Gerador FCL-passrc | **6 testes aprovados**: AST real, 204 tipos e RTC, herança/aliases, precedência das unidades, enums simbólicos, coleções `New/Items`, tipos desconhecidos, mudanças de contrato, determinismo e equivalência dos modelos extraídos com condicionais Linux/Windows. |
| Geração nativa Windows | CLI `generate` executado no Windows com Free Pascal 3.2.2/FCL-passrc: extrator `extract-model.exe` PE, 204 tipos, r48590 e contrato idêntico ao Linux. Os SHA-256 dos três arquivos gerados também coincidiram entre as plataformas. |
| Tipos e bundle Node | Typecheck e build final aprovados, bundles ESM/CommonJS e cliente gerado com resolução NodeNext conferidos. Entradas usam enums ACBr, strings decimais e datas civis; assinatura/protocolo/suplemento gerados pelo motor não são campos de entrada. |
| Supervisor Node | **8 testes aprovados**: UTF-8, isolamento de emitentes, integridade/contrato, fila, cancelamento, crash, timeout, recuperação de resultado incerto e ausência de retry/segredos em erros aprovados. |
| CLI/configuração/fontes | **11 testes aprovados** no registro `.acbr/cli-tests.log`: opções/revisões, init e colisões, caminhos relativos, origem SVN, snapshots, fontes alterados e concorrência. |
| CLI check offline Linux/Windows | Quatro operações reais aprovadas em cada sistema após integridade: gerar XML55 sintético (mapper/chave/UTF-8), validar XML assinado com certificado público sintético, recusar XML malformado e recusar DTD/entidade externa. Sem credenciais A1 na configuração do smoke, sem acesso à rede ou transmissão. |
| Motor Linux | **52 testes aprovados**: 27 do motor/TLS e 25 dos serviços SOAP locais. Incluem NF-e/NFC-e sintéticas, assinatura e schema, dados Unicode, datas/decimais/coleções, CSC/QRCode e casos de erro. |
| Consumidor Linux com runtime instalado | **ESM e CommonJS aprovados com Node 24.15.0 e 22.12.0**. Para cada formato/versão: quatro documentos, dois emitentes sintéticos, modelos 55 e 65, 12 processos nas operações `gerarXml → assinar → validar`. Não foram chamados compiladores. |
| Consumidor com revisão própria | Fluxo externo completo em **r48589**: init, atualização SVN, generate, build, check, doctor, TypeScript NodeNext e XML gerado pela fábrica própria. Contrato `369de708cd42003fc02a98397346d55b842ad3cb25a8422939bd7de0a00aad91`, distinto do snapshot principal. |
| Dependências Windows | OpenSSL 3.5.9 e libxml2 2.15.4 recompilados de fontes oficiais com MinGW x64. SHA-256 dos fontes e imports/exports PE conferidos. DLLs não dependem de VC Redistributable nem de runtime GCC dinâmico externo. Licenças e `SOURCE.json` preservados. |
| Motor Windows | Compilação e **rodada final de 52 testes aprovadas**: 20 do motor XML/A1/protocolo, sete TLS e 25 SOAP. Inclui NFC-e autorizada simulada (cStat 100), assinatura/QRCode/UTF-8 correlacionados e encerramento ao morrer o supervisor. |
| Consumidor Windows com Node mínimo | **ESM e CommonJS aprovados com Node 22.12.0** em diretório externo. Cada formato executou quatro documentos (dois CNPJs × modelos 55/65) e 12 operações offline. O processo consumidor tinha apenas Node no `PATH`; o worker e as DLLs vieram do runtime instalado, sem execução de compiladores ou fontes do checkout. |
| Distribuição e licenças | **7 testes de auditoria aprovados**, staging real Linux/Windows conferido e pack/dry-run dos três pacotes aprovados. Fontes, licenças e runtime inventariados. Tarballs de revisão em `.acbr/release-artifacts`: SDK cerca de 484 KiB, Linux 50 MiB e Windows 33 MiB. |
| Docker / CI remota dos motores | **Não executados**. O Docker Desktop não tinha daemon disponível; os motores foram validados localmente em Linux/Windows. O workflow de publicação audita e publica esses tarballs, sem reconstruir os motores. |
| Publicação npm | **Autorizada em 09/10/2026**, ainda não executada neste registro. A automação da branch `release` confere os tarballs contra hashes fixados em `release/0.1.0/manifest.json`. |

A execução final de `npm test` teve **32 testes aprovados e quatro suítes opt-in ignoradas**: seis do gerador, 11 da CLI/configuração/fontes, oito do supervisor e sete de auditoria. Os testes nativos foram habilitados e executados separadamente: **52 Linux + 52 Windows**, sem falhas.

As operações marcadas como XML, assinatura, schema e SOAP foram executadas contra o componente Pascal real e serviços locais sintéticos. Respostas simuladas não comprovam aceitação fiscal na SEFAZ.

## Consumo sem compilação

O teste `tests/package-install.mjs` instala somente os tarballs do SDK e do runtime em um diretório externo ao checkout, com npm offline e scripts de instalação desativados. O processo consumidor importa o pacote instalado em ESM/CommonJS; `criarEmissor` resolve o executável do pacote nativo sem `runtimeDirectory` ou caminho para o motor do repositório. Cada execução capturada corresponde ao worker instalado, com `PATH` restrito ao diretório do Node.

No Linux, `LD_DEBUG=libs` confirmou OpenSSL, libxml2, ICU, zlib, liblzma, libgcc, libstdc++ e provider legacy dentro do runtime instalado. O sistema forneceu apenas glibc, loader, libm, libpthread e o módulo glibc `gconv/UTF-16.so`, confirmado como arquivo do pacote Ubuntu `libc6`. A evidência corresponde ao Ubuntu 24.04/glibc; não é um teste em container limpo nem uma validação de Alpine ou de qualquer distribuição Linux.

Relatórios locais:

- `.acbr/validation-evidence/consumers/acbr-node-runtime-consumer-linux-final/report-esm.json` e `report-cjs.json`: Node 24.15.0.
- `.acbr/validation-evidence/consumers/acbr-node-runtime-consumer-linux-node22/report-esm.json` e `report-cjs.json`: Node 22.12.0.
- `C:\SRI_SERVICES\acbr-node-runtime-consumer-win32-node22-final\report-esm.json` e `report-cjs.json`: Windows com Node 22.12.0.
- `C:\SRI_SERVICES\acbr-node-generator-win32-final\generate.log`: geração FCL-passrc executada nativamente no Windows.
- `.acbr/finish-consumer.log`: geração pela fábrica do consumidor r48589.
- `.acbr/final-release-staging-audit.log`: inventário final de distribuição Linux/Windows.
- `.acbr/cli-check-linux-offline.json` e `.acbr/cli-check-windows-offline.json`: hashes do runtime e quatro probes reais do CLI por plataforma.

As cinco pastas temporárias de consumidores Linux foram removidas após preservar seus relatórios, scripts, locks, modelos gerados e logs em `.acbr/validation-evidence/consumers/`. O arquivo `archive-manifest.json` registra os caminhos originais e os hashes SHA-256 dos arquivos preservados. Os caminhos dentro dos relatórios correspondem ao local da execução original. As fixtures de certificados sintéticos podem ser recriadas por `tests/package-install.mjs`.

Os binários portáteis Node 22.12.0 de teste foram obtidos de `nodejs.org/dist/v22.12.0` e conferidos contra `SHASUMS256.txt`, sem alterar o Node padrão da máquina.

## Homologação fiscal separada

Nenhum teste deste projeto transmite documentos à SEFAZ. Certificados, CNPJs, documentos e CAs usados nos testes são sintéticos. Homologação oficial com certificado habilitado, cenários fiscais reais por UF e verificação operacional permanecem pendentes e não fazem parte da evidência dos testes locais.

A verificação de TLS não inclui consulta de revogação CRL/OCSP nesta versão. DANFE, impressão e A3 ficam fora do escopo atual.
