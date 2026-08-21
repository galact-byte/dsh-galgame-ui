param(
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repoRoot 'skin\galgame-sakura'
$targetRoot = Join-Path $env:USERPROFILE '.dsh\skins'
$target = Join-Path $targetRoot 'galgame-sakura'

if (-not (Test-Path (Join-Path $source 'skin.json'))) {
  throw "Skin source not found: $source"
}

if ((Test-Path $target) -and -not $Force) {
  throw "Skin already exists: $target. Re-run with -Force only after backing up the existing skin."
}

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null
Copy-Item -Path $source -Destination $targetRoot -Recurse -Force
Write-Output "Installed galgame-sakura to $target"
