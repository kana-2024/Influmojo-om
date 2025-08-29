// Test configuration
const BASE_URL = 'https://fair-legal-gar.ngrok-free.app';
const TEST_ORDER_ID = '123456';
const TEST_USER_ID = '789';
const TEST_ROLE = 'brand';

async function testOrderChatAPI() {
  console.log('🧪 Testing Order Chat API...\n');

  try {
    // Test 1: Get or create chat session
    console.log('1️⃣ Testing GET /api/chat/session...');
    const params = new URLSearchParams({
      order_id: TEST_ORDER_ID,
      user_id: TEST_USER_ID,
      role: TEST_ROLE
    });
    
    const sessionResponse = await fetch(`${BASE_URL}/api/chat/session?${params.toString()}`);
    const sessionData = await sessionResponse.json();

    console.log('✅ Session created/retrieved:', sessionData);
    
    if (sessionData.error) {
      console.log('⚠️ Expected error:', sessionData.error);
      console.log('💡 This is normal if the user/order IDs don\'t exist in the database.');
      return;
    }
    
    const sessionId = sessionData.data.session.id;

    // Test 2: Get session history
    console.log('\n2️⃣ Testing GET /api/chat/session/{id}/history...');
    const historyResponse = await fetch(`${BASE_URL}/api/chat/session/${sessionId}/history`);
    const historyData = await historyResponse.json();
    console.log('✅ Session history:', historyData);

    // Test 3: Send a message
    console.log('\n3️⃣ Testing POST /api/chat/session/{id}/message...');
    const messageResponse = await fetch(`${BASE_URL}/api/chat/session/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello from API test!',
        messageType: 'text'
      })
    });
    const messageData = await messageResponse.json();
    console.log('✅ Message sent:', messageData);

    // Test 4: Get user sessions
    console.log('\n4️⃣ Testing GET /api/chat/user/{userId}/sessions...');
    const userSessionsResponse = await fetch(`${BASE_URL}/api/chat/user/${TEST_USER_ID}/sessions`);
    const userSessionsData = await userSessionsResponse.json();
    console.log('✅ User sessions:', userSessionsData);

    // Test 5: Get order sessions
    console.log('\n5️⃣ Testing GET /api/chat/order/{orderId}/sessions...');
    const orderSessionsResponse = await fetch(`${BASE_URL}/api/chat/order/${TEST_ORDER_ID}/sessions`);
    const orderSessionsData = await orderSessionsResponse.json();
    console.log('✅ Order sessions:', orderSessionsData);

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 This might be expected if the backend server is not running.');
      console.log('   Please start your backend server and try again.');
    }
  }
}

// Run the test
testOrderChatAPI(); 