@echo off
echo 🚀 Creating Production Folder for AWS Deployment...
echo.

echo 📁 Step 1: Creating production folder...
if exist influmojo-production (
    echo Removing existing production folder...
    rmdir /s /q influmojo-production
)
mkdir influmojo-production
echo ✅ Created influmojo-production folder
echo.

echo 📋 Step 2: Copying essential files...
echo Copying .env file...
copy .env influmojo-production\
echo ✅ Copied .env

echo Copying backend folder (without node_modules)...
xcopy backend influmojo-production\backend /E /I /EXCLUDE:exclude.txt
echo ✅ Copied backend

echo Copying webapp folder (without node_modules)...
xcopy webapp influmojo-production\webapp /E /I /EXCLUDE:exclude.txt
echo ✅ Copied webapp
echo.

echo 📊 Step 3: Checking production folder contents...
dir influmojo-production
echo.

echo 🎯 Step 4: Production folder ready for deployment!
echo.
echo 📤 To deploy to AWS:
echo    1. Upload: scp -r influmojo-production/ ec2-user@your-ec2-ip:/var/www/
echo    2. On EC2: mv influmojo-production influmojo
echo    3. Install dependencies: npm install --production
echo.

pause
