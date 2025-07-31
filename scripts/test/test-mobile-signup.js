const https = require('https');

// Test mobile phone signup flow
function testMobileSignup() {
  console.log('📱 Testing Mobile Phone Signup Flow...');
  
  // Step 1: Send OTP
  const phoneNumber = '+919876543210'; // Test phone number
  const sendOtpData = JSON.stringify({
    phone: phoneNumber
  });

  const sendOtpOptions = {
    hostname: 'fair-legal-gar.ngrok-free.app',
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
          
          // Step 2: Verify OTP (you'll need to get the actual OTP from backend console)
          console.log('\n📱 Next step: Verify OTP');
          console.log('💡 Look in your backend terminal for the OTP code');
          console.log('💡 Then test with: node test-verify-otp.js');
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
  });

  sendOtpReq.write(sendOtpData);
  sendOtpReq.end();
}

// Test health endpoint
function testHealth() {
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
    console.log(`✅ Health Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📡 Health Response:', response);
      } catch (e) {
        console.log('📡 Raw Health Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Health Check Failed:', error.message);
  });

  req.end();
}

console.log('🧪 Testing Mobile Phone Signup...');
console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
console.log('📱 Test Phone: +919876543210');

testHealth();

setTimeout(() => {
  testMobileSignup();
}, 1000); 