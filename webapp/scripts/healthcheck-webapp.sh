#!/usr/bin/env bash
set -euo pipefail

echo "🏥 Running webapp health check..."

WEBAPP_DIR="/home/ec2-user/apps/influmojo-webapp"

# Check if webapp directory exists
if [ ! -d "$WEBAPP_DIR" ]; then
    echo "❌ Webapp directory not found"
    exit 1
fi

# Check if build files exist
if [ ! -d "$WEBAPP_DIR/.next" ]; then
    echo "❌ Webapp build files not found"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$WEBAPP_DIR/.env.local" ]; then
    echo "❌ Webapp environment file not found"
    exit 1
fi

# Check environment file permissions
ENV_PERMS=$(stat -c "%a" "$WEBAPP_DIR/.env.local")
if [ "$ENV_PERMS" != "600" ]; then
    echo "⚠️  Environment file permissions are $ENV_PERMS (should be 600)"
else
    echo "✅ Environment file permissions are correct (600)"
fi

# Verify critical environment variables
echo "🔍 Verifying environment variables..."
if grep -q "^NEXT_PUBLIC_API_URL=" "$WEBAPP_DIR/.env.local"; then
    echo "✅ NEXT_PUBLIC_API_URL is set"
else
    echo "❌ NEXT_PUBLIC_API_URL not found"
    exit 1
fi

if grep -q "^NEXT_PUBLIC_WEBAPP_URL=" "$WEBAPP_DIR/.env.local"; then
    echo "✅ NEXT_PUBLIC_WEBAPP_URL is set"
else
    echo "❌ NEXT_PUBLIC_WEBAPP_URL not found"
    exit 1
fi

# Check file sizes to ensure build was successful
NEXT_SIZE=$(du -sh "$WEBAPP_DIR/.next" 2>/dev/null | cut -f1 || echo "0")
if [ "$NEXT_SIZE" != "0" ] && [ "$NEXT_SIZE" != "0B" ]; then
    echo "✅ Build files size: $NEXT_SIZE"
else
    echo "❌ Build files appear to be empty"
    exit 1
fi

echo "🎉 Webapp health check completed successfully!"
echo "✅ Webapp is healthy and ready to serve"
