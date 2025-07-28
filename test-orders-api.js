const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test token - you'll need to replace this with a valid token
const TEST_TOKEN = 'your-test-token-here';

async function testOrdersAPI() {
  console.log('🧪 Testing Orders API...\n');

  try {
    // Test 1: Get all orders
    console.log('1. Testing GET /api/orders');
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', ordersResponse.status);
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ Orders fetched successfully');
      console.log('Orders count:', ordersData.orders?.length || 0);
      console.log('Sample order:', ordersData.orders?.[0] || 'No orders found');
    } else {
      const errorData = await ordersResponse.text();
      console.log('❌ Failed to fetch orders:', errorData);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get specific order details (if we have an order ID)
    console.log('2. Testing GET /api/orders/:orderId');
    const testOrderId = '1'; // Replace with actual order ID if available
    
    const orderDetailsResponse = await fetch(`${API_BASE_URL}/api/orders/${testOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', orderDetailsResponse.status);
    if (orderDetailsResponse.ok) {
      const orderDetailsData = await orderDetailsResponse.json();
      console.log('✅ Order details fetched successfully');
      console.log('Order ID:', orderDetailsData.order?.id);
      console.log('Package title:', orderDetailsData.order?.package?.title);
    } else {
      const errorData = await orderDetailsResponse.text();
      console.log('❌ Failed to fetch order details:', errorData);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test without authentication
    console.log('3. Testing GET /api/orders without authentication');
    const noAuthResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response for unauthenticated request');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOrdersAPI(); 