const zohoService = require('./src/services/zohoService');
require('dotenv').config();

async function testDealOnly() {
  console.log('🧪 Testing Deal Creation Only...\n');
  
  try {
    // Test deal creation with minimal required data
    console.log('1. Testing Deal Creation:');
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
        currency: 'USD'
      };
      
      console.log('   Deal data:', JSON.stringify(testDeal, null, 2));
      
      const result = await zohoService.createDeal(testDeal);
      console.log('   ✅ Deal created successfully');
      console.log('   Deal ID:', result.details.id);
    } catch (error) {
      console.log('   ❌ Deal creation failed:', error.message);
      if (error.response?.data) {
        console.log('   Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.response?.status) {
        console.log('   Status code:', error.response.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDealOnly(); 