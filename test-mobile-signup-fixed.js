const https = require('https');

// Test mobile phone signup flow with improved error handling
function testMobileSignup() {
  console.log('📱 Testing Mobile Phone Signup Flow...');
  
  // Step 1: Test health endpoint
  const healthOptions = {
    hostname: 'modest-properly-orca.ngrok-free.app',
    port: 443,
    path: '/api/health',
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const healthReq = https.request(healthOptions, (res) => {
    console.log(`✅ Health Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Health Response:', response);
        
        if (response.status === 'OK') {
          console.log('✅ Backend is healthy, proceeding with OTP test...');
          // Proceed with OTP test after health check
          setTimeout(testSendOTP, 1000);
        } else {
          console.log('❌ Backend health check failed:', response);
        }
      } catch (e) {
        console.log('❌ Health check response parsing failed:', data);
      }
    });
  });

  healthReq.on('error', (error) => {
    console.error('❌ Health Check Failed:', error.message);
    console.log('💡 This suggests a network connectivity issue');
  });

  healthReq.end();
}

function testSendOTP() {
  console.log('\n📱 Testing Send OTP...');
  
  // Step 1: Send OTP
  const phoneNumber = '+919876543210'; // Test phone number
  const sendOtpData = JSON.stringify({
    phone: phoneNumber
  });

  const sendOtpOptions = {
    hostname: 'modest-properly-orca.ngrok-free.app',
    port: 443,
    path: '/api/auth/send-phone-verification-code',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(sendOtpData),
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const sendOtpReq = https.request(sendOtpOptions, (res) => {
    console.log(`📱 Send OTP Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📱 Send OTP Response:', response);
        
        if (response.success) {
          console.log('✅ OTP sent successfully!');
          console.log('💡 Check your backend console for the OTP code');
          
          // Step 2: Test user existence check
          setTimeout(() => testCheckUserExists(phoneNumber), 1000);
        } else {
          console.log('❌ Failed to send OTP:', response.error);
        }
      } catch (e) {
        console.log('📱 Raw Send OTP Response:', data);
      }
    });
  });

  sendOtpReq.on('error', (error) => {
    console.error('❌ Send OTP Failed:', error.message);
    console.log('💡 This suggests an API endpoint issue');
  });

  sendOtpReq.write(sendOtpData);
  sendOtpReq.end();
}

function testCheckUserExists(phoneNumber) {
  console.log('\n🔍 Testing Check User Exists...');
  
  const checkUserData = JSON.stringify({
    phone: phoneNumber
  });

  const checkUserOptions = {
    hostname: 'modest-properly-orca.ngrok-free.app',
    port: 443,
    path: '/api/auth/check-user-exists',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(checkUserData),
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const checkUserReq = https.request(checkUserOptions, (res) => {
    console.log(`🔍 Check User Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('🔍 Check User Response:', response);
        
        if (response.success) {
          console.log('✅ User existence check successful');
          console.log(`📱 User exists: ${response.exists}`);
        } else {
          console.log('❌ User existence check failed:', response.error);
        }
      } catch (e) {
        console.log('🔍 Raw Check User Response:', data);
      }
    });
  });

  checkUserReq.on('error', (error) => {
    console.error('❌ Check User Exists Failed:', error.message);
  });

  checkUserReq.write(checkUserData);
  checkUserReq.end();
}

console.log('🧪 Testing Mobile Phone Signup Flow...');
console.log('🌐 Backend URL: https://modest-properly-orca.ngrok-free.app');
console.log('📱 Test Phone: +919876543210');
console.log('🔍 This test will verify:');
console.log('   1. Backend health');
console.log('   2. OTP sending capability');
console.log('   3. User existence checking');
console.log('');

testMobileSignup();
