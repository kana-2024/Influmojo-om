const axios = require('axios');
require('dotenv').config();

// Test configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api/zoho`;

// Test data
const testUserData = {
  userData: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    user_type: 'creator',
    first_name: 'Test',
    last_name: 'User',
    auth_provider: 'email',
    created_at: new Date().toISOString(),
    status: 'active'
  }
};

const testCollaborationData = {
  collaborationData: {
    campaign_title: 'Test Campaign',
    brand_name: 'Test Brand',
    creator_name: 'Test Creator',
    agreed_rate: 5000,
    status: 'pending',
    description: 'Test collaboration description'
  }
};

const testTaskData = {
  taskData: {
    subject: 'Follow up with client',
    description: 'Call client to discuss project details',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    related_to: 'test-contact-123',
    priority: 'high',
    status: 'not_started'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test functions
async function testConfigStatus() {
  try {
    logInfo('Testing Zoho configuration status...');
    const response = await axios.get(`${API_BASE}/config/status`);
    
    if (response.status === 200) {
      logSuccess('Configuration status check passed');
      console.log('Config:', response.data);
      return true;
    }
  } catch (error) {
    logError(`Configuration status check failed: ${error.message}`);
    return false;
  }
}

async function testConnection() {
  try {
    logInfo('Testing Zoho connection...');
    const response = await axios.post(`${API_BASE}/test-connection`);
    
    if (response.status === 200) {
      logSuccess('Connection test passed');
      console.log('Connection:', response.data);
      return true;
    }
  } catch (error) {
    logError(`Connection test failed: ${error.message}`);
    return false;
  }
}

async function testContactSync() {
  try {
    logInfo('Testing contact sync...');
    const response = await axios.post(`${API_BASE}/sync-contact`, testUserData);
    
    if (response.status === 200 || response.status === 201) {
      logSuccess('Contact sync test passed');
      console.log('Contact:', response.data);
      return response.data.contactId || response.data.id;
    }
  } catch (error) {
    logError(`Contact sync test failed: ${error.message}`);
    return null;
  }
}

async function testDealCreation() {
  try {
    logInfo('Testing deal creation...');
    const response = await axios.post(`${API_BASE}/create-deal`, testCollaborationData);
    
    if (response.status === 200 || response.status === 201) {
      logSuccess('Deal creation test passed');
      console.log('Deal:', response.data);
      return response.data.dealId || response.data.id;
    }
  } catch (error) {
    logError(`Deal creation test failed: ${error.message}`);
    return null;
  }
}

async function testTaskCreation() {
  try {
    logInfo('Testing task creation...');
    const response = await axios.post(`${API_BASE}/create-task`, testTaskData);
    
    if (response.status === 200 || response.status === 201) {
      logSuccess('Task creation test passed');
      console.log('Task:', response.data);
      return response.data.taskId || response.data.id;
    }
  } catch (error) {
    logError(`Task creation test failed: ${error.message}`);
    return null;
  }
}

async function testChatInitialization() {
  try {
    logInfo('Testing chat initialization...');
    const response = await axios.post(`${API_BASE}/chat/initialize`, testUserData);
    
    if (response.status === 200) {
      logSuccess('Chat initialization test passed');
      console.log('Chat:', response.data);
      return response.data.visitorId;
    }
  } catch (error) {
    logError(`Chat initialization test failed: ${error.message}`);
    return null;
  }
}

async function testChatMessage(visitorId) {
  if (!visitorId) {
    logWarning('Skipping chat message test - no visitor ID');
    return false;
  }

  try {
    logInfo('Testing chat message sending...');
    const messageData = {
      visitorId,
      message: 'Hello from test script!',
      messageType: 'text'
    };
    
    const response = await axios.post(`${API_BASE}/chat/send-message`, messageData);
    
    if (response.status === 200) {
      logSuccess('Chat message test passed');
      console.log('Message:', response.data);
      return true;
    }
  } catch (error) {
    logError(`Chat message test failed: ${error.message}`);
    return false;
  }
}

async function testChatHistory(visitorId) {
  if (!visitorId) {
    logWarning('Skipping chat history test - no visitor ID');
    return false;
  }

  try {
    logInfo('Testing chat history retrieval...');
    const response = await axios.get(`${API_BASE}/chat/history/${visitorId}`);
    
    if (response.status === 200) {
      logSuccess('Chat history test passed');
      console.log('History:', response.data);
      return true;
    }
  } catch (error) {
    logError(`Chat history test failed: ${error.message}`);
    return false;
  }
}

async function testWebhook() {
  try {
    logInfo('Testing webhook endpoint...');
    const webhookData = {
      module: 'Contacts',
      operation: 'insert',
      resource_uri: 'https://www.zohoapis.in/crm/v2/Contacts/123456789'
    };
    
    const response = await axios.post(`${API_BASE}/webhook`, webhookData);
    
    if (response.status === 200) {
      logSuccess('Webhook test passed');
      console.log('Webhook:', response.data);
      return true;
    }
  } catch (error) {
    logError(`Webhook test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Zoho Integration Tests...', 'bold');
  log('=====================================', 'bold');
  
  const results = {
    configStatus: false,
    connection: false,
    contactSync: false,
    dealCreation: false,
    taskCreation: false,
    chatInit: false,
    chatMessage: false,
    chatHistory: false,
    webhook: false
  };

  // Test configuration and connection
  results.configStatus = await testConfigStatus();
  results.connection = await testConnection();

  // Test CRM operations
  results.contactSync = await testContactSync();
  results.dealCreation = await testDealCreation();
  results.taskCreation = await testTaskCreation();

  // Test Chat operations
  results.chatInit = await testChatInitialization();
  if (results.chatInit) {
    results.chatMessage = await testChatMessage(results.chatInit);
    results.chatHistory = await testChatHistory(results.chatInit);
  }

  // Test webhook
  results.webhook = await testWebhook();

  // Summary
  log('\n📊 Test Results Summary:', 'bold');
  log('========================', 'bold');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? 'PASSED' : 'FAILED';
    const color = result ? 'green' : 'red';
    log(`${test}: ${status}`, color);
  });

  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! Zoho integration is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Check the error messages above.', 'yellow');
  }

  return results;
}

// Environment check
function checkEnvironment() {
  log('🔍 Checking environment variables...', 'bold');
  
  const requiredVars = [
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET', 
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_BASE_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logError(`Missing environment variables: ${missingVars.join(', ')}`);
    logWarning('Please check your .env file');
    return false;
  }

  logSuccess('All required environment variables are set');
  return true;
}

// Run tests
async function main() {
  if (!checkEnvironment()) {
    process.exit(1);
  }

  try {
    await runAllTests();
  } catch (error) {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  checkEnvironment
}; 