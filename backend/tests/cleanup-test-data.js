const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
  try {
    console.log('🧹 Analyzing test data in database...');
    console.log('=====================================');
    console.log('');

    // Step 1: Find all users and categorize them
    console.log('🔍 Step 1: Analyzing all users...');
    
    const allUsers = await prisma.user.findMany({
      include: {
        brand_profiles: true,
        creator_profiles: true
      }
    });

    console.log(`   Found ${allUsers.length} total users:`);
    
    const testUsers = [];
    const realUsers = [];
    
    allUsers.forEach(user => {
      const isTestUser = user.email?.includes('test') || 
                        user.name?.includes('Test') || 
                        user.email?.includes('influmojo.com');
      
      if (isTestUser) {
        testUsers.push(user);
        console.log(`   🧪 TEST: ${user.name} (${user.email}) - Type: ${user.user_type}`);
        console.log(`     Brand profiles: ${user.brand_profiles?.length || 0}`);
        console.log(`     Creator profiles: ${user.creator_profiles?.length || 0}`);
      } else {
        realUsers.push(user);
        console.log(`   ✅ REAL: ${user.name} (${user.email}) - Type: ${user.user_type}`);
        console.log(`     Brand profiles: ${user.brand_profiles?.length || 0}`);
        console.log(`     Creator profiles: ${user.creator_profiles?.length || 0}`);
      }
    });
    console.log('');

    // Step 2: Find all orders
    console.log('🔍 Step 2: Analyzing all orders...');
    
    const allOrders = await prisma.order.findMany({
      include: {
        brand: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        creator: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        package: true,
        ticket: {
          include: {
            agent: { select: { name: true, email: true } }
          }
        }
      }
    });

    console.log(`   Found ${allOrders.length} total orders:`);
    
    const testOrders = [];
    const realOrders = [];
    
    allOrders.forEach(order => {
      const brandEmail = order.brand?.user?.email || '';
      const creatorEmail = order.creator?.user?.email || '';
      const isTestOrder = brandEmail.includes('test') || 
                         creatorEmail.includes('test') || 
                         brandEmail.includes('influmojo.com') ||
                         creatorEmail.includes('influmojo.com');
      
      if (isTestOrder) {
        testOrders.push(order);
        console.log(`   🧪 TEST Order #${order.id}: ${order.brand?.user?.name || 'Unknown'} → ${order.creator?.user?.name || 'Unknown'}`);
        console.log(`     Package: ${order.package?.title || 'Unknown'}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Has Ticket: ${order.ticket ? 'Yes' : 'No'}`);
      } else {
        realOrders.push(order);
        console.log(`   ✅ REAL Order #${order.id}: ${order.brand?.user?.name || 'Unknown'} → ${order.creator?.user?.name || 'Unknown'}`);
        console.log(`     Package: ${order.package?.title || 'Unknown'}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Has Ticket: ${order.ticket ? 'Yes' : 'No'}`);
        if (order.ticket) {
          console.log(`     Ticket #${order.ticket.id} assigned to: ${order.ticket.agent?.name || 'Unknown'}`);
        }
      }
    });
    console.log('');

    // Step 3: Find all tickets
    console.log('🔍 Step 3: Analyzing all tickets...');
    
    const allTickets = await prisma.ticket.findMany({
      include: {
        order: {
          include: {
            brand: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        },
        agent: { select: { name: true, email: true } }
      }
    });

    console.log(`   Found ${allTickets.length} total tickets:`);
    
    const testTickets = [];
    const realTickets = [];
    
    allTickets.forEach(ticket => {
      const brandEmail = ticket.order?.brand?.user?.email || '';
      const isTestTicket = brandEmail.includes('test') || brandEmail.includes('influmojo.com');
      
      if (isTestTicket) {
        testTickets.push(ticket);
        console.log(`   🧪 TEST Ticket #${ticket.id}: Order #${ticket.order_id} (${ticket.order?.brand?.user?.name || 'Unknown'}) → ${ticket.agent?.name || 'Unknown'}`);
      } else {
        realTickets.push(ticket);
        console.log(`   ✅ REAL Ticket #${ticket.id}: Order #${ticket.order_id} (${ticket.order?.brand?.user?.name || 'Unknown'}) → ${ticket.agent?.name || 'Unknown'}`);
      }
    });
    console.log('');

    // Step 4: Find all packages
    console.log('🔍 Step 4: Analyzing all packages...');
    
    const allPackages = await prisma.package.findMany({
      include: {
        creator: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    console.log(`   Found ${allPackages.length} total packages:`);
    
    const testPackages = [];
    const realPackages = [];
    
    allPackages.forEach(package => {
      const creatorEmail = package.creator?.user?.email || '';
      const isTestPackage = creatorEmail.includes('test') || creatorEmail.includes('influmojo.com');
      
      if (isTestPackage) {
        testPackages.push(package);
        console.log(`   🧪 TEST Package #${package.id}: ${package.title} (${package.creator?.user?.name || 'Unknown'})`);
      } else {
        realPackages.push(package);
        console.log(`   ✅ REAL Package #${package.id}: ${package.title} (${package.creator?.user?.name || 'Unknown'})`);
      }
    });
    console.log('');

    // Step 5: Summary
    console.log('📊 SUMMARY:');
    console.log('===========');
    console.log(`   🧪 Test Data:`);
    console.log(`     - Users: ${testUsers.length}`);
    console.log(`     - Orders: ${testOrders.length}`);
    console.log(`     - Tickets: ${testTickets.length}`);
    console.log(`     - Packages: ${testPackages.length}`);
    console.log('');
    console.log(`   ✅ Real Data:`);
    console.log(`     - Users: ${realUsers.length}`);
    console.log(`     - Orders: ${realOrders.length}`);
    console.log(`     - Tickets: ${realTickets.length}`);
    console.log(`     - Packages: ${realPackages.length}`);
    console.log('');

    // Step 6: Show your real brand account
    console.log('🔍 Your Real Brand Account:');
    console.log('===========================');
    
    const realBrandUsers = realUsers.filter(user => user.user_type === 'brand');
    
    if (realBrandUsers.length > 0) {
      console.log(`   Found ${realBrandUsers.length} real brand account(s):`);
      realBrandUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
        console.log(`     Brand profiles: ${user.brand_profiles?.length || 0}`);
        if (user.brand_profiles?.length > 0) {
          user.brand_profiles.forEach(profile => {
            console.log(`       Company: ${profile.company_name}`);
            console.log(`       Brand ID: ${profile.id}`);
          });
        }
      });
    } else {
      console.log('   ❌ No real brand accounts found');
    }
    console.log('');

    // Step 7: Show your real orders
    console.log('🔍 Your Real Orders:');
    console.log('===================');
    
    if (realOrders.length > 0) {
      console.log(`   Found ${realOrders.length} real order(s):`);
      realOrders.forEach(order => {
        console.log(`   - Order #${order.id}: ${order.brand?.user?.name || 'Unknown'} → ${order.creator?.user?.name || 'Unknown'}`);
        console.log(`     Package: ${order.package?.title || 'Unknown'}`);
        console.log(`     Amount: ${order.currency} ${order.total_amount}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Has Ticket: ${order.ticket ? 'Yes' : 'No'}`);
        if (order.ticket) {
          console.log(`     Ticket #${order.ticket.id} assigned to: ${order.ticket.agent?.name || 'Unknown'}`);
        }
      });
    } else {
      console.log('   ❌ No real orders found');
    }
    console.log('');

    console.log('✅ Analysis completed!');
    console.log('');
    console.log('💡 To clean up test data:');
    console.log('   1. The test data is clearly identified above');
    console.log('   2. Your real data is safe and separate');
    console.log('   3. To delete test data, run: node delete-test-data.js');
    console.log('');

  } catch (error) {
    console.error('💥 Analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
cleanupTestData()
  .then(() => {
    console.log('🎯 Analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  }); 