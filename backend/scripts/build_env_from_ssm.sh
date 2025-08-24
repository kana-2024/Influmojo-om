#!/usr/bin/env bash
set -euo pipefail

echo "🔐 Building consolidated environment from AWS Parameter Store..."

REGION="ap-south-1"
PREFIX="/influmojo/prod/api"
OUT="/home/ec2-user/apps/influmojo-api/.env"
APP_DIR="/home/ec2-user/apps/influmojo-api"

# Create app directory if it doesn't exist
mkdir -p "$APP_DIR"

# Ensure AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please ensure it's installed."
    exit 1
fi

# Ensure jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ jq not found. Please ensure it's installed."
    exit 1
fi

echo "📡 Fetching parameters from AWS Parameter Store..."
echo "📍 Region: $REGION"
echo "📍 Prefix: $PREFIX"
echo "📁 Output: $OUT"
echo ""

echo "📋 This will create a consolidated .env file that supports:"
echo "   - Backend API (port 3002)"
echo "   - Webapp (Next.js)"
echo "   - Admin Dashboard (Next.js)"
echo "   - Mobile App (Expo)"
echo ""

# Pull all parameters under the prefix (decrypted), flatten to KEY=VALUE
aws ssm get-parameters-by-path \
  --region "$REGION" \
  --path "$PREFIX" \
  --with-decryption \
  --recursive \
  --query 'Parameters[*].{Name:Name,Value:Value}' \
  --output json \
| jq -r --arg p "$PREFIX/" '.[] | "\(.Name|sub($p;""))=\(.Value)"' > "$OUT"

# Check if we got any parameters
if [ ! -s "$OUT" ]; then
    echo "❌ No parameters found or failed to fetch from SSM"
    echo "🔍 Available parameters in region $REGION:"
    aws ssm describe-parameters --region "$REGION" --query 'Parameters[?starts_with(Name, `/influmojo/prod`)].Name' --output table || true
    exit 1
fi

# Set proper permissions
chown ec2-user:ec2-user "$OUT"
chmod 600 "$OUT"

echo "✅ Wrote $(wc -l < "$OUT") environment variables to $OUT"
echo "🔒 File permissions set to 600 (owner only)"

# Display first few lines for verification (without showing values)
echo "📋 Environment variables loaded:"
head -5 "$OUT" | sed 's/=.*/=***/' || true

# Verify critical variables are present
echo ""
echo "🔍 Verifying critical variables..."
if grep -q "^PORT=" "$OUT"; then
    PORT_VALUE=$(grep "^PORT=" "$OUT" | cut -d'=' -f2)
    echo "✅ PORT: $PORT_VALUE"
else
    echo "⚠️  PORT not found in environment file"
fi

if grep -q "^NODE_ENV=" "$OUT"; then
    NODE_ENV_VALUE=$(grep "^NODE_ENV=" "$OUT" | cut -d'=' -f2)
    echo "✅ NODE_ENV: $NODE_ENV_VALUE"
else
    echo "⚠️  NODE_ENV not found in environment file"
fi

if grep -q "^DATABASE_URL=" "$OUT"; then
    echo "✅ DATABASE_URL: ***"
else
    echo "⚠️  DATABASE_URL not found in environment file"
fi

echo ""
echo "🎉 Consolidated environment file created successfully from AWS Parameter Store!"
echo "📁 This .env file can now be used by:"
echo "   - Backend API server"
echo "   - Webapp build process"
echo "   - Admin dashboard build process"
echo "   - Mobile app configuration"
