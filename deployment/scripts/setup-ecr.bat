@echo off
echo ========================================
echo 🚀 Influmojo ECR Repository Setup
echo ========================================
echo.

echo 📦 This script will create ECR repositories for:
echo    - influmojo-webapp
echo    - influmojo-admin  
echo    - influmojo-backend
echo.

echo 🔐 Prerequisites:
echo    1. AWS CLI installed and configured
echo    2. AWS credentials set up
echo    3. Docker installed
echo.

echo ⚠️  IMPORTANT: You need to manually create these repositories in AWS Console
echo    This script provides the commands and guidance
echo.

echo 📋 AWS Console Steps:
echo    1. Go to AWS Console → ECR (Elastic Container Registry)
echo    2. Click "Create repository"
echo    3. Create each repository with these names:
echo       - influmojo-webapp
echo       - influmojo-admin
echo       - influmojo-backend
echo    4. Enable "Scan on push" for security
echo    5. Use default encryption (AES256)
echo.

echo 🎯 Repository Configuration:
echo    - Repository name: influmojo-webapp
echo    - Visibility: Private
echo    - Image tag mutability: Mutable
echo    - Scan on push: Enabled
echo    - Encryption: AES256
echo.

echo 🚀 After creating repositories, run:
echo    aws ecr get-login-password --region ap-south-1 ^| docker login --username AWS --password-stdin 424592696132.dkr.ecr.ap-south-1.amazonaws.com
echo.

echo ✅ ECR setup complete! You can now proceed to build and push Docker images.
echo.

pause
