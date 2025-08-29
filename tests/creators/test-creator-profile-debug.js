const https = require('https');

// Test creator profile endpoint
const testCreatorProfile = async () => {
  const options = {
    hostname: 'fair-legal-gar.ngrok-free.app',
    port: 443,
    path: '/api/profile/creator-profile',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('🔍 Creator Profile Response:');
          console.log('Status:', res.statusCode);
          console.log('Success:', response.success);
          console.log('Data:', JSON.stringify(response.data, null, 2));
          
          if (response.data) {
            console.log('\n🔍 Key Fields:');
            console.log('Languages:', response.data.languages);
            console.log('Languages type:', typeof response.data.languages);
            console.log('Languages is array:', Array.isArray(response.data.languages));
            console.log('Date of birth:', response.data.date_of_birth);
            console.log('Gender:', response.data.gender);
            console.log('Content categories:', response.data.content_categories);
            console.log('Content categories type:', typeof response.data.content_categories);
            console.log('Content categories is array:', Array.isArray(response.data.content_categories));
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Parse error:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.end();
  });
};

console.log('🔍 Testing Creator Profile Endpoint...');
console.log('🌐 Backend URL: https://fair-legal-gar.ngrok-free.app');
console.log('📋 Note: You need to replace YOUR_TOKEN_HERE with an actual token');

testCreatorProfile()
  .then(() => {
    console.log('✅ Test completed');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
  }); 