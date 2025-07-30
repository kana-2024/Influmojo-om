const zohoService = require('./src/services/zohoService');
const axios = require('axios');
require('dotenv').config();

async function debugZohoFinal() {
  console.log('🔍 Final Zoho Service Debug...\n');
  
  try {
    // Test 1: Get token from service and show exact details
    console.log('1. Service Token Details:');
    try {
      const serviceToken = await zohoService.getAccessToken();
      console.log('   Service token type:', typeof serviceToken);
      console.log('   Service token value:', serviceToken);
      console.log('   Service token length:', serviceToken ? serviceToken.length : 'N/A');
      console.log('   Service token starts with:', serviceToken ? serviceToken.substring(0, 20) : 'N/A');
      console.log('   Service token is truthy:', !!serviceToken);
    } catch (error) {
      console.log('   ❌ Service token failed:', error.message);
    }
    console.log('');

    // Test 2: Get token directly and compare
    console.log('2. Direct Token Details:');
    try {
      const directResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const directToken = directResponse.data.access_token;
      console.log('   Direct token type:', typeof directToken);
      console.log('   Direct token value:', directToken);
      console.log('   Direct token length:', directToken ? directToken.length : 'N/A');
      console.log('   Direct token starts with:', directToken ? directToken.substring(0, 20) : 'N/A');
      console.log('   Direct token is truthy:', !!directToken);
    } catch (error) {
      console.log('   ❌ Direct token failed:', error.message);
    }
    console.log('');

    // Test 3: Test service contact creation with detailed logging
    console.log('3. Testing Service Contact Creation:');
    try {
      const testUser = {
        name: 'Final Debug User',
        email: 'final@debug.com',
        phone: '+1234567890',
        user_type: 'creator',
        first_name: 'Final',
        last_name: 'Debug',
        auth_provider: 'email',
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      console.log('   Test user data:', testUser);
      const result = await zohoService.createOrUpdateContact(testUser);
      console.log('   ✅ Service contact creation successful:', result);
    } catch (error) {
      console.log('   ❌ Service contact creation failed:', error.message);
      if (error.response?.data) {
        console.log('   Error response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');

    // Test 4: Test direct contact creation for comparison
    console.log('4. Testing Direct Contact Creation:');
    try {
      const directResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const directToken = directResponse.data.access_token;
      
      const contactData = {
        data: [{
          Email: 'direct@debug.com',
          Phone: '+1234567890',
          First_Name: 'Direct',
          Last_Name: 'Debug',
          Account_Name: 'Influ Mojo Creator',
          Lead_Source: 'Influ Mojo App',
          Description: 'Direct API test'
        }]
      };
      
      const baseUrl = process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in';
      const contactResponse = await axios.post(`${baseUrl}/crm/v3/Contacts`, contactData, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${directToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Direct contact creation successful:', contactResponse.data.data[0].details.id);
    } catch (error) {
      console.log('   ❌ Direct contact creation failed:', error.message);
      if (error.response?.data) {
        console.log('   Error response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugZohoFinal(); 