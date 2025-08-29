const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testAgentLogin() {
  try {
    console.log('🔐 Testing Agent login...');
    
    const loginData = {
      email: 'john.agent@influmojo.com',
      password: 'agent123'  // Plain text password, not hash
    };

    console.log('📧 Attempting login with:', loginData.email);
    console.log('🔑 Using password:', loginData.password);
    
    const response = await axios.post(`${BASE_URL}/api/auth/agent-login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Agent login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data.data.user);
    console.log('Token:', response.data.data.token ? '✅ Received' : '❌ Not received');
    
    // Store the token for future use
    const token = response.data.data.token;
    if (token) {
      console.log('\n🔑 You can now use this token for authenticated requests:');
      console.log(`Authorization: Bearer ${token}`);
    }
    
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

testAgentLogin(); 