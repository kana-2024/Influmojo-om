const https = require('https');

// Test preferences endpoint
function testPreferences() {
  console.log('🧪 Testing Preferences Endpoint...');
  
  // Sample preferences data
  const preferencesData = JSON.stringify({
    categories: ['Beauty', 'Lifestyle'],
    about: 'I am a content creator focused on beauty and lifestyle content.',
    languages: ['English', 'Hindi']
  });

  const options = {
    hostname: 'fair-legal-gar.ngrok-free.app',
    port: 443,
    path: '/api/profile/update-preferences',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(preferencesData),
      'ngrok-skip-browser-warning': 'true',
      'Authorization': 'Bearer test-token' // This will fail auth, but we'll see the response
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📱 Preferences Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📱 Preferences Response:', response);
        
        if (res.statusCode === 401) {
          console.log('❌ Authentication failed (expected with test token)');
          console.log('💡 This means the endpoint exists but needs a valid token');
        } else if (res.statusCode === 500) {
          console.log('❌ Server error - check backend logs');
        } else if (res.statusCode === 200) {
          console.log('✅ Preferences saved successfully!');
        }
      } catch (e) {
        console.log('📱 Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Preferences Request Failed:', error.message);
  });

  req.write(preferencesData);
  req.end();
}

// Test health endpoint first
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
        
        if (response.status === 'OK') {
          console.log('🎉 Backend is working!');
          console.log('');
          console.log('🔍 Now testing preferences endpoint...');
          testPreferences();
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

console.log('🔍 Debugging Preferences Saving Issue...');
console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
console.log('📋 Testing preferences endpoint with sample data');

testHealth(); 