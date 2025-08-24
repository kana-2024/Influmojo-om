#!/usr/bin/env bash
set -euo pipefail

echo "🏥 Running health check..."

APP_DIR="/home/ec2-user/apps/influmojo-api"
NAME="influmojo-api"
PORT=3002

# Check if PM2 process is running
if ! pm2 list | grep -q "$NAME"; then
    echo "❌ PM2 process '$NAME' is not running"
    exit 1
fi

# Check PM2 process status
PM2_STATUS=$(pm2 list "$NAME" --format json | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" != "online" ]; then
    echo "❌ PM2 process '$NAME' is not online (status: $PM2_STATUS)"
    exit 1
fi

echo "✅ PM2 process '$NAME' is running with status: $PM2_STATUS"

# Check if the app is listening on the expected port
if netstat -tlnp 2>/dev/null | grep -q ":$PORT "; then
    echo "✅ Application is listening on port $PORT"
else
    echo "❌ Application is not listening on port $PORT"
    exit 1
fi

# Check if .env file exists and has content
if [ ! -f "$APP_DIR/.env" ]; then
    echo "❌ Environment file not found"
    exit 1
fi

ENV_LINES=$(wc -l < "$APP_DIR/.env")
if [ "$ENV_LINES" -lt 5 ]; then
    echo "❌ Environment file seems incomplete (only $ENV_LINES lines)"
    exit 1
fi

echo "✅ Environment file exists with $ENV_LINES variables"

# Test local API endpoint
echo "🔍 Testing local API endpoint..."
if curl -f -s "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
    echo "✅ Local API health check passed"
else
    echo "❌ Local API health check failed"
    echo "🔍 Checking PM2 logs for errors..."
    pm2 logs "$NAME" --lines 20 || true
    exit 1
fi

# Test external API endpoint (if accessible)
echo "🌐 Testing external API endpoint..."
if curl -f -s "https://api.influmojo.com/api/health" > /dev/null 2>&1; then
    echo "✅ External API health check passed"
else
    echo "⚠️  External API health check failed (this might be expected during deployment)"
fi

echo "🎉 Health check completed successfully!"
echo "✅ Service is healthy and ready to serve requests"
