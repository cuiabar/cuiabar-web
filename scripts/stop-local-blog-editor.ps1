$ErrorActionPreference = 'Stop'

$distro = 'Ubuntu'
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
  & wsl.exe @arguments | Out-Null
}

$directusDirWSL = (& wsl.exe -d $distro -e wslpath -a $directusDirWindows).Trim()
if ($directusDirWSL) {
  Invoke-WSLCommand -AsRoot -Command "cd '$directusDirWSL' && docker compose stop directus cache database >/dev/null 2>&1 || true"
}

if (Test-Path $keepalivePidFile) {
  $keepalivePid = (Get-Content -Path $keepalivePidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if ($keepalivePid) {
    Stop-Process -Id ([int]$keepalivePid) -Force -ErrorAction SilentlyContinue
  }
  Remove-Item $keepalivePidFile -Force -ErrorAction SilentlyContinue
}

Write-Host 'Editor local parado.'
