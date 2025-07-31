const https = require('https');

// Test appealing rejection message functionality
function testAppealingRejection() {
  console.log('🧪 Testing Appealing Rejection Message Functionality...');
  console.log('');
  
  const baseUrl = 'fair-legal-gar.ngrok-free.app';
  
  // Test data
  const testData = {
    // You'll need to replace these with actual IDs from your database
    orderId: '1', // Replace with actual order ID
    creatorToken: 'your-creator-jwt-token', // Replace with actual creator token
    brandToken: 'your-brand-jwt-token' // Replace with actual brand token
  };

  // Test 1: Health check
  console.log('1️⃣ Testing backend health...');
  makeRequest(baseUrl, '/api/health', 'GET')
    .then(response => {
      console.log('✅ Backend is healthy:', response.status);
      
      // Test 2: Reject order with appealing message
      console.log('');
      console.log('2️⃣ Testing order rejection with appealing message...');
      return makeRequest(baseUrl, `/api/orders/${testData.orderId}/reject`, 'PUT', {
        rejectionMessage: "Thank you for considering my services! Unfortunately, I'm currently unable to take on this project due to my current workload. I'd love to collaborate in the future when my schedule opens up. In the meantime, I'd recommend checking out some other talented creators who might be a perfect fit for your project!"
      }, testData.creatorToken);
    })
    .then(response => {
      console.log('✅ Order rejection response:', response);
      
      // Test 3: Get orders to see the appealing message
      console.log('');
      console.log('3️⃣ Testing get orders to see appealing message...');
      return makeRequest(baseUrl, '/api/orders', 'GET', null, testData.brandToken);
    })
    .then(response => {
      console.log('✅ Orders response:', response);
      
      // Find the rejected order
      const rejectedOrder = response.orders?.find(order => 
        order.id === testData.orderId && order.status === 'cancelled'
      );
      
      if (rejectedOrder && rejectedOrder.rejection_message) {
        console.log('🎉 SUCCESS: Appealing rejection message found!');
        console.log('📝 Message:', rejectedOrder.rejection_message);
      } else {
        console.log('❌ No appealing rejection message found');
      }
    })
    .catch(error => {
      console.error('❌ Test failed:', error.message);
    });
}

function makeRequest(hostname, path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the test
testAppealingRejection(); 