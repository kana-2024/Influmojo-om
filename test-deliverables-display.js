const { PrismaClient } = require('./backend/src/generated/client');

const prisma = new PrismaClient();

async function testDeliverablesDisplay() {
  try {
    console.log('🧪 Testing deliverables display functionality...');
    console.log('=============================================');
    
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
    
    // Step 2: Check each order for deliverables
    console.log('\n🔍 Step 2: Checking deliverables for each order...');
    orders.forEach((order, index) => {
      console.log(`\n   ${index + 1}. Order #${order.id}: ${order.brand?.user?.name || 'Unknown Brand'} → ${order.creator?.user?.name || 'Unknown Creator'}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Package: ${order.package?.title || 'Unknown'}`);
      
      // Check deliverables field
      if (order.deliverables) {
        console.log(`      Deliverables field exists: ✅`);
        console.log(`      Deliverables type: ${typeof order.deliverables}`);
        console.log(`      Deliverables value: ${order.deliverables}`);
        
        // Try to parse if it's a string
        if (typeof order.deliverables === 'string') {
          try {
            const parsed = JSON.parse(order.deliverables);
            console.log(`      Parsed deliverables: ${JSON.stringify(parsed, null, 2)}`);
            console.log(`      Number of files: ${Array.isArray(parsed) ? parsed.length : 'Not an array'}`);
          } catch (parseError) {
            console.log(`      ❌ Failed to parse deliverables JSON: ${parseError.message}`);
          }
        } else if (typeof order.deliverables === 'object') {
          console.log(`      Deliverables object: ${JSON.stringify(order.deliverables, null, 2)}`);
          console.log(`      Number of files: ${Array.isArray(order.deliverables) ? order.deliverables.length : 'Not an array'}`);
        }
      } else {
        console.log(`      Deliverables field: ❌ Not present`);
      }
      
      // Check references field
      if (order.references) {
        console.log(`      References field exists: ✅`);
        console.log(`      References type: ${typeof order.references}`);
        console.log(`      References value: ${order.references}`);
        
        // Try to parse if it's a string
        if (typeof order.references === 'string') {
          try {
            const parsed = JSON.parse(order.references);
            console.log(`      Parsed references: ${JSON.stringify(parsed, null, 2)}`);
            console.log(`      Number of references: ${Array.isArray(parsed) ? parsed.length : 'Not an array'}`);
          } catch (parseError) {
            console.log(`      ❌ Failed to parse references JSON: ${parseError.message}`);
          }
        } else if (typeof order.references === 'object') {
          console.log(`      References object: ${JSON.stringify(order.references, null, 2)}`);
          console.log(`      Number of references: ${Array.isArray(order.references) ? order.references.length : 'Not an array'}`);
        }
      } else {
        console.log(`      References field: ❌ Not present`);
      }
    });

    // Step 3: Check for orders with actual deliverables
    console.log('\n🔍 Step 3: Finding orders with actual deliverables...');
    const ordersWithDeliverables = orders.filter(order => 
      order.deliverables && 
      order.deliverables !== '[]' && 
      order.deliverables !== 'null' &&
      order.deliverables !== null
    );

    if (ordersWithDeliverables.length === 0) {
      console.log('   📭 No orders with deliverables found');
      console.log('   💡 This means no deliverables have been submitted yet');
    } else {
      console.log(`   📦 Found ${ordersWithDeliverables.length} orders with deliverables:`);
      ordersWithDeliverables.forEach((order, index) => {
        console.log(`      ${index + 1}. Order #${order.id}: ${order.status}`);
        
        let deliverablesArray = [];
        if (typeof order.deliverables === 'string') {
          try {
            deliverablesArray = JSON.parse(order.deliverables);
          } catch (e) {
            console.log(`         ❌ Failed to parse deliverables`);
            return;
          }
        } else if (Array.isArray(order.deliverables)) {
          deliverablesArray = order.deliverables;
        }
        
        if (Array.isArray(deliverablesArray)) {
          console.log(`         Files: ${deliverablesArray.length}`);
          deliverablesArray.forEach((file, fileIndex) => {
            console.log(`            File ${fileIndex + 1}: ${file.filename || 'Unknown'} (${file.type})`);
            console.log(`               URL: ${file.url}`);
            console.log(`               Size: ${file.size ? Math.round(file.size / 1024) + 'KB' : 'Unknown'}`);
          });
        }
      });
    }

    // Step 4: Summary and recommendations
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`   • Total orders: ${orders.length}`);
    console.log(`   • Orders with deliverables: ${ordersWithDeliverables.length}`);
    
    if (ordersWithDeliverables.length === 0) {
      console.log('\n💡 To test deliverables display:');
      console.log('   1. Submit deliverables for an order using the API');
      console.log('   2. Check that the order status changes to "review"');
      console.log('   3. Verify deliverables appear in both creator and brand views');
    } else {
      console.log('\n✅ Deliverables are stored correctly in database');
      console.log('   • Check frontend console logs for parsing issues');
      console.log('   • Verify JSON parsing is working correctly');
    }

  } catch (error) {
    console.error('❌ Error testing deliverables display:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDeliverablesDisplay()
  .then(() => {
    console.log('\n🎯 Deliverables display test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Deliverables display test failed:', error);
    process.exit(1);
  });
