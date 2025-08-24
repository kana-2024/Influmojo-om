#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Installing dependencies..."

# Update package manager
dnf update -y || true

# Install AWS CLI v2 and jq
if ! command -v aws &> /dev/null; then
    echo "📦 Installing AWS CLI v2..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip
    echo "✅ AWS CLI v2 installed"
else
    echo "✅ AWS CLI already installed"
fi

if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq..."
    dnf install -y jq || yum install -y jq || apt-get update && apt-get install -y jq || true
    echo "✅ jq installed"
else
    echo "✅ jq already installed"
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm use --lts
    echo "✅ Node.js installed"
else
    echo "✅ Node.js already installed"
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

echo "🎉 All dependencies installed successfully!"
