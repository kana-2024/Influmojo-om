@echo off
echo ========================================
echo INFLUMOJO AWS ENVIRONMENT DEPLOYMENT
echo ========================================
echo.

echo 🎯 Preparing consolidated environment for AWS deployment...
echo.

REM Check if root .env exists
if not exist ".env" (
    echo ❌ ERROR: Root .env file not found!
    echo Please ensure you have a .env file in the project root.
    pause
    exit /b 1
)

echo ✅ Root .env file found
echo.

REM Check if production template exists
if not exist ".env.production" (
    echo ❌ ERROR: .env.production template not found!
    echo Please ensure you have a .env.production file.
    pause
    exit /b 1
)

echo ✅ Production template found
echo.

echo 📋 Current environment structure:
echo.
echo 📁 Root .env - Main configuration
echo 📁 .env.production - AWS production template
echo 📁 webapp/.env.local - Web app overrides
echo 📁 admin-dashboard/.env.local - Admin dashboard overrides
echo.

echo 🚀 Ready for AWS deployment!
echo.
echo 📝 Next steps:
echo 1. Copy .env to your AWS server
echo 2. Update production values on AWS server
echo 3. Set up AWS Parameter Store for sensitive data
echo 4. Test the deployment
echo.

echo 📖 For detailed instructions, see: ENVIRONMENT_CONSOLIDATION_GUIDE.md
echo.

pause
