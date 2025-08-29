const { PrismaClient } = require('./src/generated/client');
const crmService = require('./src/services/crmService');

const prisma = new PrismaClient();

async function testTicketView() {
  try {
    console.log('🧪 Testing Comprehensive Ticket View');
    console.log('====================================');
    console.log('');

    // Get a ticket with full details
    const ticket = await prisma.ticket.findFirst({
      include: {
        order: {
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
            package: { select: { title: true, description: true, price: true, currency: true } }
          }
        },
        agent: { select: { name: true, email: true } },
        messages: {
          include: {
            sender: { select: { name: true, user_type: true } }
          },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!ticket) {
      console.log('❌ No tickets found to test');
      return;
    }

    console.log('📋 Ticket Information:');
    console.log(`   ID: ${ticket.id}`);
    console.log(`   Status: ${ticket.status}`);
    console.log(`   Created: ${ticket.created_at}`);
    console.log(`   Updated: ${ticket.updated_at}`);
    console.log(`   Stream Channel: ${ticket.stream_channel_id}`);
    console.log(`   Assigned Agent: ${ticket.agent?.name || 'Unassigned'}`);
    console.log('');

    console.log('📦 Order Details:');
    console.log(`   Order ID: ${ticket.order_id}`);
    console.log(`   Package: ${ticket.order?.package?.title || 'N/A'}`);
    console.log(`   Description: ${ticket.order?.package?.description || 'N/A'}`);
    console.log(`   Price: ${ticket.order?.package?.price || 0} ${ticket.order?.package?.currency || 'USD'}`);
    console.log(`   Total Amount: ${ticket.order?.total_amount || 0}`);
    console.log(`   Quantity: ${ticket.order?.quantity || 0}`);
    console.log(`   Order Status: ${ticket.order?.status || 'N/A'}`);
    console.log('');

    console.log('👥 Participants:');
    console.log('   Brand:');
    console.log(`     Name: ${ticket.order?.brand?.name || 'N/A'}`);
    console.log(`     Email: ${ticket.order?.brand?.user?.email || 'N/A'}`);
    console.log(`     Phone: ${ticket.order?.brand?.phone || 'N/A'}`);
    console.log('   Creator:');
    console.log(`     Name: ${ticket.order?.creator?.name || 'N/A'}`);
    console.log(`     Email: ${ticket.order?.creator?.user?.email || 'N/A'}`);
    console.log(`     Phone: ${ticket.order?.creator?.phone || 'N/A'}`);
    console.log('');

    console.log('💬 Chat History:');
    console.log(`   Total Messages: ${ticket.messages.length}`);
    
    if (ticket.messages.length > 0) {
      ticket.messages.forEach((msg, index) => {
        console.log(`   Message ${index + 1}:`);
        console.log(`     Sender: ${msg.sender.name} (${msg.sender.user_type})`);
        console.log(`     Text: ${msg.message_text}`);
        console.log(`     Type: ${msg.message_type}`);
        console.log(`     Time: ${msg.created_at}`);
        if (msg.file_url) {
          console.log(`     File: ${msg.file_name} (${msg.file_url})`);
        }
        console.log('');
      });
    } else {
      console.log('   No messages yet');
    }

    // Test the getTicketMessages service method
    console.log('🔍 Testing getTicketMessages service:');
    const messages = await crmService.getTicketMessages(ticket.id.toString());
    console.log(`   Service returned ${messages.length} messages`);
    
    if (messages.length > 0) {
      console.log('   First message from service:');
      console.log(`     ID: ${messages[0].id}`);
      console.log(`     Text: ${messages[0].text}`);
      console.log(`     Sender: ${messages[0].sender} (${messages[0].sender_name})`);
      console.log(`     Timestamp: ${messages[0].timestamp}`);
    }

    console.log('');
    console.log('✅ Comprehensive ticket view test completed!');
    console.log('');
    console.log('💡 What to test in the admin panel:');
    console.log('   1. Click "View" on any ticket in the tickets table');
    console.log('   2. Verify all ticket information is displayed correctly');
    console.log('   3. Check that order details are shown');
    console.log('   4. Verify brand and creator information');
    console.log('   5. Test chat history loading');
    console.log('   6. Try sending a new message');
    console.log('   7. Test communication options (chat, phone, email)');
    console.log('   8. Verify ticket actions (status update, reassign, priority)');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTicketView()
  .then(() => {
    console.log('🎯 Ticket view test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ticket view test failed:', error);
    process.exit(1);
  }); 