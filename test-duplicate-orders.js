const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test token - replace with a valid brand user token
const TEST_TOKEN = 'your-test-token-here';

async function testDuplicateOrderPrevention() {
  try {
    console.log('🧪 Testing duplicate order prevention...\n');
    
    // Test data
    const testCartItems = [
      {
        packageId: "1",
        creatorId: "1", 
        quantity: 1
      }
    ];

    console.log('1. Testing first checkout attempt...');
    const firstCheckout = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({ cartItems: testCartItems })
    });

    const firstResult = await firstCheckout.json();
    console.log('First checkout status:', firstCheckout.status);
    console.log('First checkout result:', firstResult);

    if (firstCheckout.ok) {
      console.log('✅ First order created successfully');
    } else {
      console.log('❌ First checkout failed:', firstResult.message);
      return;
    }

    console.log('\n2. Testing duplicate checkout attempt...');
    const secondCheckout = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({ cartItems: testCartItems })
    });

    const secondResult = await secondCheckout.json();
    console.log('Second checkout status:', secondCheckout.status);
    console.log('Second checkout result:', secondResult);

    if (secondCheckout.status === 409) {
      console.log('✅ Duplicate order prevention working correctly!');
      console.log('Expected error message:', secondResult.message);
    } else if (secondCheckout.ok) {
      console.log('❌ Duplicate order prevention failed - second order was created');
    } else {
      console.log('❌ Unexpected error:', secondResult.message);
    }

    console.log('\n3. Testing orders list...');
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ Orders fetched successfully');
      console.log('Total orders:', ordersData.orders?.length || 0);
      
      // Count orders for the test package
      const testOrders = ordersData.orders?.filter(order => 
        order.package?.id === "1" && 
        order.status === "pending"
      ) || [];
      
      console.log('Pending orders for test package:', testOrders.length);
      
      if (testOrders.length === 1) {
        console.log('✅ Only one order exists - duplicate prevention working!');
      } else {
        console.log('❌ Multiple orders found - duplicate prevention may not be working');
      }
    } else {
      console.log('❌ Failed to fetch orders:', ordersResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDuplicateOrderPrevention(); 