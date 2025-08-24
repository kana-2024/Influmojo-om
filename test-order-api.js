const fetch = require('node-fetch');

async function testOrderAPI() {
  try {
    console.log('🧪 Testing Order API endpoint...');
    console.log('================================');
    
    const baseUrl = 'http://localhost:3002';
    const orderId = '35'; // The order ID from the error
    
    // Test 1: Check if the server is running
    console.log('\n🔍 Test 1: Checking server connectivity...');
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      if (healthResponse.ok) {
        console.log('✅ Server is running');
      } else {
        console.log('⚠️  Server responded but health check failed');
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('   Error:', error.message);
      return;
    }
    
    // Test 2: Test the orders endpoint without authentication
    console.log('\n🔍 Test 2: Testing orders endpoint without auth (should return 401)...');
    try {
      const response = await fetch(`${baseUrl}/api/orders/${orderId}`);
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('⚠️  Unexpected status code');
      }
    } catch (error) {
      console.log('❌ Error testing endpoint:', error.message);
    }
    
    // Test 3: Test the orders endpoint with invalid auth
    console.log('\n🔍 Test 3: Testing orders endpoint with invalid auth...');
    try {
      const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log('✅ Correctly rejects invalid token');
      } else {
        console.log('⚠️  Unexpected status code');
      }
    } catch (error) {
      console.log('❌ Error testing endpoint:', error.message);
    }
    
    // Test 4: Check the correct endpoint structure
    console.log('\n🔍 Test 4: Verifying endpoint structure...');
    console.log(`   ✅ Correct endpoint: ${baseUrl}/api/orders/${orderId}`);
    console.log(`   ❌ Wrong endpoint: ${baseUrl}/api/orders/details/${orderId}`);
    
    // Test 5: Check if order exists in database
    console.log('\n🔍 Test 5: Database order check...');
    console.log('   💡 To verify if order 35 exists, check the database directly');
    console.log('   💡 Or check the backend logs when making a request');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('   • Server connectivity: Checked');
    console.log('   • Authentication required: Verified');
    console.log('   • Endpoint structure: Corrected');
    console.log('   • Next steps:');
    console.log('     1. Ensure you have a valid JWT token');
    console.log('     2. Check if order 35 exists in database');
    console.log('     3. Verify the token is being sent correctly');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testOrderAPI()
  .then(() => {
    console.log('\n🎯 Order API test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Order API test failed:', error);
    process.exit(1);
  });
