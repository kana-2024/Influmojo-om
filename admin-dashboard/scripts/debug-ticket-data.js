const { PrismaClient } = require('../../backend/src/generated/client');
const crmService = require('../../backend/src/services/crmService');

const prisma = new PrismaClient();

async function debugTicketData() {
  try {
    console.log('🔍 Debugging Ticket Data Structure');
    console.log('==================================');
    console.log('');

    // Get all tickets with full data
    const tickets = await prisma.ticket.findMany({
      include: {
        order: {
          include: {
            brand: { include: { user: { select: { name: true, email: true } } } },
            creator: { include: { user: { select: { name: true, email: true } } } },
            package: { select: { title: true } }
          }
        },
        agent: { select: { name: true, email: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      },
      orderBy: { updated_at: 'desc' },
      take: 3
    });

    console.log(`Found ${tickets.length} tickets`);
    console.log('');

    tickets.forEach((ticket, index) => {
      console.log(`📋 Ticket #${index + 1}:`);
      console.log(`   ID: ${ticket.id} (type: ${typeof ticket.id})`);
      console.log(`   Order ID: ${ticket.order_id} (type: ${typeof ticket.order_id})`);
      console.log(`   Agent ID: ${ticket.agent_id} (type: ${typeof ticket.agent_id})`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Stream Channel ID: ${ticket.stream_channel_id}`);
      console.log(`   Created At: ${ticket.created_at} (type: ${typeof ticket.created_at})`);
      console.log(`   Updated At: ${ticket.updated_at} (type: ${typeof ticket.updated_at})`);
      
      // Test date parsing
      console.log(`   Created At Parsed: ${new Date(ticket.created_at)}`);
      console.log(`   Updated At Parsed: ${new Date(ticket.updated_at)}`);
      console.log(`   Created At toLocaleDateString: ${new Date(ticket.created_at).toLocaleDateString()}`);
      console.log(`   Updated At toLocaleDateString: ${new Date(ticket.updated_at).toLocaleDateString()}`);
      console.log(`   Created At toLocaleString: ${new Date(ticket.created_at).toLocaleString()}`);
      console.log(`   Updated At toLocaleString: ${new Date(ticket.updated_at).toLocaleString()}`);
      
      console.log(`   Agent: ${ticket.agent?.name || 'Unassigned'}`);
      console.log(`   Order: ${ticket.order?.id || 'N/A'}`);
      console.log('');
    });

    // Test the getAllTickets service method
    console.log('🔍 Testing getAllTickets service method:');
    const serviceResult = await crmService.getAllTickets();
    console.log(`Service returned ${serviceResult.tickets.length} tickets`);
    
    if (serviceResult.tickets.length > 0) {
      const firstTicket = serviceResult.tickets[0];
      console.log('First ticket from service:');
      console.log(`   ID: ${firstTicket.id} (type: ${typeof firstTicket.id})`);
      console.log(`   Created At: ${firstTicket.created_at} (type: ${typeof firstTicket.created_at})`);
      console.log(`   Updated At: ${firstTicket.updated_at} (type: ${typeof firstTicket.updated_at})`);
      
      // Test date parsing on service result
      console.log(`   Created At Parsed: ${new Date(firstTicket.created_at)}`);
      console.log(`   Updated At Parsed: ${new Date(firstTicket.updated_at)}`);
      console.log(`   Created At toLocaleDateString: ${new Date(firstTicket.created_at).toLocaleDateString()}`);
      console.log(`   Updated At toLocaleDateString: ${new Date(firstTicket.updated_at).toLocaleDateString()}`);
      console.log(`   Created At toLocaleString: ${new Date(firstTicket.created_at).toLocaleString()}`);
      console.log(`   Updated At toLocaleString: ${new Date(firstTicket.updated_at).toLocaleString()}`);
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTicketData()
  .then(() => {
    console.log('🎯 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  }); 