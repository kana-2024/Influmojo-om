const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function clearSpecificOTP() {
  try {
    console.log('🧹 Clearing OTP records for specific phone numbers...');
    
    // Clear records for the phone number that's causing issues
    const phoneNumbers = ['+917702428882', '7702428882'];
    
    for (const phone of phoneNumbers) {
      const deletedRecords = await prisma.phoneVerification.deleteMany({
        where: { phone }
      });
      
      console.log(`✅ Deleted ${deletedRecords.count} OTP records for ${phone}`);
    }
    
    // Show remaining records
    const remainingRecords = await prisma.phoneVerification.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });
    
    console.log('📋 Remaining OTP records:');
    remainingRecords.forEach(record => {
      const timeAgo = Math.floor((Date.now() - record.created_at.getTime()) / 1000);
      console.log(`  - ${record.phone}: ${timeAgo}s ago (${record.created_at.toISOString()})`);
    });
    
  } catch (error) {
    console.error('❌ Error clearing OTP records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSpecificOTP(); 