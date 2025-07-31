# ========================================
# INFLUMOJO UNIFIED ENVIRONMENT SETUP (Windows)
# ========================================
# This PowerShell script sets up the unified development environment
# using influmojo.in domain with Cloudflare Tunnel

param(
    [switch]$SkipCloudflareInstall
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Influmojo Unified Development Environment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Check if cloudflared is installed
function Test-Cloudflared {
    try {
        $null = Get-Command cloudflared -ErrorAction Stop
        Write-Status "cloudflared is already installed"
        return $true
    }
    catch {
        Write-Error "cloudflared is not installed"
        return $false
    }
}

# Install cloudflared
function Install-Cloudflared {
    Write-Info "Installing cloudflared..."
    
    if (-not $SkipCloudflareInstall) {
        try {
            # Try to install via Chocolatey
            if (Get-Command choco -ErrorAction SilentlyContinue) {
                Write-Info "Installing via Chocolatey..."
                choco install cloudflared -y
            }
            else {
                Write-Warning "Chocolatey not found. Please install cloudflared manually:"
                Write-Info "Download from: https://github.com/cloudflare/cloudflared/releases"
                Write-Info "Or install Chocolatey first: https://chocolatey.org/install"
                exit 1
            }
        }
        catch {
            Write-Error "Failed to install cloudflared"
            Write-Info "Please install manually from: https://github.com/cloudflare/cloudflared/releases"
            exit 1
        }
    }
    else {
        Write-Warning "Skipping cloudflared installation"
    }
}

# Setup Cloudflare Tunnel
function Setup-CloudflareTunnel {
    Write-Info "Setting up Cloudflare Tunnel..."
    
    # Check if already authenticated
    $certPath = "$env:USERPROFILE\.cloudflared\cert.pem"
    if (-not (Test-Path $certPath)) {
        Write-Info "Authenticating with Cloudflare..."
        cloudflared login
    }
    else {
        Write-Status "Already authenticated with Cloudflare"
    }
    
    # Create tunnel if it doesn't exist
    Write-Info "Creating tunnel 'influmojo-dev'..."
    try {
        cloudflared tunnel create influmojo-dev
        Write-Status "Tunnel created successfully"
    }
    catch {
        Write-Warning "Tunnel might already exist"
    }
    
    # Create config directory
    $configDir = "$env:USERPROFILE\.cloudflared"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Copy config file
    if (Test-Path "cloudflared-config.yml") {
        Copy-Item "cloudflared-config.yml" "$configDir\config.yml" -Force
        Write-Status "Cloudflare config copied to $configDir\config.yml"
    }
    else {
        Write-Error "cloudflared-config.yml not found in current directory"
        exit 1
    }
    
    # Setup DNS routes
    Write-Info "Setting up DNS routes..."
    $subdomains = @("api", "dev", "webhook", "auth", "chat", "health")
    
    foreach ($subdomain in $subdomains) {
        try {
            cloudflared tunnel route dns influmojo-dev "$subdomain.influmojo.in"
            Write-Status "DNS route configured for $subdomain.influmojo.in"
        }
        catch {
            Write-Warning "DNS route for $subdomain.influmojo.in might already exist"
        }
    }
    
    Write-Status "DNS routes configured"
}

# Setup environment files
function Setup-EnvFiles {
    Write-Info "Setting up environment files..."
    
    # Mobile app
    if (Test-Path "mobile\.env.unified") {
        Copy-Item "mobile\.env.unified" "mobile\.env" -Force
        Write-Status "Mobile environment file created"
    }
    else {
        Write-Warning "mobile\.env.unified not found"
    }
    
    # Backend
    if (Test-Path "backend\.env.unified") {
        Copy-Item "backend\.env.unified" "backend\.env" -Force
        Write-Status "Backend environment file created"
    }
    else {
        Write-Warning "backend\.env.unified not found"
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Installing dependencies..."
    
    # Backend dependencies
    if (Test-Path "backend") {
        Set-Location "backend"
        npm install
        Set-Location ".."
        Write-Status "Backend dependencies installed"
    }
    
    # Mobile dependencies
    if (Test-Path "mobile") {
        Set-Location "mobile"
        npm install
        Set-Location ".."
        Write-Status "Mobile dependencies installed"
    }
}

# Create start script
function New-StartScript {
    Write-Info "Creating start script..."
    
    $startScript = @"
# ========================================
# INFLUMOJO DEVELOPMENT START SCRIPT (Windows)
# ========================================

Write-Host "🚀 Starting Influmojo Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]`$Port)
    try {
        `$null = Get-NetTCPConnection -LocalPort `$Port -ErrorAction Stop
        Write-Host "⚠️  Port `$Port is already in use" -ForegroundColor Yellow
        return `$false
    }
    catch {
        return `$true
    }
}

# Start Cloudflare Tunnel
Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Green
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "influmojo-dev" -WindowStyle Hidden
`$TunnelProcess = Get-Process | Where-Object { `$_.ProcessName -eq "cloudflared" } | Select-Object -Last 1

# Wait for tunnel to be ready
Start-Sleep -Seconds 5

# Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Green
if (Test-Port 3002) {
    Set-Location "backend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
    Set-Location ".."
    `$BackendProcess = Get-Process | Where-Object { `$_.ProcessName -eq "node" } | Select-Object -Last 1
}
else {
    Write-Host "⚠️  Backend server might already be running" -ForegroundColor Yellow
}

# Start mobile development server
Write-Host "📱 Starting mobile development server..." -ForegroundColor Green
if (Test-Port 8081) {
    Set-Location "mobile"
    Start-Process -FilePath "npx" -ArgumentList "expo", "start" -WindowStyle Hidden
    Set-Location ".."
    `$MobileProcess = Get-Process | Where-Object { `$_.ProcessName -eq "node" } | Select-Object -Last 1
}
else {
    Write-Host "⚠️  Mobile server might already be running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "🌐 API: https://api.influmojo.in"
Write-Host "🔗 Webhook: https://webhook.influmojo.in"
Write-Host "🔐 Auth: https://auth.influmojo.in"
Write-Host "💬 Chat: https://chat.influmojo.in"
Write-Host "🏥 Health: https://health.influmojo.in"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"

# Wait for interrupt
try {
    while (`$true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
    
    if (`$TunnelProcess) {
        Stop-Process -Id `$TunnelProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if (`$BackendProcess) {
        Stop-Process -Id `$BackendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if (`$MobileProcess) {
        Stop-Process -Id `$MobileProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Kill all cloudflared and node processes related to our project
    Get-Process | Where-Object { `$_.ProcessName -eq "cloudflared" -or `$_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
}
"@

    $startScript | Out-File -FilePath "start-dev.ps1" -Encoding UTF8
    Write-Status "Start script created: .\start-dev.ps1"
}

# Main setup
function Main {
    Write-Host "Starting setup process..." -ForegroundColor Cyan
    
    # Check and install cloudflared
    if (-not (Test-Cloudflared)) {
        Install-Cloudflared
    }
    
    Setup-CloudflareTunnel
    Setup-EnvFiles
    Install-Dependencies
    New-StartScript
    
    Write-Host ""
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update your domain DNS to use Cloudflare nameservers"
    Write-Host "2. Configure your .env files with actual credentials"
    Write-Host "3. Run: .\start-dev.ps1"
    Write-Host ""
    Write-Host "Your unified endpoints will be:" -ForegroundColor Yellow
    Write-Host "🌐 API: https://api.influmojo.in"
    Write-Host "🔗 Webhook: https://webhook.influmojo.in"
    Write-Host "🔐 Auth: https://auth.influmojo.in"
    Write-Host "💬 Chat: https://chat.influmojo.in"
    Write-Host "🏥 Health: https://health.influmojo.in"
}

# Run main function
Main 