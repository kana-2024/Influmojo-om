const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testSuperAdminLogin() {
  try {
    console.log('🔐 Testing Super Admin login...');
    
    const loginData = {
      email: 'admin@influmojo.com',
      password: 'admin123'
    };

    console.log('📧 Attempting login with:', loginData.email);
    
    const response = await axios.post(`${BASE_URL}/api/auth/super-admin-login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Super Admin login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data.data.user);
    console.log('Token:', response.data.data.token ? '✅ Received' : '❌ Not received');
    
    // Store the token for future use
    const token = response.data.data.token;
    if (token) {
      console.log('\n🔑 You can now use this token for authenticated requests:');
      console.log(`Authorization: Bearer ${token}`);
      
      // Test accessing a protected admin route
      console.log('\n🧪 Testing protected admin route...');
      try {
        const adminResponse = await axios.get(`${BASE_URL}/api/admin/agents`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Successfully accessed admin route!');
        console.log('Agents count:', adminResponse.data.length || 0);
      } catch (adminError) {
        console.log('❌ Failed to access admin route:', adminError.response?.data || adminError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Super Admin login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSuperAdminLogin(); 