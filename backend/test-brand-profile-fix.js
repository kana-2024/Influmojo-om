const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBrandProfileUpdate() {
  const userId = 23n; // Use the user ID from the error
  
  console.log('🧪 Testing brand profile update...');
  console.log('👤 User ID:', userId.toString());
  
  try {
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name, 'Type:', user.user_type);
    
    // Test the new approach
    const existingProfile = await prisma.brandProfile.findMany({
      where: { user_id: userId },
      take: 1
    });
    
    console.log('📋 Existing profiles found:', existingProfile.length);
    
    if (existingProfile.length > 0) {
      console.log('✅ Found existing profile, ID:', existingProfile[0].id.toString());
    } else {
      console.log('📝 No existing profile found, will create new one');
    }
    
    // Test data
    const testData = {
      gender: "Male",
      date_of_birth: new Date("1993-07-21T00:00:00.000Z"),
      location_state: "Tamil Nadu",
      location_city: "Coimbatore",
      location_pincode: "500023",
      role_in_organization: "Founder/CEO"
    };
    
    let brandProfile;
    
    if (existingProfile.length > 0) {
      // Update existing
      brandProfile = await prisma.brandProfile.update({
        where: { id: existingProfile[0].id },
        data: testData
      });
      console.log('✅ Updated existing profile');
    } else {
      // Create new
      brandProfile = await prisma.brandProfile.create({
        data: {
          user_id: userId,
          company_name: user.name,
          ...testData
        }
      });
      console.log('✅ Created new profile');
    }
    
    console.log('🎉 Success! Profile ID:', brandProfile.id.toString());
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBrandProfileUpdate(); 