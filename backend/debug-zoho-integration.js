const axios = require('axios');

// Debug Zoho SalesIQ integration issues
async function debugZohoIntegration() {
  console.log('🔍 Debugging Zoho SalesIQ Integration Issues...');
  
  const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';
  
  try {
    // Test 1: Check backend API
    console.log('\n📤 Test 1: Backend API Status...');
    
    const messageData = {
      visitorId: 'visitor_debug_123',
      message: 'Debug test message - ' + new Date().toISOString(),
      messageType: 'text',
      orderContext: {
        orderId: '29',
        orderNumber: 'ORD-001'
      }
    };

    const response = await axios.post(`${API_BASE_URL}/api/zoho/chat/send-message`, messageData, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('✅ Backend API Response Status:', response.data.data?.status);
    console.log('✅ Backend API Message:', response.data.data?.message);

    // Test 2: Check chat configuration
    console.log('\n🔧 Test 2: Chat Configuration...');
    
    const configResponse = await axios.get(`${API_BASE_URL}/api/zoho/chat/config`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (configResponse.data.success) {
      console.log('✅ Chat configuration retrieved');
      const config = configResponse.data.data;
      
      console.log('📋 Android App Key Length:', config.android?.appKey?.length || 0);
      console.log('📋 Android Access Key Length:', config.android?.accessKey?.length || 0);
      console.log('📋 Department ID:', config.department);
      console.log('📋 Base URL:', config.baseUrl);
      console.log('📋 Enabled:', config.enabled);
      
      // Check if keys look valid
      if (config.android?.appKey && config.android?.appKey.length > 10) {
        console.log('✅ Android App Key looks valid');
      } else {
        console.log('❌ Android App Key may be invalid or too short');
      }
      
      if (config.android?.accessKey && config.android?.accessKey.length > 10) {
        console.log('✅ Android Access Key looks valid');
      } else {
        console.log('❌ Android Access Key may be invalid or too short');
      }
    } else {
      console.log('❌ Failed to get chat configuration');
    }

    // Test 3: Check Zoho connection
    console.log('\n🔗 Test 3: Zoho Connection...');
    
    const connectionResponse = await axios.post(`${API_BASE_URL}/api/zoho/test-connection`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (connectionResponse.data.success) {
      console.log('✅ Zoho connection is working');
    } else {
      console.log('❌ Zoho connection failed');
      console.log('📋 Error:', connectionResponse.data.message);
    }

    console.log('\n🔍 Potential Issues and Solutions:');
    console.log('\n1. Zoho SalesIQ SDK Initialization:');
    console.log('   - Check if Zoho SalesIQ SDK is properly imported');
    console.log('   - Verify app keys are correctly configured');
    console.log('   - Check mobile app logs for SDK initialization errors');
    
    console.log('\n2. Zoho SalesIQ Configuration:');
    console.log('   - Verify Zoho SalesIQ is enabled in your Zoho account');
    console.log('   - Check that the department ID is correct');
    console.log('   - Ensure app keys match your Zoho SalesIQ setup');
    
    console.log('\n3. Mobile App Issues:');
    console.log('   - Test on a real device (not simulator)');
    console.log('   - Check if Zoho chat bubble appears');
    console.log('   - Verify internet connection');
    console.log('   - Check mobile app logs for errors');
    
    console.log('\n4. Zoho Account Issues:');
    console.log('   - Verify Zoho SalesIQ is active in your account');
    console.log('   - Check if there are any agents available');
    console.log('   - Ensure the department is properly configured');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Check mobile app console logs for SDK initialization');
    console.log('2. Verify Zoho SalesIQ is enabled in your Zoho account');
    console.log('3. Test on a real device with internet connection');
    console.log('4. Check if Zoho chat bubble appears when sending messages');
    console.log('5. Verify app keys in Zoho SalesIQ console match your config');

  } catch (error) {
    console.error('❌ Debug failed with error:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run the debug
debugZohoIntegration(); 