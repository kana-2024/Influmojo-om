const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

async function testCreatorsAPI() {
  try {
    console.log('🔍 Testing Creators API for Packages...');
    
    // First, let's check if the server is running
    try {
      await axios.get(`${API_BASE_URL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the backend server first.');
      return;
    }

    // Test the creators endpoint that brands use
    console.log('🔍 Testing /api/profile/creators endpoint...');
    const creatorsResponse = await axios.get(`${API_BASE_URL}/api/profile/creators`, {
      headers: {
        'Authorization': 'Bearer test-token' // Using a dummy token for testing
      }
    });

    console.log('📋 Creators Response Status:', creatorsResponse.status);
    console.log('📋 Creators Response Data:', JSON.stringify(creatorsResponse.data, null, 2));

    if (creatorsResponse.data.success) {
      const creators = creatorsResponse.data.data;
      console.log('✅ Creators API response successful');
      
      // Check each platform for creators with packages
      Object.keys(creators).forEach(platform => {
        const platformCreators = creators[platform];
        console.log(`📋 ${platform.toUpperCase()} creators: ${platformCreators.length}`);
        
        platformCreators.forEach((creator, index) => {
          console.log(`  Creator ${index + 1}: ${creator.name}`);
          console.log(`    Packages count: ${creator.packages?.length || 0}`);
          if (creator.packages && creator.packages.length > 0) {
            console.log(`    Packages:`, creator.packages.map(pkg => ({
              id: pkg.id,
              title: pkg.title,
              price: pkg.price,
              type: pkg.type
            })));
          }
        });
      });
      
      // Check if any creator has packages
      const creatorsWithPackages = Object.values(creators).flat().filter(creator => 
        creator.packages && creator.packages.length > 0
      );
      
      if (creatorsWithPackages.length > 0) {
        console.log('✅ Found creators with packages!');
        console.log(`📋 Total creators with packages: ${creatorsWithPackages.length}`);
      } else {
        console.log('❌ No creators with packages found');
      }
    } else {
      console.log('❌ Failed to get creators:', creatorsResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

testCreatorsAPI(); 