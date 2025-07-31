const axios = require('axios');

/**
 * Zoho Integration Test Script
 * Tests all Zoho CRM and Chat endpoints
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Test data
const testUserData = {
  id: '123456789',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  user_type: 'creator',
  auth_provider: 'google',
  status: 'active',
  created_at: new Date().toISOString()
};

const testCollaborationData = {
  id: '987654321',
  campaign_title: 'Test Campaign',
  brand_name: 'Test Brand',
  creator_name: 'Test Creator',
  agreed_rate: 1500,
  currency: 'USD',
  status: 'active',
  campaign_description: 'This is a test campaign',
  campaign_type: 'sponsored_post',
  creator_id: '123456789',
  brand_id: '111111111',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
};

const testTaskData = {
  subject: 'Test Follow-up Task',
  description: 'This is a test task for follow-up',
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  related_to: 'contact_id_here',
  priority: 'Medium',
  task_type: 'Follow-up',
  user_id: '123456789'
};

const testChatUserData = {
  id: '123456789',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  user_type: 'creator',
  auth_provider: 'google'
};

// Test functions
async function testZohoConfig() {
  console.log('\n🔧 Testing Zoho Configuration...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/zoho/config/status`);
    console.log('✅ Config Status:', response.data);
    return response.data.configured;
  } catch (error) {
    console.error('❌ Config test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testZohoConnection() {
  console.log('\n🔗 Testing Zoho Connection...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/zoho/test-connection`);
    console.log('✅ Connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSyncContact() {
  console.log('\n👤 Testing Contact Sync...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/zoho/sync-contact`, {
      userData: testUserData
    });
    console.log('✅ Contact sync successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Contact sync failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateDeal() {
  console.log('\n🤝 Testing Deal Creation...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/zoho/create-deal`, {
      collaborationData: testCollaborationData
    });
    console.log('✅ Deal creation successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Deal creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateTask() {
  console.log('\n📋 Testing Task Creation...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/zoho/create-task`, {
      taskData: testTaskData
    });
    console.log('✅ Task creation successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Task creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testChatInitialize() {
  console.log('\n💬 Testing Chat Initialization...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/zoho/chat/initialize`, {
      userData: testChatUserData
    });
    console.log('✅ Chat initialization successful:', response.data);
    return response.data.data?.visitor_id;
  } catch (error) {
    console.error('❌ Chat initialization failed:', error.response?.data || error.message);
    return null;
  }
}

async function testChatSendMessage(visitorId) {
  if (!visitorId) {
    console.log('⚠️ Skipping chat message test - no visitor ID');
    return false;
  }
  
  console.log('\n💬 Testing Chat Message Sending...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, {
      visitorId: visitorId,
      message: 'Hello from test script!',
      messageType: 'text'
    });
    console.log('✅ Chat message sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Chat message failed:', error.response?.data || error.message);
    return false;
  }
}

async function testChatHistory(visitorId) {
  if (!visitorId) {
    console.log('⚠️ Skipping chat history test - no visitor ID');
    return false;
  }
  
  console.log('\n📜 Testing Chat History...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/zoho/chat/history/${visitorId}?limit=10`);
    console.log('✅ Chat history retrieved successfully:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Chat history failed:', error.response?.data || error.message);
    return false;
  }
}

async function testWebhook() {
  console.log('\n📥 Testing Webhook Handler...');
  
  try {
    const webhookData = {
      channel_id: 'test_channel',
      token: 'test_token',
      module: 'Contacts',
      operation: 'create',
      resource_uri: 'https://www.zohoapis.com/crm/v3/Contacts/123456789'
    };
    
    const response = await axios.post(`${API_BASE_URL}/api/zoho/webhook`, webhookData);
    console.log('✅ Webhook handler successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Webhook test failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Zoho Integration Tests...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('⏰ Test started at:', new Date().toISOString());
  
  const results = {
    config: false,
    connection: false,
    contactSync: false,
    dealCreation: false,
    taskCreation: false,
    chatInit: false,
    chatMessage: false,
    chatHistory: false,
    webhook: false
  };
  
  // Run tests
  results.config = await testZohoConfig();
  
  if (results.config) {
    results.connection = await testZohoConnection();
    
    if (results.connection) {
      results.contactSync = await testSyncContact();
      results.dealCreation = await testCreateDeal();
      results.taskCreation = await testCreateTask();
      
      // Chat tests
      const visitorId = await testChatInitialize();
      results.chatInit = !!visitorId;
      
      if (visitorId) {
        results.chatMessage = await testChatSendMessage(visitorId);
        results.chatHistory = await testChatHistory(visitorId);
      }
      
      // Webhook test
      results.webhook = await testWebhook();
    }
  }
  
  // Print summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Configuration: ${results.config ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Contact Sync: ${results.contactSync ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Deal Creation: ${results.dealCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Task Creation: ${results.taskCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chat Init: ${results.chatInit ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chat Message: ${results.chatMessage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chat History: ${results.chatHistory ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Webhook: ${results.webhook ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Zoho integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the configuration and try again.');
  }
  
  console.log('\n⏰ Test completed at:', new Date().toISOString());
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testZohoConfig,
  testZohoConnection,
  testSyncContact,
  testCreateDeal,
  testCreateTask,
  testChatInitialize,
  testChatSendMessage,
  testChatHistory,
  testWebhook
}; 