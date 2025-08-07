const https = require('https');

// Test StreamChat configuration
function testStreamChatConfig() {
  console.log('🔍 Testing StreamChat Configuration...');
  console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
  console.log('');

  // Test 1: Check if StreamChat token endpoint is accessible
  const tokenOptions = {
    hostname: 'fair-legal-gar.ngrok-free.app',
    port: 443,
    path: '/api/chat/token',
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Authorization': 'Bearer test-token' // This will fail auth, but we'll see the response
    }
  };

  const tokenReq = https.request(tokenOptions, (res) => {
    console.log(`🔑 StreamChat Token Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('🔑 StreamChat Token Response:', response);
        
        if (res.statusCode === 401) {
          console.log('❌ Authentication failed (expected with test token)');
          console.log('💡 This means the endpoint exists but needs a valid token');
        } else if (res.statusCode === 500) {
          console.log('❌ Server error - check backend logs for StreamChat configuration');
          if (response.message && response.message.includes('STREAM_API_KEY')) {
            console.log('💡 StreamChat API key is not configured');
          } else if (response.message && response.message.includes('STREAM_API_SECRET')) {
            console.log('💡 StreamChat API secret is not configured');
          }
        } else if (res.statusCode === 200) {
          console.log('✅ StreamChat token generated successfully!');
        }
      } catch (e) {
        console.log('🔑 Raw Response:', data);
      }
    });
  });

  tokenReq.on('error', (error) => {
    console.error('❌ StreamChat Token Request Failed:', error.message);
  });

  tokenReq.end();
}

// Run the test
testStreamChatConfig(); 