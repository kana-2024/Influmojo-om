const http = require('http');

const API_BASE_URL = 'http://localhost:3001';

// Test token - you'll need to replace this with a valid token
const TEST_TOKEN = 'your-test-token-here';

function makeRequest(path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testOrdersAPI() {
  console.log('🧪 Testing Orders API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check');
    const healthResponse = await makeRequest('/api/health');
    console.log('Status:', healthResponse.status);
    if (healthResponse.status === 200) {
      console.log('✅ Health check passed');
      console.log('Response:', healthResponse.data);
    } else {
      console.log('❌ Health check failed:', healthResponse.data);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get orders without authentication
    console.log('2. Testing GET /api/orders without authentication');
    const ordersResponse = await makeRequest('/api/orders');
    console.log('Status:', ordersResponse.status);
    if (ordersResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response for unauthenticated request:', ordersResponse.data);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Get orders with authentication
    console.log('3. Testing GET /api/orders with authentication');
    const authOrdersResponse = await makeRequest('/api/orders', 'GET', {
      'Authorization': `Bearer ${TEST_TOKEN}`
    });
    console.log('Status:', authOrdersResponse.status);
    if (authOrdersResponse.status === 200) {
      console.log('✅ Orders fetched successfully');
      console.log('Orders count:', authOrdersResponse.data.orders?.length || 0);
      console.log('Sample order:', authOrdersResponse.data.orders?.[0] || 'No orders found');
    } else {
      console.log('❌ Failed to fetch orders:', authOrdersResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOrdersAPI(); 