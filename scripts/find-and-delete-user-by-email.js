const { PrismaClient } = require('./backend/src/generated/client');

const prisma = new PrismaClient();

/**
 * Finds a user by email and deletes them with all related data
 * @param {string} email - The email address to search for
 */
async function findAndDeleteUserByEmail(email) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        creator_profiles: true,
        brand_profiles: true
      }
    });

    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('✅ User found:', {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      auth_provider: user.auth_provider,
      status: user.status,
      created_at: user.created_at
    });

    // Show related profiles
    if (user.creator_profiles && user.creator_profiles.length > 0) {
      console.log('📸 Creator profile found');
    }
    if (user.brand_profiles && user.brand_profiles.length > 0) {
      console.log('🏢 Brand profile found');
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete the user and ALL related data permanently!');
    console.log('📋 Data to be deleted:');
    console.log('   - User account');
    console.log('   - Creator/Brand profile');
    console.log('   - Portfolio items');
    console.log('   - Social media accounts');
    console.log('   - Packages');
    console.log('   - KYC information');
    console.log('   - Campaign applications');
    console.log('   - Collaborations');
    console.log('   - Invoices');
    console.log('   - Phone verifications');
    console.log('   - Notifications');
    console.log('   - Messages');
    console.log('   - Reviews');
    console.log('   - Payments');
    console.log('   - Content reviews');
    console.log('   - Content submissions');
    console.log('   - Collaboration channels');

    // For automated deletion, you can set this to true
    const autoConfirm = true;
    
    if (!autoConfirm) {
      console.log('\n❓ To proceed with deletion, set autoConfirm = true in the script');
      console.log('   Or use the web interface at http://localhost:3000');
      return;
    }

    console.log('\n🗑️  Proceeding with deletion...');
    
    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      const userIdBigInt = user.id;

      // Delete phone verifications
      await tx.phoneVerification.deleteMany({ where: { user_id: userIdBigInt } });
      if (user.phone) {
        await tx.phoneVerification.deleteMany({ where: { phone: user.phone } });
      }

      // Delete notifications
      await tx.notification.deleteMany({ where: { user_id: userIdBigInt } });

      // Delete messages sent by user
      await tx.message.deleteMany({ where: { sender_id: userIdBigInt } });

      // Delete reviews where user is reviewer or reviewed
      await tx.review.deleteMany({ where: { reviewer_id: userIdBigInt } });
      await tx.review.deleteMany({ where: { reviewed_id: userIdBigInt } });

      // Delete payments where user is payer, payee, or admin
      await tx.payment.deleteMany({ where: { payer_id: userIdBigInt } });
      await tx.payment.deleteMany({ where: { payee_id: userIdBigInt } });
      await tx.payment.deleteMany({ where: { admin_id: userIdBigInt } });

      // Delete content reviews where user is reviewer
      await tx.contentReview.deleteMany({ where: { reviewer_id: userIdBigInt } });

      // Delete content submissions where user is admin
      await tx.contentSubmission.deleteMany({ where: { admin_id: userIdBigInt } });

      // Delete collaboration channels where user is admin
      await tx.collaborationChannel.deleteMany({ where: { admin_id: userIdBigInt } });

      // Delete KYC verifications where user is verifier
      await tx.kYC.deleteMany({ where: { verified_by: userIdBigInt } });

      // Delete tickets where user is the agent
      await tx.ticket.deleteMany({ where: { agent_id: userIdBigInt } });

      // Delete creator profile and related data
      if (user.creator_profiles && user.creator_profiles.length > 0) {
        for (const creatorProfile of user.creator_profiles) {
          const creatorId = creatorProfile.id;
          console.log(`🗑️  Deleting creator profile ${creatorId} and related data...`);
          
          await tx.portfolioItem.deleteMany({ where: { creator_id: creatorId } });
          await tx.socialMediaAccount.deleteMany({ where: { creator_id: creatorId } });
          await tx.package.deleteMany({ where: { creator_id: creatorId } });
          await tx.kYC.deleteMany({ where: { creator_id: creatorId } });
          await tx.campaignApplication.deleteMany({ where: { creator_id: creatorId } });
          await tx.collaboration.deleteMany({ where: { creator_id: creatorId } });
          await tx.invoice.deleteMany({ where: { creator_id: creatorId } });
          await tx.creatorProfile.delete({ where: { id: creatorId } });
        }
      }

      // Delete brand profile and related data
      if (user.brand_profiles && user.brand_profiles.length > 0) {
        for (const brandProfile of user.brand_profiles) {
          const brandId = brandProfile.id;
          console.log(`🗑️  Deleting brand profile ${brandId} and related data...`);
          
          await tx.campaign.deleteMany({ where: { brand_id: brandId } });
          await tx.collaboration.deleteMany({ where: { brand_id: brandId } });
          await tx.invoice.deleteMany({ where: { brand_id: brandId } });
          await tx.brandProfile.delete({ where: { id: brandId } });
        }
      }

      // Finally, delete the user
      await tx.user.delete({ where: { id: userIdBigInt } });
    });

    console.log('✅ User and all related data deleted successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🆔 ID: ${user.id.toString()}`);

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: node find-and-delete-user-by-email.js <email>
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node find-and-delete-user-by-email.js <email>');
    console.error('Example: node find-and-delete-user-by-email.js yarrala.srinivas@gmail.com');
    process.exit(1);
  }
  
  findAndDeleteUserByEmail(email)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { findAndDeleteUserByEmail };
