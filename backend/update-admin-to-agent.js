const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function updateAdminToAgent() {
  try {
    console.log('🔄 Starting migration: updating admin users to agent...');
    
    // Find all users with user_type: 'admin'
    const adminUsers = await prisma.user.findMany({
      where: { user_type: 'admin' },
      select: { id: true, name: true, email: true, user_type: true }
    });
    
    console.log(`📊 Found ${adminUsers.length} users with user_type: 'admin'`);
    
    if (adminUsers.length === 0) {
      console.log('✅ No admin users found. Migration complete.');
      return;
    }
    
    // Update all admin users to agent
    const updateResult = await prisma.user.updateMany({
      where: { user_type: 'admin' },
      data: { user_type: 'agent' }
    });
    
    console.log(`✅ Successfully updated ${updateResult.count} users from 'admin' to 'agent'`);
    
    // Verify the update
    const remainingAdminUsers = await prisma.user.findMany({
      where: { user_type: 'admin' },
      select: { id: true, name: true, email: true }
    });
    
    if (remainingAdminUsers.length === 0) {
      console.log('✅ Verification successful: No users with user_type: "admin" remain');
    } else {
      console.log(`⚠️ Warning: ${remainingAdminUsers.length} users still have user_type: "admin"`);
      console.log('Remaining admin users:', remainingAdminUsers);
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateAdminToAgent()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  }); 