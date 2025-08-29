const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function clearOrdersOnly() {
  try {
    console.log('🧹 Starting orders-only cleanup...');
    console.log('===============================');
    console.log('');
    
    // Step 1: Check current data
    console.log('🔍 Step 1: Checking current data...');
    
    const orderCount = await prisma.order.count();
    const ticketCount = await prisma.ticket.count();
    const paymentCount = await prisma.payment.count();
    const invoiceCount = await prisma.invoice.count();
    const messageCount = await prisma.message.count();
    
    console.log(`   Current orders: ${orderCount}`);
    console.log(`   Current tickets: ${ticketCount}`);
    console.log(`   Current payments: ${paymentCount}`);
    console.log(`   Current invoices: ${invoiceCount}`);
    console.log(`   Current messages: ${messageCount}`);
    console.log('');

    if (orderCount === 0) {
      console.log('✅ No orders to clear. Database is already clean!');
      return;
    }

    // Step 2: Clear messages first (they reference tickets)
    console.log('🗑️ Step 2: Clearing messages...');
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`   ✅ Deleted ${deletedMessages.count} messages`);

    // Step 3: Clear tickets (they reference orders)
    console.log('🗑️ Step 3: Clearing tickets...');
    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTickets.count} tickets`);

    // Step 4: Clear payments (they reference orders)
    console.log('🗑️ Step 4: Clearing payments...');
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);

    // Step 5: Clear invoices (they reference orders)
    console.log('🗑️ Step 5: Clearing invoices...');
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInvoices.count} invoices`);

    // Step 6: Clear orders
    console.log('🗑️ Step 6: Clearing orders...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrders.count} orders`);

    // Step 7: Verify cleanup
    console.log('\n🔍 Step 7: Verifying cleanup...');
    
    const finalOrderCount = await prisma.order.count();
    const finalTicketCount = await prisma.ticket.count();
    const finalPaymentCount = await prisma.payment.count();
    const finalInvoiceCount = await prisma.invoice.count();
    const finalMessageCount = await prisma.message.count();
    
    console.log(`   Final orders: ${finalOrderCount}`);
    console.log(`   Final tickets: ${finalTicketCount}`);
    console.log(`   Final payments: ${finalPaymentCount}`);
    console.log(`   Final invoices: ${finalInvoiceCount}`);
    console.log(`   Final messages: ${finalMessageCount}`);

    // Step 8: Summary
    console.log('\n🎉 Orders cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Deleted ${deletedMessages.count} messages`);
    console.log(`   • Deleted ${deletedTickets.count} tickets`);
    console.log(`   • Deleted ${deletedPayments.count} payments`);
    console.log(`   • Deleted ${deletedInvoices.count} invoices`);
    console.log(`   • Deleted ${deletedOrders.count} orders`);
    
    console.log('\n✅ What was preserved:');
    console.log('   • All users (brands, creators, agents, admins)');
    console.log('   • All packages and portfolio items');
    console.log('   • All profiles and KYC data');
    console.log('   • All social media accounts');
    
    console.log('\n🚀 You can now:');
    console.log('   1. Test the notification system with fresh orders');
    console.log('   2. Create new orders to see real-time updates');
    console.log('   3. Verify that creators get notified of new orders');

  } catch (error) {
    console.error('❌ Error during orders cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearOrdersOnly()
  .then(() => {
    console.log('\n✅ Orders cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Orders cleanup failed:', error);
    process.exit(1);
  });
