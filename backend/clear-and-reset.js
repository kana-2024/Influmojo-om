const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function clearAndReset() {
  try {
    console.log('🧹 Starting database cleanup and reset...');
    
    // Step 1: Find super admin user to preserve
    const superAdmin = await prisma.user.findFirst({
      where: {
        user_type: 'super_admin'
      }
    });

    if (!superAdmin) {
      console.log('❌ No super admin user found! Please run create-super-admin.js first.');
      return;
    }

    console.log(`✅ Found super admin: ${superAdmin.name} (${superAdmin.email})`);

    // Step 2: Clear all tickets and related data
    console.log('\n🗑️ Clearing tickets and related data...');
    
    // Delete messages (related to tickets)
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`   Deleted ${deletedMessages.count} messages`);

    // Delete tickets
    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`   Deleted ${deletedTickets.count} tickets`);

    // Step 3: Clear all orders and related data
    console.log('\n📦 Clearing orders and related data...');
    
    // Delete payments (related to orders)
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   Deleted ${deletedPayments.count} payments`);

    // Delete invoices (related to orders)
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`   Deleted ${deletedInvoices.count} invoices`);

    // Delete orders
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   Deleted ${deletedOrders.count} orders`);

    // Step 4: Clear other related data
    console.log('\n🧹 Clearing other related data...');
    
    // Delete notifications
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`   Deleted ${deletedNotifications.count} notifications`);

    // Delete phone verifications
    const deletedPhoneVerifications = await prisma.phoneVerification.deleteMany({});
    console.log(`   Deleted ${deletedPhoneVerifications.count} phone verifications`);

    // Delete reviews
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`   Deleted ${deletedReviews.count} reviews`);

    // Delete content reviews
    const deletedContentReviews = await prisma.contentReview.deleteMany({});
    console.log(`   Deleted ${deletedContentReviews.count} content reviews`);

    // Delete content submissions
    const deletedContentSubmissions = await prisma.contentSubmission.deleteMany({});
    console.log(`   Deleted ${deletedContentSubmissions.count} content submissions`);

    // Delete collaborations
    const deletedCollaborations = await prisma.collaboration.deleteMany({});
    console.log(`   Deleted ${deletedCollaborations.count} collaborations`);

    // Delete campaign applications
    const deletedCampaignApplications = await prisma.campaignApplication.deleteMany({});
    console.log(`   Deleted ${deletedCampaignApplications.count} campaign applications`);

    // Delete campaigns
    const deletedCampaigns = await prisma.campaign.deleteMany({});
    console.log(`   Deleted ${deletedCampaigns.count} campaigns`);

    // Delete packages
    const deletedPackages = await prisma.package.deleteMany({});
    console.log(`   Deleted ${deletedPackages.count} packages`);

    // Delete portfolio items
    const deletedPortfolioItems = await prisma.portfolioItem.deleteMany({});
    console.log(`   Deleted ${deletedPortfolioItems.count} portfolio items`);

    // Delete social media accounts
    const deletedSocialMediaAccounts = await prisma.socialMediaAccount.deleteMany({});
    console.log(`   Deleted ${deletedSocialMediaAccounts.count} social media accounts`);

    // Delete KYC records
    const deletedKYC = await prisma.kYC.deleteMany({});
    console.log(`   Deleted ${deletedKYC.count} KYC records`);

    // Delete creator profiles
    const deletedCreatorProfiles = await prisma.creatorProfile.deleteMany({});
    console.log(`   Deleted ${deletedCreatorProfiles.count} creator profiles`);

    // Delete brand profiles
    const deletedBrandProfiles = await prisma.brandProfile.deleteMany({});
    console.log(`   Deleted ${deletedBrandProfiles.count} brand profiles`);

    // Step 5: Clear all users except super admin
    console.log('\n👥 Clearing all users except super admin...');
    
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          not: superAdmin.id
        }
      }
    });
    console.log(`   Deleted ${deletedUsers.count} users (preserved super admin)`);

    // Step 6: Create new agents
    console.log('\n👨‍💼 Creating new agents...');
    
    const agents = [
      {
        name: 'John Agent',
        email: 'john.agent@influmojo.com',
        password: 'agent123',
        phone: '+1234567890'
      },
      {
        name: 'Sarah Agent',
        email: 'sarah.agent@influmojo.com',
        password: 'agent123',
        phone: '+1234567891'
      },
      {
        name: 'Mike Agent',
        email: 'mike.agent@influmojo.com',
        password: 'agent123',
        phone: '+1234567892'
      },
      {
        name: 'Lisa Agent',
        email: 'lisa.agent@influmojo.com',
        password: 'agent123',
        phone: '+1234567893'
      },
      {
        name: 'David Agent',
        email: 'david.agent@influmojo.com',
        password: 'agent123',
        phone: '+1234567894'
      }
    ];

    const createdAgents = [];
    
    for (const agentData of agents) {
      try {
        const hashedPassword = await bcrypt.hash(agentData.password, 10);
        
        const agent = await prisma.user.create({
          data: {
            name: agentData.name,
            email: agentData.email,
            password_hash: hashedPassword,
            user_type: 'agent',
            status: 'active',
            email_verified: true,
            phone: agentData.phone,
            phone_verified: true,
            onboarding_completed: true
          }
        });

        createdAgents.push(agent);
        console.log(`   ✅ Created agent: ${agent.name} (${agent.email})`);
      } catch (error) {
        console.log(`   ❌ Failed to create agent ${agentData.name}: ${error.message}`);
      }
    }

    // Step 7: Summary
    console.log('\n🎉 Database cleanup and reset completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Preserved super admin: ${superAdmin.name}`);
    console.log(`   • Created ${createdAgents.length} new agents`);
    console.log(`   • Cleared all tickets, orders, and related data`);
    
    console.log('\n🔑 Agent Login Credentials:');
    createdAgents.forEach(agent => {
      console.log(`   • ${agent.name}: ${agent.email} / agent123`);
    });

    console.log('\n🚀 You can now:');
    console.log('   1. Login as super admin: admin@influmojo.com / admin123');
    console.log('   2. Login as any agent using the credentials above');
    console.log('   3. Start fresh with a clean database');

  } catch (error) {
    console.error('❌ Error during cleanup and reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAndReset()
  .then(() => {
    console.log('\n✅ Cleanup and reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup and reset failed:', error);
    process.exit(1);
  }); 