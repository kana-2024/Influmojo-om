const axios = require('axios');
require('dotenv').config();

/**
 * Test Zoho SalesIQ Android SDK Setup
 * This script verifies that the new Android SDK credentials are working correctly
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fair-legal-gar.ngrok-free.app';

async function testZohoSalesIQSetup() {
  console.log('🧪 Testing Zoho SalesIQ Android SDK Setup...\n');

  try {
    // Test 1: Check backend configuration
    console.log('1️⃣ Testing backend configuration...');
    const configResponse = await axios.get(`${API_BASE_URL}/api/zoho/config/status`);
    
    if (configResponse.data.success) {
      console.log('✅ Backend configuration is valid');
      console.log('📋 Configuration details:', configResponse.data.config);
    } else {
      console.log('❌ Backend configuration failed');
      return;
    }

    // Test 2: Test Zoho connection
    console.log('\n2️⃣ Testing Zoho connection...');
    const connectionResponse = await axios.post(`${API_BASE_URL}/api/zoho/test-connection`);
    
    if (connectionResponse.data.success) {
      console.log('✅ Zoho connection test successful');
    } else {
      console.log('❌ Zoho connection test failed');
      return;
    }

    // Test 3: Test chat configuration endpoint
    console.log('\n3️⃣ Testing chat configuration endpoint...');
    const chatConfigResponse = await axios.get(`${API_BASE_URL}/api/zoho/chat/config`);
    
    if (chatConfigResponse.data.success) {
      console.log('✅ Chat configuration endpoint working');
      console.log('📋 Chat config:', chatConfigResponse.data.data);
    } else {
      console.log('❌ Chat configuration endpoint failed');
      return;
    }

    // Test 4: Test chat initialization with mock user
    console.log('\n4️⃣ Testing chat initialization...');
    const mockUser = {
      id: 'test_user_123',
      name: 'Test User',
      email: 'test@influmojo.com',
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
    } else {
      console.log('❌ Chat initialization failed');
      return;
    }

    // Test 5: Verify environment variables
    console.log('\n5️⃣ Verifying environment variables...');
    const requiredVars = [
      'ZOHO_ANDROID_APP_KEY',
      'ZOHO_ANDROID_ACCESS_KEY',
      'ZOHO_CHAT_DEPARTMENT'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set');
      console.log('📋 Android App Key:', process.env.ZOHO_ANDROID_APP_KEY ? 'Set' : 'Missing');
      console.log('📋 Android Access Key:', process.env.ZOHO_ANDROID_ACCESS_KEY ? 'Set' : 'Missing');
      console.log('📋 Department ID:', process.env.ZOHO_CHAT_DEPARTMENT);
    } else {
      console.log('❌ Missing environment variables:', missingVars);
      return;
    }

    console.log('\n🎉 All tests passed! Zoho SalesIQ Android SDK is properly configured.');
    console.log('\n📱 Next steps:');
    console.log('1. Rebuild your Android app: npm run android');
    console.log('2. Test the chat functionality in the mobile app');
    console.log('3. Verify that the chat widget appears and connects properly');

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
testZohoSalesIQSetup(); 