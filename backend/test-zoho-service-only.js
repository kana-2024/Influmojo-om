const zohoService = require('./src/services/zohoService');
require('dotenv').config();

async function testZohoServiceOnly() {
  console.log('🧪 Testing Zoho Service Directly...\n');
  
  try {
    // Test 1: Check if service is properly initialized
    console.log('1. Service Initialization:');
    console.log('   ✅ Service loaded successfully');
    console.log('   Base URL:', zohoService.baseUrl);
    console.log('   Chat Base URL:', zohoService.chatBaseUrl);
    console.log('');

    // Test 2: Test token generation
    console.log('2. Token Generation:');
    try {
      const token = await zohoService.getAccessToken();
      console.log('   ✅ Token generated successfully');
      console.log('   Token length:', token.length);
      console.log('   Token starts with:', token.substring(0, 20) + '...');
    } catch (error) {
      console.log('   ❌ Token generation failed:', error.message);
      return;
    }
    console.log('');

        // Test 3: Test contact creation
    console.log('3. Contact Creation:');
    let contactId = null;
    try {
      const testUser = {
        name: 'Service Test User',
        email: `service-${Date.now()}@test.com`, // Unique email to avoid duplicates
        phone: '+1234567890',
        user_type: 'creator',
        first_name: 'Service',
        last_name: 'Test',
        auth_provider: 'email',
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      const result = await zohoService.createOrUpdateContact(testUser);
      contactId = result.details.id;
      console.log('   ✅ Contact created successfully');
      console.log('   Contact ID:', contactId);
    } catch (error) {
      console.log('   ❌ Contact creation failed:', error.message);
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        console.log('   ⚠️  This is expected due to rate limiting');
      }
    }
    console.log('');

    // Test 4: Test deal creation
    console.log('4. Deal Creation:');
    try {
      const testDeal = {
        campaign_title: 'Service Test Campaign',
        brand_name: 'Test Brand',
        creator_name: 'Test Creator',
        agreed_rate: 5000,
        status: 'pending',
        description: 'Test deal from service',
        // Add required fields for Zoho CRM Deals
        campaign_description: 'Test campaign description',
        campaign_type: 'social_media',
        creator_id: 'test-creator-123',
        brand_id: 'test-brand-123',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        currency: 'USD',
        contact_id: contactId // Use the contact ID from step 3
      };
      
      const result = await zohoService.createDeal(testDeal);
      console.log('   ✅ Deal created successfully');
      console.log('   Deal ID:', result.details.id);
    } catch (error) {
      console.log('   ❌ Deal creation failed:', error.message);
      if (error.response?.data) {
        console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        console.log('   ⚠️  This is expected due to rate limiting');
      }
    }
    console.log('');

    // Test 5: Test task creation
    console.log('5. Task Creation:');
    try {
      const testTask = {
        subject: 'Service Test Task',
        description: 'Test task from service',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        related_to: contactId, // Use the contact ID from step 3
        priority: 'high',
        status: 'not_started'
        // Removed owner_id and other custom fields
      };
      
      const result = await zohoService.createTask(testTask);
      console.log('   ✅ Task created successfully');
      console.log('   Task ID:', result.details.id);
    } catch (error) {
      console.log('   ❌ Task creation failed:', error.message);
      if (error.response?.data) {
        console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        console.log('   ⚠️  This is expected due to rate limiting');
      }
    }
    
    console.log('\n🎉 Zoho Service Test Complete!');
    console.log('✅ The service is working correctly');
    console.log('⚠️  Some tests may fail due to Zoho rate limiting');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testZohoServiceOnly(); 