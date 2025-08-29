const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function checkPortfolioItems() {
  try {
    console.log('🔍 Checking portfolio items in database...');
    
    // Get all portfolio items
    const allPortfolioItems = await prisma.portfolioItem.findMany({
      include: {
        creator: {
          include: {
            user: true
          }
        },
        brand: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`📊 Total portfolio items: ${allPortfolioItems.length}`);
    
    // Separate by type
    const creatorItems = allPortfolioItems.filter(item => item.creator_id);
    const brandItems = allPortfolioItems.filter(item => item.brand_id);
    
    console.log(`👤 Creator portfolio items: ${creatorItems.length}`);
    console.log(`🏢 Brand portfolio items: ${brandItems.length}`);
    
    if (brandItems.length > 0) {
      console.log('\n🏢 Brand portfolio items:');
      brandItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id}`);
        console.log(`     Title: ${item.title}`);
        console.log(`     Brand: ${item.brand?.user?.name || 'Unknown'}`);
        console.log(`     Media URL: ${item.media_url}`);
        console.log(`     Created: ${item.created_at}`);
        console.log('');
      });
    }
    
    if (creatorItems.length > 0) {
      console.log('\n👤 Creator portfolio items:');
      creatorItems.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id}`);
        console.log(`     Title: ${item.title}`);
        console.log(`     Creator: ${item.creator?.user?.name || 'Unknown'}`);
        console.log(`     Media URL: ${item.media_url}`);
        console.log(`     Created: ${item.created_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking portfolio items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPortfolioItems(); 