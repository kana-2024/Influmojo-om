#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Android Build Configuration');
console.log('=====================================');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Not in the correct directory. Please run this from the mobile folder.');
  process.exit(1);
}

console.log('🔍 Checking configuration files...');

// Check if local.properties exists
const localPropertiesPath = path.join(__dirname, '../android/local.properties');
if (fs.existsSync(localPropertiesPath)) {
  console.log('✅ local.properties exists');
} else {
  console.log('❌ local.properties missing');
}

// Check if settings.gradle exists
const settingsGradlePath = path.join(__dirname, '../android/settings.gradle');
if (fs.existsSync(settingsGradlePath)) {
  console.log('✅ settings.gradle exists');
} else {
  console.log('❌ settings.gradle missing');
}

// Check if build.gradle exists
const buildGradlePath = path.join(__dirname, '../android/build.gradle');
if (fs.existsSync(buildGradlePath)) {
  console.log('✅ build.gradle exists');
} else {
  console.log('❌ build.gradle missing');
}

console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

} catch (error) {
  console.log('❌ Error reading package.json');
}

console.log('\n🚀 Ready to test build!');
console.log('Try running: npm run build:android');
console.log('or: eas build --profile development --platform android'); 