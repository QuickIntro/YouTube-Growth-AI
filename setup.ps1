# ========================================
# YouTube Growth AI - Automated Setup Script
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YouTube Growth AI - Local Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in project directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Create .env file
Write-Host "[1/5] Creating .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  .env already exists. Skipping..." -ForegroundColor Gray
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ .env file created" -ForegroundColor Green
}

# Step 2: Install root dependencies
Write-Host ""
Write-Host "[2/5] Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Install frontend dependencies
Write-Host ""
Write-Host "[3/5] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Step 4: Install backend dependencies
Write-Host ""
Write-Host "[4/5] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Step 5: Install Python dependencies
Write-Host ""
Write-Host "[5/5] Installing Python dependencies..." -ForegroundColor Yellow
Set-Location thumbnail-service

# Check if Python is installed
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "  ✗ Python not found. Please install Python 3.11+" -ForegroundColor Red
    Set-Location ..
    exit 1
}

& $pythonCmd -m pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install Python dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database schema in Supabase (see database/README.md)" -ForegroundColor White
Write-Host "2. Start the application with: .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or start services manually:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  Terminal 2: cd backend && npm run start:dev" -ForegroundColor White
Write-Host "  Terminal 3: cd thumbnail-service && python -m uvicorn main:app --reload --port 8000" -ForegroundColor White
Write-Host ""
Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
