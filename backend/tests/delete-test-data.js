const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function deleteTestData() {
  try {
    console.log('🗑️  Deleting test data...');
    console.log('========================');
    console.log('');

    // Step 1: Find test users
    console.log('🔍 Step 1: Finding test users...');
    
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'influmojo.com' } }
        ]
      }
    });

    console.log(`   Found ${testUsers.length} test users to delete:`);
    testUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Type: ${user.user_type}`);
    });
    console.log('');

    // Step 2: Find test messages first (to delete them before tickets)
    console.log('🔍 Step 2: Finding test messages...');
    
    const testMessages = await prisma.message.findMany({
      where: {
        ticket: {
          order: {
            brand: {
              user: {
                OR: [
                  { email: { contains: 'test' } },
                  { email: { contains: 'influmojo.com' } }
                ]
              }
            }
          }
        }
      },
      include: {
        ticket: {
          include: {
            order: {
              include: {
                brand: {
                  include: {
                    user: { select: { name: true, email: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`   Found ${testMessages.length} test messages to delete:`);
    testMessages.forEach(message => {
      console.log(`   - Message #${message.id}: Ticket #${message.ticket_id} (${message.ticket.order.brand.user.name})`);
    });
    console.log('');

    // Step 3: Find test tickets
    console.log('🔍 Step 3: Finding test tickets...');
    
    const testTickets = await prisma.ticket.findMany({
      where: {
        order: {
          brand: {
            user: {
              OR: [
                { email: { contains: 'test' } },
                { email: { contains: 'influmojo.com' } }
              ]
            }
          }
        }
      },
      include: {
        order: {
          include: {
            brand: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    });

    console.log(`   Found ${testTickets.length} test tickets to delete:`);
    testTickets.forEach(ticket => {
      console.log(`   - Ticket #${ticket.id}: Order #${ticket.order_id} (${ticket.order.brand.user.name})`);
    });
    console.log('');

    // Step 4: Find test orders
    console.log('🔍 Step 4: Finding test orders...');
    
    const testOrders = await prisma.order.findMany({
      where: {
        brand: {
          user: {
            OR: [
              { email: { contains: 'test' } },
              { email: { contains: 'influmojo.com' } }
            ]
          }
        }
      },
      include: {
        brand: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    console.log(`   Found ${testOrders.length} test orders to delete:`);
    testOrders.forEach(order => {
      console.log(`   - Order #${order.id}: ${order.brand.user.name} (${order.brand.user.email})`);
    });
    console.log('');

    // Step 5: Find test packages
    console.log('🔍 Step 5: Finding test packages...');
    
    const testPackages = await prisma.package.findMany({
      where: {
        creator: {
          user: {
            OR: [
              { email: { contains: 'test' } },
              { email: { contains: 'influmojo.com' } }
            ]
          }
        }
      },
      include: {
        creator: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    console.log(`   Found ${testPackages.length} test packages to delete:`);
    testPackages.forEach(package => {
      console.log(`   - Package #${package.id}: ${package.title} (${package.creator.user.name})`);
    });
    console.log('');

    // Step 6: Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete:');
    console.log(`   - ${testMessages.length} test messages`);
    console.log(`   - ${testTickets.length} test tickets`);
    console.log(`   - ${testOrders.length} test orders`);
    console.log(`   - ${testPackages.length} test packages`);
    console.log(`   - ${testUsers.length} test users`);
    console.log('');
    console.log('✅ Your real data will be preserved:');
    console.log('   - Kāna Kāna (kana.sriman@gmail.com) - Brand ID: 2');
    console.log('   - All real users and their data');
    console.log('   - All real packages and orders');
    console.log('');

    // Step 7: Perform deletion in correct order
    console.log('🗑️  Starting deletion...');
    
    let deletedCount = 0;

    // Delete test messages first (to remove foreign key constraints)
    if (testMessages.length > 0) {
      console.log(`   Deleting ${testMessages.length} test messages...`);
      
      for (const message of testMessages) {
        await prisma.message.delete({
          where: { id: message.id }
        });
        deletedCount++;
        console.log(`   ✅ Deleted message #${message.id}`);
      }
    }

    // Delete test tickets (now that messages are gone)
    if (testTickets.length > 0) {
      console.log(`   Deleting ${testTickets.length} test tickets...`);
      
      for (const ticket of testTickets) {
        await prisma.ticket.delete({
          where: { id: ticket.id }
        });
        deletedCount++;
        console.log(`   ✅ Deleted ticket #${ticket.id}`);
      }
    }

    // Delete test orders (now that tickets are gone)
    if (testOrders.length > 0) {
      console.log(`   Deleting ${testOrders.length} test orders...`);
      
      for (const order of testOrders) {
        await prisma.order.delete({
          where: { id: order.id }
        });
        deletedCount++;
        console.log(`   ✅ Deleted order #${order.id}`);
      }
    }

    // Delete test packages
    if (testPackages.length > 0) {
      console.log(`   Deleting ${testPackages.length} test packages...`);
      
      for (const package of testPackages) {
        await prisma.package.delete({
          where: { id: package.id }
        });
        deletedCount++;
        console.log(`   ✅ Deleted package #${package.id}`);
      }
    }

    // Delete test users (this will cascade delete profiles)
    if (testUsers.length > 0) {
      console.log(`   Deleting ${testUsers.length} test users...`);
      
      for (const user of testUsers) {
        await prisma.user.delete({
          where: { id: user.id }
        });
        deletedCount++;
        console.log(`   ✅ Deleted user: ${user.name} (${user.email})`);
      }
    }

    console.log('');
    console.log(`✅ Deletion completed! Deleted ${deletedCount} items.`);
    console.log('');

    // Step 8: Verify cleanup
    console.log('🔍 Step 8: Verifying cleanup...');
    
    const remainingOrders = await prisma.order.findMany({
      include: {
        brand: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    const remainingUsers = await prisma.user.findMany({
      where: {
        AND: [
          { email: { not: { contains: 'test' } } },
          { email: { not: { contains: 'influmojo.com' } } }
        ]
      }
    });

    const remainingTickets = await prisma.ticket.findMany({
      include: {
        order: {
          include: {
            brand: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    });

    const remainingMessages = await prisma.message.findMany({
      include: {
        ticket: {
          include: {
            order: {
              include: {
                brand: {
                  include: {
                    user: { select: { name: true, email: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`   Remaining orders: ${remainingOrders.length}`);
    remainingOrders.forEach(order => {
      console.log(`   - Order #${order.id}: ${order.brand.user.name} (${order.brand.user.email})`);
    });

    console.log(`   Remaining tickets: ${remainingTickets.length}`);
    remainingTickets.forEach(ticket => {
      console.log(`   - Ticket #${ticket.id}: Order #${ticket.order_id} (${ticket.order.brand.user.name})`);
    });

    console.log(`   Remaining messages: ${remainingMessages.length}`);
    remainingMessages.forEach(message => {
      console.log(`   - Message #${message.id}: Ticket #${message.ticket_id} (${message.ticket.order.brand.user.name})`);
    });

    console.log(`   Remaining users: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Type: ${user.user_type}`);
    });
    console.log('');

    console.log('🎉 Test data cleanup completed successfully!');
    console.log('');
    console.log('💡 Your real brand account is now clean:');
    console.log('   - Only your real orders will show in your brand page');
    console.log('   - Test data has been completely removed');
    console.log('   - You can now place real orders without interference');

  } catch (error) {
    console.error('💥 Deletion failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteTestData()
  .then(() => {
    console.log('🎯 Test data deletion completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test data deletion failed:', error);
    process.exit(1);
  }); 