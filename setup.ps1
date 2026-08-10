# =====================================================================
# Authentix - First Time Setup Script (Windows Native)
# =====================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "       AUTHENTIX - NATIVE ENVIRONMENT SETUP            " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot

# 1. Check Node.js and NPM
try {
    $nodeVer = node -v
    Write-Host "(OK) Node.js is installed ($nodeVer)" -ForegroundColor Green
} catch {
    Write-Host "(ERROR) Node.js is not installed or not in PATH! Please install Node.js (v18+ recommended)." -ForegroundColor Red
    exit 1
}

# 2. Check Python
try {
    $pyVer = python --version
    Write-Host "(OK) Python is installed ($pyVer)" -ForegroundColor Green
} catch {
    Write-Host "(ERROR) Python is not installed or not in PATH! Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "--- 1. Setting up Blockchain (Hardhat) Dependencies ---" -ForegroundColor Yellow
$bcDir = Join-Path $rootDir "blockchain"
Push-Location $bcDir
try {
    $bcEnv = Join-Path $bcDir ".env"
    $bcEnvEx = Join-Path $bcDir ".env.example"
    if (-not (Test-Path $bcEnv) -and (Test-Path $bcEnvEx)) {
        Copy-Item $bcEnvEx $bcEnv
        Write-Host "    Created blockchain/.env from .env.example" -ForegroundColor Gray
    }
    Write-Host "    Installing NPM packages in blockchain/..." -ForegroundColor Gray
    npm install
    Write-Host "(OK) Blockchain dependencies installed successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "--- 2. Setting up Python Virtual Environment and Backend Dependencies ---" -ForegroundColor Yellow
$backendDir = Join-Path $rootDir "webapp/backend"
$venvDir = Join-Path $backendDir "venv"
$venvScripts = Join-Path $venvDir "Scripts"
$venvPython = Join-Path $venvScripts "python.exe"
$venvPip = Join-Path $venvScripts "pip.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "    Creating Python virtual environment in webapp/backend/venv..." -ForegroundColor Gray
    python -m venv $venvDir
}

Push-Location $backendDir
try {
    $beEnv = Join-Path $backendDir ".env"
    $beEnvEx = Join-Path $backendDir ".env.example"
    if (-not (Test-Path $beEnv) -and (Test-Path $beEnvEx)) {
        Copy-Item $beEnvEx $beEnv
        Write-Host "    Created webapp/backend/.env from .env.example" -ForegroundColor Gray
    }
    Write-Host "    Installing requirements.txt into venv..." -ForegroundColor Gray
    & $venvPip install --upgrade pip
    & $venvPip install -r (Join-Path $backendDir "requirements.txt")
    Write-Host "(OK) Backend Python dependencies installed successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "--- 3. Setting up Frontend (React + Vite) Dependencies ---" -ForegroundColor Yellow
$frontendDir = Join-Path $rootDir "webapp/frontend"
Push-Location $frontendDir
try {
    $feEnv = Join-Path $frontendDir ".env"
    $feEnvEx = Join-Path $frontendDir ".env.example"
    if (-not (Test-Path $feEnv) -and (Test-Path $feEnvEx)) {
        Copy-Item $feEnvEx $feEnv
        Write-Host "    Created webapp/frontend/.env from .env.example" -ForegroundColor Gray
    }
    Write-Host "    Installing NPM packages in webapp/frontend/..." -ForegroundColor Gray
    npm install
    Write-Host "(OK) Frontend dependencies installed successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "       (OK) SETUP COMPLETED SUCCESSFULLY!             " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To launch Authentix, simply run:" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor Yellow
Write-Host ""
