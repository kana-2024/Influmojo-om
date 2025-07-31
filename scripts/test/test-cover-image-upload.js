const http = require('http');

const API_BASE_URL = 'http://localhost:3001';

// Test token - you'll need to replace this with a valid token
const TEST_TOKEN = 'your-test-token-here';

function makeRequest(path, method = 'POST', headers = {}, body = null) {
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

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testCoverImageUpload() {
  console.log('🧪 Testing Cover Image Upload API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check');
    const healthResponse = await makeRequest('/api/health', 'GET');
    console.log('Status:', healthResponse.status);
    if (healthResponse.status === 200) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed:', healthResponse.data);
      return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Update cover image without authentication
    console.log('2. Testing POST /api/profile/update-cover-image without authentication');
    const noAuthResponse = await makeRequest('/api/profile/update-cover-image', 'POST', {}, {
      cover_image_url: 'https://example.com/test-cover.jpg'
    });
    console.log('Status:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response for unauthenticated request:', noAuthResponse.data);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Update cover image with authentication
    console.log('3. Testing POST /api/profile/update-cover-image with authentication');
    const authResponse = await makeRequest('/api/profile/update-cover-image', 'POST', {
      'Authorization': `Bearer ${TEST_TOKEN}`
    }, {
      cover_image_url: 'https://res.cloudinary.com/dbfwrgwke/image/upload/v1234567890/test-cover-image.jpg'
    });
    console.log('Status:', authResponse.status);
    if (authResponse.status === 200) {
      console.log('✅ Cover image updated successfully');
      console.log('Response:', authResponse.data);
    } else {
      console.log('❌ Failed to update cover image:', authResponse.data);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Update cover image with invalid URL
    console.log('4. Testing POST /api/profile/update-cover-image with invalid URL');
    const invalidUrlResponse = await makeRequest('/api/profile/update-cover-image', 'POST', {
      'Authorization': `Bearer ${TEST_TOKEN}`
    }, {
      cover_image_url: 'not-a-valid-url'
    });
    console.log('Status:', invalidUrlResponse.status);
    if (invalidUrlResponse.status === 400) {
      console.log('✅ Invalid URL validation working (expected)');
      console.log('Error:', invalidUrlResponse.data);
    } else {
      console.log('❌ Unexpected response for invalid URL:', invalidUrlResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testCoverImageUpload(); 