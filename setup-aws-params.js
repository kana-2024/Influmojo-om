#!/usr/bin/env node

/**
 * AWS Parameter Store Setup Script for Influmojo
 * 
 * This script helps you set up AWS Parameter Store for storing sensitive
 * environment variables securely instead of using .env files.
 * 
 * Usage:
 * 1. Install AWS SDK: npm install aws-sdk
 * 2. Configure AWS credentials: aws configure
 * 3. Run: node setup-aws-params.js
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// AWS Configuration
const region = process.env.AWS_REGION || 'us-east-1';
const ssm = new AWS.SSM({ region });

// Parameter Store path prefix
const PARAM_PREFIX = '/influmojo/prod';

// Sensitive parameters to store in Parameter Store
const SENSITIVE_PARAMS = {
  // Database
  [`${PARAM_PREFIX}/database-url`]: 'postgresql://username:password@your-aws-rds-endpoint:5432/influmojo-prod',
  
  // JWT and Session
  [`${PARAM_PREFIX}/jwt-secret`]: 'your-production-jwt-secret-here',
  [`${PARAM_PREFIX}/session-secret`]: 'your-production-session-secret-here',
  
  // Twilio
  [`${PARAM_PREFIX}/twilio-account-sid`]: 'your-twilio-account-sid',
  [`${PARAM_PREFIX}/twilio-auth-token`]: 'your-twilio-auth-token',
  [`${PARAM_PREFIX}/twilio-verify-service-sid`]: 'your-twilio-verify-service-sid',
  
  // Google OAuth
  [`${PARAM_PREFIX}/google-client-secret`]: 'your-google-client-secret',
  
  // Facebook OAuth
  [`${PARAM_PREFIX}/facebook-app-secret`]: 'your-facebook-app-secret',
  
  // SendGrid
  [`${PARAM_PREFIX}/sendgrid-api-key`]: 'your-sendgrid-api-key',
  
  // StreamChat
  [`${PARAM_PREFIX}/stream-api-secret`]: 'your-stream-api-secret',
  
  // AWS Credentials (if needed)
  [`${PARAM_PREFIX}/aws-access-key-id`]: 'your-aws-access-key',
  [`${PARAM_PREFIX}/aws-secret-access-key`]: 'your-aws-secret-access-key'
};

// Public parameters (safe to store in .env)
const PUBLIC_PARAMS = {
  // Server
  PORT: '3002',
  NODE_ENV: 'production',
  
  // Google OAuth (public)
  GOOGLE_CLIENT_ID: 'your_google_client_id_here',
  GOOGLE_ANDROID_CLIENT_ID: 'your_google_android_client_id_here',
  
  // Facebook OAuth (public)
  FACEBOOK_APP_ID: '1457804359003690',
  
  // StreamChat (public)
  STREAM_API_KEY: 'v8bkzb3hh26z',
  
  // URLs
  WEBAPP_URL: 'https://influmojo.com',
  NEXT_PUBLIC_API_URL: 'https://api.influmojo.com',
  GOOGLE_CALLBACK_URL: 'https://api.influmojo.com/api/auth/google/callback',
  FACEBOOK_CALLBACK_URL: 'https://api.influmojo.com/api/auth/facebook/callback',
  
  // Mobile/Web Public
  EXPO_PUBLIC_API_URL: 'https://api.influmojo.com',
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: 'your_google_client_id_here',
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID: 'your_google_android_client_id_here',
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS: 'your_google_ios_client_id_here',
  
  // AWS
  AWS_REGION: region
};

async function createParameter(paramName, paramValue, isSecure = true) {
  try {
    const params = {
      Name: paramName,
      Value: paramValue,
      Type: isSecure ? 'SecureString' : 'String',
      Description: `Influmojo production parameter: ${paramName}`,
      Overwrite: true
    };

    await ssm.putParameter(params).promise();
    console.log(`✅ Created parameter: ${paramName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create parameter ${paramName}:`, error.message);
    return false;
  }
}

async function setupParameterStore() {
  console.log('🚀 Setting up AWS Parameter Store for Influmojo...\n');
  
  let successCount = 0;
  let totalCount = Object.keys(SENSITIVE_PARAMS).length;
  
  for (const [paramName, paramValue] of Object.entries(SENSITIVE_PARAMS)) {
    if (paramValue.includes('your-') || paramValue.includes('username:password')) {
      console.log(`⚠️  Skipping ${paramName} - please update the value first`);
      continue;
    }
    
    const success = await createParameter(paramName, paramValue, true);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Parameter Store Setup Complete:`);
  console.log(`✅ Successfully created: ${successCount}/${totalCount} parameters`);
  console.log(`⚠️  Please update the remaining parameters with real values and run again`);
}

function createPublicEnvFile() {
  console.log('\n📝 Creating public .env file with non-sensitive variables...');
  
  let envContent = `# ========================================\n`;
  envContent += `# INFLUMOJO PUBLIC ENVIRONMENT VARIABLES\n`;
  envContent += `# ========================================\n`;
  envContent += `# This file contains non-sensitive variables\n`;
  envContent += `# Sensitive variables are stored in AWS Parameter Store\n\n`;
  
  for (const [key, value] of Object.entries(PUBLIC_PARAMS)) {
    envContent += `${key}=${value}\n`;
  }
  
  const envPath = path.join(__dirname, '.env.public');
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Created .env.public file`);
}

function createEnvLoader() {
  console.log('\n🔧 Creating environment loader for your applications...');
  
  const loaderContent = `const AWS = require('aws-sdk');

/**
 * Environment Variable Loader for Influmojo
 * Loads sensitive variables from AWS Parameter Store
 */

class EnvLoader {
  constructor() {
    this.ssm = new AWS.SSM({ region: process.env.AWS_REGION || 'us-east-1' });
    this.cache = new Map();
  }

  async getParameter(paramName, useCache = true) {
    if (useCache && this.cache.has(paramName)) {
      return this.cache.get(paramName);
    }

    try {
      const response = await this.ssm.getParameter({
        Name: paramName,
        WithDecryption: true
      }).promise();
      
      const value = response.Parameter.Value;
      if (useCache) {
        this.cache.set(paramName, value);
      }
      
      return value;
    } catch (error) {
      console.error(\`Failed to load parameter \${paramName}:\`, error.message);
      return null;
    }
  }

  async loadSensitiveEnvVars() {
    const sensitiveVars = {
      DATABASE_URL: await this.getParameter('/influmojo/prod/database-url'),
      JWT_SECRET: await this.getParameter('/influmojo/prod/jwt-secret'),
      SESSION_SECRET: await this.getParameter('/influmojo/prod/session-secret'),
      TWILIO_ACCOUNT_SID: await this.getParameter('/influmojo/prod/twilio-account-sid'),
      TWILIO_AUTH_TOKEN: await this.getParameter('/influmojo/prod/twilio-auth-token'),
      TWILIO_VERIFY_SERVICE_SID: await this.getParameter('/influmojo/prod/twilio-verify-service-sid'),
      GOOGLE_CLIENT_SECRET: await this.getParameter('/influmojo/prod/google-client-secret'),
      FACEBOOK_APP_SECRET: await this.getParameter('/influmojo/prod/facebook-app-secret'),
      SENDGRID_API_KEY: await this.getParameter('/influmojo/prod/sendgrid-api-key'),
      STREAM_API_SECRET: await this.getParameter('/influmojo/prod/stream-api-secret')
    };

    // Set environment variables
    Object.entries(sensitiveVars).forEach(([key, value]) => {
      if (value) {
        process.env[key] = value;
      }
    });

    return sensitiveVars;
  }
}

module.exports = EnvLoader;
`;

  const loaderPath = path.join(__dirname, 'env-loader.js');
  fs.writeFileSync(loaderPath, loaderContent);
  console.log(`✅ Created env-loader.js utility`);
}

function createUsageExample() {
  console.log('\n📚 Creating usage example...');
  
  const exampleContent = `// Example usage in your backend server.js
const EnvLoader = require('./env-loader');

async function startServer() {
  try {
    // Load sensitive environment variables from AWS Parameter Store
    const envLoader = new EnvLoader();
    await envLoader.loadSensitiveEnvVars();
    
    // Your server code here
    console.log('Environment variables loaded successfully');
    
    // Start your server
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(\`Server running on port \${port}\`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
`;

  const examplePath = path.join(__dirname, 'server-usage-example.js');
  fs.writeFileSync(examplePath, exampleContent);
  console.log(`✅ Created server-usage-example.js`);
}

async function main() {
  try {
    // Check AWS credentials
    const credentials = await AWS.config.getCredentials();
    if (!credentials.accessKeyId) {
      console.error('❌ AWS credentials not configured. Please run: aws configure');
      process.exit(1);
    }
    
    console.log(`🔑 Using AWS credentials for region: ${region}\n`);
    
    // Setup Parameter Store
    await setupParameterStore();
    
    // Create supporting files
    createPublicEnvFile();
    createEnvLoader();
    createUsageExample();
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Update the parameter values in this script');
    console.log('2. Run the script again to create all parameters');
    console.log('3. Use env-loader.js in your applications');
    console.log('4. Update your deployment scripts to use the new approach');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupParameterStore, createPublicEnvFile, createEnvLoader };
