const axios = require('axios');
require('dotenv').config();

// Test configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api/zoho`;

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

// Test 1: Basic Configuration Check
async function testConfiguration() {
  logInfo('1️⃣ Testing Zoho Configuration...');
  try {
    const response = await axios.get(`${API_BASE}/config/status`);
    console.log('Configuration:', JSON.stringify(response.data, null, 2));
    
    if (response.data.configured) {
      logSuccess('Configuration is properly set up');
      return true;
    } else {
      logError('Configuration is incomplete');
      return false;
    }
  } catch (error) {
    logError(`Configuration check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Connection Test
async function testConnection() {
  logInfo('2️⃣ Testing Zoho Connection...');
  try {
    const response = await axios.post(`${API_BASE}/test-connection`);
    console.log('Connection:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      logSuccess('Connection test passed');
      return true;
    } else {
      logError('Connection test failed');
      return false;
    }
  } catch (error) {
    logError(`Connection test failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Test 3: Contact Sync with Unique Data
async function testContactSync() {
  logInfo('3️⃣ Testing Contact Sync with Unique Data...');
  
  // Generate unique test data
  const timestamp = Date.now();
  const uniqueEmail = `test-${timestamp}@example.com`;
  const uniquePhone = `+1234567${timestamp.toString().slice(-4)}`;
  
  const testUserData = {
    userData: {
      id: `test-user-${timestamp}`,
      name: `Test User ${timestamp}`,
      email: uniqueEmail,
      phone: uniquePhone,
      user_type: 'creator',
      first_name: 'Test',
      last_name: `User${timestamp}`,
      auth_provider: 'email',
      created_at: new Date().toISOString(),
      status: 'active',
      profile_image_url: 'https://example.com/avatar.jpg'
    }
  };

  try {
    const response = await axios.post(`${API_BASE}/sync-contact`, testUserData);
    console.log('Contact Sync Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      logSuccess('Contact sync successful');
      return response.data.data?.details?.id || 'unknown';
    } else {
      logError('Contact sync failed');
      return null;
    }
  } catch (error) {
    logError(`Contact sync failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test 4: Deal Creation with Valid Data
async function testDealCreation() {
  logInfo('4️⃣ Testing Deal Creation with Valid Data...');
  
  const testCollaborationData = {
    collaborationData: {
      id: `deal-${Date.now()}`,
      campaign_title: `Test Campaign ${Date.now()}`,
      brand_name: 'Test Brand Inc',
      creator_name: 'Test Creator',
      contact_id: 'test-contact-123',
      agreed_rate: 5000,
      currency: 'USD',
      status: 'pending',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      campaign_description: 'Test campaign for influencer marketing',
      brand_name: 'Test Brand Inc'
    }
  };

  try {
    const response = await axios.post(`${API_BASE}/create-deal`, testCollaborationData);
    console.log('Deal Creation Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      logSuccess('Deal creation successful');
      return response.data.data?.details?.id || 'unknown';
    } else {
      logError('Deal creation failed');
      return null;
    }
  } catch (error) {
    logError(`Deal creation failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test 5: Task Creation
async function testTaskCreation() {
  logInfo('5️⃣ Testing Task Creation...');
  
  const testTaskData = {
    taskData: {
      subject: `Test Task ${Date.now()}`,
      description: 'This is a test task for debugging purposes',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      related_to: 'test-contact-123',
      priority: 'Medium',
      status: 'Not Started'
    }
  };

  try {
    const response = await axios.post(`${API_BASE}/create-task`, testTaskData);
    console.log('Task Creation Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      logSuccess('Task creation successful');
      return response.data.data?.details?.id || 'unknown';
    } else {
      logError('Task creation failed');
      return null;
    }
  } catch (error) {
    logError(`Task creation failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test 6: Chat Initialization
async function testChatInitialization() {
  logInfo('6️⃣ Testing Chat Initialization...');
  
  const testUserData = {
    userData: {
      id: `chat-user-${Date.now()}`,
      name: `Chat User ${Date.now()}`,
      email: `chat-${Date.now()}@example.com`,
      phone: `+1234567${Date.now().toString().slice(-4)}`,
      user_type: 'creator',
      auth_provider: 'email'
    }
  };

  try {
    const response = await axios.post(`${API_BASE}/chat/initialize`, testUserData);
    console.log('Chat Initialization Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      logSuccess('Chat initialization successful');
      return response.data.data?.visitor_id || response.data.data?.id || 'unknown';
    } else {
      logError('Chat initialization failed');
      return null;
    }
  } catch (error) {
    logError(`Chat initialization failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test 7: Webhook Test
async function testWebhook() {
  logInfo('7️⃣ Testing Webhook Endpoint...');
  
  const webhookData = {
    channel_id: 'test-channel',
    token: 'test-token',
    module: 'Contacts',
    operation: 'insert',
    resource_uri: 'https://www.zohoapis.in/crm/v2/Contacts/123456789'
  };

  try {
    const response = await axios.post(`${API_BASE}/webhook`, webhookData);
    console.log('Webhook Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      logSuccess('Webhook test successful');
      return true;
    } else {
      logError('Webhook test failed');
      return false;
    }
  } catch (error) {
    logError(`Webhook test failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Main test runner
async function runDebugTests() {
  log('🔍 Starting Zoho Integration Debug Tests...', 'bold');
  log('============================================', 'bold');
  
  const results = {
    config: false,
    connection: false,
    contactSync: null,
    dealCreation: null,
    taskCreation: null,
    chatInit: null,
    webhook: false
  };

  // Run tests sequentially
  results.config = await testConfiguration();
  
  if (results.config) {
    results.connection = await testConnection();
    
    if (results.connection) {
      results.contactSync = await testContactSync();
      results.dealCreation = await testDealCreation();
      results.taskCreation = await testTaskCreation();
      results.chatInit = await testChatInitialization();
    }
  }
  
  results.webhook = await testWebhook();

  // Summary
  log('\n📊 Debug Test Results Summary:', 'bold');
  log('==============================', 'bold');
  
  Object.entries(results).forEach(([test, result]) => {
    if (result === true) {
      log(`${test}: PASSED`, 'green');
    } else if (result === false) {
      log(`${test}: FAILED`, 'red');
    } else if (result) {
      log(`${test}: PASSED (ID: ${result})`, 'green');
    } else {
      log(`${test}: FAILED`, 'red');
    }
  });

  // Recommendations
  log('\n💡 Recommendations:', 'bold');
  log('==================', 'bold');
  
  if (!results.config) {
    logWarning('• Check your .env file for ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN');
  }
  
  if (!results.connection) {
    logWarning('• Verify your Zoho credentials and refresh token');
    logWarning('• Check if your Zoho account has API access enabled');
  }
  
  if (!results.contactSync) {
    logWarning('• Contact sync failed - check Zoho CRM field mappings');
    logWarning('• Verify that required fields are properly configured in Zoho CRM');
  }
  
  if (!results.dealCreation) {
    logWarning('• Deal creation failed - check date format and required fields');
    logWarning('• Verify Zoho CRM deal stage mappings');
  }
  
  if (!results.taskCreation) {
    logWarning('• Task creation failed - check task field configurations');
  }
  
  if (!results.chatInit) {
    logWarning('• Chat initialization failed - check Zoho Chat configuration');
    logWarning('• Verify chat widget setup and API permissions');
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
    await runDebugTests();
  } catch (error) {
    logError(`Debug test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runDebugTests,
  checkEnvironment
}; 