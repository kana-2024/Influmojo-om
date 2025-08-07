const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function checkAgents() {
  try {
    console.log('🔍 Checking for agents in database...');
    
    // Check for agent users
    const agentUsers = await prisma.user.findMany({
      where: {
        user_type: 'agent'
      },
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
        status: true,
        created_at: true
      }
    });

    console.log(`📊 Found ${agentUsers.length} agent users:`);
    if (agentUsers.length > 0) {
      agentUsers.forEach(user => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   User Type: ${user.user_type}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No agent users found');
    }

    // Check for super_admin users
    const superAdminUsers = await prisma.user.findMany({
      where: {
        user_type: 'super_admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
        status: true,
        created_at: true
      }
    });

    console.log(`📊 Found ${superAdminUsers.length} super_admin users:`);
    if (superAdminUsers.length > 0) {
      superAdminUsers.forEach(user => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   User Type: ${user.user_type}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No super_admin users found');
    }

    // Summary
    const totalAgents = agentUsers.length + superAdminUsers.length;
    console.log(`🎯 Summary: ${totalAgents} total agent/admin users found`);
    
    if (totalAgents === 0) {
      console.log('💡 No agents found. You need to create agent users for ticket assignment.');
      console.log('   Run: node create-admin-users.js to create agent users');
    } else if (agentUsers.length === 0) {
      console.log('💡 No agent users found. The CRM service needs users with user_type: "agent"');
      console.log('   Run: node create-admin-users.js to create agent users');
    } else {
      console.log('✅ Agent users found. Ticket assignment should work.');
    }

  } catch (error) {
    console.error('❌ Error checking agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkAgents()
  .then(() => {
    console.log('🎉 Agent check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Agent check failed:', error);
    process.exit(1);
  }); 