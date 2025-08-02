const axios = require('axios');
require('dotenv').config();

/**
 * Debug Zoho SalesIQ API calls
 * This script tests the actual API endpoints and authentication
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fair-legal-gar.ngrok-free.app';

async function debugZohoSalesIQAPI() {
  console.log('🔍 Debugging Zoho SalesIQ API calls...\n');

  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking environment variables...');
    console.log('ZOHO_CHAT_LICENSE:', process.env.ZOHO_CHAT_LICENSE ? 'Set' : 'Missing');
    console.log('ZOHO_CHAT_DEPARTMENT:', process.env.ZOHO_CHAT_DEPARTMENT);
    console.log('ZOHO_CHAT_BASE_URL:', process.env.ZOHO_CHAT_BASE_URL);
    console.log('ZOHO_ANDROID_APP_KEY:', process.env.ZOHO_ANDROID_APP_KEY ? 'Set' : 'Missing');
    console.log('ZOHO_ANDROID_ACCESS_KEY:', process.env.ZOHO_ANDROID_ACCESS_KEY ? 'Set' : 'Missing');

    // Test 2: Test chat initialization
    console.log('\n2️⃣ Testing chat initialization...');
    const mockUser = {
      id: 'debug_user_123',
      name: 'Debug User',
      email: 'debug@influmojo.com',
      phone: '+1234567890',
      user_type: 'brand'
    };

    const initResponse = await axios.post(`${API_BASE_URL}/api/zoho/chat/initialize`, {
      userData: mockUser
    });

    if (initResponse.data.success) {
      console.log('✅ Chat initialization successful');
      console.log('📋 Visitor ID:', initResponse.data.visitor_id);
      console.log('📋 Session ID:', initResponse.data.session_id);
      
      const visitorId = initResponse.data.visitor_id;

      // Test 3: Test sending message
      console.log('\n3️⃣ Testing message sending...');
      const messageData = {
        visitorId: visitorId,
        message: 'Hello from debug test!',
        messageType: 'text'
      };

      const messageResponse = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, messageData);

      if (messageResponse.data.success) {
        console.log('✅ Message sent successfully');
        console.log('📋 Message response:', messageResponse.data);
      } else {
        console.log('❌ Message sending failed:', messageResponse.data);
      }

      // Test 4: Test chat history
      console.log('\n4️⃣ Testing chat history...');
      const historyResponse = await axios.get(`${API_BASE_URL}/api/zoho/chat/history?visitorId=${visitorId}&limit=10`);

      if (historyResponse.data.success) {
        console.log('✅ Chat history retrieved successfully');
        console.log('📋 History response:', historyResponse.data);
      } else {
        console.log('❌ Chat history failed:', historyResponse.data);
      }

    } else {
      console.log('❌ Chat initialization failed:', initResponse.data);
    }

    // Test 5: Test direct Zoho SalesIQ API (if we have the credentials)
    console.log('\n5️⃣ Testing direct Zoho SalesIQ API...');
    
    const chatBaseUrl = process.env.ZOHO_CHAT_BASE_URL || 'https://salesiq.zoho.in';
    const appKey = process.env.ZOHO_CHAT_LICENSE;
    const departmentId = process.env.ZOHO_CHAT_DEPARTMENT;

    if (appKey && departmentId) {
      try {
        // Test direct API call to Zoho SalesIQ
        const directResponse = await axios.get(`${chatBaseUrl}/api/v1/departments/${departmentId}`, {
          headers: {
            'X-Zoho-SalesIQ-AppKey': appKey,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Direct Zoho SalesIQ API call successful');
        console.log('📋 Department info:', directResponse.data);
      } catch (error) {
        console.log('❌ Direct Zoho SalesIQ API call failed:', error.response?.data || error.message);
        console.log('💡 This might indicate incorrect API endpoint or authentication method');
      }
    } else {
      console.log('⚠️ Missing Zoho SalesIQ credentials for direct API test');
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.response?.data || error.message);
  }
}

// Run the debug test
debugZohoSalesIQAPI(); 