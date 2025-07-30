#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Android Build Fix Script');
console.log('==========================');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Not in the correct directory. Please run this from the mobile folder.');
  process.exit(1);
}

console.log('🧹 Cleaning build cache...');
try {
  // Clean Expo cache
  execSync('npx expo install --fix', { stdio: 'inherit' });
  console.log('✅ Expo dependencies fixed');
} catch (error) {
  console.log('⚠️  Expo fix failed, continuing...');
}

try {
  // Clean Android build
  execSync('cd android && ./gradlew clean', { stdio: 'inherit' });
  console.log('✅ Android build cleaned');
} catch (error) {
  console.log('⚠️  Android clean failed, continuing...');
}

console.log('📦 Reinstalling dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies reinstalled');
} catch (error) {
  console.error('❌ Failed to reinstall dependencies');
  process.exit(1);
}

console.log('🔍 Checking Android configuration...');
try {
  // Check if local.properties exists
  const localPropertiesPath = path.join(__dirname, '../android/local.properties');
  if (!fs.existsSync(localPropertiesPath)) {
    console.log('⚠️  local.properties not found, creating...');
    const sdkPath = process.platform === 'win32' 
      ? 'C:\\Users\\kanas\\AppData\\Local\\Android\\Sdk'
      : '/Users/kanas/Library/Android/sdk';
    
    fs.writeFileSync(localPropertiesPath, `sdk.dir=${sdkPath}\n`);
    console.log('✅ local.properties created');
  }
} catch (error) {
  console.log('⚠️  Could not create local.properties');
}

console.log('🚀 Ready to build! Try running:');
console.log('   npm run build:android');
console.log('   or');
console.log('   eas build --profile development --platform android'); 