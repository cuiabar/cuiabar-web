$ErrorActionPreference = 'Stop'

$distro = 'Ubuntu'
$healthUrl = 'http://127.0.0.1:8055/server/health'
$editorUrl = 'http://127.0.0.1:8055/admin'
$repoRoot = Split-Path -Parent $PSScriptRoot
$directusDirWindows = Join-Path $repoRoot 'blog-options\directus'
$keepalivePidFile = Join-Path $repoRoot '.blog-editor-keepalive.pid'

function Invoke-WSLCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [switch]$AsRoot
  )

  $arguments = @('-d', $distro)
  if ($AsRoot) {
    $arguments += @('-u', 'root')
  }

  $arguments += @('-e', 'sh', '-lc', $Command)
  & wsl.exe @arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar no WSL: $Command"
  }
}

function Get-WSLPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WindowsPath
  )

  $path = (& wsl.exe -d $distro -e wslpath -a $WindowsPath).Trim()
  if ($LASTEXITCODE -ne 0 -or -not $path) {
    throw "Nao foi possivel converter o caminho para WSL: $WindowsPath"
  }

  return $path
}

if (Test-Path $keepalivePidFile) {
  $existingPid = (Get-Content -Path $keepalivePidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if ($existingPid) {
    $existingProcess = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
    if (-not $existingProcess) {
      Remove-Item $keepalivePidFile -Force -ErrorAction SilentlyContinue
    }
  } else {
    Remove-Item $keepalivePidFile -Force -ErrorAction SilentlyContinue
  }
}

if (-not (Test-Path $keepalivePidFile)) {
  $keepaliveProcess = Start-Process -FilePath 'wsl.exe' `
    -ArgumentList @('-d', $distro, '-u', 'root', '-e', 'tail', '-f', '/dev/null') `
    -WindowStyle Hidden `
    -PassThru
  Set-Content -Path $keepalivePidFile -Value $keepaliveProcess.Id -Encoding ascii
  Start-Sleep -Seconds 2
}

$directusDirWSL = Get-WSLPath -WindowsPath $directusDirWindows

Invoke-WSLCommand -AsRoot -Command 'systemctl start docker'
Invoke-WSLCommand -AsRoot -Command "cd '$directusDirWSL' && docker compose up -d database cache directus"
Invoke-WSLCommand -AsRoot -Command "cd '$directusDirWSL' && docker compose stop cloudflared >/dev/null 2>&1 || true"

for ($attempt = 1; $attempt -le 45; $attempt++) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
      Start-Process $editorUrl
      Write-Host "Editor pronto em $editorUrl"
      exit 0
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

throw 'O Directus nao respondeu a tempo em http://127.0.0.1:8055. Verifique o Docker/WSL.'
