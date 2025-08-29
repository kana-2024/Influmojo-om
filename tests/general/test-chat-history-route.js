const axios = require('axios');
require('dotenv').config();

/**
 * Test chat history route specifically
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fair-legal-gar.ngrok-free.app';

async function testChatHistoryRoute() {
  console.log('🧪 Testing chat history route...\n');

  try {
    // Test the chat history route directly
    const visitorId = 'test_visitor_123';
    const url = `${API_BASE_URL}/api/zoho/chat/history?visitorId=${visitorId}&limit=10`;
    
    console.log('📡 Testing URL:', url);
    
    const response = await axios.get(url);
    
    console.log('✅ Chat history route working!');
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Chat history route failed:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 Route not found - server may need restart');
    }
  }
}

// Run the test
testChatHistoryRoute(); 