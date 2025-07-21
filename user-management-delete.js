const { PrismaClient } = require('./backend/src/generated/client');
const prisma = new PrismaClient();

/**
 * Deletes a user and all related data for testing purposes.
 * @param {BigInt|String|Number} userId
 */
async function deleteUserAndAllData(userId) {
  const userIdBigInt = BigInt(userId);

  // Find user and their profiles
  const user = await prisma.user.findUnique({ where: { id: userIdBigInt } });
  if (!user) {
    console.log('User not found:', userId);
    return;
  }

  // Find related profiles
  const creatorProfile = await prisma.creatorProfile.findUnique({ where: { user_id: userIdBigInt } });
  const brandProfile = await prisma.brandProfile.findFirst({ where: { user_id: userIdBigInt } });

  await prisma.$transaction(async (tx) => {
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

    // Delete packages where user is admin
    await tx.package.deleteMany({ where: { admin_id: userIdBigInt } });

    // Delete content reviews where user is reviewer
    await tx.contentReview.deleteMany({ where: { reviewer_id: userIdBigInt } });

    // Delete content submissions where user is admin
    await tx.contentSubmission.deleteMany({ where: { admin_id: userIdBigInt } });

    // Delete collaboration channels where user is admin
    await tx.collaborationChannel.deleteMany({ where: { admin_id: userIdBigInt } });

    // Delete KYC verifications where user is verifier
    await tx.kYC.deleteMany({ where: { verified_by: userIdBigInt } });

    // Delete creator profile and related data
    if (creatorProfile) {
      const creatorId = creatorProfile.id;
      await tx.portfolioItem.deleteMany({ where: { creator_id: creatorId } });
      await tx.socialMediaAccount.deleteMany({ where: { creator_id: creatorId } });
      await tx.package.deleteMany({ where: { creator_id: creatorId } });
      await tx.kYC.deleteMany({ where: { creator_id: creatorId } });
      await tx.campaignApplication.deleteMany({ where: { creator_id: creatorId } });
      await tx.collaboration.deleteMany({ where: { creator_id: creatorId } });
      await tx.invoice.deleteMany({ where: { creator_id: creatorId } });
      await tx.creatorProfile.delete({ where: { id: creatorId } });
    }

    // Delete brand profile and related data
    if (brandProfile) {
      const brandId = brandProfile.id;
      await tx.campaign.deleteMany({ where: { brand_id: brandId } });
      await tx.collaboration.deleteMany({ where: { brand_id: brandId } });
      await tx.invoice.deleteMany({ where: { brand_id: brandId } });
      await tx.brandProfile.delete({ where: { id: brandId } });
    }

    // Finally, delete the user
    await tx.user.delete({ where: { id: userIdBigInt } });
  });

  console.log('User and all related data deleted:', userId);
}

// Usage: node user-management-delete.js <userId>
if (require.main === module) {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node user-management-delete.js <userId>');
    process.exit(1);
  }
  deleteUserAndAllData(userId)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error deleting user:', err);
      process.exit(1);
    });
}

module.exports = { deleteUserAndAllData }; 