# =====================================================================
# Authentix - Native Master Startup Script (No Docker Required)
# =====================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "         AUTHENTIX - STARTING SERVICES                 " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$venvPython = "python"
$frontendDir = Join-Path $rootDir "webapp\frontend"
$blockchainDir = Join-Path $rootDir "blockchain"

# 1. Start Hardhat Local Blockchain Node
Write-Host "[1/3] Starting Hardhat Ethereum Node on http://127.0.0.1:8545..." -ForegroundColor Yellow
$nodeCmd = "title Authentix - Hardhat Ethereum Node (8545) && cd /d `"$blockchainDir`" && echo ⛓️ Starting Hardhat Node... && npx hardhat node"
Start-Process cmd.exe -ArgumentList "/k", $nodeCmd

Start-Sleep -Seconds 3

# 2. Start FastAPI Backend Server
Write-Host "[2/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendCmd = "title Authentix - FastAPI Backend (8000) && cd /d `"$rootDir`" && set RPC_URL=http://127.0.0.1:8545 && echo 🔧 Starting FastAPI Backend... && `"$venvPython`" -m uvicorn webapp.backend.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process cmd.exe -ArgumentList "/k", $backendCmd

Start-Sleep -Seconds 2

# 3. Start Vite React Frontend Dev Server
Write-Host "[3/3] Starting React Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendCmd = "title Authentix - React Frontend (5173) && cd /d `"$frontendDir`" && echo 🌐 Starting Vite Frontend... && npm run dev"
Start-Process cmd.exe -ArgumentList "/k", $frontendCmd

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "      [+] ALL AUTHENTIX SERVICES STARTED!             " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  * Frontend Application:   http://localhost:5173" -ForegroundColor White
Write-Host "  * Backend API Docs:       http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  * Ethereum RPC:           http://127.0.0.1:8545" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services, run: .\stop.ps1" -ForegroundColor Gray
Write-Host ""
