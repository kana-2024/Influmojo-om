const zohoService = require('./src/services/zohoService');
require('dotenv').config();

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

// Test 1: Check environment variables
function testEnvironment() {
  logInfo('1️⃣ Checking Environment Variables...');
  
  const requiredVars = [
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET', 
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_BASE_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logError(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  logSuccess('All required environment variables are set');
  return true;
}

// Test 2: Test access token generation
async function testAccessToken() {
  logInfo('2️⃣ Testing Access Token Generation...');
  
  try {
    const accessToken = await zohoService.getAccessToken();
    
    if (accessToken) {
      logSuccess('Access token generated successfully');
      console.log('Token length:', accessToken.length);
      return true;
    } else {
      logError('Failed to generate access token');
      return false;
    }
  } catch (error) {
    logError(`Access token generation failed: ${error.message}`);
    return false;
  }
}

// Test 3: Test contact creation
async function testContactCreation() {
  logInfo('3️⃣ Testing Contact Creation...');
  
  const testUserData = {
    id: `test-user-${Date.now()}`,
    name: `Test User ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    phone: `+1234567${Date.now().toString().slice(-4)}`,
    user_type: 'creator',
    first_name: 'Test',
    last_name: `User${Date.now()}`,
    auth_provider: 'email',
    created_at: new Date().toISOString(),
    status: 'active',
    profile_image_url: 'https://example.com/avatar.jpg'
  };

  try {
    const result = await zohoService.createOrUpdateContact(testUserData);
    
    if (result && (result.details?.id || result.message)) {
      logSuccess('Contact creation/update successful');
      console.log('Result:', result);
      return true;
    } else {
      logError('Contact creation failed');
      return false;
    }
  } catch (error) {
    logError(`Contact creation failed: ${error.message}`);
    return false;
  }
}

// Test 4: Test deal creation
async function testDealCreation() {
  logInfo('4️⃣ Testing Deal Creation...');
  
  const testCollaborationData = {
    id: `deal-${Date.now()}`,
    campaign_title: `Test Campaign ${Date.now()}`,
    brand_name: 'Test Brand Inc',
    creator_name: 'Test Creator',
    // Use a valid numeric contact ID or leave it undefined
    // contact_id: '998641000000447039', // Uncomment and use the actual contact ID from previous test
    agreed_rate: 5000,
    currency: 'USD',
    status: 'pending',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    campaign_description: 'Test campaign for influencer marketing'
  };

  try {
    const result = await zohoService.createDeal(testCollaborationData);
    
    if (result && result.details?.id) {
      logSuccess('Deal creation successful');
      console.log('Deal ID:', result.details.id);
      return true;
    } else {
      logError('Deal creation failed');
      return false;
    }
  } catch (error) {
    logError(`Deal creation failed: ${error.message}`);
    return false;
  }
}

// Test 5: Test task creation
async function testTaskCreation() {
  logInfo('5️⃣ Testing Task Creation...');
  
  const testTaskData = {
    subject: `Test Task ${Date.now()}`,
    description: 'This is a test task for debugging purposes',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    related_to: 'test-contact-123',
    priority: 'Medium',
    status: 'Not Started'
  };

  try {
    const result = await zohoService.createTask(testTaskData);
    
    if (result && result.details?.id) {
      logSuccess('Task creation successful');
      console.log('Task ID:', result.details.id);
      return true;
    } else {
      logError('Task creation failed');
      return false;
    }
  } catch (error) {
    logError(`Task creation failed: ${error.message}`);
    return false;
  }
}

// Test 6: Test webhook handling
async function testWebhook() {
  logInfo('6️⃣ Testing Webhook Handling...');
  
  const webhookData = {
    channel_id: 'test-channel',
    token: 'test-token',
    module: 'Contacts',
    operation: 'insert',
    resource_uri: 'https://www.zohoapis.in/crm/v2/Contacts/123456789'
  };

  try {
    const result = await zohoService.handleWebhook(webhookData);
    
    if (result && result.success) {
      logSuccess('Webhook handling successful');
      return true;
    } else {
      logError('Webhook handling failed');
      return false;
    }
  } catch (error) {
    logError(`Webhook handling failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Zoho Service Tests...', 'bold');
  log('================================', 'bold');
  
  const results = {
    environment: false,
    accessToken: false,
    contactCreation: false,
    dealCreation: false,
    taskCreation: false,
    webhook: false
  };

  // Run tests sequentially
  results.environment = testEnvironment();
  
  if (results.environment) {
    results.accessToken = await testAccessToken();
    
    if (results.accessToken) {
      results.contactCreation = await testContactCreation();
      results.dealCreation = await testDealCreation();
      results.taskCreation = await testTaskCreation();
    }
  }
  
  results.webhook = await testWebhook();

  // Summary
  log('\n📊 Test Results Summary:', 'bold');
  log('========================', 'bold');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? 'PASSED' : 'FAILED';
    const color = result ? 'green' : 'red';
    log(`${test}: ${status}`, color);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! Zoho integration is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Check the error messages above.', 'yellow');
  }

  // Recommendations
  log('\n💡 Recommendations:', 'bold');
  log('==================', 'bold');
  
  if (!results.environment) {
    logWarning('• Check your .env file for ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN');
  }
  
  if (!results.accessToken) {
    logWarning('• Verify your Zoho credentials and refresh token');
    logWarning('• Check if your Zoho account has API access enabled');
  }
  
  if (!results.contactCreation) {
    logWarning('• Contact creation failed - check Zoho CRM field mappings');
    logWarning('• Verify that required fields are properly configured in Zoho CRM');
  }
  
  if (!results.dealCreation) {
    logWarning('• Deal creation failed - check date format and required fields');
    logWarning('• Verify Zoho CRM deal stage mappings');
  }
  
  if (!results.taskCreation) {
    logWarning('• Task creation failed - check task field configurations');
  }

  return results;
}

// Run tests
async function main() {
  try {
    await runTests();
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
  runTests
}; 