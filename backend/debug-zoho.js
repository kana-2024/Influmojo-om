const zohoService = require('./src/services/zohoService');
require('dotenv').config();

async function debugZoho() {
  console.log('🔍 Debugging Zoho Service...\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1. Environment Variables:');
    console.log('   ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('   ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('   ZOHO_REFRESH_TOKEN:', process.env.ZOHO_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('   ZOHO_BASE_URL:', process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in');
    console.log('');
    
    // Test 2: Try to get access token
    console.log('2. Testing Access Token:');
    try {
      const token = await zohoService.getAccessToken();
      console.log('   ✅ Access token obtained:', token ? 'Success' : 'Failed');
    } catch (error) {
      console.log('   ❌ Access token failed:', error.message);
      console.log('   Error details:', error.response?.data || error.stack);
    }
    console.log('');
    
    // Test 3: Test a simple API call
    console.log('3. Testing Simple API Call:');
    try {
      const testUser = {
        name: 'Debug Test User',
        email: 'debug@test.com',
        phone: '+1234567890',
        user_type: 'creator',
        first_name: 'Debug',
        last_name: 'Test',
        auth_provider: 'email',
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      const result = await zohoService.createOrUpdateContact(testUser);
      console.log('   ✅ Contact creation successful:', result);
    } catch (error) {
      console.log('   ❌ Contact creation failed:', error.message);
      console.log('   Error details:', error.response?.data || error.stack);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugZoho(); 