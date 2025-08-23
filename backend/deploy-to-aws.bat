@echo off
echo 🚀 Deploying Influmojo Backend to AWS...
echo.

echo 📝 Step 1: Updating .env for production...
echo    Changing NODE_ENV to production...
echo    Changing PORT to 80...

REM Update the .env file for production
powershell -Command "(Get-Content .env) -replace 'NODE_ENV=development', 'NODE_ENV=production' -replace 'PORT=3002', 'PORT=80' | Set-Content .env"

echo ✅ .env updated for production
echo.

echo 🔐 Step 2: Setting up AWS Parameter Store...
echo    Run this command to set up your AWS parameters:
echo    node setup-aws-params.js
echo.

echo 🚀 Step 3: Starting production server...
echo    The server will automatically:
echo    - Load non-sensitive values from .env
echo    - Load sensitive values from AWS Parameter Store
echo    - Override local sensitive values with AWS values
echo.

echo 📋 Your .env file now contains:
echo    - Non-sensitive values (loaded in production)
echo    - Development sensitive values (overridden by AWS)
echo.

echo 🎯 To start the server:
echo    NODE_ENV=production node src/server.js
echo.

echo 🔄 To switch back to development:
echo    Change NODE_ENV back to development in .env
echo    Change PORT back to 3002 in .env
echo.

pause
