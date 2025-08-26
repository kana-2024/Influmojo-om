# 🚀 Automated Deploy Script for Influmojo Webapp (PowerShell)
# This script builds, packages, uploads to S3, and deploys to EC2 automatically

param(
    [switch]$Verbose
)

# Configuration
$EC2_INSTANCE_ID = "i-0b338206ea637e1b4"
$S3_BUCKET = "influmojo-deployments"
$AWS_REGION = "ap-south-1"
$PACKAGE_FILE = "webapp-standalone.zip"

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $BLUE
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $GREEN
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $YELLOW
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $RED
}

Write-Status "🚀 Starting automated deployment of Influmojo Webapp..."

# Step 1: Clean up previous build artifacts
Write-Status "🧹 Cleaning up old build artifacts..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "webapp-standalone.tgz") { Remove-Item -Force "webapp-standalone.tgz" }
if (Test-Path "webapp-standalone.zip") { Remove-Item -Force "webapp-standalone.zip" }

# Step 2: Install dependencies
Write-Status "📦 Installing dependencies..."
npm ci --no-audit --no-fund

# Step 3: Build the application
Write-Status "🔨 Building application with standalone output..."
npm run build

# Step 4: Package the build
Write-Status "📦 Packaging standalone output..."
$compressItems = @(".next/standalone", ".next/static")
if (Test-Path "public") {
    $compressItems += "public"
}
Compress-Archive -Path $compressItems -DestinationPath $PACKAGE_FILE -Force

Write-Success "✅ Webapp packaged to $PACKAGE_FILE"
Get-ChildItem $PACKAGE_FILE | Format-Table Name, Length -AutoSize

# Step 5: Upload to S3
Write-Status "☁️ Uploading package to S3..."
aws s3 cp $PACKAGE_FILE "s3://$S3_BUCKET/$PACKAGE_FILE"

Write-Success "✅ Package uploaded to S3"

# Step 6: Deploy to EC2 via SSM
Write-Status "🚀 Deploying to EC2 via SSM..."

# Create deployment commands
$deployCommands = @"
#!/bin/bash
set -euo pipefail

echo "📁 Setting up webapp directory..."
sudo mkdir -p /opt/influmojo/webapp
sudo chown ec2-user:ec2-user /opt/influmojo/webapp
cd /opt/influmojo/webapp

echo "📦 Downloading new webapp package..."
aws s3 cp s3://$S3_BUCKET/$PACKAGE_FILE ~/

echo "📦 Extracting new webapp..."
sudo rm -rf /opt/influmojo/webapp/*
sudo unzip ~/$PACKAGE_FILE -d /opt/influmojo/webapp/
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
echo "🌐 Webapp should be available at: http://`$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"

# Show PM2 status
pm2 status

# Clean up
rm -f ~/$PACKAGE_FILE
"@

# Save commands to temporary file
$tempFile = "deploy-commands.sh"
$deployCommands | Out-File -FilePath $tempFile -Encoding UTF8

# Execute deployment via SSM
Write-Status "⏳ Executing deployment on EC2..."
$commandId = aws ssm send-command `
    --instance-ids $EC2_INSTANCE_ID `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[`"bash -s`"]" `
    --cli-input-json "file://$tempFile" `
    --region $AWS_REGION `
    --query 'Command.CommandId' `
    --output text

Write-Status "⏳ Waiting for deployment to complete..."
aws ssm wait command-executed `
    --command-id $commandId `
    --instance-id $EC2_INSTANCE_ID `
    --region $AWS_REGION

# Get command output
Write-Status "📋 Deployment output:"
$output = aws ssm get-command-invocation `
    --command-id $commandId `
    --instance-id $EC2_INSTANCE_ID `
    --region $AWS_REGION `
    --query 'StandardOutputContent' `
    --output text

Write-Host $output

# Check for errors
$errorOutput = aws ssm get-command-invocation `
    --command-id $commandId `
    --instance-id $EC2_INSTANCE_ID `
    --region $AWS_REGION `
    --query 'StandardErrorContent' `
    --output text

if ($errorOutput -and $errorOutput -ne "None") {
    Write-Warning "⚠️ Deployment warnings/errors:"
    Write-Host $errorOutput
}

# Clean up local files
Remove-Item -Force $tempFile

Write-Success "🎉 Automated deployment completed!"
Write-Status "🌐 Your webapp should be live at: http://influmojo-alb-1717302406.ap-south-1.elb.amazonaws.com/"
Write-Status "💡 To check logs: aws ssm start-session --target $EC2_INSTANCE_ID --region $AWS_REGION"
Write-Status "💡 To restart: aws ssm start-session --target $EC2_INSTANCE_ID --region $AWS_REGION"
