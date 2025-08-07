const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testAuthMe() {
  try {
    console.log('🔍 Testing /api/auth/me endpoint...');
    
    // First, login as an agent to get a fresh token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/agent-login`, {
      email: 'john.agent@influmojo.com',
      password: 'agent123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Agent login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Agent login successful, token received');
    
    // Now test the /me endpoint
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing /api/auth/me:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuthMe(); 