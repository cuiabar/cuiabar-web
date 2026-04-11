$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error 'Docker nao encontrado. Instale Docker Desktop para subir o Directus.'
}

if (-not (Test-Path '.env')) {
  Write-Error 'Arquivo .env nao encontrado. Copie .env.example para .env antes do deploy.'
}

Write-Host '>> Atualizando imagens...'
docker compose pull

Write-Host '>> Subindo stack local do editor...'
docker compose up -d database cache directus

Write-Host '>> Garantindo que o tunnel remoto fique desligado neste modo local...'
docker compose stop cloudflared | Out-Null

Write-Host '>> Status dos servicos:'
docker compose ps

Write-Host ''
Write-Host 'Painel local: http://127.0.0.1:8055'
Write-Host 'Login manual atual: leonardo@cuiabar.net'
