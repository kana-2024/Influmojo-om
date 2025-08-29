const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testHealth() {
  try {
    console.log('🔍 Testing server health...');
    
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    console.log('✅ Server is running!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ Server health check failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testHealth(); 