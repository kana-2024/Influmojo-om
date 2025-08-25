const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function migrateCurrencyToINR() {
  try {
    console.log('🔄 Starting currency migration from USD to INR...');
    
    // Update all existing packages that have USD currency
    const result = await prisma.package.updateMany({
      where: {
        currency: 'USD'
      },
      data: {
        currency: 'INR'
      }
    });
    
    console.log(`✅ Successfully updated ${result.count} packages from USD to INR`);
    
    // Also update orders with USD currency
    const orderResult = await prisma.order.updateMany({
      where: {
        currency: 'USD'
      },
      data: {
        currency: 'INR'
      }
    });
    
    console.log(`✅ Successfully updated ${orderResult.count} orders from USD to INR`);
    
    // Update campaigns with USD currency
    const campaignResult = await prisma.campaign.updateMany({
      where: {
        currency: 'USD'
      },
      data: {
        currency: 'INR'
      }
    });
    
    console.log(`✅ Successfully updated ${campaignResult.count} campaigns from USD to INR`);
    
    // Update campaign applications with USD currency
    const applicationResult = await prisma.campaignApplication.updateMany({
      where: {
        currency: 'USD'
      },
      data: {
        currency: 'INR'
      }
    });
    
    console.log(`✅ Successfully updated ${applicationResult.count} campaign applications from USD to INR`);
    
    // Update collaborations with USD currency
    const collaborationResult = await prisma.collaboration.updateMany({
      where: {
        currency: 'USD'
      },
      data: {
        currency: 'INR'
      }
    });
    
    console.log(`✅ Successfully updated ${collaborationResult.count} collaborations from USD to INR`);
    
    console.log('🎉 Currency migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during currency migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateCurrencyToINR()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
