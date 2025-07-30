#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Zoho Chat Integration Setup for Influ Mojo\n');
console.log('This script will help you configure Zoho integration.\n');

const questions = [
  {
    name: 'zohoClientId',
    question: 'Enter your Zoho Client ID: ',
    required: true
  },
  {
    name: 'zohoClientSecret',
    question: 'Enter your Zoho Client Secret: ',
    required: true
  },
  {
    name: 'zohoRefreshToken',
    question: 'Enter your Zoho Refresh Token: ',
    required: true
  },
  {
    name: 'zohoChatLicense',
    question: 'Enter your Zoho Chat License Key: ',
    required: true
  },
  {
    name: 'zohoChatDepartment',
    question: 'Enter your Zoho Chat Department ID: ',
    required: true
  },
  {
    name: 'zohoWebhookSecret',
    question: 'Enter your Zoho Webhook Secret (optional): ',
    required: false
  }
];

const answers = {};

async function askQuestion(questionObj) {
  return new Promise((resolve) => {
    rl.question(questionObj.question, (answer) => {
      if (questionObj.required && !answer.trim()) {
        console.log('❌ This field is required. Please try again.');
        askQuestion(questionObj).then(resolve);
      } else {
        answers[questionObj.name] = answer.trim();
        resolve();
      }
    });
  });
}

async function setupEnvironment() {
  console.log('📝 Setting up environment variables...\n');

  // Ask all questions
  for (const question of questions) {
    await askQuestion(question);
  }

  // Create backend .env file
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const backendEnvContent = `# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/influmojo-test"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_VERIFY_SERVICE_SID="your-twilio-verify-service-sid"

# Zoho CRM Configuration
ZOHO_CLIENT_ID="${answers.zohoClientId}"
ZOHO_CLIENT_SECRET="${answers.zohoClientSecret}"
ZOHO_REFRESH_TOKEN="${answers.zohoRefreshToken}"
ZOHO_BASE_URL="https://www.zohoapis.in"
ZOHO_CHAT_BASE_URL="https://salesiq.zoho.in"

# Zoho Chat Configuration
ZOHO_CHAT_LICENSE="${answers.zohoChatLicense}"
ZOHO_CHAT_DEPARTMENT="${answers.zohoChatDepartment}"
ZOHO_WEBHOOK_SECRET="${answers.zohoWebhookSecret || ''}"

# Server Configuration
PORT=3002
NODE_ENV=development
`;

  // Create mobile .env file
  const mobileEnvPath = path.join(__dirname, 'mobile', '.env');
  const mobileEnvContent = `# API Configuration
EXPO_PUBLIC_API_URL="http://localhost:3002"

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID="your-google-client-id-android"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS="your-google-client-id-ios"

# Zoho Chat Widget Configuration
EXPO_PUBLIC_ZOHO_CHAT_LICENSE="${answers.zohoChatLicense}"
EXPO_PUBLIC_ZOHO_CHAT_DEPARTMENT="${answers.zohoChatDepartment}"
`;

  try {
    // Write backend .env
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Backend .env file created successfully');

    // Write mobile .env
    fs.writeFileSync(mobileEnvPath, mobileEnvContent);
    console.log('✅ Mobile .env file created successfully');

    console.log('\n🎉 Environment setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your database URL in backend/.env');
    console.log('2. Update your Google OAuth credentials');
    console.log('3. Update your Twilio credentials (if using SMS)');
    console.log('4. Run database migration: cd backend && npm run db:migrate');
    console.log('5. Test the integration: cd backend && npm start');

  } catch (error) {
    console.error('❌ Error creating environment files:', error.message);
  }

  rl.close();
}

// Run the setup
setupEnvironment().catch(console.error);