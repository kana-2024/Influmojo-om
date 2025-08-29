const axios = require('axios');
require('dotenv').config();

// Test chat visitor ID creation
async function testChatVisitorId() {
  console.log('🧪 Testing Chat Visitor ID Creation...\n');

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
    // Test 1: Initialize chat widget and check visitor ID
    console.log('📋 Test 1: Initializing chat widget...');
    const initResponse = await axios.post(`${baseUrl}/api/zoho/chat/initialize`, {
      userData: testUserData
    });
    
    console.log('✅ Chat init response:', JSON.stringify(initResponse.data, null, 2));
    
    // Check if we got a real visitor ID or mock
    const visitorId = initResponse.data.visitor_id || initResponse.data.data?.visitor_id;
    if (initResponse.data.success && visitorId) {
      console.log(`📋 Visitor ID: ${visitorId}`);
      
      if (visitorId.startsWith('visitor_')) {
        console.log('⚠️ This appears to be a mock visitor ID');
      } else {
        console.log('✅ This appears to be a real Zoho visitor ID');
      }
      
      // Test 2: Try to send a message with this visitor ID
      console.log('\n📋 Test 2: Sending test message...');
      const messageResponse = await axios.post(`${baseUrl}/api/zoho/chat/send-message`, {
        visitorId: visitorId,
        message: 'Hello from Influmojo test! This is a test message from the brand support chat.',
        messageType: 'text'
      });
      
      console.log('✅ Message response:', JSON.stringify(messageResponse.data, null, 2));
      
      // Test 3: Get chat history
      console.log('\n📋 Test 3: Getting chat history...');
      const historyResponse = await axios.get(`${baseUrl}/api/zoho/chat/history?visitorId=${visitorId}&limit=10`);
      console.log('✅ History response:', JSON.stringify(historyResponse.data, null, 2));
    } else {
      console.log('❌ No visitor ID received');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testChatVisitorId(); 