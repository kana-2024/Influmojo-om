const jwt = require('jsonwebtoken');

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNiIsInVzZXJfdHlwZSI6ImFnZW50IiwiaWF0IjoxNzU0NDY5MDg4OTE3LCJleHAiOjE3NTQ0Njk2OTM3MTd9.UdwXbOaoC48kylmTPoNTzno0vx5wOP4VTwu4OYS03QY';

function testJWT() {
  try {
    console.log('🔍 Testing JWT token...');
    
    const decoded = jwt.verify(TEST_TOKEN, process.env.JWT_SECRET || 'your_jwt_secret');
    
    console.log('✅ JWT token decoded successfully:');
    console.log('User ID:', decoded.userId);
    console.log('User Type:', decoded.user_type);
    console.log('Issued At:', new Date(decoded.iat).toISOString());
    console.log('Expires At:', new Date(decoded.exp).toISOString());
    
  } catch (error) {
    console.error('❌ JWT token verification failed:', error.message);
  }
}

testJWT(); 