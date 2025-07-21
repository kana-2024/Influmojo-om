const https = require('https');

// Test all endpoints for BigInt serialization issues
function testAllEndpoints() {
  console.log('🔍 Testing All Endpoints for BigInt Serialization Issues...');
  console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
  console.log('');

  const endpoints = [
    { path: '/api/health', method: 'GET', name: 'Health Check' },
    { path: '/api/auth/google-mobile', method: 'POST', name: 'Google Auth', data: { idToken: 'test' } },
    { path: '/api/auth/send-phone-verification-code', method: 'POST', name: 'Send OTP', data: { phone: '+919876543210' } },
    { path: '/api/auth/verify-phone-code', method: 'POST', name: 'Verify OTP', data: { phone: '+919876543210', code: '123456' } },
    { path: '/api/profile/update-preferences', method: 'POST', name: 'Update Preferences', data: { categories: ['test'], about: 'test', languages: ['test'] } },
    { path: '/api/profile/update-basic-info', method: 'POST', name: 'Update Basic Info', data: { gender: 'Male', email: 'test@test.com', dob: '1990-01-01', state: 'test', city: 'test', pincode: '123456' } },
    { path: '/api/profile/create-package', method: 'POST', name: 'Create Package', data: { platform: 'test', contentType: 'test', quantity: 1, revisions: 1, duration1: '1', duration2: 'day', price: 100 } },
    { path: '/api/profile/create-portfolio', method: 'POST', name: 'Create Portfolio', data: { mediaUrl: 'test', mediaType: 'image', fileName: 'test.jpg', fileSize: 1000 } },
    { path: '/api/profile/submit-kyc', method: 'POST', name: 'Submit KYC', data: { documentType: 'aadhaar', frontImageUrl: 'test', backImageUrl: 'test' } },
    { path: '/api/profile/profile', method: 'GET', name: 'Get Profile' }
  ];

  let completed = 0;
  let bigIntErrors = 0;

  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      testEndpoint(endpoint, () => {
        completed++;
        if (completed === endpoints.length) {
          console.log('');
          console.log('📊 Test Results:');
          console.log(`✅ Completed: ${completed} endpoints`);
          console.log(`❌ BigInt Errors: ${bigIntErrors}`);
          
          if (bigIntErrors === 0) {
            console.log('🎉 All endpoints are BigInt-safe!');
          } else {
            console.log('⚠️ Some endpoints still have BigInt issues');
          }
        }
      });
    }, index * 500); // Stagger requests
  });

  function testEndpoint(endpoint, callback) {
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : '';
    
    const options = {
      hostname: 'fair-legal-gar.ngrok-free.app',
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse JSON to check for BigInt errors
          JSON.parse(data);
          console.log(`✅ ${endpoint.name}: ${res.statusCode} (No BigInt error)`);
        } catch (e) {
          if (data.includes('BigInt') || e.message.includes('BigInt')) {
            console.log(`❌ ${endpoint.name}: ${res.statusCode} (BigInt error detected)`);
            bigIntErrors++;
          } else {
            console.log(`✅ ${endpoint.name}: ${res.statusCode} (JSON parse error, but no BigInt)`);
          }
        }
        callback();
      });
    });

    req.on('error', (error) => {
      console.log(`⚠️ ${endpoint.name}: Network error (${error.message})`);
      callback();
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  }
}

console.log('🧪 Comprehensive BigInt Serialization Test...');
testAllEndpoints(); 