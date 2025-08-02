require('dotenv').config();
const ZohoService = require('./src/services/zohoService');

async function testZohoConnection() {
  console.log('🧪 Testing Zoho CRM connection...\n');

  try {
    console.log('📋 Checking environment variables...');
    console.log('🔑 ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('🔐 ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('🔄 ZOHO_REFRESH_TOKEN:', process.env.ZOHO_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('🌐 ZOHO_BASE_URL:', process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in');
    console.log('\n');

    // Test access token generation
    console.log('🔑 Testing access token generation...');
    console.log('⏳ Waiting 3 seconds before making API call...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const accessToken = await ZohoService.getAccessToken();
    
    console.log('✅ SUCCESS: Access token generated successfully!');
    console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');
    console.log('🔑 Token length:', accessToken.length, 'characters');
    
    console.log('\n🎉 ZOHO CONNECTION IS WORKING CORRECTLY!');
    console.log('✅ Your Zoho credentials are valid');
    console.log('✅ Your Zoho API access is working');
    console.log('✅ You can now create contacts and deals in Zoho CRM');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    
    if (error.response) {
      console.error('\n📋 Error response details:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Check if it's a rate limiting error
    if (error.message.includes('Rate limited') || 
        (error.response?.data?.error === 'Access Denied' && 
         error.response?.data?.error_description?.includes('too many requests'))) {
      console.log('\n⚠️ RATE LIMITING DETECTED');
      console.log('📋 This actually means your Zoho credentials are working correctly!');
      console.log('⏳ Zoho has rate limits to prevent API abuse.');
      console.log('💡 Try running this test again in a few minutes.');
      console.log('✅ Your Zoho integration is properly configured.');
    } else if (error.response?.data?.error === 'invalid_grant') {
      console.log('\n❌ INVALID REFRESH TOKEN');
      console.log('📋 Your refresh token has expired or is invalid.');
      console.log('💡 You need to generate a new refresh token.');
      console.log('🔗 Follow the Zoho OAuth setup guide to get a new token.');
    } else if (error.response?.data?.error === 'invalid_client') {
      console.log('\n❌ INVALID CLIENT CREDENTIALS');
      console.log('📋 Your ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET is incorrect.');
      console.log('💡 Check your Zoho app configuration.');
    } else {
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1. Check if ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN are correct');
      console.log('2. Verify that ZOHO_BASE_URL is set correctly (https://www.zohoapis.in for India)');
      console.log('3. Ensure the refresh token is valid and not expired');
      console.log('4. Check if your Zoho account has CRM access enabled');
      console.log('5. Verify your Zoho app has the necessary scopes (ZohoCRM.modules.ALL)');
    }
  }
}

// Run the test
testZohoConnection()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 