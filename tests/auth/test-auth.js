const jwt = require('jsonwebtoken');
const { PrismaClient } = require('./src/generated/client');

// Test JWT token generation and verification
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const prisma = new PrismaClient();

async function generateTestToken() {
  try {
    // Find the super_admin user in the database
    const superAdmin = await prisma.user.findFirst({
      where: {
        user_type: 'super_admin'
      }
    });

    if (!superAdmin) {
      console.log('❌ No super_admin user found in database!');
      console.log('💡 Run: node create-super-admin.js to create one');
      return;
    }

    // Test user data from database
    const testUser = {
      id: superAdmin.id.toString(), // Convert BigInt to string
      email: superAdmin.email,
      user_type: superAdmin.user_type
    };

    // Generate a test token
    const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });

    console.log('🔐 Authentication Test Script');
    console.log('=============================');
    console.log('');

    console.log('✅ Test User Data:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('');

    console.log('🔑 Generated JWT Token:');
    console.log(token);
    console.log('');

    console.log('🔍 Token Verification:');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token is valid!');
      console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }

    console.log('');
    console.log('📋 Usage Instructions:');
    console.log('1. Use this token in the Authorization header:');
    console.log(`   Authorization: Bearer ${token}`);
    console.log('');
    console.log('2. Test the admin endpoints:');
    console.log('   GET  http://localhost:3002/api/admin/agents');
    console.log('   POST http://localhost:3002/api/admin/agents');
    console.log('');
    console.log('3. Test the CRM endpoints:');
    console.log('   GET  http://localhost:3002/api/crm/tickets');
    console.log('   POST http://localhost:3002/api/crm/tickets');
    console.log('');

    console.log('🎯 Expected Behavior:');
    console.log('- With valid token: 200 OK');
    console.log('- With invalid token: 403 Forbidden');
    console.log('- Without token: 401 Unauthorized');
    console.log('- With non-admin token: 403 Access denied');

  } catch (error) {
    console.error('❌ Error generating test token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateTestToken()
  .then(() => {
    console.log('🎉 Test token generation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test token generation failed:', error);
    process.exit(1);
  }); 