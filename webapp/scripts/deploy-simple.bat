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
aws s3 cp %PACKAGE_FILE% s3://%S3_BUCKET%/releases/%PACKAGE_FILE% --region %AWS_REGION%

echo ✅ Uploaded to S3

REM Step 6: Deploy via SSM
echo 🚀 Deploying to EC2...

REM Generate unique ID
for /f %%i in ('powershell -Command "(Get-FileHash '%PACKAGE_FILE%' -Algorithm SHA1).Hash.Substring(0,7)"') do set REL=manual-%%i

REM Create JSON file using PowerShell
powershell -Command "& {
    $json = @{
        commands = @(
            'set -euo pipefail',
            'REL=\"%REL%\"',
            'ZIP=\"/tmp/%PACKAGE_FILE%\"',
            'echo \"📦 Downloading...\"',
            'aws s3 cp s3://%S3_BUCKET%/releases/%PACKAGE_FILE% \"$ZIP\"',
            'sudo mkdir -p /opt/influmojo/webapp',
            'sudo chown -R ssm-user:ssm-user /opt/influmojo/webapp',
            'sudo dnf -y install unzip >/dev/null 2>&1 || sudo yum -y install unzip',
            'sudo -iu ssm-user bash -lc ''cd /opt/influmojo/webapp && rm -rf ./* && unzip -qo \"$ZIP\"''',
            'NODE_BIN=/home/ssm-user/.nvm/versions/node/v20.19.4/bin',
            'PM2=$NODE_BIN/pm2; NODE=$NODE_BIN/node',
            'cd /opt/influmojo/webapp',
            'sudo -iu ssm-user bash -lc \"\\\"$PM2\\\" describe webapp >/dev/null 2>&1 && NODE_ENV=production PORT=3000 HOST=0.0.0.0 \\\"$PM2\\\" reload webapp --update-env || NODE_ENV=production PORT=3000 HOST=0.0.0.0 \\\"$PM2\\\" start \\\"$NODE\\\" --name webapp -- .next/standalone/server.js\"',
            'sudo -iu ssm-user bash -lc ''\"$PM2\" save''',
            'echo \"✅ Deployed $rel\"'
        )
    }
    $json | ConvertTo-Json -Depth 3 | Out-File -FilePath 'deploy.json' -Encoding UTF8
}"

REM Send command to EC2
aws ssm send-command --region %AWS_REGION% --document-name "AWS-RunShellScript" --instance-ids %EC2_INSTANCE_ID% --parameters file://deploy.json --query "Command.CommandId" --output text > command_id.txt
set /p COMMAND_ID=<command_id.txt
del command_id.txt

echo ⏳ Waiting for deployment...
aws ssm wait command-executed --region %AWS_REGION% --command-id %COMMAND_ID% --instance-id %EC2_INSTANCE_ID%

aws ssm get-command-invocation --region %AWS_REGION% --command-id %COMMAND_ID% --instance-id %EC2_INSTANCE_ID% --query "StandardOutputContent" --output text

del deploy.json

echo 🎉 Deployment completed!
echo 🌐 Webapp: http://influmojo-alb-1717302406.ap-south-1.elb.amazonaws.com/
