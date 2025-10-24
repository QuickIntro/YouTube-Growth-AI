# YouTube Growth AI - Quick Install

Write-Host ""
Write-Host "YouTube Growth AI - Installing Dependencies"
Write-Host ""

# Create .env
if (Test-Path ".env") {
    Write-Host "[OK] .env file exists"
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Created .env file"
}

# Install root
Write-Host ""
Write-Host "[1/3] Installing root dependencies..."
npm install --legacy-peer-deps
Write-Host "[OK] Root done"

# Install frontend
Write-Host ""
Write-Host "[2/3] Installing frontend..."
Set-Location frontend
npm install --legacy-peer-deps
Set-Location ..
Write-Host "[OK] Frontend done"

# Install backend
Write-Host ""
Write-Host "[3/3] Installing backend..."
Set-Location backend
npm install --legacy-peer-deps
Set-Location ..
Write-Host "[OK] Backend done"

# Done
Write-Host ""
Write-Host "========================================"
Write-Host "Setup Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host ""
Write-Host "1. Setup Database:"
Write-Host "   Go to: https://dzdnperklrtelnjiscgy.supabase.co"
Write-Host "   SQL Editor -> New Query"
Write-Host "   Copy database\schema.sql and Run"
Write-Host ""
Write-Host "2. Start app:"
Write-Host "   .\start-simple.ps1"
Write-Host ""
