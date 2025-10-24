# YouTube Growth AI - Start

Write-Host ""
Write-Host "Starting services..."
Write-Host ""

# Frontend
Write-Host "Starting Frontend..."
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'FRONTEND' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# Backend
Write-Host "Starting Backend..."
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'BACKEND' -ForegroundColor Green; npm run start:dev"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Services started!"
Write-Host ""
Write-Host "Opening browser..."
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:4000"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
