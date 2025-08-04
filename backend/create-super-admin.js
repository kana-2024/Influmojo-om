const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔍 Checking for super_admin user...');
    
    // Check if super_admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        user_type: 'super_admin'
      }
    });

    if (existingAdmin) {
      console.log('✅ Super admin user already exists:');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   User Type: ${existingAdmin.user_type}`);
      console.log(`   Status: ${existingAdmin.status}`);
      return existingAdmin;
    }

    console.log('❌ No super_admin user found. Creating one...');

    // Create super admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@influmojo.com',
        name: 'Super Admin',
        password_hash: hashedPassword,
        user_type: 'super_admin',
        status: 'active',
        email_verified: true,
        onboarding_completed: true
      }
    });

    console.log('✅ Super admin user created successfully:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   User Type: ${superAdmin.user_type}`);
    console.log(`   Status: ${superAdmin.status}`);
    console.log('');
    console.log('🔑 Default credentials:');
    console.log('   Email: admin@influmojo.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('💡 You can now use this user ID in the test-auth.js script');

    return superAdmin;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('🎉 Super admin setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Super admin setup failed:', error);
    process.exit(1);
  }); 