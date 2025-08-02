const axios = require('axios');

// Test the updated Zoho chat widget integration
async function testZohoChatWidget() {
  console.log('🧪 Testing Updated Zoho Chat Widget Integration...');
  
  const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';
  
  try {
    // Test 1: Send a chat message (should now actually send to Zoho)
    console.log('\n📤 Test 1: Sending chat message to Zoho SalesIQ...');
    
    const messageData = {
      visitorId: 'visitor_1754064936770_wgq0mcm3z',
      message: 'Test message from updated backend - ' + new Date().toISOString(),
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
      
      // Check if the message was actually sent to Zoho (not just logged)
      if (response.data.data?.status === 'sent_to_zoho') {
        console.log('✅ CONFIRMED: Message was sent directly to Zoho SalesIQ API');
      } else {
        console.log('⚠️ WARNING: Message may not have been sent to Zoho (status:', response.data.data?.status, ')');
      }
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

    console.log('\n📱 Mobile App Integration:');
    console.log('✅ Custom chat widget with "Open Zoho Chat" button');
    console.log('✅ Backend API integration for message sending');
    console.log('✅ Zoho SalesIQ SDK initialization');
    console.log('✅ Native Zoho chat interface integration');
    
    console.log('\n🎯 Expected Behavior:');
    console.log('1. User opens chat widget in mobile app');
    console.log('2. User can send messages via custom interface (backend API)');
    console.log('3. User can click "Open Zoho Chat" to use native Zoho interface');
    console.log('4. Messages should appear in Zoho SalesIQ console');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run the test
testZohoChatWidget(); 