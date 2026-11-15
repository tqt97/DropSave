$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Write-Step([string]$Message) {
    Write-Host "`n[DropSave Build] $Message" -ForegroundColor Cyan
}

function Test-Command([string]$Name) {
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-Path {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machine;$user"

    $cargo = Join-Path $env:USERPROFILE '.cargo\bin'
    if ((Test-Path $cargo) -and ($env:Path -notlike "*$cargo*")) {
        $env:Path = "$cargo;$env:Path"
    }
}

function Install-NodeIfMissing {
    if ((Test-Command 'node') -and (Test-Command 'npm')) {
        Write-Step "Node is ready: $(node --version)"
        return
    }

    Write-Step 'Node.js is missing. Installing Node.js LTS automatically...'
    if (-not (Test-Command 'winget')) {
        throw 'Node.js is missing and winget is unavailable. Install Microsoft App Installer once, then run Build-DropSave.cmd again.'
    }

    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js installation failed with code $LASTEXITCODE."
    }

    Refresh-Path
    if (-not (Test-Command 'node') -or -not (Test-Command 'npm')) {
        throw 'Node.js was installed but is not visible in the current process. Re-run Build-DropSave.cmd.'
    }
}

try {
    if (-not [Environment]::Is64BitOperatingSystem) {
        throw 'DropSave V1 build supports Windows x64 only.'
    }

    $projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
    Set-Location $projectRoot
    Refresh-Path

    Install-NodeIfMissing

    Write-Step 'Installing JavaScript dependencies...'
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }

    Write-Step 'Running automated tests...'
    npm test
    if ($LASTEXITCODE -ne 0) { throw 'Tests failed. Build stopped to avoid producing a broken installer.' }

    Write-Step 'Bootstrapping build environment and creating Windows installer...'
    npm run desktop:build
    if ($LASTEXITCODE -ne 0) { throw 'Desktop build failed.' }

    $candidateFolders = @(
        (Join-Path $projectRoot 'src-tauri\target\release\bundle\nsis'),
        (Join-Path $projectRoot 'src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis')
    )

    $installer = $null
    foreach ($folder in $candidateFolders) {
        if (Test-Path $folder) {
            $installer = Get-ChildItem -Path $folder -Filter '*-setup.exe' -File |
                Sort-Object LastWriteTime -Descending |
                Select-Object -First 1
            if ($installer) { break }
        }
    }

    if (-not $installer) {
        throw 'Build completed but the NSIS setup EXE could not be found.'
    }

    $releaseDir = Join-Path $projectRoot 'release'
    New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
    $friendlyInstaller = Join-Path $releaseDir 'DropSave-Setup.exe'
    Copy-Item $installer.FullName $friendlyInstaller -Force

    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host ' DropSave Windows installer is ready.' -ForegroundColor Green
    Write-Host " $friendlyInstaller" -ForegroundColor Green
    Write-Host ' Give ONLY this EXE to end users.' -ForegroundColor Green
    Write-Host "============================================================`n" -ForegroundColor Green

    Start-Process explorer.exe -ArgumentList "/select,`"$friendlyInstaller`""
}
catch {
    Write-Host "`n[DropSave Build] ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'See docs/TROUBLESHOOTING.md if the automatic recovery could not complete.' -ForegroundColor Yellow
    exit 1
}
