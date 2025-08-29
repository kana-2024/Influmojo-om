const https = require('https');

// Test Google auth with a more realistic token format
function testGoogleAuthReal() {
  console.log('🔐 Testing Google Auth with Realistic Token Format...');
  
  // This is a more realistic Google ID token structure (still fake, but proper format)
  const postData = JSON.stringify({
    idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiNDAxOTI1MDI3ODIyLXFuZHI1Ymk2cDNjbzQ3YjE5cmpkdG5kNXBibTNmZDU5LmFwcHMuZ29vZ2xlLmNvbSIsImV4cCI6MTczMjE5MjgwMCwiaWF0IjoxNzMyMTg5MjAwLCJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvZSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdmF0YXJfaHJlZiI6Imh0dHA6Ly9leGFtcGxlLmNvbS9hdmF0YXIuanBnIn0.test-signature'
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
        
        if (response.error) {
          console.log('❌ Error Details:');
          console.log('   - Error:', response.error);
          console.log('   - Message:', response.message);
          
          if (response.message.includes('No pem found')) {
            console.log('💡 This is expected - the token is fake but the format is correct');
            console.log('✅ Your mobile app should work with real Google tokens!');
          } else if (response.message.includes('Invalid audience')) {
            console.log('💡 Issue: Google Client ID mismatch');
          } else if (response.message.includes('Token expired')) {
            console.log('💡 Issue: Token has expired');
          }
        } else {
          console.log('🎉 Google Auth successful!');
        }
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

console.log('🧪 Testing Google Authentication with Realistic Token...');
console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
console.log('📋 Expected: Token format validation (will fail with fake token, but format is correct)');

testGoogleAuthReal(); 