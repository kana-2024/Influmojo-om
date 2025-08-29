// Simple test script to check the API endpoint
const API_BASE_URL = 'https://modest-properly-orca.ngrok-free.app';

async function testCreatorProfileAPI() {
  try {
    console.log('🔍 Testing Creator Profile API...');
    
    // Test without token first
    console.log('🔍 Testing without token...');
    const response = await fetch(`${API_BASE_URL}/api/profile/creator-profile`);
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('🔍 Response text (first 200 chars):', responseText.substring(0, 200));
    
    if (response.status === 401) {
      console.log('✅ Endpoint requires authentication (expected)');
      
      // Now test with a sample token to see if the endpoint exists
      console.log('\n🔍 Testing with sample token...');
      const responseWithToken = await fetch(`${API_BASE_URL}/api/profile/creator-profile`, {
        headers: {
          'Authorization': 'Bearer sample_token_for_testing',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response with token status:', responseWithToken.status);
      const responseTextWithToken = await responseWithToken.text();
      console.log('🔍 Response with token (first 200 chars):', responseTextWithToken.substring(0, 200));
      
    } else if (response.status === 404) {
      console.log('❌ Endpoint not found (404)');
    } else {
      console.log('⚠️ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCreatorProfileAPI();
