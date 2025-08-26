#!/bin/bash
set -euo pipefail

# 🚀 Automated Deploy Script for Influmojo Webapp
# This script builds, packages, uploads to S3, and deploys to EC2 automatically

echo "🚀 Starting automated deployment of Influmojo Webapp..."

# Configuration
EC2_INSTANCE_ID="i-0b338206ea637e1b4"
S3_BUCKET="influmojo-deployments"
AWS_REGION="ap-south-1"
PACKAGE_FILE="webapp-standalone.zip"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Clean up previous build artifacts
print_status "🧹 Cleaning up old build artifacts..."
rm -rf .next webapp-standalone.tgz webapp-standalone.zip || true

# Step 2: Install dependencies
print_status "📦 Installing dependencies..."
npm ci --no-audit --no-fund

# Step 3: Build the application
print_status "🔨 Building application with standalone output..."
npm run build

# Step 4: Package the build
print_status "📦 Packaging standalone output..."
if [ -d "public" ]; then
    Compress-Archive -Path ".next/standalone", ".next/static", "public" -DestinationPath "$PACKAGE_FILE" -Force
else
    Compress-Archive -Path ".next/standalone", ".next/static" -DestinationPath "$PACKAGE_FILE" -Force
fi

print_success "✅ Webapp packaged to $PACKAGE_FILE"
ls -lh "$PACKAGE_FILE"

# Step 5: Upload to S3
print_status "☁️ Uploading package to S3..."
aws s3 cp "$PACKAGE_FILE" "s3://$S3_BUCKET/$PACKAGE_FILE"

print_success "✅ Package uploaded to S3"

# Step 6: Deploy to EC2 via SSM
print_status "🚀 Deploying to EC2 via SSM..."

# Create deployment script for EC2
cat > deploy-commands.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "📁 Setting up webapp directory..."
sudo mkdir -p /opt/influmojo/webapp
sudo chown ec2-user:ec2-user /opt/influmojo/webapp
cd /opt/influmojo/webapp

echo "📦 Downloading new webapp package..."
aws s3 cp s3://influmojo-deployments/webapp-standalone.zip ~/

echo "📦 Extracting new webapp..."
sudo rm -rf /opt/influmojo/webapp/*
sudo unzip ~/webapp-standalone.zip -d /opt/influmojo/webapp/
sudo chown -R ec2-user:ec2-user /opt/influmojo/webapp

echo "🔄 Restarting webapp with PM2..."
# Stop existing webapp if running
pm2 stop webapp 2>/dev/null || true
pm2 delete webapp 2>/dev/null || true

# Start new webapp
cd /opt/influmojo/webapp
NODE_ENV=production PORT=3000 HOST=0.0.0.0 \
pm2 start "node server.js" --name webapp --update-env

# Save PM2 configuration
pm2 save

echo "✅ Webapp deployed successfully!"
echo "🌐 Webapp should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"

# Show PM2 status
pm2 status

# Clean up
rm -f ~/webapp-standalone.zip
EOF

# Upload and execute deployment script
aws ssm send-command \
    --instance-ids "$EC2_INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["bash -s"]' \
    --cli-input-json file://<(echo '{"commands":["bash -s"],"workingDirectory":["/home/ssm-user"]}' | jq '.') \
    --region "$AWS_REGION" \
    --query 'Command.CommandId' \
    --output text > command_id.txt

COMMAND_ID=$(cat command_id.txt)
rm command_id.txt

print_status "⏳ Waiting for deployment to complete..."
aws ssm wait command-executed \
    --command-id "$COMMAND_ID" \
    --instance-id "$EC2_INSTANCE_ID" \
    --region "$AWS_REGION"

# Get command output
print_status "📋 Deployment output:"
aws ssm get-command-invocation \
    --command-id "$COMMAND_ID" \
    --instance-id "$EC2_INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'StandardOutputContent' \
    --output text

# Check for errors
ERROR_OUTPUT=$(aws ssm get-command-invocation \
    --command-id "$COMMAND_ID" \
    --instance-id "$EC2_INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'StandardErrorContent' \
    --output text)

if [ -n "$ERROR_OUTPUT" ] && [ "$ERROR_OUTPUT" != "None" ]; then
    print_warning "⚠️ Deployment warnings/errors:"
    echo "$ERROR_OUTPUT"
fi

# Clean up local files
rm -f deploy-commands.sh

print_success "🎉 Automated deployment completed!"
print_status "🌐 Your webapp should be live at: http://influmojo-alb-1717302406.ap-south-1.elb.amazonaws.com/"
print_status "💡 To check logs: aws ssm start-session --target $EC2_INSTANCE_ID --region $AWS_REGION 'pm2 logs webapp'"
print_status "💡 To restart: aws ssm start-session --target $EC2_INSTANCE_ID --region $AWS_REGION 'pm2 restart webapp'"
