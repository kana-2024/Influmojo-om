#!/usr/bin/env node

/**
 * StreamChat Integration Setup Script
 * 
 * This script helps set up the StreamChat integration for Influmojo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up StreamChat Integration for Influmojo...\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const isRoot = fs.existsSync(path.join(currentDir, 'backend')) && fs.existsSync(path.join(currentDir, 'mobile'));

if (!isRoot) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Step 1: Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install stream-chat@^9.14.0', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies:', error.message);
  process.exit(1);
}

// Step 2: Install mobile dependencies
console.log('📱 Installing mobile dependencies...');
try {
  execSync('cd mobile && npx expo install stream-chat@6.5.2 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1', { stdio: 'inherit' });
  console.log('✅ Mobile dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install mobile dependencies:', error.message);
  console.log('⚠️  Trying with legacy peer deps...');
  try {
    execSync('cd mobile && npx expo install stream-chat@6.5.2 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1 --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Mobile dependencies installed with legacy peer deps\n');
  } catch (legacyError) {
    console.error('❌ Failed to install mobile dependencies even with legacy peer deps:', legacyError.message);
    process.exit(1);
  }
}

// Step 3: Check environment variables
console.log('🔧 Checking environment variables...');
const backendEnvPath = path.join(currentDir, 'backend', '.env');
const mobileEnvPath = path.join(currentDir, 'mobile', '.env');

let backendEnv = '';
let mobileEnv = '';

if (fs.existsSync(backendEnvPath)) {
  backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
}

if (fs.existsSync(mobileEnvPath)) {
  mobileEnv = fs.readFileSync(mobileEnvPath, 'utf8');
}

// Check for StreamChat variables
const hasStreamApiKey = backendEnv.includes('STREAM_API_KEY');
const hasStreamApiSecret = backendEnv.includes('STREAM_API_SECRET');

if (!hasStreamApiKey || !hasStreamApiSecret) {
  console.log('⚠️  StreamChat environment variables not found');
  console.log('Please add the following to your backend/.env file:');
  console.log('');
  console.log('# StreamChat Configuration');
  console.log('STREAM_API_KEY=your_stream_api_key');
  console.log('STREAM_API_SECRET=your_stream_api_secret');
  console.log('');
} else {
  console.log('✅ StreamChat environment variables found\n');
}

// Step 4: Create necessary directories
console.log('📁 Creating necessary directories...');
const dirs = [
  'backend/src/services',
  'mobile/services',
  'mobile/components'
];

dirs.forEach(dir => {
  const fullPath = path.join(currentDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Step 5: Check if files exist
console.log('\n📄 Checking required files...');
const requiredFiles = [
  'backend/src/services/streamService.js',
  'backend/src/routes/chat.js',
  'mobile/services/streamChatService.ts',
  'mobile/components/TicketChat.tsx',
  'mobile/components/ContactSupportButton.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(currentDir, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Some required files are missing');
  console.log('Please ensure all StreamChat integration files are created');
}

// Step 6: Update package.json scripts
console.log('\n🔧 Checking package.json scripts...');
const backendPackagePath = path.join(currentDir, 'backend', 'package.json');
const mobilePackagePath = path.join(currentDir, 'mobile', 'package.json');

if (fs.existsSync(backendPackagePath)) {
  const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  if (!backendPackage.dependencies['stream-chat']) {
    console.log('⚠️  stream-chat dependency not found in backend/package.json');
  } else {
    console.log('✅ stream-chat dependency found in backend/package.json');
  }
}

if (fs.existsSync(mobilePackagePath)) {
  const mobilePackage = JSON.parse(fs.readFileSync(mobilePackagePath, 'utf8'));
  if (!mobilePackage.dependencies['stream-chat-react-native']) {
    console.log('⚠️  stream-chat-react-native dependency not found in mobile/package.json');
  } else {
    console.log('✅ stream-chat-react-native dependency found in mobile/package.json');
  }
}

// Step 7: Check app.config.js for Reanimated plugin
console.log('\n🔧 Checking app.config.js for Reanimated plugin...');
const appConfigPath = path.join(currentDir, 'mobile', 'app.config.js');
if (fs.existsSync(appConfigPath)) {
  const appConfig = fs.readFileSync(appConfigPath, 'utf8');
  if (appConfig.includes('react-native-reanimated/plugin')) {
    console.log('✅ Reanimated plugin found in app.config.js');
  } else {
    console.log('⚠️  Reanimated plugin not found in app.config.js');
    console.log('Please add "react-native-reanimated/plugin" to the plugins array');
  }
}

// Step 8: Final instructions
console.log('\n🎯 Setup Complete!');
console.log('');
console.log('Next steps:');
console.log('');
console.log('1. 🔑 Get StreamChat API credentials:');
console.log('   - Go to https://getstream.io/');
console.log('   - Create a new app');
console.log('   - Copy your API Key and API Secret');
console.log('');
console.log('2. 🔧 Add environment variables:');
console.log('   - Add STREAM_API_KEY and STREAM_API_SECRET to backend/.env');
console.log('');
console.log('3. 🧪 Test the integration:');
console.log('   - Start your backend server: cd backend && npm run dev');
console.log('   - Test token generation: curl -X GET http://localhost:3002/api/chat/token');
console.log('');
console.log('4. 📱 Test mobile integration:');
console.log('   - Start your mobile app: cd mobile && npm start');
console.log('   - Test the ContactSupportButton component');
console.log('');
console.log('5. 📚 Read the documentation:');
console.log('   - Check STREAMCHAT_INTEGRATION_README.md for detailed instructions');
console.log('');
console.log('�� Happy coding!'); 