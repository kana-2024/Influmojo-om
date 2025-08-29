const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking current users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        user_type: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.user_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 