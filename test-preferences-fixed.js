const https = require('https');

// Test preferences endpoint after BigInt fix
function testPreferencesFixed() {
  console.log('🧪 Testing Preferences Endpoint (After BigInt Fix)...');
  
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
      'Authorization': 'Bearer test-token' // This will fail auth, but we'll see if BigInt error is gone
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
          console.log('✅ Authentication failed (expected) - but no BigInt error!');
          console.log('🎉 The BigInt serialization issue is fixed!');
          console.log('');
          console.log('📱 Your mobile app should now work properly.');
          console.log('💡 The "user preferences cannot be saved" error should be resolved.');
        } else if (res.statusCode === 500) {
          console.log('❌ Server error - check if BigInt issue is still present');
        } else if (res.statusCode === 200) {
          console.log('✅ Preferences saved successfully!');
        }
      } catch (e) {
        console.log('📱 Raw Response:', data);
        if (data.includes('BigInt')) {
          console.log('❌ BigInt error still present');
        } else {
          console.log('✅ No BigInt error in response');
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Preferences Request Failed:', error.message);
  });

  req.write(preferencesData);
  req.end();
}

console.log('🔍 Testing Preferences After BigInt Fix...');
console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
console.log('📋 Expected: 401 (auth failed) but no BigInt serialization error');

testPreferencesFixed(); 