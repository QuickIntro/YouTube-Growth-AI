# ========================================
# YouTube Growth AI - Start All Services
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YouTube Growth AI - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exist
if (-not (Test-Path "frontend/node_modules") -or -not (Test-Path "backend/node_modules")) {
    Write-Host "ERROR: Dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host "This will open 3 new terminal windows" -ForegroundColor Gray
Write-Host ""

# Start Frontend (Terminal 1)
Write-Host "[1/3] Starting Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 2

# Start Backend (Terminal 2)
Write-Host "[2/3] Starting Backend (NestJS)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend API Server' -ForegroundColor Cyan; npm run start:dev"
Start-Sleep -Seconds 2

# Start Thumbnail Service (Terminal 3)
Write-Host "[3/3] Starting Thumbnail Service (Python)..." -ForegroundColor Yellow

# Detect Python command
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if ($pythonCmd) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\thumbnail-service'; Write-Host 'Thumbnail Analyzer Service' -ForegroundColor Cyan; $pythonCmd -m uvicorn main:app --reload --port 8000"
} else {
    Write-Host "  ⚠ Python not found. Thumbnail service not started." -ForegroundColor Yellow
}

Start-Sleep -Seconds 3

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running on:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:     http://localhost:4000" -ForegroundColor White
Write-Host "  API Docs:    http://localhost:4000/api/docs" -ForegroundColor White
Write-Host "  Thumbnail:   http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C in each terminal window" -ForegroundColor White
Write-Host "  Or run: .\stop.ps1" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
