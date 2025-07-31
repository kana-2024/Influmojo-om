const https = require('https');

// Test Google auth with detailed debugging
function debugGoogleAuth() {
  // This is a sample Google ID token format (not a real one)
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
    console.log(`📋 Response Headers:`, res.headers);
    
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
          
          // Common Google auth issues
          if (response.message.includes('Wrong number of segments')) {
            console.log('💡 Issue: Invalid token format (expected real Google ID token)');
          } else if (response.message.includes('Invalid audience')) {
            console.log('💡 Issue: Google Client ID mismatch');
          } else if (response.message.includes('Token expired')) {
            console.log('💡 Issue: Token has expired');
          } else if (response.message.includes('database')) {
            console.log('💡 Issue: Database connection problem');
          }
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

// Test database connection through health endpoint
function testDatabaseConnection() {
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
    console.log(`✅ Health Check Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📡 Health Response:', response);
        
        if (response.status === 'OK') {
          console.log('🎉 Backend and database are working!');
        }
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

console.log('🔍 Debugging Google Authentication...');
console.log('🌐 Testing URL: https://fair-legal-gar.ngrok-free.app');
console.log('📋 Google Client ID: 401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com');

testDatabaseConnection();

setTimeout(() => {
  console.log('\n🔍 Testing Google Auth with detailed error analysis...');
  debugGoogleAuth();
}, 1000); 