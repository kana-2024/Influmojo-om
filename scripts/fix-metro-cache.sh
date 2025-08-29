#!/bin/bash

echo "🔧 Fixing Metro cache issues..."

echo "Clearing Metro cache..."
npx expo start --clear

if [ $? -ne 0 ]; then
    echo "Failed to clear cache with expo, trying alternative methods..."
    
    echo "Clearing node_modules..."
    rm -rf node_modules
    if [ $? -ne 0 ]; then
        echo "Failed to clear node_modules"
    else
        echo "Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            echo "Failed to install dependencies"
        else
            echo "Starting expo with cleared cache..."
            npx expo start --clear
        fi
    fi
fi

echo "✅ Metro cache fix completed. Please restart your development server." 