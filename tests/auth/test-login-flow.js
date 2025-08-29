// Test script to verify login flow and token storage
const API_BASE_URL = 'https://modest-properly-orca.ngrok-free.app';

async function testLoginFlow() {
  try {
    console.log('🔍 Testing Login Flow...');
    
    // Step 1: Test if user exists
    console.log('\n🔍 Step 1: Testing if user exists...');
    const checkUserResponse = await fetch(`${API_BASE_URL}/api/auth/check-user-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '+919948425492'
      })
    });
    
    console.log('🔍 Check user response status:', checkUserResponse.status);
    const checkUserData = await checkUserResponse.json();
    console.log('🔍 Check user response:', checkUserData);
    
    if (checkUserData.exists) {
      console.log('✅ User exists, proceeding to send OTP...');
      
      // Step 2: Send OTP
      console.log('\n🔍 Step 2: Sending OTP...');
      const sendOtpResponse = await fetch(`${API_BASE_URL}/api/auth/send-phone-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: '+919948425492'
        })
      });
      
      console.log('🔍 Send OTP response status:', sendOtpResponse.status);
      const sendOtpData = await sendOtpResponse.json();
      console.log('🔍 Send OTP response:', sendOtpData);
      
      if (sendOtpData.success) {
        console.log('✅ OTP sent successfully');
        console.log('🔑 OTP for testing:', sendOtpData.otp);
        
        // Step 3: Verify OTP (this would normally be done by the user)
        console.log('\n🔍 Step 3: Verifying OTP...');
        console.log('⚠️ Note: This step requires the actual OTP from the user');
        console.log('🔍 To test this manually:');
        console.log('1. Check your phone for the OTP');
        console.log('2. Use the OTP in the webapp login');
        console.log('3. Check if the token is stored in localStorage');
        
      } else {
        console.log('❌ Failed to send OTP:', sendOtpData.error);
      }
    } else {
      console.log('❌ User does not exist');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLoginFlow();

