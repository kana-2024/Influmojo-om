const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function testAgentUser() {
  try {
    console.log('🔍 Testing agent user...');
    
    // Check if agent exists
    const agent = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'agent@influmojo.com' },
          { phone: '+1234567890' }
        ]
      }
    });

    if (!agent) {
      console.log('❌ Agent user not found');
      return;
    }

    console.log('✅ Agent user found:');
    console.log('ID:', agent.id.toString());
    console.log('Name:', agent.name);
    console.log('Email:', agent.email);
    console.log('Phone:', agent.phone);
    console.log('User Type:', agent.user_type);
    console.log('Status:', agent.status);

    // Check if agent has any tickets assigned
    const tickets = await prisma.ticket.findMany({
      where: {
        agent_id: agent.id
      }
    });

    console.log('\n📋 Tickets assigned to agent:', tickets.length);
    
    if (tickets.length > 0) {
      console.log('Ticket IDs:', tickets.map(t => t.id.toString()));
    } else {
      console.log('No tickets assigned to this agent yet.');
    }

  } catch (error) {
    console.error('❌ Error testing agent user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAgentUser(); 