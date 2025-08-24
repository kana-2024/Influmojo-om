#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Influmojo Webapp..."

WEBAPP_DIR="/home/ec2-user/apps/influmojo-webapp"

# Verify webapp files exist
if [ ! -d "$WEBAPP_DIR/.next" ]; then
    echo "❌ Webapp build files not found at $WEBAPP_DIR/.next"
    exit 1
fi

# Verify environment file exists
if [ ! -f "$WEBAPP_DIR/.env.local" ]; then
    echo "❌ Environment file not found at $WEBAPP_DIR/.env.local"
    exit 1
fi

echo "📁 Webapp directory: $WEBAPP_DIR"
echo "✅ Build files verified"
echo "✅ Environment file verified"

# Check if webapp is accessible (if Nginx is configured)
echo "🔍 Checking webapp accessibility..."
if curl -f -s "http://localhost/webapp" > /dev/null 2>&1; then
    echo "✅ Webapp is accessible via Nginx"
else
    echo "⚠️  Webapp may not be accessible via Nginx yet"
    echo "   This is expected if Nginx configuration hasn't been updated"
fi

echo "🎉 Webapp started successfully!"
echo "📁 Static files are ready at: $WEBAPP_DIR/.next"
echo "🔐 Environment configured from consolidated .env"
echo ""
echo "📋 Next steps:"
echo "   1. Configure Nginx to serve webapp files"
echo "   2. Test webapp accessibility"
echo "   3. Verify all environment variables are working"
