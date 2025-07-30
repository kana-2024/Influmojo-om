const zohoService = require('./src/services/zohoService');
require('dotenv').config();

async function testDealWithContact() {
  console.log('🧪 Testing Deal Creation with Contact...\n');
  
  try {
    // Step 1: Create a contact first
    console.log('1. Creating Contact:');
    let contactId = null;
    try {
      const testUser = {
        name: 'Deal Test User',
        email: `deal-test-${Date.now()}@test.com`,
        phone: '+1234567890',
        user_type: 'creator',
        first_name: 'Deal',
        last_name: 'Test',
        auth_provider: 'email',
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      const contact = await zohoService.createOrUpdateContact(testUser);
      contactId = contact.details.id;
      console.log('   ✅ Contact created successfully');
      console.log('   Contact ID:', contactId);
    } catch (error) {
      console.log('   ❌ Contact creation failed:', error.message);
      return;
    }
    console.log('');

    // Step 2: Create a deal using the contact ID
    console.log('2. Creating Deal:');
    try {
      const testDeal = {
        campaign_title: 'Test Campaign',
        brand_name: 'Test Brand',
        creator_name: 'Test Creator',
        agreed_rate: 5000,
        status: 'pending',
        description: 'Test deal',
        campaign_description: 'Test campaign',
        campaign_type: 'social_media',
        creator_id: 'test-123',
        brand_id: 'test-456',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'USD',
        contact_id: contactId // Use the contact ID we just created
      };
      
      console.log('   Deal data:', JSON.stringify(testDeal, null, 2));
      
      const result = await zohoService.createDeal(testDeal);
      console.log('   ✅ Deal created successfully');
      console.log('   Deal ID:', result.details.id);
    } catch (error) {
      console.log('   ❌ Deal creation failed:', error.message);
      if (error.response?.data) {
        console.log('   Full error details:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDealWithContact(); 