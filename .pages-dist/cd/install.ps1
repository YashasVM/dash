<#PSScriptInfo
.VERSION 0.1.0
.GUID 3f2c1e6b-7a4d-4c8e-9b1f-2d5a6c7e8f9a
.AUTHOR yashas
.DESCRIPTION Installs cdx — the CD terminal file-sharing client — on Windows.
#>
<#
.SYNOPSIS
  Installs cdx on Windows from checksum-verified GitHub releases.
.DESCRIPTION
  Run in PowerShell:
    irm https://yash0.in/cd/install.ps1 | iex
  Optional overrides:
    $env:CDX_VERSION = 'latest' (default) or a tag like 'v0.1.0'
    $env:CDX_INSTALL_DIR = install directory (default: $HOME\.local\bin)
#>

& {
  $ErrorActionPreference = 'Stop'
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  $Repository = 'YashasVM/cd'
  $Version = if ($env:CDX_VERSION) { $env:CDX_VERSION } else { 'latest' }
  if ($Version -ne 'latest' -and -not $Version.StartsWith('v')) {
    throw "cdx: CDX_VERSION must be 'latest' or a tag like v0.1.0 (got '$Version')"
  }

  $Machine = $env:PROCESSOR_ARCHITECTURE
  if ($env:PROCESSOR_ARCHITEW6432) { $Machine = $env:PROCESSOR_ARCHITEW6432 }
  $Arch = switch ($Machine.ToUpperInvariant()) {
    'AMD64' { 'amd64' }
    'ARM64' { 'arm64' }
    default { throw "cdx: unsupported architecture: $Machine" }
  }

  $Asset = "cdx-windows-$Arch.exe"
  if ($Version -eq 'latest') {
    $BaseUrl = "https://github.com/$Repository/releases/latest/download"
  } else {
    $BaseUrl = "https://github.com/$Repository/releases/download/$Version"
  }

  $InstallDir = if ($env:CDX_INSTALL_DIR) { $env:CDX_INSTALL_DIR } else { Join-Path $HOME '.local\bin' }
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

  $TempDir = Join-Path ([IO.Path]::GetTempPath()) ('cdx-install-' + [Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
  try {
    $AssetPath = Join-Path $TempDir $Asset
    $SumsPath = Join-Path $TempDir 'checksums.txt'
    Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/$Asset" -OutFile $AssetPath
    Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/checksums.txt" -OutFile $SumsPath

    $Expected = $null
    foreach ($Line in (Get-Content -Path $SumsPath)) {
      $Parts = ($Line.Trim() -split '\s+')
      if ($Parts.Count -ge 2 -and $Parts[1].TrimStart('*') -eq $Asset) { $Expected = $Parts[0]; break }
    }
    if (-not $Expected) { throw 'cdx: release checksum is missing' }
    $Actual = (Get-FileHash -Algorithm SHA256 -Path $AssetPath).Hash.ToLowerInvariant()
    if ($Actual -ne $Expected.ToLowerInvariant()) { throw 'cdx: checksum verification failed' }

    $Target = Join-Path $InstallDir 'cdx.exe'
    Copy-Item -Path $AssetPath -Destination $Target -Force
    Write-Host "installed cdx to $Target"

    $Needle = $InstallDir.TrimEnd('\')
    $OnPath = ($env:Path -split ';') | ForEach-Object { $_.Trim().TrimEnd('\') } | Where-Object { $_ -eq $Needle }
    if (-not $OnPath) {
      $UserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
      if ($UserPath) {
        $HasIt = ($UserPath -split ';') | ForEach-Object { $_.Trim().TrimEnd('\') } | Where-Object { $_ -eq $Needle }
        if (-not $HasIt) {
          [Environment]::SetEnvironmentVariable('Path', "$UserPath;$InstallDir", 'User')
          Write-Host "added $InstallDir to your user PATH"
        }
      } else {
        [Environment]::SetEnvironmentVariable('Path', $InstallDir, 'User')
        Write-Host "added $InstallDir to your user PATH"
      }
      $env:Path = "$env:Path;$InstallDir"
      Write-Host 'PATH updated for this session too — no restart needed'
    }
  } finally {
    Remove-Item -Recurse -Force -Path $TempDir -ErrorAction SilentlyContinue
  }

  Write-Host 'run: cdx send <file>'
}
