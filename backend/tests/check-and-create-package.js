const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

async function checkAndCreatePackage() {
  try {
    console.log('🔍 Checking for existing packages...');
    
    const packages = await prisma.package.findMany();
    console.log(`Found ${packages.length} packages`);
    
    if (packages.length === 0) {
      console.log('❌ No packages found. Creating one...');
      
      // Get existing creator
      const creators = await prisma.creatorProfile.findMany({ take: 1 });
      if (creators.length === 0) {
        console.log('❌ No creators found!');
        return;
      }
      
      const package = await prisma.package.create({
        data: {
          creator_id: creators[0].id,
          type: 'predefined',
          title: 'Test Package',
          description: 'A test package for CRM testing',
          price: 150.00,
          currency: 'USD'
        }
      });
      
      console.log(`✅ Package created: ${package.title} (ID: ${package.id})`);
    } else {
      console.log('✅ Packages already exist');
      packages.forEach(pkg => {
        console.log(`   - ${pkg.title} (ID: ${pkg.id})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreatePackage(); 