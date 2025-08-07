const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUsers() {
  try {
    console.log('🔍 Checking for admin users...');
    
    // Check if admin users exist
    const existingAdmins = await prisma.user.findMany({
      where: {
        user_type: 'admin'
      }
    });

    if (existingAdmins.length > 0) {
      console.log(`✅ Found ${existingAdmins.length} admin user(s):`);
      existingAdmins.forEach(admin => {
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   User Type: ${admin.user_type}`);
        console.log(`   Status: ${admin.status}`);
        console.log('');
      });
      return existingAdmins;
    }

    console.log('❌ No admin users found. Creating admin users...');

    // Create admin users
    const adminUsers = [
      {
        email: 'admin1@influmojo.com',
        name: 'Admin User 1',
        password: 'admin123'
      },
      {
        email: 'admin2@influmojo.com',
        name: 'Admin User 2',
        password: 'admin123'
      }
    ];

    const createdAdmins = [];

    for (const adminData of adminUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: adminData.email }
      });

      if (existingUser) {
        console.log(`⚠️ Admin user with email ${adminData.email} already exists`);
        createdAdmins.push(existingUser);
        continue;
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const admin = await prisma.user.create({
        data: {
          email: adminData.email,
          name: adminData.name,
          password_hash: hashedPassword,
          user_type: 'admin',
          status: 'active',
          email_verified: true,
          onboarding_completed: true
        }
      });

      console.log(`✅ Admin user created successfully:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   User Type: ${admin.user_type}`);
      console.log(`   Status: ${admin.status}`);
      console.log('');

      createdAdmins.push(admin);
    }

    console.log('🔑 Default credentials for admin users:');
    console.log('   Email: admin1@influmojo.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('   Email: admin2@influmojo.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('💡 These admin users can now be assigned to tickets');

    return createdAdmins;
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUsers()
  .then(() => {
    console.log('🎉 Admin users setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Admin users setup failed:', error);
    process.exit(1);
  }); 