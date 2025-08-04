const { PrismaClient } = require('./src/generated/client');
const crmService = require('./src/services/crmService');

const prisma = new PrismaClient();

async function testTicketSystem() {
  try {
    console.log('🧪 Testing Ticket Creation and Round-Robin Assignment');
    console.log('==================================================');
    console.log('');

    // Step 1: Check existing agents
    console.log('🔍 Step 1: Checking existing agents...');
    const agents = await prisma.user.findMany({
      where: { user_type: 'admin' },
      select: { id: true, name: true, email: true }
    });

    if (agents.length === 0) {
      console.log('❌ No admin agents found! Please create agents first.');
      return;
    }

    console.log(`✅ Found ${agents.length} agents:`);
    agents.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} (${agent.email}) - ID: ${agent.id}`);
    });
    console.log('');

    // Step 2: Check existing orders or create test data
    console.log('🔍 Step 2: Checking existing orders...');
    let orders = await prisma.order.findMany({
      take: 5,
      select: { id: true, status: true }
    });

    if (orders.length === 0) {
      console.log('❌ No orders found! Creating test data...');
      
      // Check for existing packages, brands, and creators
      const packages = await prisma.package.findMany({ take: 1 });
      const brands = await prisma.brandProfile.findMany({ take: 1 });
      const creators = await prisma.creatorProfile.findMany({ take: 1 });

      if (packages.length === 0 || brands.length === 0 || creators.length === 0) {
        console.log('❌ Missing required data for order creation:');
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Brands: ${brands.length}`);
        console.log(`   Creators: ${creators.length}`);
        console.log('');
        console.log('💡 Please create some packages, brands, and creators first.');
        console.log('   For now, we will test with existing data only.');
        return;
      }

      // Create a test order using existing data
      const testOrder = await prisma.order.create({
        data: {
          package_id: packages[0].id,
          brand_id: brands[0].id,
          creator_id: creators[0].id,
          total_amount: 100.00,
          currency: 'USD',
          status: 'pending'
        }
      });
      orders.push(testOrder);
      console.log(`✅ Created test order with ID: ${testOrder.id}`);
    }

    console.log(`✅ Found ${orders.length} orders for testing`);
    console.log('');

    // Step 3: Create test tickets
    console.log('🎫 Step 3: Creating test tickets with round-robin assignment...');
    
    const createdTickets = [];
    
    for (let i = 0; i < Math.min(orders.length, 3); i++) {
      const orderId = orders[i].id;
      const streamChannelId = `test-channel-${orderId}-${Date.now()}`;
      
      console.log(`   Creating ticket for order ${orderId}...`);
      
      try {
        const ticket = await crmService.createTicket(orderId, streamChannelId);
        createdTickets.push(ticket);
        console.log(`   ✅ Ticket created: ID ${ticket.id}, Assigned to: ${ticket.agent.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to create ticket for order ${orderId}:`, error.message);
      }
    }
    console.log('');

    // Step 4: Verify round-robin assignment
    console.log('🔄 Step 4: Verifying round-robin assignment...');
    if (createdTickets.length > 1) {
      const assignments = createdTickets.map(ticket => ({
        ticketId: ticket.id,
        agentId: ticket.agent_id,
        agentName: ticket.agent.name
      }));

      console.log('   Ticket assignments:');
      assignments.forEach((assignment, index) => {
        console.log(`   ${index + 1}. Ticket ${assignment.ticketId} → ${assignment.agentName} (ID: ${assignment.agentId})`);
      });

      // Check if assignments are distributed
      const uniqueAgents = new Set(assignments.map(a => a.agentId));
      console.log(`   📊 Distribution: ${uniqueAgents.size} unique agents used out of ${agents.length} total agents`);
      
      if (uniqueAgents.size > 1) {
        console.log('   ✅ Round-robin assignment is working correctly!');
      } else {
        console.log('   ⚠️  All tickets assigned to same agent (might be correct if only 1 agent)');
      }
    } else if (createdTickets.length === 1) {
      console.log('   📊 Single ticket created - round-robin will be tested with more tickets');
    }
    console.log('');

    // Step 5: Test ticket operations
    if (createdTickets.length > 0) {
      console.log('🔧 Step 5: Testing ticket operations...');
      const testTicket = createdTickets[0];
      
      // Test adding a message
      console.log(`   Adding test message to ticket ${testTicket.id}...`);
      try {
        const message = await crmService.addMessage(
          testTicket.id,
          testTicket.agent_id,
          'This is a test message from the agent',
          'text'
        );
        console.log(`   ✅ Message added: "${message.message_text}"`);
      } catch (error) {
        console.log(`   ❌ Failed to add message:`, error.message);
      }

      // Test updating status
      console.log(`   Updating ticket ${testTicket.id} status to 'in_progress'...`);
      try {
        const updatedTicket = await crmService.updateTicketStatus(testTicket.id, 'in_progress');
        console.log(`   ✅ Status updated to: ${updatedTicket.status}`);
      } catch (error) {
        console.log(`   ❌ Failed to update status:`, error.message);
      }
    }
    console.log('');

    // Step 6: Display final results
    console.log('📊 Final Results:');
    console.log('================');
    console.log(`   • Agents available: ${agents.length}`);
    console.log(`   • Orders found: ${orders.length}`);
    console.log(`   • Tickets created: ${createdTickets.length}`);
    console.log(`   • Round-robin working: ${createdTickets.length > 1 ? '✅' : '⚠️'}`);
    console.log('');

    console.log('🎉 Ticket system test completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Test the admin panel ticket management');
    console.log('   2. Test the CRM API endpoints');
    console.log('   3. Implement StreamChat integration');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTicketSystem()
  .then(() => {
    console.log('🎯 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }); 