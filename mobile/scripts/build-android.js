#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Android Build Helper');
console.log('=======================');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Not in the correct directory. Please run this from the mobile folder.');
  process.exit(1);
}

// Check if EAS CLI is installed
try {
  execSync('eas --version', { stdio: 'pipe' });
  console.log('✅ EAS CLI is installed');
} catch (error) {
  console.log('⚠️  EAS CLI not found. Installing...');
  try {
    execSync('npm install -g eas-cli@latest', { stdio: 'inherit' });
    console.log('✅ EAS CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install EAS CLI');
    process.exit(1);
  }
}

// Check project configuration
console.log('\n🔍 Checking project configuration...');
try {
  execSync('npm run troubleshoot', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Troubleshooting script failed, continuing...');
}

// Clean build cache
console.log('\n🧹 Cleaning build cache...');
try {
  execSync('eas build:clean', { stdio: 'inherit' });
  console.log('✅ Build cache cleaned');
} catch (error) {
  console.log('⚠️  Could not clean build cache, continuing...');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Start the build
console.log('\n🚀 Starting Android build...');
console.log('This will take several minutes...');
console.log('You can monitor progress at: https://expo.dev/accounts/navyateja929/projects/influmojo-mobile/builds');

try {
  execSync('eas build --profile development --platform android --clear-cache', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Check the build logs at the URL above');
  console.log('   2. Run: npm run troubleshoot');
  console.log('   3. Try: eas build:clean');
  console.log('   4. Check your EAS project configuration');
  process.exit(1);
} 