const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Frontend URL
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNiIsInVzZXJfdHlwZSI6ImFnZW50IiwiaWF0IjoxNzU0NDY3MjQzMDEyLCJleHAiOjE3NTQ0Njc4NDc4MTJ9.446TSVP_z18MOl68115OpFSoq_ksNftx66G1y-rFTA8';

async function testProxy() {
  try {
    console.log('🔍 Testing Next.js proxy to backend...');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Proxy test successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Proxy test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testProxy(); 