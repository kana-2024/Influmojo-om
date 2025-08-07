const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId, userType = 'agent') => {
  return jwt.sign(
    { userId: userId.toString(), user_type: userType, iat: Date.now() },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' }
  );
};

async function createAgent() {
  try {
    console.log('🤖 Creating agent user...');

    // Agent details - you can modify these
    const agentData = {
      name: 'John Agent',
      email: 'agent@influmojo.com',
      phone: '+1234567890',
      user_type: 'agent',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      onboarding_completed: true,
      onboarding_step: 2
    };

    // Check if agent already exists
    const existingAgent = await prisma.user.findFirst({
      where: {
        OR: [
          { email: agentData.email },
          { phone: agentData.phone }
        ]
      }
    });

    if (existingAgent) {
      console.log('⚠️ Agent already exists with email or phone');
      console.log('Agent ID:', existingAgent.id.toString());
      console.log('Agent Name:', existingAgent.name);
      console.log('Agent Email:', existingAgent.email);
      console.log('Agent Type:', existingAgent.user_type);
      
      // Generate token for existing agent
      const token = generateToken(existingAgent.id, existingAgent.user_type);
      console.log('\n🎫 JWT Token for existing agent:');
      console.log(token);
      
      return;
    }

    // Create new agent
    const agent = await prisma.user.create({
      data: agentData
    });

    console.log('✅ Agent created successfully!');
    console.log('Agent ID:', agent.id.toString());
    console.log('Agent Name:', agent.name);
    console.log('Agent Email:', agent.email);
    console.log('Agent Type:', agent.user_type);

    // Generate JWT token
    const token = generateToken(agent.id, agent.user_type);
    console.log('\n🎫 JWT Token for agent login:');
    console.log(token);
    console.log('\n📝 Use this token to login to the agent dashboard at:');
    console.log('http://localhost:3000/agent');

  } catch (error) {
    console.error('❌ Error creating agent:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAgent(); 