const axios = require('axios');

// Test Zoho SalesIQ chat integration
async function testZohoChatIntegration() {
  console.log('🧪 Testing Zoho SalesIQ Chat Integration...');
  
  const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';
  
  try {
    // Test 1: Send a chat message
    console.log('\n📤 Test 1: Sending chat message to Zoho SalesIQ...');
    
    const messageData = {
      visitorId: 'visitor_1754064936770_wgq0mcm3z',
      message: 'Test message from backend API - ' + new Date().toISOString(),
      messageType: 'text',
      orderContext: {
        orderId: '29',
        orderNumber: 'ORD-001',
        orderStatus: 'pending',
        amount: 1000,
        customerName: 'Test Customer'
      }
    };

    const response = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, messageData, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('✅ Chat message response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 SUCCESS: Message sent to Zoho SalesIQ!');
      console.log('📋 Message ID:', response.data.data?.message_id);
      console.log('📋 Status:', response.data.data?.status);
    } else {
      console.log('❌ FAILED: Message not sent to Zoho SalesIQ');
      console.log('📋 Error:', response.data.message);
      console.log('📋 Details:', response.data.error);
    }

    // Test 2: Get chat configuration
    console.log('\n🔧 Test 2: Getting chat configuration...');
    
    const configResponse = await axios.get(`${API_BASE_URL}/api/zoho/chat/config`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('✅ Chat config response:', configResponse.data);
    
    if (configResponse.data.success) {
      console.log('🎉 SUCCESS: Chat configuration retrieved!');
      console.log('📋 Android App Key:', configResponse.data.data?.android?.appKey ? '✅ Set' : '❌ Missing');
      console.log('📋 Android Access Key:', configResponse.data.data?.android?.accessKey ? '✅ Set' : '❌ Missing');
      console.log('📋 Department ID:', configResponse.data.data?.department);
    } else {
      console.log('❌ FAILED: Could not get chat configuration');
    }

    // Test 3: Test Zoho connection
    console.log('\n🔗 Test 3: Testing Zoho connection...');
    
    const connectionResponse = await axios.post(`${API_BASE_URL}/api/zoho/test-connection`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('✅ Connection test response:', connectionResponse.data);
    
    if (connectionResponse.data.success) {
      console.log('🎉 SUCCESS: Zoho connection is working!');
    } else {
      console.log('❌ FAILED: Zoho connection test failed');
      console.log('📋 Error:', connectionResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run the test
testZohoChatIntegration(); 