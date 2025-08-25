const { PrismaClient } = require('./backend/src/generated/client');

const prisma = new PrismaClient();

/**
 * Finds a user by email and shows their information
 * @param {string} email - The email address to search for
 */
async function findUserByEmail(email) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        creator_profiles: {
          include: {
            portfolio_items: true,
            social_media_accounts: true,
            packages_created: true,
            kyc: true
          }
        },
        brand_profiles: {
          include: {
            campaigns: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('\n✅ User found:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 ID: ${user.id.toString()}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📱 Phone: ${user.phone || 'Not provided'}`);
    console.log(`🔐 User Type: ${user.user_type}`);
    console.log(`🔑 Auth Provider: ${user.auth_provider || 'email'}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`📅 Created: ${user.created_at}`);
    console.log(`📅 Last Login: ${user.last_login_at || 'Never'}`);
    console.log(`✅ Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
    console.log(`✅ Phone Verified: ${user.phone_verified ? 'Yes' : 'No'}`);
    console.log(`🎯 Onboarding Completed: ${user.onboarding_completed ? 'Yes' : 'No'}`);
    console.log(`📝 Onboarding Step: ${user.onboarding_step || 'Not started'}`);

    // Show creator profile details
    if (user.creator_profiles && user.creator_profiles.length > 0) {
      console.log('\n📸 Creator Profile Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      for (const profile of user.creator_profiles) {
        console.log(`   🆔 Profile ID: ${profile.id.toString()}`);
        console.log(`   📝 Bio: ${profile.bio || 'Not provided'}`);
        console.log(`   📍 Location: ${profile.location_city || 'Not specified'}, ${profile.location_state || 'Not specified'}`);
        console.log(`   💰 Rate Range: ${profile.min_rate || 'Not set'} - ${profile.max_rate || 'Not set'} ${profile.rate_currency || 'USD'}`);
        console.log(`   ⭐ Rating: ${profile.rating || 'No rating'}`);
        console.log(`   🤝 Total Collaborations: ${profile.total_collaborations}`);
        console.log(`   📊 Portfolio Items: ${profile.portfolio_items?.length || 0}`);
        console.log(`   📱 Social Media Accounts: ${profile.social_media_accounts?.length || 0}`);
        console.log(`   📦 Packages Created: ${profile.packages_created?.length || 0}`);
        console.log(`   🔐 KYC Status: ${profile.kyc ? 'Submitted' : 'Not submitted'}`);
      }
    }

    // Show brand profile details
    if (user.brand_profiles && user.brand_profiles.length > 0) {
      console.log('\n🏢 Brand Profile Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      for (const profile of user.brand_profiles) {
        console.log(`   🆔 Profile ID: ${profile.id.toString()}`);
        console.log(`   🏢 Company Name: ${profile.company_name || 'Not provided'}`);
        console.log(`   🏭 Business Type: ${profile.business_type || 'Not specified'}`);
        console.log(`   🌐 Website: ${profile.website || 'Not provided'}`);
        console.log(`   📊 Campaigns: ${profile.campaigns?.length || 0}`);
      }
    }

    console.log('\n📋 Summary of Dependencies:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalDependencies = 0;
    
    if (user.creator_profiles && user.creator_profiles.length > 0) {
      for (const profile of user.creator_profiles) {
        totalDependencies += profile.portfolio_items?.length || 0;
        totalDependencies += profile.social_media_accounts?.length || 0;
        totalDependencies += profile.packages_created?.length || 0;
        if (profile.kyc) totalDependencies += 1;
      }
    }
    
    if (user.brand_profiles && user.brand_profiles.length > 0) {
      for (const profile of user.brand_profiles) {
        totalDependencies += profile.campaigns?.length || 0;
      }
    }
    
    console.log(`   📊 Total Related Records: ${totalDependencies}`);
    console.log(`   ⚠️  This user has ${totalDependencies} dependent records that would be deleted`);
    
    if (totalDependencies > 0) {
      console.log('\n💡 To delete this user, you can:');
      console.log('   1. Use the web interface: http://localhost:3000');
      console.log('   2. Run: node find-and-delete-user-by-email.js yarrala.srinivas@gmail.com');
      console.log('   3. Use the existing API endpoint: DELETE /api/auth/delete-user');
    }

  } catch (error) {
    console.error('❌ Error finding user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: node find-user-by-email.js <email>
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node find-user-by-email.js <email>');
    console.error('Example: node find-user-by-email.js yarrala.srinivas@gmail.com');
    process.exit(1);
  }
  
  findUserByEmail(email)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { findUserByEmail };
