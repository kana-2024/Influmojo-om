#!/usr/bin/env bash
set -euo pipefail

echo "🏥 Running admin dashboard health check..."

ADMIN_DIR="/home/ec2-user/apps/influmojo-admin"

# Check if admin dashboard directory exists
if [ ! -d "$ADMIN_DIR" ]; then
    echo "❌ Admin dashboard directory not found"
    exit 1
fi

# Check if build files exist
if [ ! -d "$ADMIN_DIR/.next" ]; then
    echo "❌ Admin dashboard build files not found"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ADMIN_DIR/.env.local" ]; then
    echo "❌ Admin dashboard environment file not found"
    exit 1
fi

# Check environment file permissions
ENV_PERMS=$(stat -c "%a" "$ADMIN_DIR/.env.local")
if [ "$ENV_PERMS" != "600" ]; then
    echo "⚠️  Environment file permissions are $ENV_PERMS (should be 600)"
else
    echo "✅ Environment file permissions are correct (600)"
fi

# Verify critical environment variables
echo "🔍 Verifying environment variables..."
if grep -q "^NEXT_PUBLIC_ADMIN_API_URL=" "$ADMIN_DIR/.env.local"; then
    echo "✅ NEXT_PUBLIC_ADMIN_API_URL is set"
else
    echo "❌ NEXT_PUBLIC_ADMIN_API_URL not found"
    exit 1
fi

if grep -q "^NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY=" "$ADMIN_DIR/.env.local"; then
    echo "✅ NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY is set"
else
    echo "❌ NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY not found"
    exit 1
fi

# Check file sizes to ensure build was successful
NEXT_SIZE=$(du -sh "$ADMIN_DIR/.next" 2>/dev/null | cut -f1 || echo "0")
if [ "$NEXT_SIZE" != "0" ] && [ "$NEXT_SIZE" != "0B" ]; then
    echo "✅ Build files size: $NEXT_SIZE"
else
    echo "❌ Build files appear to be empty"
    exit 1
fi

echo "🎉 Admin dashboard health check completed successfully!"
echo "✅ Admin dashboard is healthy and ready to serve"
