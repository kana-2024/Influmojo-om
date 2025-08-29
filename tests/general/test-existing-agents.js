const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function checkExistingAgents() {
  try {
    console.log('🔍 Checking existing agents in database...');
    
    // Get all users with agent type
    const agents = await prisma.user.findMany({
      where: {
        user_type: 'agent'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
        status: true,
        created_at: true
      }
    });

    console.log(`✅ Found ${agents.length} agents in database:`);
    
    agents.forEach((agent, index) => {
      console.log(`\n${index + 1}. Agent Details:`);
      console.log(`   ID: ${agent.id.toString()}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   Phone: ${agent.phone}`);
      console.log(`   User Type: ${agent.user_type}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Created: ${agent.created_at.toISOString()}`);
    });

    // Also check for any users that might be agents but have different user_type
    const potentialAgents = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'agent' } },
          { name: { contains: 'agent' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
        status: true,
        created_at: true
      }
    });

    console.log(`\n🔍 Found ${potentialAgents.length} potential agents (by name/email):`);
    
    potentialAgents.forEach((user, index) => {
      console.log(`\n${index + 1}. Potential Agent:`);
      console.log(`   ID: ${user.id.toString()}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   User Type: ${user.user_type}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.created_at.toISOString()}`);
    });

  } catch (error) {
    console.error('❌ Error checking existing agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingAgents(); 