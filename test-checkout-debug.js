const fetch = require('node-fetch').default;

const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';

async function testCheckoutDebug() {
  try {
    console.log('🔍 Testing checkout functionality...');
    
    // Test 1: Health check
    console.log('\n1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData.message);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
    
    // Test 2: Test orders endpoint without auth
    console.log('\n2️⃣ Testing orders endpoint without auth...');
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`);
    if (ordersResponse.status === 401) {
      console.log('✅ Orders endpoint properly requires authentication');
    } else {
      console.log('⚠️ Orders endpoint response:', ordersResponse.status);
    }
    
    // Test 3: Test checkout endpoint without auth
    console.log('\n3️⃣ Testing checkout endpoint without auth...');
    const checkoutData = {
      cartItems: [
        {
          packageId: "1",
          creatorId: "1",
          quantity: 1
        }
      ]
    };
    
    const checkoutResponse = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });
    
    if (checkoutResponse.status === 401) {
      console.log('✅ Checkout endpoint properly requires authentication');
    } else {
      console.log('⚠️ Checkout endpoint response:', checkoutResponse.status);
      const errorText = await checkoutResponse.text();
      console.log('Error details:', errorText.substring(0, 200));
    }
    
    // Test 4: Test with invalid token
    console.log('\n4️⃣ Testing checkout with invalid token...');
    const invalidTokenResponse = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_here'
      },
      body: JSON.stringify(checkoutData)
    });
    
    if (invalidTokenResponse.status === 401) {
      console.log('✅ Checkout endpoint properly rejects invalid tokens');
    } else {
      console.log('⚠️ Invalid token response:', invalidTokenResponse.status);
    }
    
    // Test 5: Test with development bypass
    console.log('\n5️⃣ Testing checkout with development bypass...');
    const bypassResponse = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bypass-auth': 'true'
      },
      body: JSON.stringify(checkoutData)
    });
    
    if (bypassResponse.ok) {
      const bypassData = await bypassResponse.json();
      console.log('✅ Development bypass working:', bypassData.success);
      if (!bypassData.success) {
        console.log('❌ Checkout failed with bypass:', bypassData.message);
      }
    } else {
      const bypassError = await bypassResponse.text();
      console.log('❌ Development bypass failed:', bypassResponse.status, bypassError.substring(0, 200));
    }
    
    console.log('\n🎯 Checkout debug test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCheckoutDebug(); 