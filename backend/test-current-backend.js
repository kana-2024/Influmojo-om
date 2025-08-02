const axios = require('axios');

// Test to check current backend response
async function testCurrentBackend() {
  console.log('🧪 Testing Current Backend Response...');
  
  const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';
  
  try {
    const messageData = {
      visitorId: 'visitor_test_123',
      message: 'Test message - ' + new Date().toISOString(),
      messageType: 'text',
      orderContext: {
        orderId: '29',
        orderNumber: 'ORD-001'
      }
    };

    const response = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, messageData, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
    // Check the response structure
    if (response.data.data?.status === 'logged_for_tracking') {
      console.log('🎉 SUCCESS: Backend is using the updated code!');
    } else if (response.data.data?.status === 'sent_via_mobile_sdk') {
      console.log('⚠️ WARNING: Backend is still using the old code');
    } else {
      console.log('❓ UNKNOWN: Backend response format unclear');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCurrentBackend(); 