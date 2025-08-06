@echo off
echo 🔧 Fixing Metro cache issues for Windows...

echo Clearing Metro cache...
npx expo start --clear

if %errorlevel% neq 0 (
    echo Failed to clear cache with expo, trying alternative methods...
    
    echo Clearing node_modules...
    rmdir /s /q node_modules
    if %errorlevel% neq 0 (
        echo Failed to clear node_modules
    ) else (
        echo Installing dependencies...
        npm install
        if %errorlevel% neq 0 (
            echo Failed to install dependencies
        ) else (
            echo Starting expo with cleared cache...
            npx expo start --clear
        )
    )
)

echo ✅ Metro cache fix completed. Please restart your development server.
pause 