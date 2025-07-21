#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Build Troubleshooting Script');
console.log('================================');

// Check if all required files exist
const requiredFiles = [
  'app.config.js',
  'package.json',
  'eas.json',
  'assets/Asset37.png'
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
});

// Check package.json for required dependencies
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const requiredDeps = [
  '@react-native-google-signin/google-signin',
  'expo',
  'react',
  'react-native'
];

console.log('\n📦 Checking required dependencies:');
requiredDeps.forEach(dep => {
  const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
  console.log(`   ${dep}: ${hasDep ? '✅' : '❌'}`);
});

// Check EAS configuration
const easJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'eas.json'), 'utf8'));
console.log('\n⚙️  EAS Configuration:');
console.log(`   CLI version: ${easJson.cli?.version || 'Not set'}`);
console.log(`   App version source: ${easJson.cli?.appVersionSource || 'Not set'}`);
console.log(`   Development profile: ${easJson.build?.development ? '✅' : '❌'}`);
console.log(`   Preview profile: ${easJson.build?.preview ? '✅' : '❌'}`);
console.log(`   Production profile: ${easJson.build?.production ? '✅' : '❌'}`);

// Check environment variables
console.log('\n🌍 Environment Variables:');
const envVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID'
];

envVars.forEach(envVar => {
  const hasEnv = easJson.build?.development?.env?.[envVar];
  console.log(`   ${envVar}: ${hasEnv ? '✅' : '❌'}`);
});

// Check for common build issues
console.log('\n🔍 Common Build Issues:');
const issues = [];

// Check for large assets
const assetsDir = path.join(__dirname, '../assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const largeFiles = files.filter(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    return stats.size > 500 * 1024; // Files larger than 500KB
  });
  
  if (largeFiles.length > 0) {
    issues.push(`Large asset files detected: ${largeFiles.join(', ')}`);
  }
}

// Check for console.log statements in production
const sourceDir = path.join(__dirname, '..');
function checkConsoleLogs(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalLogs = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      totalLogs += checkConsoleLogs(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const logs = (content.match(/console\.log/g) || []).length;
      totalLogs += logs;
    }
  }
  
  return totalLogs;
}

const totalLogs = checkConsoleLogs(sourceDir);
if (totalLogs > 50) {
  issues.push(`Too many console.log statements: ${totalLogs}`);
}

if (issues.length === 0) {
  console.log('   ✅ No common issues detected');
} else {
  issues.forEach(issue => {
    console.log(`   ⚠️  ${issue}`);
  });
}

console.log('\n💡 Build Troubleshooting Tips:');
console.log('   1. Run: eas build:clean');
console.log('   2. Run: expo install --fix');
console.log('   3. Check EAS project status: eas project:info');
console.log('   4. Update EAS CLI: npm install -g eas-cli@latest');
console.log('   5. Try local build: expo run:android');

console.log('\n✅ Troubleshooting check complete!'); 