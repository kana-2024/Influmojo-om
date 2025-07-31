#!/bin/bash

# ========================================
# INFLUMOJO UNIFIED ENVIRONMENT SETUP
# ========================================
# This script sets up the unified development environment
# using influmojo.in domain with Cloudflare Tunnel

set -e

echo "🚀 Setting up Influmojo Unified Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if cloudflared is installed
check_cloudflared() {
    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared is not installed"
        print_info "Installing cloudflared..."
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install cloudflared
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
            sudo dpkg -i cloudflared-linux-amd64.deb
            rm cloudflared-linux-amd64.deb
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            # Windows (Git Bash)
            print_warning "Please install cloudflared manually on Windows:"
            print_info "Download from: https://github.com/cloudflare/cloudflared/releases"
            print_info "Or use: choco install cloudflared"
            exit 1
        else
            print_error "Unsupported OS. Please install cloudflared manually."
            exit 1
        fi
    else
        print_status "cloudflared is already installed"
    fi
}

# Setup Cloudflare Tunnel
setup_cloudflare_tunnel() {
    print_info "Setting up Cloudflare Tunnel..."
    
    # Check if already authenticated
    if [ ! -f ~/.cloudflared/cert.pem ]; then
        print_info "Authenticating with Cloudflare..."
        cloudflared login
    else
        print_status "Already authenticated with Cloudflare"
    fi
    
    # Create tunnel if it doesn't exist
    print_info "Creating tunnel 'influmojo-dev'..."
    cloudflared tunnel create influmojo-dev || print_warning "Tunnel might already exist"
    
    # Create config directory
    mkdir -p ~/.cloudflared
    
    # Copy config file
    if [ -f "cloudflared-config.yml" ]; then
        cp cloudflared-config.yml ~/.cloudflared/config.yml
        print_status "Cloudflare config copied to ~/.cloudflared/config.yml"
    else
        print_error "cloudflared-config.yml not found in current directory"
        exit 1
    fi
    
    # Setup DNS routes
    print_info "Setting up DNS routes..."
    cloudflared tunnel route dns influmojo-dev api.influmojo.in
    cloudflared tunnel route dns influmojo-dev dev.influmojo.in
    cloudflared tunnel route dns influmojo-dev webhook.influmojo.in
    cloudflared tunnel route dns influmojo-dev auth.influmojo.in
    cloudflared tunnel route dns influmojo-dev chat.influmojo.in
    cloudflared tunnel route dns influmojo-dev health.influmojo.in
    
    print_status "DNS routes configured"
}

# Setup environment files
setup_env_files() {
    print_info "Setting up environment files..."
    
    # Mobile app
    if [ -f "mobile/.env.unified" ]; then
        cp mobile/.env.unified mobile/.env
        print_status "Mobile environment file created"
    else
        print_warning "mobile/.env.unified not found"
    fi
    
    # Backend
    if [ -f "backend/.env.unified" ]; then
        cp backend/.env.unified backend/.env
        print_status "Backend environment file created"
    else
        print_warning "backend/.env.unified not found"
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ]; then
        cd backend
        npm install
        cd ..
        print_status "Backend dependencies installed"
    fi
    
    # Mobile dependencies
    if [ -d "mobile" ]; then
        cd mobile
        npm install
        cd ..
        print_status "Mobile dependencies installed"
    fi
}

# Create start script
create_start_script() {
    print_info "Creating start script..."
    
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# ========================================
# INFLUMOJO DEVELOPMENT START SCRIPT
# ========================================

echo "🚀 Starting Influmojo Development Environment"
echo "============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Start Cloudflare Tunnel
echo -e "${GREEN}🌐 Starting Cloudflare Tunnel...${NC}"
cloudflared tunnel run influmojo-dev &
TUNNEL_PID=$!

# Wait for tunnel to be ready
sleep 5

# Start backend server
echo -e "${GREEN}🔧 Starting backend server...${NC}"
if check_port 3002; then
    cd backend && npm start &
    BACKEND_PID=$!
    cd ..
else
    echo -e "${YELLOW}⚠️  Backend server might already be running${NC}"
fi

# Start mobile development server
echo -e "${GREEN}📱 Starting mobile development server...${NC}"
if check_port 8081; then
    cd mobile && npx expo start &
    MOBILE_PID=$!
    cd ..
else
    echo -e "${YELLOW}⚠️  Mobile server might already be running${NC}"
fi

echo ""
echo -e "${GREEN}✅ Development environment started!${NC}"
echo "============================================="
echo "🌐 API: https://api.influmojo.in"
echo "🔗 Webhook: https://webhook.influmojo.in"
echo "🔐 Auth: https://auth.influmojo.in"
echo "💬 Chat: https://chat.influmojo.in"
echo "🏥 Health: https://health.influmojo.in"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $TUNNEL_PID $BACKEND_PID $MOBILE_PID 2>/dev/null; exit' INT

wait
EOF

    chmod +x start-dev.sh
    print_status "Start script created: ./start-dev.sh"
}

# Main setup
main() {
    echo "Starting setup process..."
    
    check_cloudflared
    setup_cloudflare_tunnel
    setup_env_files
    install_dependencies
    create_start_script
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "=================================================="
    echo "Next steps:"
    echo "1. Update your domain DNS to use Cloudflare nameservers"
    echo "2. Configure your .env files with actual credentials"
    echo "3. Run: ./start-dev.sh"
    echo ""
    echo "Your unified endpoints will be:"
    echo "🌐 API: https://api.influmojo.in"
    echo "🔗 Webhook: https://webhook.influmojo.in"
    echo "🔐 Auth: https://auth.influmojo.in"
    echo "💬 Chat: https://chat.influmojo.in"
    echo "🏥 Health: https://health.influmojo.in"
}

# Run main function
main "$@" 