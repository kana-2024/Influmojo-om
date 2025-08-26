#!/bin/bash
set -euo pipefail

echo "🚀 Building and packaging Influmojo Webapp for EC2 deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -f webapp-standalone.tgz

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --no-audit --no-fund

# Build the application
echo "🔨 Building application..."
npm run build

# Verify standalone output exists
if [ ! -d ".next/standalone" ]; then
    echo "❌ Standalone output not found. Check Next.js config."
    exit 1
fi

# Package the standalone output
echo "📦 Packaging standalone output..."
tar czf webapp-standalone.tgz .next/standalone .next/static public

# Show package info
PACKAGE_SIZE=$(du -h webapp-standalone.tgz | cut -f1)
echo "✅ Package created: webapp-standalone.tgz ($PACKAGE_SIZE)"

echo ""
echo "🎉 Build and packaging completed!"
echo "📁 Package: webapp-standalone.tgz"
echo "📋 Next steps:"
echo "   1. Copy webapp-standalone.tgz to your EC2 instance"
echo "   2. Extract and deploy using PM2"
echo ""
echo "💡 Deployment commands for EC2:"
echo "   mkdir -p /opt/influmojo/webapp && cd /opt/influmojo/webapp"
echo "   tar xzf ~/webapp-standalone.tgz -C ."
echo "   NODE_ENV=production PORT=3000 HOST=0.0.0.0 pm2 start \"node server.js\" --name webapp --update-env"
echo "   pm2 save"
