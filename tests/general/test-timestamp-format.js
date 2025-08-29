const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function testTimestampFormat() {
  try {
    console.log('🧪 Testing Timestamp Format');
    console.log('===========================');
    console.log('');

    // Get a ticket to test timestamp formatting
    const ticket = await prisma.ticket.findFirst({
      include: {
        agent: { select: { name: true } }
      }
    });

    if (!ticket) {
      console.log('❌ No tickets found to test');
      return;
    }

    console.log('📋 Ticket Data:');
    console.log(`   ID: ${ticket.id}`);
    console.log(`   Agent: ${ticket.agent?.name || 'Unassigned'}`);
    console.log(`   Status: ${ticket.status}`);
    console.log('');

    // Test different date formats
    const created = new Date(ticket.created_at);
    const updated = new Date(ticket.updated_at);

    console.log('📅 Date Formatting Examples:');
    console.log(`   Created At (Date only): ${created.toLocaleDateString()}`);
    console.log(`   Created At (Date + Time): ${created.toLocaleString()}`);
    console.log(`   Created At (ISO): ${created.toISOString()}`);
    console.log(`   Created At (UTC): ${created.toUTCString()}`);
    console.log('');
    console.log(`   Updated At (Date only): ${updated.toLocaleDateString()}`);
    console.log(`   Updated At (Date + Time): ${updated.toLocaleString()}`);
    console.log(`   Updated At (ISO): ${updated.toISOString()}`);
    console.log(`   Updated At (UTC): ${updated.toUTCString()}`);
    console.log('');

    // Test the format that will be used in admin panel
    console.log('🎯 Admin Panel Format (toLocaleString):');
    console.log(`   Created: ${created.toLocaleString()}`);
    console.log(`   Updated: ${updated.toLocaleString()}`);
    console.log('');

    console.log('✅ Timestamp format test completed!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTimestampFormat()
  .then(() => {
    console.log('🎯 Timestamp format test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Timestamp format test failed:', error);
    process.exit(1);
  }); 