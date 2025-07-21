const https = require('https');

// Test ngrok backend health endpoint
function testNgrokBackend() {
  const options = {
    hostname: 'fair-legal-gar.ngrok-free.app',
    port: 443,
    path: '/api/health',
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Ngrok Backend Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📡 Ngrok Backend Response:', response);
        console.log('🎉 Backend is working correctly!');
      } catch (e) {
        console.log('📡 Raw Response:', data);
        if (data.includes('ERR_NGROK_8012')) {
          console.log('❌ Error: ngrok is trying to connect to wrong port');
          console.log('💡 Fix: Use command: ngrok http --url=fair-legal-gar.ngrok-free.app 3002');
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Ngrok Backend Connection Failed:', error.message);
    console.log('💡 Make sure:');
    console.log('   1. Backend server is running on port 3002');
    console.log('   2. ngrok is running: ngrok http --url=fair-legal-gar.ngrok-free.app 3002');
    console.log('   3. The static domain is correct');
  });

  req.end();
}

// Test Google auth endpoint through ngrok
function testGoogleAuthNgrok() {
  const postData = JSON.stringify({
    idToken: 'test-token'
  });

  const options = {
    hostname: 'fair-legal-gar.ngrok-free.app',
    port: 443,
    path: '/api/auth/google-mobile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`🔐 Google Auth Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('🔐 Google Auth Response:', response);
      } catch (e) {
        console.log('🔐 Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Google Auth Failed:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('🧪 Testing Ngrok Backend Connection...');
console.log('🌐 Testing URL: https://fair-legal-gar.ngrok-free.app');
console.log('📋 Expected: Backend running on port 3002');
testNgrokBackend();

setTimeout(() => {
  console.log('\n🧪 Testing Google Auth Endpoint through Ngrok...');
  testGoogleAuthNgrok();
}, 2000); 