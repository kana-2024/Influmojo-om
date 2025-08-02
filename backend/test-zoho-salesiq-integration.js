const axios = require('axios');
require('dotenv').config();

// Test Zoho SalesIQ integration
async function testZohoSalesIQIntegration() {
  console.log('🧪 Testing Zoho SalesIQ Integration...\n');

  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002';
  
  // Test data - simulating a brand user
  const testUserData = {
    id: '58', // Your user ID
    name: 'Test Brand User',
    email: 'test@influmojo.com',
    phone: '+1234567890',
    user_type: 'brand',
    auth_provider: 'google'
  };

  try {
    // Test 1: Get chat configuration
    console.log('📋 Test 1: Getting chat configuration...');
    const configResponse = await axios.get(`${baseUrl}/api/zoho/chat/config`);
    console.log('✅ Chat config response:', JSON.stringify(configResponse.data, null, 2));

    // Test 2: Initialize chat widget
    console.log('\n📋 Test 2: Initializing chat widget...');
    const initResponse = await axios.post(`${baseUrl}/api/zoho/chat/initialize`, {
      userData: testUserData
    });
    console.log('✅ Chat init response:', JSON.stringify(initResponse.data, null, 2));

    // Test 3: Send a test message (if we have a visitor ID)
    if (initResponse.data.success && initResponse.data.visitor_id) {
      console.log('\n📋 Test 3: Sending test message...');
      const messageResponse = await axios.post(`${baseUrl}/api/zoho/chat/send-message`, {
        visitorId: initResponse.data.visitor_id,
        message: 'Hello from Influmojo test! This is a test message from the brand support chat.',
        messageType: 'text'
      });
      console.log('✅ Message response:', JSON.stringify(messageResponse.data, null, 2));

      // Test 4: Get chat history
      console.log('\n📋 Test 4: Getting chat history...');
      const historyResponse = await axios.get(`${baseUrl}/api/zoho/chat/history?visitorId=${initResponse.data.visitor_id}&limit=10`);
      console.log('✅ History response:', JSON.stringify(historyResponse.data, null, 2));
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testZohoSalesIQIntegration(); 