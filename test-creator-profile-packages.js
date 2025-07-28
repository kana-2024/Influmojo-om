const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

async function testCreatorProfile() {
  try {
    console.log('🔍 Testing Creator Profile Packages...');
    
    // First, let's check if the server is running
    try {
      await axios.get(`${API_BASE_URL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the backend server first.');
      return;
    }

    // Get a list of users to find a creator
    console.log('🔍 Getting users to find a creator...');
    const usersResponse = await axios.get(`${API_BASE_URL}/api/auth/users`);
    
    if (!usersResponse.data.success) {
      console.log('❌ Failed to get users');
      return;
    }

    const users = usersResponse.data.users;
    const creator = users.find(user => user.user_type === 'creator');
    
    if (!creator) {
      console.log('❌ No creator found in database');
      return;
    }

    console.log('✅ Found creator:', creator.name, 'ID:', creator.id);

    // Now let's check the creator's profile
    console.log('🔍 Getting creator profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/creator-profile`, {
      headers: {
        'Authorization': `Bearer ${creator.id}` // Using ID as token for testing
      }
    });

    console.log('📋 Profile Response Status:', profileResponse.status);
    console.log('📋 Profile Response Data:', JSON.stringify(profileResponse.data, null, 2));

    if (profileResponse.data.success) {
      const profile = profileResponse.data.data;
      console.log('✅ Creator profile retrieved successfully');
      console.log('📋 Packages count:', profile.packages?.length || 0);
      console.log('📋 Packages:', profile.packages);
      
      if (profile.packages && profile.packages.length > 0) {
        console.log('✅ Packages are showing up correctly');
      } else {
        console.log('❌ No packages found in creator profile');
        
        // Let's check if there are any packages in the Package table for this creator
        console.log('🔍 Checking Package table directly...');
        const packagesResponse = await axios.get(`${API_BASE_URL}/api/profile/packages/${creator.id}`);
        console.log('📋 Direct packages response:', JSON.stringify(packagesResponse.data, null, 2));
      }
    } else {
      console.log('❌ Failed to get creator profile:', profileResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

testCreatorProfile(); 