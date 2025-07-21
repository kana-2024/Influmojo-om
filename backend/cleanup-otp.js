const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function cleanupOldOTPRecords() {
  try {
    console.log('🧹 Cleaning up old OTP records...');
    
    // Delete OTP records older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const deletedRecords = await prisma.phoneVerification.deleteMany({
      where: {
        created_at: {
          lt: tenMinutesAgo
        }
      }
    });
    
    console.log(`✅ Deleted ${deletedRecords.count} old OTP records`);
    
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
    console.error('❌ Error cleaning up OTP records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldOTPRecords(); 