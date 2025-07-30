const axios = require('axios');
require('dotenv').config();

async function testContactOnly() {
  console.log('🔍 Testing Contact Creation Only...\n');
  
  try {
    // Step 1: Get fresh access token
    console.log('1. Getting fresh access token...');
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
    
    const accessToken = tokenResponse.data.access_token;
    console.log('   ✅ Token obtained:', accessToken ? 'Success' : 'Failed');
    console.log('   Token type:', tokenResponse.data.token_type);
    console.log('   Scope:', tokenResponse.data.scope);
    console.log('');
    
    // Step 2: Test simple contact creation
    console.log('2. Testing contact creation...');
    const contactData = {
      data: [{
        Email: 'test@example.com',
        Phone: '+1234567890',
        First_Name: 'Test',
        Last_Name: 'User',
        Account_Name: 'Influ Mojo Creator',
        Lead_Source: 'Influ Mojo App',
        Description: 'Test contact from API'
      }]
    };
    
    console.log('   Request URL:', `${process.env.ZOHO_BASE_URL}/crm/v3/Contacts`);
    console.log('   Request Headers:', {
      'Authorization': `Zoho-oauthtoken ${accessToken.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });
    console.log('   Request Data:', JSON.stringify(contactData, null, 2));
    
    const contactResponse = await axios.post(`${process.env.ZOHO_BASE_URL}/crm/v3/Contacts`, contactData, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ Contact creation successful!');
    console.log('   Response:', JSON.stringify(contactResponse.data, null, 2));
    
  } catch (error) {
    console.log('   ❌ Contact creation failed');
    console.log('   Error:', error.response?.data || error.message);
    console.log('   Status:', error.response?.status);
    console.log('   Headers:', error.response?.headers);
    
    // Try to get more details about the error
    if (error.response?.data) {
      console.log('   Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testContactOnly(); 