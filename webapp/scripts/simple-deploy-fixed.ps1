# Simple Deploy Script for Influmojo Webapp - Fixed Version

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
$packageDir = "webapp-package"
if (Test-Path $packageDir) { Remove-Item -Recurse -Force $packageDir }
New-Item -ItemType Directory -Path $packageDir

# Copy standalone files
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
aws s3 cp $PACKAGE_FILE "s3://$S3_BUCKET/releases/$PACKAGE_FILE" --region $AWS_REGION

Write-Host "✅ Uploaded to S3" -ForegroundColor Green

# Step 6: Deploy via SSM
Write-Host "🚀 Deploying to EC2..." -ForegroundColor Blue

# Build the SSM JSON parameter on the fly (no quoting headaches)
$rel = (Get-FileHash $PACKAGE_FILE -Algorithm SHA1).Hash.Substring(0,7)  # or use a timestamp
$rel = "manual-$rel"

# Create JSON content as a string
$cmds = @'
{
  "commands": [
    "set -euo pipefail",
    "REL=\"__REL__\"",
    "ZIP=\"/tmp/__PACKAGE_FILE__\"",
    "echo \"📦 Downloading...\"",
    "aws s3 cp s3://__S3_BUCKET__/releases/__PACKAGE_FILE__ \"$ZIP\"",
    "sudo mkdir -p /opt/influmojo/webapp",
    "sudo chown -R ssm-user:ssm-user /opt/influmojo/webapp",
    "sudo dnf -y install unzip >/dev/null 2>&1 || sudo yum -y install unzip",
    "sudo -iu ssm-user bash -lc 'cd /opt/influmojo/webapp && rm -rf ./* && unzip -qo \"$ZIP\"'",
    "NODE_BIN=/home/ssm-user/.nvm/versions/node/v20.19.4/bin",
    "PM2=$NODE_BIN/pm2; NODE=$NODE_BIN/node",
    "cd /opt/influmojo/webapp",
    "sudo -iu ssm-user bash -lc \"\\\"$PM2\\\" describe webapp >/dev/null 2>&1 && NODE_ENV=production PORT=3000 HOST=0.0.0.0 \\\"$PM2\\\" reload webapp --update-env || NODE_ENV=production PORT=3000 HOST=0.0.0.0 \\\"$PM2\\\" start \\\"$NODE\\\" --name webapp -- .next/standalone/server.js\"",
    "sudo -iu ssm-user bash -lc '\"$PM2\" save'",
    "echo \"✅ Deployed __REL__\""
  ]
}
'@

# Replace placeholders
$cmds = $cmds -replace "__REL__", $rel
$cmds = $cmds -replace "__PACKAGE_FILE__", $PACKAGE_FILE
$cmds = $cmds -replace "__S3_BUCKET__", $S3_BUCKET

$temp = New-TemporaryFile
$cmds | Out-File -FilePath $temp -Encoding UTF8

$cmdId = aws ssm send-command `
  --region $AWS_REGION `
  --document-name "AWS-RunShellScript" `
  --instance-ids $EC2_INSTANCE_ID `
  --parameters file://$temp `
  --query 'Command.CommandId' --output text

aws ssm wait command-executed --region $AWS_REGION --command-id $cmdId --instance-id $EC2_INSTANCE_ID
aws ssm get-command-invocation --region $AWS_REGION --command-id $cmdId --instance-id $EC2_INSTANCE_ID `
  --query 'StandardOutputContent' --output text

Remove-Item $temp -Force

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Webapp: http://influmojo-alb-1717302406.ap-south-1.elb.amazonaws.com/" -ForegroundColor Cyan