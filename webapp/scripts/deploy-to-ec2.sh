#!/bin/bash
set -euo pipefail

# Configuration
EC2_USER="ec2-user"
EC2_HOST="13.232.254.45"  # Set this to your EC2 public IP or hostname
EC2_KEY_PATH="/c/aws-keys/influmojo-ec2-key.pem"  # Set this to your EC2 key file path
WEBAPP_DIR="/opt/influmojo/webapp"
PACKAGE_FILE="webapp-standalone.zip"

echo "🚀 Deploying Influmojo Webapp to EC2..."

# Check if package exists
if [ ! -f "$PACKAGE_FILE" ]; then
    echo "❌ Package file $PACKAGE_FILE not found!"
    echo "💡 Run ./scripts/build-and-package.sh first"
    exit 1
fi

# Check if EC2 details are configured
if [ -z "$EC2_HOST" ] || [ -z "$EC2_KEY_PATH" ]; then
    echo "❌ EC2 configuration missing!"
    echo "💡 Edit this script and set EC2_HOST and EC2_KEY_PATH"
    exit 1
fi

# Check if security group allows current IP
echo "⚠️  Make sure your security group allows SSH from your current IP:"
echo "   Add this rule to 'launch-wizard-1' security group:"
echo "   Type: SSH, Port: 22, Source: 157.50.157.18/32"
echo ""

# Check if key file exists
if [ ! -f "$EC2_KEY_PATH" ]; then
    echo "❌ EC2 key file not found: $EC2_KEY_PATH"
    exit 1
fi

echo "📡 Uploading package to EC2..."
scp -i "$EC2_KEY_PATH" "$PACKAGE_FILE" "$EC2_USER@$EC2_HOST:~/"

echo "🔧 Deploying on EC2..."
ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << 'EOF'
    set -euo pipefail
    
    echo "📁 Setting up webapp directory..."
    sudo mkdir -p /opt/influmojo/webapp
    sudo chown ec2-user:ec2-user /opt/influmojo/webapp
    cd /opt/influmojo/webapp
    
    echo "📦 Extracting new webapp..."
    unzip ~/webapp-standalone.zip -d .
    
    echo "🔄 Restarting webapp with PM2..."
    # Stop existing webapp if running
    pm2 stop webapp 2>/dev/null || true
    pm2 delete webapp 2>/dev/null || true
    
    # Start new webapp
    NODE_ENV=production PORT=3000 HOST=0.0.0.0 \
    pm2 start "node server.js" --name webapp --update-env
    
    # Save PM2 configuration
    pm2 save
    
    echo "✅ Webapp deployed successfully!"
    echo "🌐 Webapp should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
    
    # Show PM2 status
    pm2 status
EOF

echo ""
echo "🎉 Deployment completed!"
echo "💡 To check logs: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 logs webapp'"
echo "💡 To restart: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 restart webapp'"
