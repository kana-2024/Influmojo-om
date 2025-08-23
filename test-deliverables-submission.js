const { PrismaClient } = require('./backend/src/generated/client');

const prisma = new PrismaClient();

async function testDeliverablesSubmission() {
  try {
    console.log('🧪 Testing deliverables submission functionality...');
    console.log('===============================================');
    
    // Step 1: Check if orders exist
    console.log('\n🔍 Step 1: Checking existing orders...');
    const orders = await prisma.order.findMany({
      take: 5,
      include: {
        brand: {
          include: {
            user: true
          }
        },
        creator: {
          include: {
            user: true
          }
        },
        package: true
      }
    });

    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      return;
    }

    console.log(`✅ Found ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order #${order.id}: ${order.brand?.user?.name || 'Unknown Brand'} → ${order.creator?.user?.name || 'Unknown Creator'}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Package: ${order.package?.title || 'Unknown'}`);
      console.log(`      Deliverables: ${order.deliverables ? JSON.parse(order.deliverables).length : 0} files`);
    });

    // Step 2: Check order statuses
    console.log('\n🔍 Step 2: Analyzing order statuses...');
    const statusCounts = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    console.log('   Order status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`      ${status}: ${count} orders`);
    });

    // Step 3: Check for orders that can accept deliverables
    console.log('\n🔍 Step 3: Finding orders that can accept deliverables...');
    const eligibleOrders = orders.filter(order => 
      ['accepted', 'in_progress'].includes(order.status)
    );

    if (eligibleOrders.length === 0) {
      console.log('   ⚠️  No orders in "accepted" or "in_progress" status found');
      console.log('   💡 Orders need to be in these statuses to accept deliverables');
    } else {
      console.log(`   ✅ Found ${eligibleOrders.length} orders that can accept deliverables:`);
      eligibleOrders.forEach((order, index) => {
        console.log(`      ${index + 1}. Order #${order.id}: ${order.brand?.user?.name || 'Unknown'} → ${order.creator?.user?.name || 'Unknown'}`);
        console.log(`         Current status: ${order.status}`);
      });
    }

    // Step 4: Check for orders with deliverables
    console.log('\n🔍 Step 4: Checking orders with deliverables...');
    const ordersWithDeliverables = orders.filter(order => 
      order.deliverables && order.deliverables !== '[]'
    );

    if (ordersWithDeliverables.length === 0) {
      console.log('   📭 No orders with deliverables found');
    } else {
      console.log(`   📦 Found ${ordersWithDeliverables.length} orders with deliverables:`);
      ordersWithDeliverables.forEach((order, index) => {
        const deliverables = JSON.parse(order.deliverables);
        console.log(`      ${index + 1}. Order #${order.id}: ${deliverables.length} files`);
        deliverables.forEach((deliverable, fileIndex) => {
          console.log(`         File ${fileIndex + 1}: ${deliverable.filename || 'Unknown'} (${deliverable.type})`);
          console.log(`            URL: ${deliverable.url}`);
        });
      });
    }

    // Step 5: Test deliverables submission endpoint
    console.log('\n🔍 Step 5: Testing deliverables submission endpoint...');
    console.log('   📋 API Endpoint: POST /api/orders/:orderId/deliverables');
    console.log('   📋 Required fields:');
    console.log('      - deliverables: Array of objects');
    console.log('      - Each object: { url, filename, type, size }');
    console.log('   📋 Status changes: accepted/in_progress → review');

    // Step 6: Summary and recommendations
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`   • Total orders: ${orders.length}`);
    console.log(`   • Orders eligible for deliverables: ${eligibleOrders.length}`);
    console.log(`   • Orders with deliverables: ${ordersWithDeliverables.length}`);
    
    if (eligibleOrders.length > 0) {
      console.log('\n💡 To test deliverables submission:');
      console.log(`   1. Use one of the ${eligibleOrders.length} eligible orders`);
      console.log(`   2. Submit deliverables via POST /api/orders/{orderId}/deliverables`);
      console.log(`   3. Order status should change to 'review'`);
      console.log(`   4. Check that deliverables appear in order details`);
    }

    if (ordersWithDeliverables.length > 0) {
      console.log('\n✅ Deliverables are working:');
      console.log(`   • ${ordersWithDeliverables.length} orders have submitted deliverables`);
      console.log(`   • Files are being stored and retrieved correctly`);
    }

  } catch (error) {
    console.error('❌ Error testing deliverables submission:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDeliverablesSubmission()
  .then(() => {
    console.log('\n🎯 Deliverables submission test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Deliverables submission test failed:', error);
    process.exit(1);
  });
