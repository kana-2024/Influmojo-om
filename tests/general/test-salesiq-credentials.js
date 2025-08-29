const axios = require('axios');
require('dotenv').config();

console.log('🔍 Zoho SalesIQ Credentials Debug\n');

// Check current configuration
console.log('📋 Current Configuration:');
console.log('ZOHO_CHAT_LICENSE:', process.env.ZOHO_CHAT_LICENSE);
console.log('ZOHO_CHAT_DEPARTMENT:', process.env.ZOHO_CHAT_DEPARTMENT);
console.log('ZOHO_CHAT_DEPARTMENT_ID:', process.env.ZOHO_CHAT_DEPARTMENT_ID);
console.log('ZOHO_CHAT_BASE_URL:', process.env.ZOHO_CHAT_BASE_URL);
console.log('');

// Test different authentication methods
async function testSalesIQAuth() {
  try {
    console.log('🧪 Testing SalesIQ Authentication Methods...\n');

    // Method 1: Test with current credentials
    console.log('1️⃣ Testing with current credentials...');
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      user_type: 'brand',
      user_id: 'test123',
      auth_provider: 'google',
      department_id: process.env.ZOHO_CHAT_DEPARTMENT
    };

    const response = await axios.post('https://salesiq.zoho.in/api/v1/visitors', testData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Zoho-SalesIQ-AppKey': process.env.ZOHO_CHAT_LICENSE
      }
    });

    console.log('✅ Success with current credentials');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with current credentials');
    console.log('Error:', error.response?.data || error.message);
  }

  console.log('\n2️⃣ Testing alternative authentication...');
  try {
    // Method 2: Test with Bearer token (if available)
    const zohoService = require('./src/services/zohoService');
    const accessToken = await zohoService.getAccessToken();
    
    const testData2 = {
      name: 'Test User 2',
      email: 'test2@example.com',
      phone: '+1234567890',
      user_type: 'brand',
      user_id: 'test456',
      auth_provider: 'google',
      department_id: process.env.ZOHO_CHAT_DEPARTMENT
    };

    const response2 = await axios.post('https://salesiq.zoho.in/api/v1/visitors', testData2, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Zoho-SalesIQ-AppKey': process.env.ZOHO_CHAT_LICENSE
      }
    });

    console.log('✅ Success with Bearer token');
    console.log('Response:', response2.data);
  } catch (error) {
    console.log('❌ Failed with Bearer token');
    console.log('Error:', error.response?.data || error.message);
  }
}

// Run the test
testSalesIQAuth().catch(console.error);

console.log('\n💡 Recommendations:');
console.log('1. Check your Zoho SalesIQ console for correct App Key');
console.log('2. Verify Department ID matches your SalesIQ setup');
console.log('3. Consider using Zoho Desk instead of SalesIQ');
console.log('4. Contact Zoho support if authentication issues persist'); 