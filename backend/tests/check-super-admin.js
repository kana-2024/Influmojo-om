const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    console.log('🔍 Checking for super_admin user...');
    
    const superAdmin = await prisma.user.findFirst({
      where: {
        user_type: 'super_admin'
      }
    });

    if (superAdmin) {
      console.log('✅ Super admin user found:');
      console.log(`   ID: ${superAdmin.id}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Name: ${superAdmin.name}`);
      console.log(`   User Type: ${superAdmin.user_type}`);
      console.log(`   Status: ${superAdmin.status}`);
      console.log(`   Has Password: ${!!superAdmin.password_hash}`);
    } else {
      console.log('❌ No super admin user found!');
      console.log('💡 Run: node create-super-admin.js to create one');
    }
  } catch (error) {
    console.error('❌ Error checking super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin(); 