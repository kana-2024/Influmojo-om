const { PrismaClient } = require('./src/generated/client');
const agentService = require('./src/services/agentService');
const crmService = require('./src/services/crmService');

const prisma = new PrismaClient();

async function testAdminPanelFixes() {
  try {
    console.log('🧪 Testing Admin Panel Fixes');
    console.log('============================');
    console.log('');

    // Step 1: Check current agents
    console.log('🔍 Step 1: Checking current agents...');
    const currentAgents = await prisma.user.findMany({
      where: { user_type: 'admin' },
      select: { id: true, name: true, email: true, status: true }
    });

    console.log(`   Found ${currentAgents.length} agents:`);
    currentAgents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.email}) - Status: ${agent.status}`);
    });
    console.log('');

    // Step 2: Create additional test agents if needed
    console.log('🔍 Step 2: Creating additional test agents...');
    
    const testAgents = [
      { name: 'Test Agent 1', email: 'test-agent-1@influmojo.com' },
      { name: 'Test Agent 2', email: 'test-agent-2@influmojo.com' },
      { name: 'Test Agent 3', email: 'test-agent-3@influmojo.com' }
    ];

    let createdAgents = 0;
    for (const agentData of testAgents) {
      try {
        const existingAgent = await prisma.user.findUnique({
          where: { email: agentData.email }
        });

        if (!existingAgent) {
          await agentService.createAgent(agentData.email, agentData.name, 1); // Using user ID 1 as super admin
          console.log(`   ✅ Created agent: ${agentData.name}`);
          createdAgents++;
        } else {
          console.log(`   ⚠️ Agent already exists: ${agentData.name}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to create agent ${agentData.name}:`, error.message);
      }
    }
    console.log('');

    // Step 3: Test agent statistics
    console.log('🔍 Step 3: Testing agent statistics...');
    const stats = await agentService.getAgentStats();
    console.log('   Agent Statistics:');
    console.log(`   - Total Agents: ${stats.total_agents}`);
    console.log(`   - Active Agents: ${stats.active_agents}`);
    console.log(`   - Suspended Agents: ${stats.suspended_agents}`);
    console.log(`   - Pending Agents: ${stats.pending_agents}`);
    console.log(`   - Average Tickets per Agent: ${stats.avg_tickets_per_agent}`);
    console.log(`   - Total Tickets: ${stats.total_tickets}`);
    console.log('');

    // Step 4: Check current tickets
    console.log('🔍 Step 4: Checking current tickets...');
    const currentTickets = await prisma.ticket.findMany({
      include: {
        agent: { select: { name: true, email: true } },
        order: { select: { id: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    console.log(`   Found ${currentTickets.length} tickets (showing latest 5):`);
    currentTickets.forEach(ticket => {
      const createdDate = new Date(ticket.created_at).toLocaleDateString();
      const updatedDate = new Date(ticket.updated_at).toLocaleDateString();
      const createdTimestamp = new Date(ticket.created_at).toLocaleString();
      const updatedTimestamp = new Date(ticket.updated_at).toLocaleString();
      console.log(`   - Ticket #${ticket.id}: Order #${ticket.order_id}`);
      console.log(`     Agent: ${ticket.agent?.name || 'Unassigned'}`);
      console.log(`     Status: ${ticket.status}`);
      console.log(`     Created: ${createdDate} (${createdTimestamp})`);
      console.log(`     Updated: ${updatedDate} (${updatedTimestamp})`);
    });
    console.log('');

    // Step 5: Create a test ticket if needed
    console.log('🔍 Step 5: Creating test ticket...');
    
    // Check if we have any orders to create tickets for
    const orders = await prisma.order.findMany({ take: 1 });
    
    if (orders.length > 0) {
      try {
        const streamChannelId = `test-channel-${Date.now()}`;
        const ticket = await crmService.createTicket(orders[0].id, streamChannelId);
        console.log(`   ✅ Created test ticket #${ticket.id} for order #${orders[0].id}`);
        console.log(`   - Status: ${ticket.status}`);
        console.log(`   - Assigned to: ${ticket.agent?.name || 'Unassigned'}`);
        console.log(`   - Created: ${new Date(ticket.created_at).toLocaleDateString()}`);
      } catch (error) {
        console.log(`   ❌ Failed to create test ticket:`, error.message);
      }
    } else {
      console.log('   ⚠️ No orders found to create tickets for');
    }
    console.log('');

    // Step 6: Final verification
    console.log('🔍 Step 6: Final verification...');
    const finalStats = await agentService.getAgentStats();
    const finalTickets = await prisma.ticket.count();
    
    console.log('   Final Statistics:');
    console.log(`   - Total Agents: ${finalStats.total_agents}`);
    console.log(`   - Total Tickets: ${finalTickets}`);
    console.log(`   - Average Tickets per Agent: ${finalStats.avg_tickets_per_agent}`);
    console.log('');

    console.log('✅ Admin panel fixes test completed!');
    console.log('');
    console.log('💡 What to check in the admin panel:');
    console.log('   1. Agent count should show the correct number');
    console.log('   2. Ticket dates should display properly (not "Invalid Date")');
    console.log('   3. Statistics should reflect real data');
    console.log('   4. All agents should be listed with correct status');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAdminPanelFixes()
  .then(() => {
    console.log('🎯 Admin panel fixes test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Admin panel fixes test failed:', error);
    process.exit(1);
  }); 