const axios = require('axios');
require('dotenv').config();

/**
 * Test Order-Based Chat Integration with Zoho SalesIQ
 * This script tests the complete flow for order support chat sessions
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fair-legal-gar.ngrok-free.app';

async function testOrderChatIntegration() {
  console.log('🧪 Testing Order-Based Chat Integration...\n');

  try {
    // Test 1: Initialize chat with order context
    console.log('1️⃣ Testing chat initialization with order context...');
    const mockUser = {
      id: 'brand_user_123',
      name: 'Test Brand User',
      email: 'brand@influmojo.com',
      phone: '+1234567890',
      user_type: 'brand'
    };

    const orderContext = {
      orderId: 'order_123456',
      orderNumber: 'INV-2024-001',
      orderStatus: 'pending',
      amount: 1500.00,
      customerName: 'Test Brand User'
    };

    const initResponse = await axios.post(`${API_BASE_URL}/api/zoho/chat/initialize`, {
      userData: mockUser,
      orderContext: orderContext
    });

    if (initResponse.data.success) {
      console.log('✅ Chat initialized with order context successfully');
      console.log('📋 Visitor ID:', initResponse.data.visitor_id);
      console.log('📋 Session ID:', initResponse.data.session_id);
      console.log('🎫 Ticket ID:', initResponse.data.ticket_id);
      
      const visitorId = initResponse.data.visitor_id;
      const sessionId = initResponse.data.session_id;

      // Test 2: Send message with order context
      console.log('\n2️⃣ Testing message sending with order context...');
      const messageData = {
        visitorId: visitorId,
        message: 'Hi, I need help with my order INV-2024-001. The status shows pending but I expected it to be completed.',
        messageType: 'text',
        orderContext: orderContext
      };

      const messageResponse = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, messageData);

      if (messageResponse.data.success) {
        console.log('✅ Message sent with order context successfully');
        console.log('📋 Message response:', messageResponse.data);
      } else {
        console.log('❌ Message sending failed:', messageResponse.data);
      }

      // Test 3: Get chat session history
      console.log('\n3️⃣ Testing chat session history...');
      const historyResponse = await axios.get(`${API_BASE_URL}/api/zoho/chat/history?visitorId=${visitorId}&sessionId=${sessionId}&limit=10`);

      if (historyResponse.data.success) {
        console.log('✅ Chat session history retrieved successfully');
        console.log('📋 History response:', historyResponse.data);
      } else {
        console.log('❌ Chat history failed:', historyResponse.data);
      }

      // Test 4: Get active chat sessions
      console.log('\n4️⃣ Testing active chat sessions...');
      const sessionsResponse = await axios.get(`${API_BASE_URL}/api/zoho/chat/sessions?visitorId=${visitorId}`);

      if (sessionsResponse.data.success) {
        console.log('✅ Active chat sessions retrieved successfully');
        console.log('📋 Sessions response:', sessionsResponse.data);
      } else {
        console.log('❌ Active sessions failed:', sessionsResponse.data);
      }

      // Test 5: Send another message to test conversation flow
      console.log('\n5️⃣ Testing conversation flow...');
      const followUpMessage = {
        visitorId: visitorId,
        message: 'Can you please check when this order will be processed?',
        messageType: 'text',
        orderContext: orderContext
      };

      const followUpResponse = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, followUpMessage);

      if (followUpResponse.data.success) {
        console.log('✅ Follow-up message sent successfully');
        console.log('📋 Follow-up response:', followUpResponse.data);
      } else {
        console.log('❌ Follow-up message failed:', followUpResponse.data);
      }

    } else {
      console.log('❌ Chat initialization failed:', initResponse.data);
    }

    console.log('\n🎉 Order-based chat integration test completed!');
    console.log('\n📱 Next steps:');
    console.log('1. Test the chat functionality in the mobile app');
    console.log('2. Verify that order context is properly passed to Zoho SalesIQ');
    console.log('3. Check that support tickets are created with order details');
    console.log('4. Verify that chat sessions are properly linked to orders');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure your backend server is running on:', API_BASE_URL);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running. Start it with: npm start');
    }
  }
}

// Run the test
testOrderChatIntegration(); 