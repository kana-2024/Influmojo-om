# Simple Deploy Script for Influmojo Webapp

Write-Host "🚀 Starting deployment..." -ForegroundColor Blue

# Configuration
$EC2_INSTANCE_ID = "i-0b338206ea637e1b4"
$S3_BUCKET = "influmojo-deployments"
$AWS_REGION = "ap-south-1"
$PACKAGE_FILE = "webapp-standalone.zip"

# Step 1: Clean up
Write-Host "🧹 Cleaning up..." -ForegroundColor Blue
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "webapp-standalone.zip") { Remove-Item -Force "webapp-standalone.zip" }

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm ci --no-audit --no-fund

# Step 3: Build
Write-Host "🔨 Building..." -ForegroundColor Blue
npm run build

# Step 4: Package
Write-Host "📦 Packaging..." -ForegroundColor Blue
# Create a proper standalone package
$packageDir = "webapp-package"
if (Test-Path $packageDir) { Remove-Item -Recurse -Force $packageDir }
New-Item -ItemType Directory -Path $packageDir

# Copy standalone files (the build creates these locally)
if (Test-Path ".next/standalone") {
    Copy-Item -Recurse -Path ".next/standalone/*" -Destination $packageDir
} else {
    Write-Host "❌ .next/standalone not found! Build may have failed." -ForegroundColor Red
    exit 1
}

# Copy static files
if (Test-Path ".next/static") {
    New-Item -ItemType Directory -Path "$packageDir/.next" -Force
    Copy-Item -Recurse -Path ".next/static" -Destination "$packageDir/.next/"
} else {
    Write-Host "❌ .next/static not found! Build may have failed." -ForegroundColor Red
    exit 1
}

# Copy public files if they exist
if (Test-Path "public") {
    Copy-Item -Recurse -Path "public" -Destination $packageDir
}

# Create the zip from the package directory
Compress-Archive -Path "$packageDir/*" -DestinationPath $PACKAGE_FILE -Force
Remove-Item -Recurse -Force $packageDir

Write-Host "✅ Package created: $PACKAGE_FILE" -ForegroundColor Green

# Step 5: Upload to S3
Write-Host "☁️ Uploading to S3..." -ForegroundColor Blue
aws s3 cp $PACKAGE_FILE "s3://$S3_BUCKET/$PACKAGE_FILE"

Write-Host "✅ Uploaded to S3" -ForegroundColor Green

# Step 6: Deploy via SSM
Write-Host "🚀 Deploying to EC2..." -ForegroundColor Blue

$deployScript = @"
#!/bin/bash
set -euo pipefail

echo "📁 Setting up webapp directory..."
sudo mkdir -p /opt/influmojo/webapp
sudo chown ec2-user:ec2-user /opt/influmojo/webapp
cd /opt/influmojo/webapp

echo "📦 Downloading package..."
aws s3 cp s3://$S3_BUCKET/$PACKAGE_FILE ~/

echo "📦 Extracting..."
sudo rm -rf /opt/influmojo/webapp/*
sudo unzip ~/$PACKAGE_FILE -d /opt/influmojo/webapp/
sudo chown -R ssm-user:ssm-user /opt/influmojo/webapp

echo "🔄 Restarting PM2..."
pm2 stop webapp 2>/dev/null || true
pm2 delete webapp 2>/dev/null || true

cd /opt/influmojo/webapp/standalone
NODE_ENV=production PORT=3000 HOST=0.0.0.0 pm2 start "node server.js" --name webapp --update-env
pm2 save

echo "✅ Deployment completed!"
pm2 status
rm -f ~/$PACKAGE_FILE
"@

$deployScript | Out-File -FilePath "deploy.sh" -Encoding UTF8

$commandId = aws ssm send-command --instance-ids $EC2_INSTANCE_ID --document-name "AWS-RunShellScript" --parameters "commands=[`"bash -s`"]" --cli-input-json "file://deploy.sh" --region $AWS_REGION --query 'Command.CommandId' --output text

Write-Host "⏳ Waiting for deployment..." -ForegroundColor Yellow
aws ssm wait command-executed --command-id $commandId --instance-id $EC2_INSTANCE_ID --region $AWS_REGION

$output = aws ssm get-command-invocation --command-id $commandId --instance-id $EC2_INSTANCE_ID --region $AWS_REGION --query 'StandardOutputContent' --output text
Write-Host $output

Remove-Item -Force "deploy.sh"

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Webapp: http://influmojo-alb-1717302406.ap-south-1.elb.amazonaws.com/" -ForegroundColor Cyan
