#!/bin/bash

# Production Deployment Script for Influmojo Backend
# This script sets up the backend for EC2 deployment

echo "🚀 Starting production deployment for Influmojo Backend..."

# Set production environment
export NODE_ENV=production
export PORT=3002

# Load environment variables from AWS Parameter Store (if available)
if command -v aws &> /dev/null; then
    echo "🔐 Loading environment variables from AWS Parameter Store..."
    
    # Load critical environment variables
    export DATABASE_URL=$(aws ssm get-parameter --name "/influmojo/prod/database-url" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
    export JWT_SECRET=$(aws ssm get-parameter --name "/influmojo/prod/jwt-secret" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
    export CORS_ORIGINS=$(aws ssm get-parameter --name "/influmojo/prod/cors-origins" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "https://influmojo.com,https://www.influmojo.com,https://api.influmojo.com")
    
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

# Run database migrations (if using Prisma)
if [ -f "prisma/schema.prisma" ]; then
    echo "🗄️  Running database migrations..."
    npx prisma migrate deploy
fi

# Start the production server
echo "🚀 Starting production server on port $PORT..."
echo "🌐 Backend API will be available at: http://localhost:$PORT"
echo "🔗 Health check: http://localhost:$PORT/api/health"
echo "🔐 CORS Origins: $CORS_ORIGINS"

# Start the server
npm start
