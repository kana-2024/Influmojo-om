# ========================================
# INFLUMOJO DEVELOPMENT START SCRIPT (Windows)
# ========================================

Write-Host "Starting Influmojo Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $null = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
        Write-Host "Port $Port is already in use" -ForegroundColor Yellow
        return $false
    }
    catch {
        return $true
    }
}

# Start Cloudflare Tunnel
Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Green
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "influmojo-dev" -WindowStyle Hidden
$TunnelProcess = Get-Process | Where-Object { $_.ProcessName -eq "cloudflared" } | Select-Object -Last 1

# Wait for tunnel to be ready
Start-Sleep -Seconds 5

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
if (Test-Port 3002) {
    Set-Location "backend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
    Set-Location ".."
    $BackendProcess = Get-Process | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Last 1
}
else {
    Write-Host "Backend server might already be running" -ForegroundColor Yellow
}

# Start mobile development server
Write-Host "Starting mobile development server..." -ForegroundColor Green
if (Test-Port 8081) {
    Set-Location "mobile"
    Start-Process -FilePath "npx" -ArgumentList "expo", "start" -WindowStyle Hidden
    Set-Location ".."
    $MobileProcess = Get-Process | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Last 1
}
else {
    Write-Host "Mobile server might already be running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "API: https://api.influmojo.in"
Write-Host "Webhook: https://webhook.influmojo.in"
Write-Host "Auth: https://auth.influmojo.in"
Write-Host "Chat: https://chat.influmojo.in"
Write-Host "Health: https://health.influmojo.in"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"

# Wait for interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    
    if ($TunnelProcess) {
        Stop-Process -Id $TunnelProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($BackendProcess) {
        Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($MobileProcess) {
        Stop-Process -Id $MobileProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Kill all cloudflared and node processes related to our project
    Get-Process | Where-Object { $_.ProcessName -eq "cloudflared" -or $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
}
