#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Influmojo Production Setup Script"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Installing now..."
        yum install -y jq || apt-get update && apt-get install -y jq || true
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Installing now..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install --lts
        nvm use --lts
    fi
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 is not installed. Installing now..."
        npm install -g pm2
    fi
    
    print_success "Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package manager
    if command -v dnf &> /dev/null; then
        dnf update -y || true
        dnf install -y unzip curl wget || true
    elif command -v yum &> /dev/null; then
        yum update -y || true
        yum install -y unzip curl wget || true
    elif command -v apt-get &> /dev/null; then
        apt-get update || true
        apt-get install -y unzip curl wget || true
    fi
    
    print_success "Dependencies installed"
}

# Setup directory structure
setup_directories() {
    print_status "Setting up directory structure..."
    
    # Create deployment directories
    mkdir -p /home/ec2-user/deploys/influmojo-api/releases
    mkdir -p /home/ec2-user/apps/influmojo-api
    mkdir -p /home/ec2-user/scripts
    
    # Set proper ownership
    chown -R ec2-user:ec2-user /home/ec2-user/deploys
    chown -R ec2-user:ec2-user /home/ec2-user/apps
    chown -R ec2-user:ec2-user /home/ec2-user/scripts
    
    print_success "Directory structure created"
}

# Make scripts executable
make_scripts_executable() {
    print_status "Making deployment scripts executable..."
    
    chmod +x scripts/*.sh
    
    print_success "Scripts are now executable"
}

# Test AWS connectivity
test_aws_connectivity() {
    print_status "Testing AWS connectivity..."
    
    # Test if we can access SSM
    if aws ssm describe-parameters --region ap-south-1 --max-items 1 &> /dev/null; then
        print_success "AWS connectivity test passed"
    else
        print_error "AWS connectivity test failed. Check your credentials and permissions."
        exit 1
    fi
}

# Setup CodeDeploy
setup_codedeploy() {
    print_status "Setting up CodeDeploy..."
    
    # Check if CodeDeploy agent is already installed
    if systemctl list-unit-files | grep -q codedeploy-agent; then
        print_warning "CodeDeploy agent is already installed"
    else
        print_status "Installing CodeDeploy agent..."
        cd /home/ec2-user
        wget https://aws-codedeploy-ap-south-1.s3.ap-south-1.amazonaws.com/latest/install
        chmod +x ./install
        ./install auto
        rm ./install
    fi
    
    # Start and enable CodeDeploy agent
    systemctl start codedeploy-agent
    systemctl enable codedeploy-agent
    
    print_success "CodeDeploy setup completed"
}

# Main setup function
main() {
    echo "Starting production setup..."
    echo ""
    
    check_root
    check_prerequisites
    install_dependencies
    setup_directories
    make_scripts_executable
    test_aws_connectivity
    setup_codedeploy
    
    echo ""
    print_success "Production setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run: node setup-ssm-params.js (as ec2-user)"
    echo "2. Update SSM parameters with real values"
    echo "3. Run: sudo ./scripts/update-nginx.sh"
    echo "4. Configure GitHub Actions secrets"
    echo "5. Deploy via CodeDeploy"
    echo ""
    echo "For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"
