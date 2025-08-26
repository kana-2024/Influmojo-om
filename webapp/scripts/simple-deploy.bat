@echo off
echo 🚀 Starting deployment...

REM Configuration
set EC2_INSTANCE_ID=i-0b338206ea637e1b4
set S3_BUCKET=influmojo-deployments
set AWS_REGION=ap-south-1
set PACKAGE_FILE=webapp-standalone.zip

REM Step 1: Clean up
echo 🧹 Cleaning up...
if exist ".next" rmdir /s /q ".next"
if exist "webapp-standalone.zip" del "webapp-standalone.zip"

REM Step 2: Install dependencies
echo 📦 Installing dependencies...
npm ci --no-audit --no-fund

REM Step 3: Build
echo 🔨 Building...
npm run build

REM Step 4: Package
echo 📦 Packaging...
if exist "webapp-package" rmdir /s /q "webapp-package"
mkdir "webapp-package"

REM Copy standalone files
if exist ".next\standalone" (
    xcopy ".next\standalone\*" "webapp-package\" /E /I /Y
) else (
    echo ❌ .next/standalone not found! Build may have failed.
    exit /b 1
)

REM Copy static files
if exist ".next\static" (
    mkdir "webapp-package\.next" 2>nul
    xcopy ".next\static" "webapp-package\.next\static\" /E /I /Y
) else (
    echo ❌ .next/static not found! Build may have failed.
    exit /b 1
)

REM Copy public files if they exist
if exist "public" (
    xcopy "public" "webapp-package\public\" /E /I /Y
)

REM Create the zip from the package directory
powershell -Command "Compress-Archive -Path 'webapp-package\*' -DestinationPath '%PACKAGE_FILE%' -Force"
rmdir /s /q "webapp-package"

echo ✅ Package created: %PACKAGE_FILE%

REM Step 5: Upload to S3
echo ☁️ Uploading to S3...
aws s3 cp %PACKAGE_FILE% s3://%S3_BUCKET%/%PACKAGE_FILE%

echo ✅ Uploaded to S3

REM Step 6: Deploy via SSM
echo 🚀 Deploying to EC2...

REM Create deploy script file
echo #!/bin/bash > deploy.sh
echo set -euo pipefail >> deploy.sh
echo. >> deploy.sh
echo echo "📁 Setting up webapp directory..." >> deploy.sh
echo sudo mkdir -p /opt/influmojo/webapp >> deploy.sh
echo sudo chown ec2-user:ec2-user /opt/influmojo/webapp >> deploy.sh
echo cd /opt/influmojo/webapp >> deploy.sh
echo. >> deploy.sh
echo echo "📦 Downloading package..." >> deploy.sh
echo aws s3 cp s3://%S3_BUCKET%/%PACKAGE_FILE% ~/ >> deploy.sh
echo. >> deploy.sh
echo echo "📦 Extracting..." >> deploy.sh
echo sudo rm -rf /opt/influmojo/webapp/* >> deploy.sh
echo sudo unzip ~/%PACKAGE_FILE% -d /opt/influmojo/webapp/ >> deploy.sh
echo sudo chown -R ssm-user:ssm-user /opt/influmojo/webapp >> deploy.sh
echo. >> deploy.sh
echo echo "🔄 Restarting PM2..." >> deploy.sh
echo pm2 stop webapp 2^>/dev/null ^|^| true >> deploy.sh
echo pm2 delete webapp 2^>/dev/null ^|^| true >> deploy.sh
echo. >> deploy.sh
echo cd /opt/influmojo/webapp/standalone >> deploy.sh
echo NODE_ENV=production PORT=3000 HOST=0.0.0.0 pm2 start "node server.js" --name webapp --update-env >> deploy.sh
echo pm2 save >> deploy.sh
echo. >> deploy.sh
echo echo "✅ Deployment completed!" >> deploy.sh
echo pm2 status >> deploy.sh
echo rm -f ~/%PACKAGE_FILE% >> deploy.sh

REM Send command to EC2
aws ssm send-command --instance-ids %EC2_INSTANCE_ID% --document-name "AWS-RunShellScript" --parameters "commands=[\"bash -s\"]" --cli-input-json "file://deploy.sh" --region %AWS_REGION% --query "Command.CommandId" --output text > command_id.txt
set /p COMMAND_ID=<command_id.txt
del command_id.txt

echo ⏳ Waiting for deployment...
aws ssm wait command-executed --command-id %COMMAND_ID% --instance-id %EC2_INSTANCE_ID% --region %AWS_REGION%

aws ssm get-command-invocation --command-id %COMMAND_ID% --instance-id %EC2_INSTANCE_ID% --region %AWS_REGION% --query "StandardOutputContent" --output text

del deploy.sh

echo 🎉 Deployment completed!
echo 🌐 Webapp: http://influmojo-alb-1717302406.ap-south-1.elb.amazonaws.com/
