#!/bin/bash

# Production Deployment Script for Influmojo Webapp
# This script sets up the webapp for EC2 deployment

echo "🚀 Starting production deployment for Influmojo Webapp..."

# Set production environment
export NODE_ENV=production
export PORT=3000

# Load environment variables with better error handling
echo "🔐 Loading environment variables..."

# Try AWS Parameter Store first, fallback to local files
if command -v aws &> /dev/null; then
    echo "📡 Attempting to load from AWS Parameter Store..."
    
    # Load with timeout and better error handling
    export NEXT_PUBLIC_API_URL=$(timeout 10 aws ssm get-parameter --name "/influmojo/prod/webapp-api-url" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "https://api.influmojo.com")
    export NEXT_PUBLIC_GOOGLE_CLIENT_ID=$(timeout 10 aws ssm get-parameter --name "/influmojo/prod/google-client-id" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
    
    echo "✅ Environment variables loaded from AWS Parameter Store"
else
    echo "⚠️  AWS CLI not found, trying local environment files..."
fi

# Fallback to local environment files
if [ -f .env.production ]; then
    echo "📄 Loading from .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.production"
elif [ -f .env.local ]; then
    echo "📄 Loading from .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.local"
else
    echo "⚠️  No environment file found, using defaults"
    export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"https://api.influmojo.com"}
fi

# Install ALL dependencies (including dev dependencies for build)
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Remove dev dependencies after build to save space
echo "🧹 Removing dev dependencies..."
npm prune --production

# Start the production server
echo "🚀 Starting production server on port $PORT..."
echo "🌐 Webapp will be available at: http://localhost:$PORT"
echo "🔗 API endpoint: $NEXT_PUBLIC_API_URL"

# Start the server
npm start
