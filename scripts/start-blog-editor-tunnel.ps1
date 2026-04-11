$ErrorActionPreference = 'Stop'

$cloudflaredCommand = Get-Command cloudflared -ErrorAction SilentlyContinue
$cloudflared = if ($cloudflaredCommand) { $cloudflaredCommand.Source } else { $null }
if (-not $cloudflared) {
  throw 'cloudflared nao encontrado. Instale o binario antes de subir o tunnel.'
}

$wslIp = (wsl -d Ubuntu -e sh -lc "hostname -I | tr ' ' '\n' | sed -n '1p'").Trim()
if (-not $wslIp) {
  throw 'Nao foi possivel descobrir o IP atual do WSL.'
}

$tunnelName = 'interno-cuiabar'
$tunnelId = 'ca756fc0-f2d1-4126-8281-bd3ed3ff5089'
$hiddenHostname = 'blog-editor-origin.cuiabar.com'
$cloudflaredDir = Join-Path $HOME '.cloudflared'
$credentialsFile = Join-Path $cloudflaredDir "$tunnelId.json"
$configFile = Join-Path $cloudflaredDir 'config.yml'
$logFile = Join-Path $cloudflaredDir 'blog-editor-tunnel.log'

if (-not (Test-Path $credentialsFile)) {
  throw "Arquivo de credenciais do tunnel nao encontrado em $credentialsFile"
}

$config = @"
tunnel: $tunnelId
credentials-file: $credentialsFile

ingress:
  - hostname: $hiddenHostname
    service: http://$wslIp`:8055
  - service: http_status:404
"@

Set-Content -Path $configFile -Value $config -Encoding ascii

$existing = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($existing) {
  $existing | Stop-Process -Force
  Start-Sleep -Seconds 1
}

Start-Process -FilePath $cloudflared -ArgumentList @('tunnel', '--config', $configFile, '--logfile', $logFile, 'run', $tunnelName) -WindowStyle Hidden

Write-Host "Tunnel iniciado para $hiddenHostname"
Write-Host "Origem atual do Directus no WSL: http://$wslIp`:8055"
Write-Host "Config gravada em: $configFile"
Write-Host "Log: $logFile"
