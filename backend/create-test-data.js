const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔧 Creating Test Data for Ticket System');
    console.log('======================================');
    console.log('');

    // Step 1: Create test brand user and profile
    console.log('🏢 Step 1: Creating test brand...');
    const brandUser = await prisma.user.create({
      data: {
        email: 'test-brand@influmojo.com',
        name: 'Test Brand',
        password_hash: await bcrypt.hash('test123', 10),
        user_type: 'brand',
        status: 'active',
        email_verified: true,
        onboarding_completed: true
      }
    });

    const brandProfile = await prisma.brandProfile.create({
      data: {
        user_id: brandUser.id,
        company_name: 'Test Brand Company',
        industry: 'Technology',
        business_type: 'Startup',
        website_url: 'https://testbrand.com',
        description: 'A test brand for CRM testing',
        location_country: 'India',
        location_state: 'Karnataka',
        location_city: 'Bangalore'
      }
    });

    console.log(`   ✅ Brand created: ${brandProfile.company_name} (ID: ${brandProfile.id})`);
    console.log('');

    // Step 2: Create test creator user and profile
    console.log('👤 Step 2: Creating test creator...');
    const creatorUser = await prisma.user.create({
      data: {
        email: 'test-creator@influmojo.com',
        name: 'Test Creator',
        password_hash: await bcrypt.hash('test123', 10),
        user_type: 'creator',
        status: 'active',
        email_verified: true,
        onboarding_completed: true
      }
    });

    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        user_id: creatorUser.id,
        bio: 'A test creator for CRM testing',
        location_city: 'Mumbai',
        location_state: 'Maharashtra',
        min_rate: 100.00,
        max_rate: 500.00,
        rate_currency: 'USD',
        availability_status: 'available'
      }
    });

    console.log(`   ✅ Creator created: ${creatorUser.name} (ID: ${creatorProfile.id})`);
    console.log('');

    // Step 3: Create test package
    console.log('📦 Step 3: Creating test package...');
    const package = await prisma.package.create({
      data: {
        creator_id: creatorProfile.id,
        type: 'predefined',
        title: 'Test Package',
        description: 'A test package for CRM testing',
        price: 150.00,
        currency: 'USD'
      }
    });

    console.log(`   ✅ Package created: ${package.title} (ID: ${package.id})`);
    console.log('');

    // Step 4: Create test order
    console.log('🛒 Step 4: Creating test order...');
    const order = await prisma.order.create({
      data: {
        package_id: package.id,
        brand_id: brandProfile.id,
        creator_id: creatorProfile.id,
        total_amount: 150.00,
        currency: 'USD',
        status: 'pending'
      }
    });

    console.log(`   ✅ Order created: ID ${order.id}`);
    console.log('');

    // Step 5: Display summary
    console.log('📊 Test Data Summary:');
    console.log('=====================');
    console.log(`   • Brand: ${brandProfile.company_name} (ID: ${brandProfile.id})`);
    console.log(`   • Creator: ${creatorUser.name} (ID: ${creatorProfile.id})`);
    console.log(`   • Package: ${package.title} (ID: ${package.id})`);
    console.log(`   • Order: ID ${order.id}`);
    console.log('');

    console.log('🎉 Test data created successfully!');
    console.log('');
    console.log('💡 You can now run: node test-ticket-system.js');

  } catch (error) {
    console.error('💥 Error creating test data:', error);
    
    // Check if it's a duplicate key error
    if (error.code === 'P2002') {
      console.log('');
      console.log('💡 Some test data already exists. This is normal.');
      console.log('   You can proceed with: node test-ticket-system.js');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestData()
  .then(() => {
    console.log('🎯 Test data setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test data setup failed:', error);
    process.exit(1);
  }); 