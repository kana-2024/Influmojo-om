const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testAgentEmailLogin() {
  try {
    console.log('🔍 Testing agent email login...');
    
    // Test with existing agent
    const loginData = {
      email: 'agent@influmojo.com',
      password: 'agent123'
    };

    console.log('📧 Login attempt with:', loginData.email);
    
    const response = await axios.post(`${BASE_URL}/api/auth/agent-login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Agent login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Agent login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAgentEmailLogin(); 