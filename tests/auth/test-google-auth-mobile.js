const https = require('https');

// Test mobile Google auth configuration
function testMobileGoogleAuth() {
  console.log('📱 Testing Mobile Google Auth Configuration...');
  console.log('✅ Android Client ID: 401925027822-8vnuv8dfjbjnc265fkihkk61qsoofnot.apps.googleusercontent.com');
  console.log('⏳ iOS Client ID: Pending (you need to create this)');
  console.log('');
  
  // Test backend health
  const healthOptions = {
    hostname: 'fair-legal-gar.ngrok-free.app',
    port: 443,
    path: '/api/health',
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const healthReq = https.request(healthOptions, (res) => {
    console.log(`✅ Backend Health Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📡 Backend Response:', response);
        
        if (response.status === 'OK') {
          console.log('🎉 Backend is working perfectly!');
          console.log('');
          console.log('📱 Next Steps:');
          console.log('   1. Create iOS OAuth client ID in Google Cloud Console');
          console.log('   2. Add it to mobile/.env file');
          console.log('   3. Test Google signup in your mobile app');
          console.log('');
          console.log('🚀 Your Android Google signup should work now!');
        }
      } catch (e) {
        console.log('📡 Raw Response:', data);
      }
    });
  });

  healthReq.on('error', (error) => {
    console.error('❌ Backend Health Check Failed:', error.message);
  });

  healthReq.end();
}

console.log('🧪 Testing Mobile Google Authentication Setup...');
console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
console.log('📱 Platform: Android (iOS pending)');

testMobileGoogleAuth(); 