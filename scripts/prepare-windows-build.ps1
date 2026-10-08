param(
  [ValidateRange(1, 2147483647)][int]$Revision = 48590
)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($env:FPC_ROOT) -or [string]::IsNullOrWhiteSpace($env:LAZARUS_ROOT)) {
  throw 'Defina FPC_ROOT e LAZARUS_ROOT para instalações gratuitas de Free Pascal/Lazarus x64.'
}
$fpcRoot = (Resolve-Path -LiteralPath $env:FPC_ROOT).Path
$lazarusRoot = (Resolve-Path -LiteralPath $env:LAZARUS_ROOT).Path
$compiler = Join-Path $fpcRoot 'bin/x86_64-win64/ppcx64.exe'
$configTool = Join-Path $fpcRoot 'bin/x86_64-win64/fpcmkcfg.exe'
foreach ($required in @($compiler, $configTool, (Join-Path $lazarusRoot 'components/lazutils'))) {
  if (!(Test-Path -LiteralPath $required)) { throw "Toolchain incompleto: $required" }
}
$version = (& $compiler -iV).Trim()
if ($LASTEXITCODE -ne 0 -or $version -ne '3.2.2') { throw "Esta receita foi validada com FPC3.2.2; encontrado: $version" }
$cfgDir = Join-Path $projectRoot '.acbr/fpc/windows'
New-Item -ItemType Directory -Path $cfgDir -Force | Out-Null
& $configTool -d ('basepath=' + $fpcRoot) -p -o (Join-Path $cfgDir 'fpc.cfg')
if ($LASTEXITCODE -ne 0) { throw 'fpcmkcfg falhou.' }
$env:PPC_CONFIG_PATH = $cfgDir
if (![string]::IsNullOrWhiteSpace($env:GITHUB_ENV)) { Add-Content -LiteralPath $env:GITHUB_ENV -Value ('PPC_CONFIG_PATH=' + $cfgDir) -Encoding utf8 }
$deps = Join-Path $projectRoot '.acbr/deps/win32-x64'
$libraryFiles = @('libcrypto-3-x64.dll', 'libssl-3-x64.dll', 'libxml2.dll') | ForEach-Object { Join-Path $deps $_ }
$providerFiles = @(Join-Path $deps 'legacy.dll')
foreach ($dll in @($libraryFiles) + @($providerFiles)) {
  if (!(Test-Path -LiteralPath $dll) -or !(Test-Path -LiteralPath ($dll + '.LICENSE'))) { throw "DLL/notice ausente: $dll" }
}
$config = [ordered]@{
  formatVersion = 1
  source = [ordered]@{ url = 'https://svn.code.sf.net/p/acbr/code/trunk2'; revision = $Revision; directory = '.acbr/source' }
  generator = [ordered]@{ outputDir = '.' }
  native = [ordered]@{ project = 'native/acbr-worker.lpr'; outputDir = '.acbr/runtime'; fpc = $compiler; lazarusRoot = $lazarusRoot; libraryFiles = @($libraryFiles); providerFiles = @($providerFiles) }
}
$configPath = Join-Path $projectRoot 'acbr.ci.windows.config.json'
$json = ($config | ConvertTo-Json -Depth 10) + [Environment]::NewLine
[IO.File]::WriteAllText($configPath, $json, [Text.UTF8Encoding]::new($false))
Write-Output "Configuração: $configPath"
Write-Output "PPC_CONFIG_PATH: $cfgDir"
