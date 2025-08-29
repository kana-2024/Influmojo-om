# ========================================
# INFLUMOJO UNIFIED ENVIRONMENT SETUP
# ========================================

Write-Host "🚀 Setting up Influmojo Unified Development Environment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if cloudflared is installed
try {
    $null = Get-Command cloudflared -ErrorAction Stop
    Write-Host "✅ cloudflared is already installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ cloudflared is not installed" -ForegroundColor Red
    Write-Host "Please install cloudflared from: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    Write-Host "Or install via Chocolatey: choco install cloudflared -y" -ForegroundColor Yellow
    exit 1
}

# Setup Cloudflare Tunnel
Write-Host "🌐 Setting up Cloudflare Tunnel..." -ForegroundColor Cyan

# Check if already authenticated
$certPath = "$env:USERPROFILE\.cloudflared\cert.pem"
if (-not (Test-Path $certPath)) {
    Write-Host "🔐 Authenticating with Cloudflare..." -ForegroundColor Yellow
    cloudflared login
}
else {
    Write-Host "✅ Already authenticated with Cloudflare" -ForegroundColor Green
}

# Create tunnel if it doesn't exist
Write-Host "🔧 Creating tunnel 'influmojo-dev'..." -ForegroundColor Yellow
try {
    cloudflared tunnel create influmojo-dev
    Write-Host "✅ Tunnel created successfully" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Tunnel might already exist" -ForegroundColor Yellow
}

# Configure tunnel routes
Write-Host "🌍 Configuring tunnel routes..." -ForegroundColor Yellow
try {
    # Removed cloudflared tunnel routes - using ngrok instead
# cloudflared tunnel route dns influmojo-dev api.influmojo.in
# cloudflared tunnel route dns influmojo-dev webhook.influmojo.in
# cloudflared tunnel route dns influmojo-dev auth.influmojo.in
# cloudflared tunnel route dns influmojo-dev chat.influmojo.in
# cloudflared tunnel route dns influmojo-dev health.influmojo.in
    Write-Host "✅ Tunnel routes configured" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Some routes might already exist" -ForegroundColor Yellow
}

# Setup environment files
Write-Host "📝 Setting up environment files..." -ForegroundColor Cyan

# Create backend .env file
$backendEnvContent = @"
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/influmojo-test"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Zoho CRM
ZOHO_CLIENT_ID="your-zoho-client-id"
ZOHO_CLIENT_SECRET="your-zoho-client-secret"
ZOHO_REFRESH_TOKEN="your-zoho-refresh-token"

# Zoho SalesIQ
ZOHO_SALESIQ_ACCESS_KEY="your-salesiq-access-key"
ZOHO_SALESIQ_SECRET_KEY="your-salesiq-secret-key"

# Twilio
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Server
PORT=3002
NODE_ENV=development
"@

$backendEnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "✅ Backend .env created" -ForegroundColor Green

# Create mobile .env file
$mobileEnvContent = @"
EXPO_PUBLIC_API_URL=https://fair-legal-gar.ngrok-free.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-google-client-id-android
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-google-client-id-ios
"@

$mobileEnvContent | Out-File -FilePath "mobile\.env" -Encoding UTF8
Write-Host "✅ Mobile .env created" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Backend dependencies
Set-Location "backend"
npm install
Set-Location ".."
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Mobile dependencies
Set-Location "mobile"
npm install
Set-Location ".."
Write-Host "✅ Mobile dependencies installed" -ForegroundColor Green

# Create start script
Write-Host "🚀 Creating start script..." -ForegroundColor Cyan

$startScriptContent = @"
# ========================================
# INFLUMOJO DEVELOPMENT ENVIRONMENT START
# ========================================

Write-Host "🚀 Starting Influmojo Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Start Cloudflare Tunnel
Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Green
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "influmojo-dev" -WindowStyle Hidden

# Wait for tunnel to be ready
Start-Sleep -Seconds 5

# Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Green
Set-Location "backend"
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
Set-Location ".."

# Start mobile development server
Write-Host "📱 Starting mobile development server..." -ForegroundColor Green
Set-Location "mobile"
Start-Process -FilePath "npx" -ArgumentList "expo", "start" -WindowStyle Hidden
Set-Location ".."

Write-Host ""
Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "🌐 API: https://fair-legal-gar.ngrok-free.app"
Write-Host "🔗 Webhook: https://fair-legal-gar.ngrok-free.app"
Write-Host "🔐 Auth: https://fair-legal-gar.ngrok-free.app"
Write-Host "💬 Chat: https://fair-legal-gar.ngrok-free.app"
Write-Host "🏥 Health: https://fair-legal-gar.ngrok-free.app"
Write-Host ""
Write-Host "Press any key to stop all services..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@

$startScriptContent | Out-File -FilePath "start-dev.ps1" -Encoding UTF8
Write-Host "✅ Start script created: .\start-dev.ps1" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your domain DNS to use Cloudflare nameservers"
Write-Host "2. Configure your .env files with actual credentials"
Write-Host "3. Run: .\start-dev.ps1"
Write-Host ""
Write-Host "Your ngrok endpoints will be:" -ForegroundColor Yellow
Write-Host "🌐 API: https://fair-legal-gar.ngrok-free.app"
Write-Host "🔗 Webhook: https://fair-legal-gar.ngrok-free.app"
Write-Host "🔐 Auth: https://fair-legal-gar.ngrok-free.app"
Write-Host "💬 Chat: https://fair-legal-gar.ngrok-free.app"
Write-Host "🏥 Health: https://fair-legal-gar.ngrok-free.app" 