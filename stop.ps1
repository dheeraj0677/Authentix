# =====================================================================
# Authentix - Clean Shutdown Script
# =====================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "         AUTHENTIX - STOPPING SERVICES                 " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(
    @{ Port = 8545; Name = "Hardhat Ethereum Node" },
    @{ Port = 8000; Name = "FastAPI Backend API" },
    @{ Port = 5173; Name = "Vite React Frontend" }
)

$killedCount = 0

foreach ($item in $ports) {
    $port = $item.Port
    $name = $item.Name
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            if ($procId -and $procId -ne 0) {
                try {
                    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    $procName = if ($proc) { $proc.ProcessName } else { "Unknown" }
                    Write-Host "Stopping $name (PID: $procId - $procName) on port $port..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    $killedCount++
                } catch {
                    Write-Host "Could not stop PID $procId : $_" -ForegroundColor DarkGray
                }
            }
        }
    } else {
        Write-Host "No active process found on port $port ($name)." -ForegroundColor Gray
    }
}

Write-Host ""
if ($killedCount -gt 0) {
    Write-Host "[✓] All Authentix services stopped successfully." -ForegroundColor Green
} else {
    Write-Host "[i] No running Authentix services were detected." -ForegroundColor Cyan
}
Write-Host ""
