# ========================================
# YouTube Growth AI - Stop All Services
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YouTube Growth AI - Stopping Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill process on port
function Stop-ProcessOnPort {
    param($Port)
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    
    if ($connections) {
        foreach ($connection in $connections) {
            $parts = $connection -split '\s+' | Where-Object { $_ -ne '' }
            $pid = $parts[-1]
            
            if ($pid -and $pid -match '^\d+$') {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✓ Stopped process on port $Port (PID: $pid)" -ForegroundColor Green
                } catch {
                    Write-Host "  ⚠ Could not stop process on port $Port" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "  - No process running on port $Port" -ForegroundColor Gray
    }
}

# Stop services
Write-Host "Stopping all services..." -ForegroundColor Yellow
Write-Host ""

Write-Host "[1/3] Stopping Frontend (port 3000)..." -ForegroundColor Yellow
Stop-ProcessOnPort 3000

Write-Host "[2/3] Stopping Backend (port 4000)..." -ForegroundColor Yellow
Stop-ProcessOnPort 4000

Write-Host "[3/3] Stopping Thumbnail Service (port 8000)..." -ForegroundColor Yellow
Stop-ProcessOnPort 8000

# Also stop Redis if running
Write-Host "[4/4] Stopping Redis (port 6379)..." -ForegroundColor Yellow
Stop-ProcessOnPort 6379

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ All Services Stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start again, run: .\start.ps1" -ForegroundColor Cyan
Write-Host ""
