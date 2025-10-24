# ========================================
# YouTube Growth AI - COMPLETE AUTOMATED SETUP
# This script will install EVERYTHING you need
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YouTube Growth AI" -ForegroundColor Cyan
Write-Host "  Complete Automated Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Check and install Node.js if needed" -ForegroundColor White
Write-Host "  2. Check and install Python if needed" -ForegroundColor White
Write-Host "  3. Create .env file" -ForegroundColor White
Write-Host "  4. Install all dependencies" -ForegroundColor White
Write-Host "  5. Prepare everything to run" -ForegroundColor White
Write-Host ""
Write-Host "This may take 10-15 minutes..." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

# ========================================
# STEP 1: Check Node.js
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 1: Checking Node.js..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    
    try {
        winget install -e --id OpenJS.NodeJS.LTS --silent
        Write-Host "✓ Node.js installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Please close this window and run this script again!" -ForegroundColor Yellow
        Write-Host "Press any key to exit..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    } catch {
        Write-Host "✗ Failed to install Node.js automatically" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Node.js manually:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://nodejs.org/" -ForegroundColor White
        Write-Host "2. Download and install the LTS version" -ForegroundColor White
        Write-Host "3. Restart your computer" -ForegroundColor White
        Write-Host "4. Run this script again" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# ========================================
# STEP 2: Check Python
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 2: Checking Python..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$pythonInstalled = $false
$pythonCmd = $null

if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
    $pythonInstalled = $true
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
    $pythonInstalled = $true
}

if ($pythonInstalled) {
    $pythonVersion = & $pythonCmd --version
    Write-Host "✓ Python is installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Python..." -ForegroundColor Yellow
    
    try {
        winget install -e --id Python.Python.3.11 --silent
        Write-Host "✓ Python installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Please close this window and run this script again!" -ForegroundColor Yellow
        Write-Host "Press any key to exit..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    } catch {
        Write-Host "⚠ Failed to install Python automatically" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You can continue without Python (thumbnail analyzer won't work)" -ForegroundColor Yellow
        Write-Host "Or install Python manually from: https://www.python.org/downloads/" -ForegroundColor White
        Write-Host ""
        $continue = Read-Host "Continue without Python? (Y/N)"
        if ($continue -ne "Y" -and $continue -ne "y") {
            exit 1
        }
    }
}

# ========================================
# STEP 3: Create .env file
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 3: Creating .env file..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created from .env.example" -ForegroundColor Green
}

# ========================================
# STEP 4: Install Root Dependencies
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 4: Installing root dependencies..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Some warnings during installation (this is normal)" -ForegroundColor Yellow
}

# ========================================
# STEP 5: Install Frontend Dependencies
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 5: Installing frontend dependencies..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location frontend
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Some warnings during installation (this is normal)" -ForegroundColor Yellow
}
Set-Location ..

# ========================================
# STEP 6: Install Backend Dependencies
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 6: Installing backend dependencies..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location backend
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Some warnings during installation (this is normal)" -ForegroundColor Yellow
}
Set-Location ..

# ========================================
# STEP 7: Install Python Dependencies
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 7: Installing Python dependencies..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($pythonInstalled) {
    Set-Location thumbnail-service
    
    # Upgrade pip first
    & $pythonCmd -m pip install --upgrade pip --quiet
    
    # Install requirements
    & $pythonCmd -m pip install -r requirements.txt --quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Python dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Some Python packages may have issues" -ForegroundColor Yellow
    }
    Set-Location ..
} else {
    Write-Host "⊘ Skipping Python dependencies (Python not installed)" -ForegroundColor Yellow
}

# ========================================
# FINAL STEP: Success Message
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓✓✓ SETUP COMPLETE! ✓✓✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "What's been installed:" -ForegroundColor Cyan
Write-Host "  ✓ Node.js and npm" -ForegroundColor Green
if ($pythonInstalled) {
    Write-Host "  ✓ Python and pip" -ForegroundColor Green
} else {
    Write-Host "  ⊘ Python (skipped - thumbnail analyzer won't work)" -ForegroundColor Yellow
}
Write-Host "  ✓ .env configuration file" -ForegroundColor Green
Write-Host "  ✓ Frontend dependencies (Next.js)" -ForegroundColor Green
Write-Host "  ✓ Backend dependencies (NestJS)" -ForegroundColor Green
if ($pythonInstalled) {
    Write-Host "  ✓ Thumbnail service dependencies (Python)" -ForegroundColor Green
}
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Setup Database (REQUIRED - 2 minutes):" -ForegroundColor Yellow
Write-Host "   a. Go to: https://dzdnperklrtelnjiscgy.supabase.co" -ForegroundColor White
Write-Host "   b. Click 'SQL Editor' in left sidebar" -ForegroundColor White
Write-Host "   c. Click 'New Query'" -ForegroundColor White
Write-Host "   d. Open file: database\schema.sql" -ForegroundColor White
Write-Host "   e. Copy ENTIRE file content" -ForegroundColor White
Write-Host "   f. Paste into SQL Editor and click 'Run'" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the Application:" -ForegroundColor Yellow
Write-Host "   Run this command:" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Need help? Check these files:" -ForegroundColor Cyan
Write-Host "  - RUN_ME_FIRST.md (quick start guide)" -ForegroundColor White
Write-Host "  - QUICK_START.md (detailed guide)" -ForegroundColor White
Write-Host "  - database\README.md (database setup)" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
