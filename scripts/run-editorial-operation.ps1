$ErrorActionPreference = 'Stop'

function Invoke-External {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    [string[]]$Arguments = @()
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar: $FilePath $($Arguments -join ' ')"
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$directusDir = Join-Path $repoRoot 'blog-options\directus'

$dockerCandidates = @(
  'docker',
  'C:\Users\usuario\AppData\Local\Microsoft\WinGet\Packages\Docker.DockerCLI_Microsoft.Winget.Source_8wekyb3d8bbwe\docker\docker.exe'
)

$composeCandidates = @(
  'docker-compose',
  'C:\Users\usuario\AppData\Local\Microsoft\WinGet\Packages\Docker.DockerCompose_Microsoft.Winget.Source_8wekyb3d8bbwe\docker-compose.exe'
)

$docker = $null
foreach ($candidate in $dockerCandidates) {
  $command = Get-Command $candidate -ErrorAction SilentlyContinue
  if ($command) {
    $docker = $command.Source
    break
  }
  if (Test-Path $candidate) {
    $docker = $candidate
    break
  }
}

if (-not $docker) {
  throw 'Docker CLI nao encontrado. Instale Docker Desktop ou Docker CLI.'
}

$compose = $null
foreach ($candidate in $composeCandidates) {
  $command = Get-Command $candidate -ErrorAction SilentlyContinue
  if ($command) {
    $compose = $command.Source
    break
  }
  if (Test-Path $candidate) {
    $compose = $candidate
    break
  }
}

if (-not $compose) {
  throw 'Docker Compose nao encontrado. Instale Docker Compose.'
}

Write-Host "Docker CLI: $docker"
Write-Host "Compose: $compose"
Invoke-External -FilePath $docker -Arguments @('version')

Set-Location $directusDir

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host 'Arquivo .env criado a partir de .env.example. Ajuste credenciais antes de producao.'
}

Write-Host 'Subindo stack editorial local (Directus + Postgres + Redis)...'
Invoke-External -FilePath $compose -Arguments @('up', '-d', 'database', 'cache', 'directus')

Write-Host 'Garantindo que o tunnel remoto fique desligado neste modo local...'
& $compose 'stop' 'cloudflared' | Out-Null

Write-Host ''
Write-Host 'Status:'
Invoke-External -FilePath $compose -Arguments @('ps')

Write-Host ''
Write-Host 'Painel local do editor: http://127.0.0.1:8055'
Write-Host 'Login manual atual: leonardo@cuiabar.net'
Write-Host ''
Write-Host 'Atalho local recomendado: Editor do Blog Cuiabar na Area de Trabalho'
