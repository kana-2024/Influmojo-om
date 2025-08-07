const jwt = require('jsonwebtoken');

function generateSuperAdminJWTSimple() {
  try {
    console.log('🔐 Generating JWT token for Super Admin (Simple Mode)...');
    console.log('');

    // Super admin user details (you can modify these)
    const superAdminData = {
      userId: '1', // Default super admin ID
      user_type: 'super_admin',
      email: 'admin@influmojo.com',
      name: 'Super Admin'
    };

    console.log('📋 Using super admin data:');
    console.log(`   ID: ${superAdminData.userId}`);
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Name: ${superAdminData.name}`);
    console.log(`   User Type: ${superAdminData.user_type}`);
    console.log('');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: superAdminData.userId, 
        user_type: superAdminData.user_type, 
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

    console.log('🎉 JWT generation completed successfully!');
    return token;

  } catch (error) {
    console.error('❌ Error generating JWT:', error);
    throw error;
  }
}

// Run the script
try {
  const token = generateSuperAdminJWTSimple();
  if (token) {
    process.exit(0);
  }
} catch (error) {
  console.error('💥 JWT generation failed:', error);
  process.exit(1);
}
