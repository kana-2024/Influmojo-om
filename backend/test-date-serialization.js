const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function testDateSerialization() {
  try {
    console.log('🧪 Testing Date Serialization');
    console.log('==============================');
    console.log('');

    // Get a ticket to test serialization
    const ticket = await prisma.ticket.findFirst({
      include: {
        agent: { select: { name: true } }
      }
    });

    if (!ticket) {
      console.log('❌ No tickets found to test');
      return;
    }

    console.log('📋 Original Ticket Data:');
    console.log(`   ID: ${ticket.id} (type: ${typeof ticket.id})`);
    console.log(`   Created At: ${ticket.created_at} (type: ${typeof ticket.created_at})`);
    console.log(`   Updated At: ${ticket.updated_at} (type: ${typeof ticket.updated_at})`);
    console.log('');

    // Simulate the serialization that happens in server.js
    const serializeData = (obj) => {
      if (obj === null || obj === undefined) {
        return obj;
      }
      if (typeof obj === 'bigint') {
        return obj.toString();
      }
      if (obj instanceof Date) {
        return obj.toISOString();
      }
      if (Array.isArray(obj)) {
        return obj.map(serializeData);
      }
      if (typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            result[key] = serializeData(obj[key]);
          }
        }
        return result;
      }
      return obj;
    };

    const serializedTicket = serializeData(ticket);
    
    console.log('📋 Serialized Ticket Data:');
    console.log(`   ID: ${serializedTicket.id} (type: ${typeof serializedTicket.id})`);
    console.log(`   Created At: ${serializedTicket.created_at} (type: ${typeof serializedTicket.created_at})`);
    console.log(`   Updated At: ${serializedTicket.updated_at} (type: ${typeof serializedTicket.updated_at})`);
    console.log('');

    // Test parsing the serialized dates in frontend
    console.log('📋 Frontend Date Parsing Test:');
    const frontendCreated = new Date(serializedTicket.created_at);
    const frontendUpdated = new Date(serializedTicket.updated_at);
    
    console.log(`   Created At Parsed: ${frontendCreated}`);
    console.log(`   Updated At Parsed: ${frontendUpdated}`);
    console.log(`   Created At Valid: ${!isNaN(frontendCreated.getTime())}`);
    console.log(`   Updated At Valid: ${!isNaN(frontendUpdated.getTime())}`);
    console.log(`   Created At toLocaleDateString: ${frontendCreated.toLocaleDateString()}`);
    console.log(`   Updated At toLocaleDateString: ${frontendUpdated.toLocaleDateString()}`);
    console.log('');

    console.log('✅ Date serialization test completed!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDateSerialization()
  .then(() => {
    console.log('🎯 Date serialization test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Date serialization test failed:', error);
    process.exit(1);
  }); 