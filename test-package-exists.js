const { PrismaClient } = require('./backend/src/generated/client');

const prisma = new PrismaClient();

async function checkPackageExists() {
  try {
    console.log('🔍 Checking if package exists...');
    
    const packageId = '1753561518396';
    console.log(`Looking for package ID: ${packageId}`);
    
    // Check with BigInt
    const package = await prisma.package.findFirst({
      where: {
        id: BigInt(packageId),
        is_active: true
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (package) {
      console.log('✅ Package found!');
      console.log('Package details:', {
        id: package.id.toString(),
        title: package.title,
        description: package.description,
        price: package.price.toString(),
        currency: package.currency,
        is_active: package.is_active,
        creator: {
          id: package.creator.id.toString(),
          user: package.creator.user
        }
      });
    } else {
      console.log('❌ Package not found or inactive');
      
      // Let's check if it exists but is inactive
      const inactivePackage = await prisma.package.findFirst({
        where: {
          id: BigInt(packageId),
          is_active: false
        }
      });
      
      if (inactivePackage) {
        console.log('⚠️ Package exists but is inactive');
        console.log('Package details:', {
          id: inactivePackage.id.toString(),
          title: inactivePackage.title,
          is_active: inactivePackage.is_active
        });
      } else {
        console.log('❌ Package does not exist at all');
      }
      
      // Let's also check what packages exist
      const allPackages = await prisma.package.findMany({
        take: 5,
        orderBy: {
          created_at: 'desc'
        },
        select: {
          id: true,
          title: true,
          is_active: true,
          created_at: true
        }
      });
      
      console.log('📋 Recent packages in database:');
      allPackages.forEach(pkg => {
        console.log(`  - ID: ${pkg.id.toString()}, Title: ${pkg.title}, Active: ${pkg.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking package:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPackageExists(); 