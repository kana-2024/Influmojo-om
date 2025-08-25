#!/bin/bash

# Production Deployment Script for Influmojo Webapp
# This script sets up the webapp for EC2 deployment

echo "🚀 Starting production deployment for Influmojo Webapp..."

# Set production environment
export NODE_ENV=production
export PORT=3000

# Load environment variables from AWS Parameter Store (if available)
if command -v aws &> /dev/null; then
    echo "🔐 Loading environment variables from AWS Parameter Store..."
    
    # Load critical environment variables
    export NEXT_PUBLIC_API_URL=$(aws ssm get-parameter --name "/influmojo/prod/webapp-api-url" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "https://api.influmojo.com")
    export NEXT_PUBLIC_GOOGLE_CLIENT_ID=$(aws ssm get-parameter --name "/influmojo/prod/google-client-id" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
    
    echo "✅ Environment variables loaded from AWS Parameter Store"
else
    echo "⚠️  AWS CLI not found, using .env.production file"
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        echo "✅ Environment variables loaded from .env.production"
    else
        echo "❌ .env.production file not found"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Start the production server
echo "🚀 Starting production server on port $PORT..."
echo "🌐 Webapp will be available at: http://localhost:$PORT"
echo "🔗 API endpoint: $NEXT_PUBLIC_API_URL"

# Start the server
npm start
