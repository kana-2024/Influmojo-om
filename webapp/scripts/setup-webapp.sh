#!/usr/bin/env bash
set -euo pipefail

echo "🌐 Setting up Influmojo Webapp..."

WEBAPP_DIR="/home/ec2-user/apps/influmojo-webapp"
CONSOLIDATED_ENV="/home/ec2-user/apps/influmojo-api/.env"

# Check if consolidated environment exists
if [ ! -f "$CONSOLIDATED_ENV" ]; then
    echo "❌ Consolidated environment file not found at $CONSOLIDATED_ENV"
    echo "🔍 Please ensure the backend deployment has run first to create the consolidated .env"
    exit 1
fi

echo "📁 Webapp directory: $WEBAPP_DIR"
echo "🔐 Using consolidated environment: $CONSOLIDATED_ENV"

# Copy consolidated environment to webapp
echo "📋 Copying consolidated environment to webapp..."
cp "$CONSOLIDATED_ENV" "$WEBAPP_DIR/.env.local"

# Verify critical environment variables
echo "🔍 Verifying environment variables..."
if grep -q "^NEXT_PUBLIC_API_URL=" "$WEBAPP_DIR/.env.local"; then
    API_URL=$(grep "^NEXT_PUBLIC_API_URL=" "$WEBAPP_DIR/.env.local" | cut -d'=' -f2)
    echo "✅ NEXT_PUBLIC_API_URL: $API_URL"
else
    echo "❌ NEXT_PUBLIC_API_URL not found"
    exit 1
fi

if grep -q "^NEXT_PUBLIC_WEBAPP_URL=" "$WEBAPP_DIR/.env.local"; then
    WEBAPP_URL=$(grep "^NEXT_PUBLIC_WEBAPP_URL=" "$WEBAPP_DIR/.env.local" | cut -d'=' -f2)
    echo "✅ NEXT_PUBLIC_WEBAPP_URL: $WEBAPP_URL"
else
    echo "❌ NEXT_PUBLIC_WEBAPP_URL not found"
    exit 1
fi

# Set proper permissions
chown ec2-user:ec2-user "$WEBAPP_DIR/.env.local"
chmod 600 "$WEBAPP_DIR/.env.local"

echo "✅ Webapp setup completed successfully!"
echo "🌐 Webapp will be accessible at: $WEBAPP_URL"
echo "🔗 API endpoint: $API_URL"
