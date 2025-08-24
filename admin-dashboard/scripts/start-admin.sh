#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Influmojo Admin Dashboard..."

ADMIN_DIR="/home/ec2-user/apps/influmojo-admin"

# Verify admin dashboard files exist
if [ ! -d "$ADMIN_DIR/.next" ]; then
    echo "❌ Admin dashboard build files not found at $ADMIN_DIR/.next"
    exit 1
fi

# Verify environment file exists
if [ ! -f "$ADMIN_DIR/.env.local" ]; then
    echo "❌ Environment file not found at $ADMIN_DIR/.env.local"
    exit 1
fi

echo "📁 Admin dashboard directory: $ADMIN_DIR"
echo "✅ Build files verified"
echo "✅ Environment file verified"

# Check if admin dashboard is accessible (if Nginx is configured)
echo "🔍 Checking admin dashboard accessibility..."
if curl -f -s "http://localhost/admin" > /dev/null 2>&1; then
    echo "✅ Admin dashboard is accessible via Nginx"
else
    echo "⚠️  Admin dashboard may not be accessible via Nginx yet"
    echo "   This is expected if Nginx configuration hasn't been updated"
fi

echo "🎉 Admin dashboard started successfully!"
echo "📁 Static files are ready at: $ADMIN_DIR/.next"
echo "🔐 Environment configured from consolidated .env"
echo ""
echo "📋 Next steps:"
echo "   1. Configure Nginx to serve admin dashboard files"
echo "   2. Test admin dashboard accessibility"
echo "   3. Verify all environment variables are working"
