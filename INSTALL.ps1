# ========================================
# YouTube Growth AI - Simple Setup
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YouTube Growth AI - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create .env
Write-Host "[1/4] Creating .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  .env already exists" -ForegroundColor Gray
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created .env file" -ForegroundColor Green
}

# Step 2: Install root dependencies
Write-Host ""
Write-Host "[2/4] Installing root dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps 2>&1 | Out-Null
Write-Host "  ✓ Root dependencies installed" -ForegroundColor Green

# Step 3: Install frontend
Write-Host ""
Write-Host "[3/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install --legacy-peer-deps 2>&1 | Out-Null
Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

# Step 4: Install backend
Write-Host ""
Write-Host "[4/4] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install --legacy-peer-deps 2>&1 | Out-Null
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Success
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Setup Database:" -ForegroundColor Yellow
Write-Host "   - Go to: https://dzdnperklrtelnjiscgy.supabase.co" -ForegroundColor White
Write-Host "   - SQL Editor -> New Query" -ForegroundColor White
Write-Host "   - Copy ALL of database\schema.sql" -ForegroundColor White
Write-Host "   - Paste and Run" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the app:" -ForegroundColor Yellow
Write-Host "   .\start-simple.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
