#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Reanimated Build Issues...\n');

// Check if we're in the mobile directory
const mobileDir = path.join(__dirname, '..');
if (!fs.existsSync(path.join(mobileDir, 'package.json'))) {
  console.error('❌ This script must be run from the mobile directory');
  process.exit(1);
}

try {
  // 1. Clean node_modules and reinstall
  console.log('📦 Cleaning node_modules...');
  if (fs.existsSync(path.join(mobileDir, 'node_modules'))) {
    execSync('rm -rf node_modules', { cwd: mobileDir, stdio: 'inherit' });
  }
  
  // 2. Clean package-lock.json
  console.log('🗑️ Cleaning package-lock.json...');
  if (fs.existsSync(path.join(mobileDir, 'package-lock.json'))) {
    fs.unlinkSync(path.join(mobileDir, 'package-lock.json'));
  }
  
  // 3. Clean Expo cache
  console.log('🧹 Cleaning Expo cache...');
  try {
    execSync('npx expo install --fix', { cwd: mobileDir, stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Expo install --fix failed, trying regular install...');
  }
  
  // 4. Install dependencies with legacy peer deps
  console.log('📥 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { cwd: mobileDir, stdio: 'inherit' });
  
  // 5. Verify Reanimated installation
  console.log('🔍 Verifying Reanimated installation...');
  const packageJson = JSON.parse(fs.readFileSync(path.join(mobileDir, 'package.json'), 'utf8'));
  const reanimatedVersion = packageJson.dependencies['react-native-reanimated'];
  
  if (reanimatedVersion !== '3.7.0') {
    console.log(`⚠️ Reanimated version mismatch. Expected: 3.7.0, Found: ${reanimatedVersion}`);
    console.log('📦 Installing correct Reanimated version...');
    execSync('npx expo install react-native-reanimated@3.7.0', { cwd: mobileDir, stdio: 'inherit' });
  }
  
  // 6. Check babel.config.js
  console.log('🔧 Checking babel.config.js...');
  const babelConfigPath = path.join(mobileDir, 'babel.config.js');
  if (fs.existsSync(babelConfigPath)) {
    const babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
    if (!babelConfig.includes('react-native-reanimated/plugin')) {
      console.log('⚠️ Reanimated plugin not found in babel.config.js, adding...');
      const updatedConfig = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ],
  };
};`;
      fs.writeFileSync(babelConfigPath, updatedConfig);
    }
  }
  
  // 7. Check app.config.js
  console.log('🔧 Checking app.config.js...');
  const appConfigPath = path.join(mobileDir, 'app.config.js');
  if (fs.existsSync(appConfigPath)) {
    const appConfig = fs.readFileSync(appConfigPath, 'utf8');
    if (appConfig.includes('react-native-reanimated/plugin')) {
      console.log('⚠️ Reanimated plugin found in app.config.js, removing...');
      const updatedConfig = appConfig.replace(/,\s*"react-native-reanimated\/plugin"/g, '');
      fs.writeFileSync(appConfigPath, updatedConfig);
    }
  }
  
  // 8. Clean Expo build cache
  console.log('🧹 Cleaning Expo build cache...');
  try {
    execSync('npx expo build:clean', { cwd: mobileDir, stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Expo build:clean failed, continuing...');
  }
  
  console.log('\n✅ Reanimated build issues fixed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npx expo start --clear');
  console.log('2. If issues persist, try: npx expo prebuild --clean');
  console.log('3. For EAS build: eas build --platform android --profile development --clear-cache');
  
} catch (error) {
  console.error('❌ Error fixing Reanimated build issues:', error.message);
  process.exit(1);
} 