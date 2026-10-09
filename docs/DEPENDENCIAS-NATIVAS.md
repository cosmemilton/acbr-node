# Reconstrução gratuita das DLLs Windows x64

O motor Pascal usa OpenSSL 3 e libxml2 como bibliotecas dinâmicas. As DLLs distribuídas podem ser reconstruídas no Ubuntu 24.04/WSL com MinGW-w64, sem compilador comercial e sem Visual C++ Redistributable.

A receita fixa OpenSSL **3.5.9** e libxml2 **2.15.4**. Usa os arquivos oficiais e confere SHA-256 antes de extrair ou compilar:

| Fonte | SHA-256 |
| --- | --- |
| `openssl-3.5.9.tar.gz` | `603f5602e2eef00d77fbd429d34dcd5822bb301757a1bc9cdb24c670f1eb859a` |
| `libxml2-2.15.4.tar.xz` | `98087fd181d9070724f3fbc65c7377db03038eb92bd882374daff44940138821` |

Os hashes foram comparados aos arquivos publicados pelos projetos: [OpenSSL 3.5.9 e checksum](https://github.com/openssl/openssl/releases/tag/openssl-3.5.9), [checksum libxml2](https://download.gnome.org/sources/libxml2/2.15/libxml2-2.15.4.sha256sum). O script contém as URLs exatas dos tarballs e dos respectivos checksums.

## Ferramentas e execução

No Ubuntu 24.04/WSL:

```sh
sudo apt-get update
sudo apt-get install gcc-mingw-w64-x86-64 g++-mingw-w64-x86-64 \
  binutils-mingw-w64-x86-64 cmake ninja-build make perl curl tar xz-utils
```

Na raiz deste projeto:

```sh
node scripts/build-native-deps.mjs --project "$PWD"
```

O script do pacote instalado também pode ser usado:

```sh
node node_modules/cosmemilton-acbr-node/scripts/build-native-deps.mjs \
  --project "$PWD"
```

Downloads ficam em `.acbr/deps/downloads`; fontes, objetos, instalação intermediária e logs ficam em `.acbr/deps/build/windows`. Os arquivos finais ficam em `.acbr/deps/win32-x64`. O comando não compila o motor ACBr e não acessa serviços fiscais.

Para aproveitar tarballs já disponíveis, indique os arquivos. O hash continua obrigatório; os arquivos originais são somente lidos:

```sh
node scripts/build-native-deps.mjs --project "$PWD" --jobs 4 \
  --openssl-archive /caminho/openssl-3.5.9.tar.gz \
  --libxml2-archive /caminho/libxml2-2.15.4.tar.xz
```

Após uma interrupção, `--resume` reaproveita a configuração OpenSSL existente somente se revisão, argumentos e ambiente coincidirem. Use a mesma instalação de ferramentas; após mudar o compilador, execute o comando sem essa opção para reconfigurar. A reutilização aparece em `SOURCE.json`.

Cada comando tem seu log em `.acbr/deps/build/windows/logs`. Em falhas, o script informa o caminho e o final do log. Apenas depois de todas as compilações e auditorias bem-sucedidas substitui as DLLs finais e remove os artefatos temporários conhecidos do build anterior com MSVC.

## Configuração do build

O OpenSSL é configurado como `mingw64 shared`, com assembly x64, `-static-libgcc`, timestamp PE fixo e provider `legacy`. A compilação cruzada segue o [procedimento oficial MinGW](https://github.com/openssl/openssl/blob/openssl-3.5.9/NOTES-WINDOWS.md) e a [documentação de instalação](https://github.com/openssl/openssl/blob/openssl-3.5.9/INSTALL.md).

O libxml2 usa CMake/Ninja, compilador `x86_64-w64-mingw32-gcc-win32` e biblioteca compartilhada. XML Schema, C14N, threads, XPath e serialização permanecem habilitados. Python, iconv, ICU, zlib, HTTP e APIs legacy opcionais ficam desabilitados; os documentos NF-e usam UTF-8. As opções são as do `CMakeLists.txt` incluído no [tarball oficial libxml2 2.15.4](https://download.gnome.org/sources/libxml2/2.15/libxml2-2.15.4.tar.xz).

O GCC usa o modelo de threads Win32 e o runtime GCC estático. O libxml2 também recebe `-static-libstdc++` no link, embora seu código seja C. Não se distribuem `libgcc_s`, `libstdc++`, `libwinpthread` nem `vcruntime140`; `msvcrt.dll` é um componente do próprio Windows. A auditoria dos imports PE rejeita qualquer dependência fora das quatro DLLs produzidas e da lista explícita de DLLs do sistema.

`SOURCE_DATE_EPOCH=0` e `--no-insert-timestamp` reduzem variação de timestamps. O manifesto registra ferramentas, argumentos e hashes reais dos binários; não afirma identidade binária entre versões diferentes de compilador ou diretórios de build.

## Artefatos, licenças e staging

A saída inclui:

- `libcrypto-3-x64.dll`, `libssl-3-x64.dll`, `legacy.dll` e `libxml2.dll`;
- licença original adjacente `<DLL>.LICENSE` para cada DLL;
- `GCC-Runtime.LICENSE`, `GCC-GPL-3.LICENSE` e `MinGW-w64.LICENSE`, que preservam os avisos do código de runtime incorporado;
- `SOURCE.json` com URLs, versões, hashes dos fontes/binários, comandos, ferramentas e imports PE.

OpenSSL preserva Apache-2.0; libxml2 preserva sua licença MIT. O arquivo do GCC contém a [GCC Runtime Library Exception 3.1](https://www.gnu.org/licenses/gcc-exception-3.1.html), além dos avisos aplicáveis. Os avisos MinGW-w64 vêm do pacote instalado, sem substituir os textos originais por uma licença genérica do projeto.

Para compilar o motor Windows, configure os caminhos das DLLs no arquivo de configuração usado pelo CLI, por exemplo:

```json
{
  "native": {
    "libraryFiles": [
      ".acbr/deps/win32-x64/libcrypto-3-x64.dll",
      ".acbr/deps/win32-x64/libssl-3-x64.dll",
      ".acbr/deps/win32-x64/libxml2.dll"
    ],
    "providerFiles": [".acbr/deps/win32-x64/legacy.dll"]
  }
}
```

Mantenha os outros campos existentes de `acbr.config.json`, como compilador, projeto Pascal e diretório Lazarus. O build do motor faz o staging das DLLs, de todas as licenças e de `SOURCE.json`. O provider vai para `ossl-modules`; o processo auxiliar recebe `OPENSSL_MODULES` e `OPENSSL_CONF` do runtime gerado, sem depender dos diretórios da máquina que compilou o OpenSSL.

## Validação

A receita confere arquitetura PE x64, imports de todas as DLLs e exports essenciais de libxml2 para parsing, C14N e XML Schema. A compilação cruzada não executa a suíte upstream no Linux: os testes gerados são executáveis Windows. `SOURCE.json` registra explicitamente essa limitação.

Depois do staging, execute os testes offline do worker no Windows: geração de XML, assinatura com certificado temporário, validação dos schemas e TLS contra servidor local. Essa etapa comprova o funcionamento das DLLs no alvo. Os testes locais não autorizam emissão ou transmissão fiscal.
