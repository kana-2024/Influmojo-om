#!/usr/bin/env bash
set -euo pipefail

echo "🏗️  Building frontend applications with consolidated environment..."

# Source the consolidated environment
ENV_FILE="/home/ec2-user/apps/influmojo-api/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Consolidated environment file not found at $ENV_FILE"
    echo "🔍 Please ensure the SSM script has run and created the .env file"
    exit 1
fi

echo "📁 Using consolidated environment: $ENV_FILE"
echo ""

# Load environment variables
export $(cat "$ENV_FILE" | xargs)

# Verify critical variables
echo "🔍 Verifying environment variables for frontend builds..."
if [ -n "${NEXT_PUBLIC_API_URL:-}" ]; then
    echo "✅ NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
else
    echo "❌ NEXT_PUBLIC_API_URL not set"
    exit 1
fi

if [ -n "${NEXT_PUBLIC_WEBAPP_URL:-}" ]; then
    echo "✅ NEXT_PUBLIC_WEBAPP_URL: $NEXT_PUBLIC_WEBAPP_URL"
else
    echo "❌ NEXT_PUBLIC_WEBAPP_URL not set"
    exit 1
fi

if [ -n "${NEXT_PUBLIC_ADMIN_API_URL:-}" ]; then
    echo "✅ NEXT_PUBLIC_ADMIN_API_URL: $NEXT_PUBLIC_ADMIN_API_URL"
else
    echo "❌ NEXT_PUBLIC_ADMIN_API_URL not set"
    exit 1
fi

echo ""

# Build Webapp
echo "🌐 Building Webapp (Next.js)..."
WEBAPP_DIR="/home/ec2-user/apps/influmojo-webapp"
if [ -d "$WEBAPP_DIR" ]; then
    cd "$WEBAPP_DIR"
    
    # Copy consolidated environment
    cp "$ENV_FILE" .env.local
    
    echo "📦 Installing dependencies..."
    npm ci --production || npm install --production
    
    echo "🏗️  Building webapp..."
    npm run build
    
    echo "✅ Webapp built successfully"
else
    echo "⚠️  Webapp directory not found at $WEBAPP_DIR"
    echo "   You may need to clone or set up the webapp separately"
fi

echo ""

# Build Admin Dashboard
echo "📊 Building Admin Dashboard (Next.js)..."
ADMIN_DIR="/home/ec2-user/apps/influmojo-admin"
if [ -d "$ADMIN_DIR" ]; then
    cd "$ADMIN_DIR"
    
    # Copy consolidated environment
    cp "$ENV_FILE" .env.local
    
    echo "📦 Installing dependencies..."
    npm ci --production || npm install --production
    
    echo "🏗️  Building admin dashboard..."
    npm run build
    
    echo "✅ Admin dashboard built successfully"
else
    echo "⚠️  Admin dashboard directory not found at $ADMIN_DIR"
    echo "   You may need to clone or set up the admin dashboard separately"
fi

echo ""

# Build Mobile App (if needed)
echo "📱 Building Mobile App (Expo)..."
MOBILE_DIR="/home/ec2-user/apps/influmojo-mobile"
if [ -d "$MOBILE_DIR" ]; then
    cd "$MOBILE_DIR"
    
    # Copy consolidated environment
    cp "$ENV_FILE" .env
    
    echo "📦 Installing dependencies..."
    npm ci --production || npm install --production
    
    echo "🏗️  Building mobile app..."
    npx expo export --platform web
    
    echo "✅ Mobile app built successfully"
else
    echo "⚠️  Mobile app directory not found at $MOBILE_DIR"
    echo "   You may need to clone or set up the mobile app separately"
fi

echo ""
echo "🎉 Frontend applications built successfully!"
echo ""
echo "📁 Consolidated environment used: $ENV_FILE"
echo "🌐 All applications now have access to the same environment variables"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy the built applications to your web server"
echo "   2. Ensure Nginx is configured to serve the built files"
echo "   3. Test that all applications are working with the new environment"
