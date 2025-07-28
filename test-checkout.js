const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testCheckout() {
  try {
    console.log('Testing checkout functionality...');
    
    // First, let's test the orders endpoint
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ Orders endpoint working:', ordersData.success);
    } else {
      console.log('❌ Orders endpoint failed:', ordersResponse.status);
    }
    
    // Test checkout endpoint
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
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(checkoutData)
    });
    
    if (checkoutResponse.ok) {
      const checkoutResult = await checkoutResponse.json();
      console.log('✅ Checkout endpoint working:', checkoutResult.success);
      console.log('Created orders:', checkoutResult.orders?.length || 0);
    } else {
      const errorText = await checkoutResponse.text();
      console.log('❌ Checkout endpoint failed:', checkoutResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCheckout(); 