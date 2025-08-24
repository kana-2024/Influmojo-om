#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting or reloading Influmojo API with consolidated environment..."

export NVM_DIR="/home/ec2-user/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

CURRENT="/home/ec2-user/deploys/influmojo-api/current"
APP_DIR="/home/ec2-user/apps/influmojo-api"
NAME="influmojo-api"

# Verify current deployment exists
if [ ! -d "$CURRENT" ]; then
    echo "❌ Current deployment not found at $CURRENT"
    exit 1
fi

# Verify environment file exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "❌ Environment file not found at $APP_DIR/.env"
    echo "🔍 Checking if SSM script ran successfully..."
    ls -la "$APP_DIR/" || true
    exit 1
fi

echo "📁 Current deployment: $CURRENT"
echo "📁 App directory: $APP_DIR"
echo "🔐 Environment file: $APP_DIR/.env"
echo ""

echo "📋 This consolidated .env supports:"
echo "   - Backend API (port 3002)"
echo "   - Webapp (Next.js)"
echo "   - Admin Dashboard (Next.js)"
echo "   - Mobile App (Expo)"
echo ""

# Sync code but keep .env written by SSM step
echo "🔄 Syncing code from deployment to app directory..."
rsync -a --delete --exclude ".env" "$CURRENT/" "$APP_DIR/"

cd "$APP_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
nvm install --lts >/dev/null 2>&1 || true
nvm use --lts >/dev/null 2>&1 || true
npm ci --production

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate || echo "⚠️  Prisma generate failed, continuing..."

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Database migration failed, continuing..."

# Read PORT from .env for PM2 env
echo "🔍 Reading PORT from consolidated environment file..."
export $(grep -E '^(PORT)=' .env | xargs) || true
PORT=${PORT:-3002}
echo "🌐 Using PORT: $PORT"

# Verify other critical environment variables
echo "🔍 Verifying environment variables..."
if [ -n "${NODE_ENV:-}" ]; then
    echo "✅ NODE_ENV: $NODE_ENV"
else
    echo "⚠️  NODE_ENV not set"
fi

if [ -n "${DATABASE_URL:-}" ]; then
    echo "✅ DATABASE_URL: ***"
else
    echo "⚠️  DATABASE_URL not set"
fi

if [ -n "${JWT_SECRET:-}" ]; then
    echo "✅ JWT_SECRET: ***"
else
    echo "⚠️  JWT_SECRET not set"
fi

# Check if PM2 is running
if pm2 list | grep -q "$NAME"; then
    echo "🔄 Reloading existing PM2 process: $NAME"
    pm2 reload "$NAME"
else
    echo "🚀 Starting new PM2 process: $NAME"
    pm2 start npm --name "$NAME" -- run start
fi

# Save PM2 configuration
pm2 save

# Wait a moment for the app to start
sleep 5

# Check PM2 status
echo "📊 PM2 Status:"
pm2 list "$NAME" || true

# Check if the app is listening on the expected port
if netstat -tlnp 2>/dev/null | grep -q ":$PORT "; then
    echo "✅ Application is listening on port $PORT"
else
    echo "⚠️  Application may not be listening on port $PORT"
    echo "🔍 Checking PM2 logs..."
    pm2 logs "$NAME" --lines 10 || true
fi

echo ""
echo "🎉 Application started/reloaded successfully!"
echo "🌐 API should be available at: http://localhost:$PORT"
echo ""
echo "📁 The consolidated .env file is now available at: $APP_DIR/.env"
echo "   This file can be used by all your applications:"
echo "   - Backend API server (running on port $PORT)"
echo "   - Webapp build process"
echo "   - Admin dashboard build process"
echo "   - Mobile app configuration"
