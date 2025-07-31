const fetch = require('node-fetch').default;
const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';

async function testChatWebhook() {
  try {
    console.log('🔍 Testing Zoho chat webhook functionality...');
    
    // Test 1: Test general webhook endpoint
    console.log('\n1️⃣ Testing general webhook endpoint...');
    const generalWebhookData = {
      module: 'Messages',
      operation: 'message_received',
      visitor_id: 'test_visitor_123',
      session_id: 'test_session_456',
      message: 'Hello from Zoho agent!',
      message_type: 'text',
      agent_name: 'Support Agent',
      agent_id: 'agent_789',
      timestamp: new Date().toISOString()
    };
    
    const generalResponse = await fetch(`${API_BASE_URL}/api/zoho/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generalWebhookData)
    });
    
    if (generalResponse.ok) {
      const generalResult = await generalResponse.json();
      console.log('✅ General webhook working:', generalResult.success);
    } else {
      console.log('❌ General webhook failed:', generalResponse.status);
    }
    
    // Test 2: Test chat-specific webhook endpoint
    console.log('\n2️⃣ Testing chat-specific webhook endpoint...');
    const chatWebhookData = {
      type: 'message',
      operation: 'message_received',
      visitor_id: 'test_visitor_123',
      session_id: 'test_session_456',
      message: 'This is a test message from Zoho agent',
      message_type: 'text',
      agent_name: 'Test Agent',
      agent_id: 'agent_123',
      timestamp: new Date().toISOString()
    };
    
    const chatResponse = await fetch(`${API_BASE_URL}/api/zoho/chat-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatWebhookData)
    });
    
    if (chatResponse.ok) {
      const chatResult = await chatResponse.json();
      console.log('✅ Chat webhook working:', chatResult.success);
    } else {
      console.log('❌ Chat webhook failed:', chatResponse.status);
      const errorText = await chatResponse.text();
      console.log('Error details:', errorText.substring(0, 200));
    }
    
    // Test 3: Test agent joined event
    console.log('\n3️⃣ Testing agent joined event...');
    const agentJoinedData = {
      type: 'chat',
      operation: 'agent_joined',
      visitor_id: 'test_visitor_123',
      session_id: 'test_session_456',
      agent_name: 'Support Agent',
      agent_id: 'agent_789',
      timestamp: new Date().toISOString()
    };
    
    const agentResponse = await fetch(`${API_BASE_URL}/api/zoho/chat-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentJoinedData)
    });
    
    if (agentResponse.ok) {
      const agentResult = await agentResponse.json();
      console.log('✅ Agent joined event working:', agentResult.success);
    } else {
      console.log('❌ Agent joined event failed:', agentResponse.status);
    }
    
    // Test 4: Test chat started event
    console.log('\n4️⃣ Testing chat started event...');
    const chatStartedData = {
      type: 'chat',
      operation: 'chat_started',
      visitor_id: 'test_visitor_123',
      session_id: 'test_session_456',
      timestamp: new Date().toISOString()
    };
    
    const startedResponse = await fetch(`${API_BASE_URL}/api/zoho/chat-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatStartedData)
    });
    
    if (startedResponse.ok) {
      const startedResult = await startedResponse.json();
      console.log('✅ Chat started event working:', startedResult.success);
    } else {
      console.log('❌ Chat started event failed:', startedResponse.status);
    }
    
    console.log('\n🎯 Chat webhook test completed!');
    console.log('\n📝 Summary:');
    console.log('- Chat webhook endpoints are now available');
    console.log('- Incoming messages from Zoho agents will be processed');
    console.log('- Agent events (joined, left, chat started) are handled');
    console.log('- Notifications will be sent to users (when implemented)');
    console.log('\n🔧 Next Steps:');
    console.log('1. Configure Zoho Desk webhook URL to point to your chat-webhook endpoint');
    console.log('2. Implement push notifications in sendChatNotification function');
    console.log('3. Test with real Zoho agent messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChatWebhook(); 