const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testOTP() {
  const phone = '+917702428882';
  
  console.log('🧪 Testing OTP functionality...');
  console.log('📱 Phone:', phone);
  console.log('🌐 API Base URL:', API_BASE_URL);
  
  try {
    // First, clear any existing OTP records
    console.log('\n🧹 Clearing existing OTP records...');
    const clearResponse = await fetch(`${API_BASE_URL}/api/auth/clear-otp/${phone}`, {
      method: 'DELETE'
    });
    
    if (clearResponse.ok) {
      const clearResult = await clearResponse.json();
      console.log('✅ Cleared OTP records:', clearResult);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send OTP with bypass header
    console.log('\n📤 Sending OTP with bypass header...');
    const otpResponse = await fetch(`${API_BASE_URL}/api/auth/send-phone-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bypass-rate-limit': 'true' // Bypass rate limiting
      },
      body: JSON.stringify({ phone })
    });
    
    const otpResult = await otpResponse.json();
    console.log('📱 OTP Response:', otpResult);
    
    if (otpResult.success) {
      console.log('✅ OTP sent successfully!');
      console.log('🔢 OTP Code:', otpResult.otp);
    } else {
      console.log('❌ OTP failed:', otpResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOTP(); 