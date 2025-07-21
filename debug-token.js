const https = require('https');

// Debug token and preferences
function debugTokenAndPreferences() {
  console.log('🔍 Debugging Token and Preferences...');
  console.log('');
  console.log('📋 Instructions:');
  console.log('1. Complete Google signup in your mobile app');
  console.log('2. When you get to the preferences screen, check the mobile app console');
  console.log('3. Look for any error messages or token-related logs');
  console.log('4. Share the error message with me');
  console.log('');
  console.log('🔧 Common Issues:');
  console.log('- Token not being stored after Google signup');
  console.log('- Token not being sent in Authorization header');
  console.log('- Token expired');
  console.log('- Database connection issues');
  console.log('');
  console.log('💡 To debug:');
  console.log('1. Add console.log in your mobile app to see the token');
  console.log('2. Check if the token is being stored properly');
  console.log('3. Verify the Authorization header is being sent');
  console.log('');
  console.log('📱 Mobile App Debug Steps:');
  console.log('1. In CreatorPreferencesScreen.tsx, add this before the API call:');
  console.log('   console.log("Token:", await getToken());');
  console.log('2. Check the mobile app console for the token');
  console.log('3. If token is null, the issue is in token storage');
  console.log('4. If token exists, the issue is in the API call');
}

// Test preferences with a sample token (you'll need to replace this with a real token)
function testWithRealToken(token) {
  if (!token) {
    console.log('❌ No token provided');
    return;
  }

  console.log('🧪 Testing with real token...');
  
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
      'Authorization': `Bearer ${token}`
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
        
        if (res.statusCode === 200) {
          console.log('✅ Preferences saved successfully!');
        } else if (res.statusCode === 401) {
          console.log('❌ Token is invalid or expired');
        } else if (res.statusCode === 500) {
          console.log('❌ Server error - check backend logs');
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

console.log('🔍 Token and Preferences Debug Guide...');
debugTokenAndPreferences();

// If you have a real token, uncomment and use this:
// testWithRealToken('YOUR_REAL_TOKEN_HERE'); 