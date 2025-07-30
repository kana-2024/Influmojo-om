const zohoService = require('./src/services/zohoService');
require('dotenv').config();

async function debugZohoDetailed() {
  console.log('🔍 Detailed Zoho Service Debug...\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1. Environment Variables:');
    console.log('   ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('   ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('   ZOHO_REFRESH_TOKEN:', process.env.ZOHO_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('   ZOHO_BASE_URL:', process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in');
    console.log('');

    // Test 2: Try to get access token and log details
    console.log('2. Testing Access Token Generation:');
    try {
      const token = await zohoService.getAccessToken();
      console.log('   ✅ Token obtained:', token ? `Success (${token.substring(0, 20)}...)` : 'Failed');
      console.log('   Token length:', token ? token.length : 'N/A');
      console.log('   Token starts with:', token ? token.substring(0, 10) : 'N/A');
    } catch (error) {
      console.log('   ❌ Access token failed:', error.message);
      console.log('   Error details:', error.response?.data || error.stack);
    }
    console.log('');

    // Test 3: Test direct API call with fresh token
    console.log('3. Testing Direct API Call:');
    try {
      const axios = require('axios');
      
      // Get fresh token directly
      const tokenResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const directToken = tokenResponse.data.access_token;
      console.log('   ✅ Direct token obtained:', directToken ? `Success (${directToken.substring(0, 20)}...)` : 'Failed');
      
      // Test contact creation with direct token
      const testUser = {
        name: 'Debug Test User',
        email: 'debug@test.com',
        phone: '+1234567890',
        user_type: 'creator',
        first_name: 'Debug',
        last_name: 'Test',
        auth_provider: 'email',
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      const contactData = {
        data: [{
          Email: testUser.email,
          Phone: testUser.phone,
          First_Name: testUser.first_name,
          Last_Name: testUser.last_name,
          Account_Name: 'Influ Mojo Creator',
          Lead_Source: 'Influ Mojo App',
          Description: `User Type: ${testUser.user_type}\nAuth Provider: ${testUser.auth_provider}\nCreated: ${testUser.created_at}`
        }]
      };
      
      const baseUrl = process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in';
      const contactResponse = await axios.post(`${baseUrl}/crm/v3/Contacts`, contactData, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${directToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Direct API call successful:', contactResponse.data.data[0].details.id);
      
    } catch (error) {
      console.log('   ❌ Direct API call failed:', error.message);
      console.log('   Error details:', error.response?.data || error.stack);
    }
    console.log('');

    // Test 4: Compare service token vs direct token
    console.log('4. Comparing Service vs Direct Token:');
    try {
      const serviceToken = await zohoService.getAccessToken();
      const axios = require('axios');
      
      const directTokenResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const directToken = directTokenResponse.data.access_token;
      
      console.log('   Service token:', serviceToken ? `✅ Valid (${serviceToken.substring(0, 20)}...)` : '❌ Invalid');
      console.log('   Direct token:', directToken ? `✅ Valid (${directToken.substring(0, 20)}...)` : '❌ Invalid');
      console.log('   Tokens match:', serviceToken === directToken ? '✅ Yes' : '❌ No');
      
    } catch (error) {
      console.log('   ❌ Token comparison failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugZohoDetailed(); 