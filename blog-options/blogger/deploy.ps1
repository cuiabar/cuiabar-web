$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

if (-not (Test-Path 'blog-options\blogger\.env')) {
  Copy-Item 'blog-options\blogger\.env.example' 'blog-options\blogger\.env'
  Write-Host 'Arquivo blog-options\blogger\.env criado a partir do exemplo.'
  Write-Host 'Preencha as credenciais Google antes da publicacao real.'
}

Write-Host 'Gerando preview/local package do Blogger...'
node scripts/publish-to-blogger.mjs

Write-Host ''
Write-Host 'Se BLOGGER_DRY_RUN=false e as credenciais estiverem preenchidas, os posts serao enviados ao Blogger.'
