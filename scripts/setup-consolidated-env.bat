@echo off
echo ========================================
echo INFLUMOJO ENVIRONMENT SETUP
echo ========================================
echo.

echo 🚀 Setting up consolidated environment configuration...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install AWS SDK if not already installed
echo 📦 Installing AWS SDK...
npm install aws-sdk --save
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ Root .env file not found. Please create it first.
    echo.
    echo You can copy from backend/.env and update the values.
    pause
    exit /b 1
)

echo ✅ Root .env file found
echo.

REM Run the migration script
echo 🔄 Running environment migration...
node migrate-env.js
echo.

REM Run the AWS Parameter Store setup
echo 🏗️  Setting up AWS Parameter Store...
echo.
echo ⚠️  Make sure you have AWS credentials configured:
echo    aws configure
echo.
echo Press any key to continue with Parameter Store setup...
pause >nul

node setup-aws-params.js
echo.

echo 🎉 Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Update your AWS production values in .env
echo 2. Run setup-aws-params.js again to create all parameters
echo 3. Update your applications to use the new approach
echo 4. Deploy to AWS
echo.
pause
