const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/auth';

async function testOTP() {
  const phone = '+917702428882';
  
  console.log('🧪 Testing OTP functionality...');
  
  try {
    // Test 1: Send OTP
    console.log('\n1️⃣ Sending OTP...');
    const response1 = await fetch(`${API_BASE}/send-phone-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });
    
    const result1 = await response1.json();
    console.log('Response:', result1);
    
    if (response1.status === 429) {
      console.log('⏰ Rate limited! Clearing records and trying again...');
      
      // Clear rate limit
      const clearResponse = await fetch(`${API_BASE}/disable-rate-limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });
      
      const clearResult = await clearResponse.json();
      console.log('Clear result:', clearResult);
      
      // Try again
      console.log('\n🔄 Trying again after clearing...');
      const response2 = await fetch(`${API_BASE}/send-phone-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });
      
      const result2 = await response2.json();
      console.log('Second attempt:', result2);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOTP(); 