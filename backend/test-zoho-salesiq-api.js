const axios = require('axios');
require('dotenv').config();

// Test Zoho SalesIQ API directly
async function testZohoSalesIQAPI() {
  console.log('🧪 Testing Zoho SalesIQ API Directly...\n');

  // Get environment variables
  const appKey = process.env.ZOHO_CHAT_LICENSE;
  const accessKey = process.env.ZOHO_ANDROID_ACCESS_KEY;
  const departmentId = process.env.ZOHO_CHAT_DEPARTMENT;
  const chatBaseUrl = process.env.ZOHO_CHAT_BASE_URL || 'https://salesiq.zoho.in';

  console.log('📋 Environment Variables:');
  console.log('  App Key:', appKey ? `${appKey.substring(0, 20)}...` : 'NOT SET');
  console.log('  Access Key:', accessKey ? `${accessKey.substring(0, 20)}...` : 'NOT SET');
  console.log('  Department ID:', departmentId || 'NOT SET');
  console.log('  Chat Base URL:', chatBaseUrl);
  console.log('');

  // Test different API endpoints
  const endpoints = [
    {
      name: 'SalesIQ API (salesiq.zoho.in)',
      baseUrl: 'https://salesiq.zoho.in',
      path: '/api/v1/visitors'
    },
    {
      name: 'SalesIQ API (salesiq.zoho.in)',
      baseUrl: 'https://salesiq.zoho.in',
      path: '/api/v1/visitors'
    },
    {
      name: 'Zoho Chat API (chat.zoho.com)',
      baseUrl: 'https://chat.zoho.com',
      path: '/api/v1/visitors'
    }
  ];

  const testVisitorData = {
    name: 'Test Brand User',
    email: 'test@influmojo.com',
    phone: '+1234567890',
    user_type: 'brand',
    user_id: '58',
    auth_provider: 'google',
    department_id: departmentId,
    source: 'mobile_app',
    platform: 'android'
  };

  for (const endpoint of endpoints) {
    console.log(`🔗 Testing ${endpoint.name}...`);
    
    try {
      // Test with different header combinations
      const headerCombinations = [
        {
          name: 'App Key + Department',
          headers: {
            'Content-Type': 'application/json',
            'X-Zoho-SalesIQ-AppKey': appKey,
            'X-Zoho-SalesIQ-Department': departmentId
          }
        },
        {
          name: 'App Key + Access Key',
          headers: {
            'Content-Type': 'application/json',
            'X-Zoho-SalesIQ-AppKey': appKey,
            'X-Zoho-SalesIQ-AccessKey': accessKey
          }
        },
        {
          name: 'App Key Only',
          headers: {
            'Content-Type': 'application/json',
            'X-Zoho-SalesIQ-AppKey': appKey
          }
        },
        {
          name: 'Authorization Bearer',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${appKey}`
          }
        }
      ];

      for (const headerCombo of headerCombinations) {
        try {
          console.log(`  📋 Trying ${headerCombo.name}...`);
          
          const response = await axios.post(`${endpoint.baseUrl}${endpoint.path}`, testVisitorData, {
            headers: headerCombo.headers,
            timeout: 10000
          });

          console.log(`  ✅ SUCCESS with ${headerCombo.name}!`);
          console.log(`  📋 Response:`, JSON.stringify(response.data, null, 2));
          
          if (response.data.visitor_id || response.data.id) {
            console.log(`  🎉 VISITOR ID CREATED: ${response.data.visitor_id || response.data.id}`);
            return {
              success: true,
              endpoint: endpoint.name,
              method: headerCombo.name,
              visitorId: response.data.visitor_id || response.data.id,
              data: response.data
            };
          }
        } catch (error) {
          console.log(`  ❌ Failed with ${headerCombo.name}:`, error.response?.status, error.response?.data?.error?.message || error.message);
        }
      }
    } catch (error) {
      console.log(`  ❌ Endpoint failed:`, error.message);
    }
    
    console.log('');
  }

  console.log('❌ All API endpoints failed');
  return { success: false };
}

// Test the working configuration
async function testWorkingConfig() {
  console.log('🧪 Testing Working Configuration...\n');
  
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002';
  
  try {
    // Test 1: Get chat configuration
    console.log('📋 Test 1: Getting chat configuration...');
    const configResponse = await axios.get(`${baseUrl}/api/zoho/chat/config`);
    console.log('✅ Chat config:', JSON.stringify(configResponse.data, null, 2));

    // Test 2: Initialize chat with working config
    console.log('\n📋 Test 2: Initializing chat...');
    const initResponse = await axios.post(`${baseUrl}/api/zoho/chat/initialize`, {
      userData: {
        id: '58',
        name: 'Test Brand User',
        email: 'test@influmojo.com',
        phone: '+1234567890',
        user_type: 'brand',
        auth_provider: 'google'
      }
    });
    
    console.log('✅ Chat init response:', JSON.stringify(initResponse.data, null, 2));
    
    // Check if we got a visitor ID
    const visitorId = initResponse.data.visitor_id;
    if (visitorId) {
      console.log(`🎉 VISITOR ID: ${visitorId}`);
      
      // Test 3: Send a message
      console.log('\n📋 Test 3: Sending message...');
      const messageResponse = await axios.post(`${baseUrl}/api/zoho/chat/send-message`, {
        visitorId: visitorId,
        message: 'Hello from Influmojo test!',
        messageType: 'text'
      });
      
      console.log('✅ Message response:', JSON.stringify(messageResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Zoho SalesIQ API Tests...\n');
  
  // Test 1: Direct API testing
  const apiResult = await testZohoSalesIQAPI();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Working configuration
  await testWorkingConfig();
  
  console.log('\n🎉 All tests completed!');
  
  if (apiResult.success) {
    console.log('\n✅ FOUND WORKING CONFIGURATION:');
    console.log(`   Endpoint: ${apiResult.endpoint}`);
    console.log(`   Method: ${apiResult.method}`);
    console.log(`   Visitor ID: ${apiResult.visitorId}`);
  } else {
    console.log('\n❌ NO WORKING CONFIGURATION FOUND');
    console.log('   Please check your Zoho SalesIQ credentials and API documentation');
  }
}

runTests(); 