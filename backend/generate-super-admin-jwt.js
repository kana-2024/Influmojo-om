const jwt = require('jsonwebtoken');
const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function generateSuperAdminJWT() {
  try {
    console.log('🔐 Generating JWT token for Super Admin...');
    console.log('');

    // Check if super admin user exists
    const superAdmin = await prisma.user.findFirst({
      where: {
        user_type: 'super_admin'
      }
    });

    if (!superAdmin) {
      console.log('❌ No super admin user found!');
      console.log('');
      console.log('💡 Please create a super admin user first:');
      console.log('   node create-super-admin.js');
      console.log('');
      return;
    }

    console.log('✅ Found super admin user:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   User Type: ${superAdmin.user_type}`);
    console.log(`   Status: ${superAdmin.status}`);
    console.log('');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: superAdmin.id.toString(), 
        user_type: superAdmin.user_type, 
        iat: Date.now() 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    console.log('🎯 Generated JWT Token:');
    console.log('=' .repeat(80));
    console.log(token);
    console.log('=' .repeat(80));
    console.log('');

    // Decode token to show payload
    const decoded = jwt.decode(token);
    console.log('📋 Token Payload:');
    console.log(JSON.stringify(decoded, null, 2));
    console.log('');

    console.log('🔑 Usage Instructions:');
    console.log('1. Copy the token above');
    console.log('2. Use it in the Authorization header:');
    console.log(`   Authorization: Bearer ${token}`);
    console.log('');
    console.log('🌐 For Admin Dashboard:');
    console.log('1. Open your admin dashboard');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to Application/Storage tab');
    console.log('4. Find localStorage or sessionStorage');
    console.log('5. Add/update the authToken key with the token above');
    console.log('');
    console.log('📱 For Mobile App Testing:');
    console.log('1. Use the token in API requests');
    console.log('2. Add to Authorization header');
    console.log('3. Token expires in 7 days');
    console.log('');

    // Test the token
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('✅ Token verification successful!');
      console.log(`   Expires: ${new Date(verified.exp * 1000).toLocaleString()}`);
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError.message);
    }

    return token;

  } catch (error) {
    console.error('❌ Error generating JWT:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateSuperAdminJWT()
  .then((token) => {
    if (token) {
      console.log('🎉 JWT generation completed successfully!');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 JWT generation failed:', error);
    process.exit(1);
  });
