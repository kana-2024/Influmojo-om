#!/usr/bin/env bash
set -euo pipefail

echo "📊 Setting up Influmojo Admin Dashboard..."

ADMIN_DIR="/home/ec2-user/apps/influmojo-admin"
CONSOLIDATED_ENV="/home/ec2-user/apps/influmojo-api/.env"

# Check if consolidated environment exists
if [ ! -f "$CONSOLIDATED_ENV" ]; then
    echo "❌ Consolidated environment file not found at $CONSOLIDATED_ENV"
    echo "🔍 Please ensure the backend deployment has run first to create the consolidated .env"
    exit 1
fi

echo "📁 Admin dashboard directory: $ADMIN_DIR"
echo "🔐 Using consolidated environment: $CONSOLIDATED_ENV"

# Copy consolidated environment to admin dashboard
echo "📋 Copying consolidated environment to admin dashboard..."
cp "$CONSOLIDATED_ENV" "$ADMIN_DIR/.env.local"

# Verify critical environment variables
echo "🔍 Verifying environment variables..."
if grep -q "^NEXT_PUBLIC_ADMIN_API_URL=" "$ADMIN_DIR/.env.local"; then
    API_URL=$(grep "^NEXT_PUBLIC_ADMIN_API_URL=" "$ADMIN_DIR/.env.local" | cut -d'=' -f2)
    echo "✅ NEXT_PUBLIC_ADMIN_API_URL: $API_URL"
else
    echo "❌ NEXT_PUBLIC_ADMIN_API_URL not found"
    exit 1
fi

if grep -q "^NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY=" "$ADMIN_DIR/.env.local"; then
    STREAM_KEY=$(grep "^NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY=" "$ADMIN_DIR/.env.local" | cut -d'=' -f2)
    echo "✅ NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY: $STREAM_KEY"
else
    echo "❌ NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY not found"
    exit 1
fi

# Set proper permissions
chown ec2-user:ec2-user "$ADMIN_DIR/.env.local"
chmod 600 "$ADMIN_DIR/.env.local"

echo "✅ Admin dashboard setup completed successfully!"
echo "🔗 API endpoint: $API_URL"
echo "🔑 StreamChat API key configured"
