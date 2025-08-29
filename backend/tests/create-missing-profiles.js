const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Helper function to create initial profiles for existing users
const createInitialProfile = async (userId, userType) => {
  try {
    if (userType === 'brand') {
      // Create initial BrandProfile
      const brandProfile = await prisma.brandProfile.create({
        data: {
          user_id: userId,
          company_name: 'Company Name', // Will be updated during onboarding
          industry: 'General', // Will be updated during onboarding
          industries: ['General'], // Will be updated during onboarding
          description: '', // Will be updated during onboarding
          languages: [], // Will be updated during onboarding
          verified: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log(`✅ Created initial BrandProfile for user ${userId}:`, brandProfile.id.toString());
      return brandProfile;
    } else if (userType === 'creator') {
      // Create initial CreatorProfile
      const creatorProfile = await prisma.creatorProfile.create({
        data: {
          user_id: userId,
          bio: '', // Will be updated during onboarding
          content_categories: [], // Will be updated during onboarding
          languages: [], // Will be updated during onboarding
          availability_status: 'available',
          verified: false,
          featured: false,
          rating: 0.00,
          total_collaborations: 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log(`✅ Created initial CreatorProfile for user ${userId}:`, creatorProfile.id.toString());
      return creatorProfile;
    }
  } catch (error) {
    console.error(`❌ Failed to create initial profile for user ${userId}:`, error);
    return null;
  }
};

async function createMissingProfiles() {
  try {
    console.log('🔍 Starting to create missing profiles for existing users...');
    
    // Get all users
    const users = await prisma.user.findMany({
      where: {
        user_type: {
          in: ['brand', 'creator']
        }
      },
      select: {
        id: true,
        user_type: true,
        name: true,
        email: true,
        phone: true
      }
    });
    
    console.log(`📊 Found ${users.length} users to check for missing profiles`);
    
    let createdProfiles = 0;
    let skippedProfiles = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        if (user.user_type === 'brand') {
          // Check if BrandProfile exists
          const existingBrandProfile = await prisma.brandProfile.findFirst({
            where: { user_id: user.id }
          });
          
          if (!existingBrandProfile) {
            console.log(`🔄 Creating missing BrandProfile for user ${user.id} (${user.name || user.email || user.phone})`);
            const result = await createInitialProfile(user.id, user.user_type);
            if (result) {
              createdProfiles++;
            } else {
              errors++;
            }
          } else {
            console.log(`⏭️  BrandProfile already exists for user ${user.id}`);
            skippedProfiles++;
          }
        } else if (user.user_type === 'creator') {
          // Check if CreatorProfile exists
          const existingCreatorProfile = await prisma.creatorProfile.findFirst({
            where: { user_id: user.id }
          });
          
          if (!existingCreatorProfile) {
            console.log(`🔄 Creating missing CreatorProfile for user ${user.id} (${user.name || user.email || user.phone})`);
            const result = await createInitialProfile(user.id, user.user_type);
            if (result) {
              createdProfiles++;
            } else {
              errors++;
            }
          } else {
            console.log(`⏭️  CreatorProfile already exists for user ${user.id}`);
            skippedProfiles++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error);
        errors++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`✅ Created profiles: ${createdProfiles}`);
    console.log(`⏭️  Skipped (already exist): ${skippedProfiles}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${users.length}`);
    
    if (createdProfiles > 0) {
      console.log('\n🎉 Successfully created missing profiles!');
    } else {
      console.log('\nℹ️  No missing profiles found - all users already have their profiles.');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createMissingProfiles();
