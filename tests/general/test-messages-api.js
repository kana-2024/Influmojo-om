const { PrismaClient } = require('./src/generated/client');
const crmService = require('./src/services/crmService');

const prisma = new PrismaClient();

async function testMessagesAPI() {
  try {
    console.log('🧪 Testing Messages API Response Structure');
    console.log('==========================================');
    console.log('');

    // Get a ticket with messages
    const ticket = await prisma.ticket.findFirst({
      include: {
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

    console.log('📋 Ticket ID:', ticket.id);
    console.log('📋 Messages count:', ticket.messages.length);
    console.log('');

    // Test the service method directly
    console.log('🔍 Testing crmService.getTicketMessages:');
    const messages = await crmService.getTicketMessages(ticket.id.toString());
    
    console.log('📋 Service Response (all messages - backward compatibility):');
    console.log(JSON.stringify(messages, null, 2));
    console.log('');

    // Test role-based filtering
    console.log('🔍 Testing role-based message filtering:');
    
    // Test as agent (should see all messages)
    const agentMessages = await crmService.getTicketMessages(ticket.id.toString(), '1', 'agent');
    console.log(`📋 Agent view: ${agentMessages.length} messages`);
    
    // Test as brand (should only see agent messages and own messages)
    const brandMessages = await crmService.getTicketMessages(ticket.id.toString(), ticket.order?.brand?.user?.id?.toString(), 'brand');
    console.log(`📋 Brand view: ${brandMessages.length} messages`);
    
    // Test as creator (should only see agent messages and own messages)
    const creatorMessages = await crmService.getTicketMessages(ticket.id.toString(), ticket.order?.creator?.user?.id?.toString(), 'creator');
    console.log(`📋 Creator view: ${creatorMessages.length} messages`);
    
    console.log('');

    // Simulate the API response structure
    const apiResponse = {
      success: true,
      message: 'Messages retrieved successfully',
      data: { messages }
    };

    console.log('📋 Simulated API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');

    // Test the frontend parsing logic
    console.log('🔍 Testing Frontend Parsing Logic:');
    const response = apiResponse;
    
    console.log('Response structure check:');
    console.log('- hasResponse:', !!response);
    console.log('- hasData:', !!response?.data);
    console.log('- hasMessages:', !!response?.data?.messages);
    console.log('- messagesLength:', response?.data?.messages?.length);
    console.log('');

    if (response && response.data?.messages) {
      const messages = response.data.messages;
      console.log('✅ Messages found, processing...');
      
      messages.forEach((msg, index) => {
        const isSent = msg.sender === 'admin';
        const timestamp = new Date(msg.timestamp).toLocaleString();
        console.log(`Message ${index + 1}:`);
        console.log(`  - Sender: ${msg.sender} (${msg.sender_name})`);
        console.log(`  - Is Sent: ${isSent}`);
        console.log(`  - Text: ${msg.text.substring(0, 50)}...`);
        console.log(`  - Timestamp: ${timestamp}`);
        console.log('');
      });
    } else {
      console.log('❌ No messages found in response structure');
    }

    console.log('✅ Messages API test completed!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMessagesAPI()
  .then(() => {
    console.log('🎯 Messages API test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Messages API test failed:', error);
    process.exit(1);
  }); 