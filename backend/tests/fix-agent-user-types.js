const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function fixAgentUserTypes() {
  try {
    console.log('🔍 Checking for agents that need user_type update...');
    
    // Find all users with user_type: 'agent'
    const agentUsers = await prisma.user.findMany({
      where: {
        user_type: 'agent'
      },
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
        status: true
      }
    });

    if (agentUsers.length === 0) {
      console.log('✅ No agents found that need updating');
      return;
    }

    console.log(`📊 Found ${agentUsers.length} agents with user_type: 'agent' that need updating:`);
    agentUsers.forEach(user => {
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Current User Type: ${user.user_type}`);
      console.log('');
    });

    // Update all agents to have user_type: 'admin'
    console.log('🔄 Updating agents to user_type: "admin"...');
    
    const updatePromises = agentUsers.map(user => 
      prisma.user.update({
        where: { id: user.id },
        data: { user_type: 'admin' }
      })
    );

    const updatedUsers = await Promise.all(updatePromises);

    console.log(`✅ Successfully updated ${updatedUsers.length} agents:`);
    updatedUsers.forEach(user => {
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Updated User Type: ${user.user_type}`);
      console.log('');
    });

    // Verify the update
    const verifyAdmins = await prisma.user.findMany({
      where: {
        user_type: 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
        status: true
      }
    });

    console.log(`🎯 Verification: Found ${verifyAdmins.length} users with user_type: 'admin'`);
    console.log('✅ Agent user types have been successfully updated!');
    console.log('💡 Ticket assignment should now work properly.');

  } catch (error) {
    console.error('❌ Error updating agent user types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixAgentUserTypes()
  .then(() => {
    console.log('🎉 Agent user type fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Agent user type fix failed:', error);
    process.exit(1);
  }); 