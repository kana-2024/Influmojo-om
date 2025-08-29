const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function updateExistingAgents() {
  try {
    console.log('🔍 Updating existing agents to correct user_type...');
    
    // Find all users that should be agents (by name or email containing 'agent')
    const potentialAgents = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'agent' } },
          { name: { contains: 'agent' } }
        ],
        user_type: { not: 'agent' } // Only update those that aren't already agents
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
        status: true
      }
    });

    console.log(`Found ${potentialAgents.length} potential agents to update:`);
    
    for (const user of potentialAgents) {
      console.log(`\n🔄 Updating user ${user.id} (${user.name} - ${user.email}):`);
      console.log(`   Current user_type: ${user.user_type}`);
      
      // Update the user to be an agent
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { user_type: 'agent' },
        select: {
          id: true,
          name: true,
          email: true,
          user_type: true
        }
      });
      
      console.log(`   ✅ Updated to user_type: ${updatedUser.user_type}`);
    }

    // Also check for any users with user_type: 'admin' that should be agents
    const adminAgents = await prisma.user.findMany({
      where: {
        user_type: 'admin',
        OR: [
          { email: { contains: 'agent' } },
          { name: { contains: 'agent' } }
        ]
      }
    });

    if (adminAgents.length > 0) {
      console.log(`\n🔍 Found ${adminAgents.length} admin users that should be agents:`);
      
      for (const user of adminAgents) {
        console.log(`   - ${user.name} (${user.email})`);
      }
    }

    console.log('\n✅ Agent update completed!');

  } catch (error) {
    console.error('❌ Error updating agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingAgents(); 