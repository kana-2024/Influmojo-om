#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Testing API Connection');
console.log('========================');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Not in the correct directory. Please run this from the mobile folder.');
  process.exit(1);
}

console.log('🔍 Checking environment variables...');

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiUrlMatch = envContent.match(/EXPO_PUBLIC_API_URL=(.+)/);
  
  if (apiUrlMatch) {
    const apiUrl = apiUrlMatch[1].trim();
    console.log('📡 API URL:', apiUrl);
    
    if (apiUrl.includes('localhost')) {
      console.log('⚠️  Warning: Using localhost URL. This won\'t work on physical devices.');
    } else if (apiUrl.includes('ngrok')) {
      console.log('✅ Using ngrok URL - good for testing on devices');
    } else {
      console.log('✅ Using external URL');
    }
  } else {
    console.log('❌ EXPO_PUBLIC_API_URL not found in .env');
  }
} else {
  console.log('❌ .env file missing');
  console.log('💡 Create a .env file with:');
  console.log('   EXPO_PUBLIC_API_URL=https://fair-legal-gar.ngrok-free.app');
}

console.log('\n🧪 Testing API connectivity...');

// Test API health endpoint
const testApiConnection = async () => {
  try {
    const https = require('https');
    const url = 'https://fair-legal-gar.ngrok-free.app/api/health';
    
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        console.log('✅ API is reachable (Status:', res.statusCode, ')');
        resolve(true);
      });
      
      req.on('error', (err) => {
        console.log('❌ API connection failed:', err.message);
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        console.log('❌ API connection timeout');
        req.destroy();
        resolve(false);
      });
    });
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
    return false;
  }
};

testApiConnection().then((isConnected) => {
  console.log('\n📱 Next steps:');
  if (isConnected) {
    console.log('✅ API is working! You can now test your app.');
    console.log('   Run: npm start');
    console.log('   Then test Google login in your app');
  } else {
    console.log('❌ API connection failed. Please check:');
    console.log('   1. Is your backend server running?');
    console.log('   2. Is ngrok tunnel active?');
    console.log('   3. Is the API URL correct in .env?');
  }
}); 