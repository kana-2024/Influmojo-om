const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testStreamChatToken() {
  try {
    console.log('🔑 Testing StreamChat token generation...');
    
    // First, login as an agent
    console.log('📝 Attempting agent login...');
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
    
    // Now test StreamChat token generation
    console.log('🔑 Attempting StreamChat token generation...');
    const streamResponse = await axios.get(`${BASE_URL}/api/chat/token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (streamResponse.data.success) {
      console.log('✅ StreamChat token generated successfully!');
      console.log('Token data:', {
        userId: streamResponse.data.data.userId,
        apiKey: streamResponse.data.data.apiKey ? '✅ Present' : '❌ Missing',
        token: streamResponse.data.data.token ? '✅ Present' : '❌ Missing'
      });
    } else {
      console.error('❌ StreamChat token generation failed:', streamResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testStreamChatToken(); 