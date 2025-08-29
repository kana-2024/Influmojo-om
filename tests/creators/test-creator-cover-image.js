const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

async function testCreatorCoverImage() {
  try {
    console.log('🔍 Testing Creator API endpoints for cover_image_url...');
    
    // Test the main creators endpoint
    console.log('🔍 Testing /api/profile/creators endpoint...');
    const creatorsResponse = await axios.get(`${API_BASE_URL}/api/profile/creators`);
    
    console.log('📋 Creators Response Status:', creatorsResponse.status);
    
    if (creatorsResponse.data.success) {
      const creators = creatorsResponse.data.data;
      console.log('✅ Creators API response successful');
      
      // Check if cover_image_url is present in the response
      let hasCoverImage = false;
      Object.keys(creators).forEach(platform => {
        const platformCreators = creators[platform];
        platformCreators.forEach(creator => {
          if (creator.cover_image_url) {
            hasCoverImage = true;
            console.log(`✅ Found creator with cover image: ${creator.name} - ${creator.cover_image_url}`);
          }
        });
      });
      
      if (hasCoverImage) {
        console.log('✅ Cover image URLs are being returned by the API!');
      } else {
        console.log('⚠️ No creators with cover images found in the response');
      }
    } else {
      console.log('❌ Failed to get creators:', creatorsResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCreatorCoverImage(); 