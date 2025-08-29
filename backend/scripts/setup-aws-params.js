#!/usr/bin/env node

/**
 * AWS Parameter Store Setup Script for Influmojo Backend
 * 
 * This script helps you set up AWS Parameter Store for storing sensitive
 * environment variables securely for production deployment.
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
const PARAM_PREFIX = '/influmojo/production';

// Sensitive parameters to store in Parameter Store
const SENSITIVE_PARAMS = {
  // JWT and Session
  [`${PARAM_PREFIX}/JWT_SECRET`]: 'your-production-jwt-secret-here-minimum-32-characters',
  [`${PARAM_PREFIX}/JWT_SECRET_PREVIOUS`]: 'your-production-jwt-secret-previous-here',
  [`${PARAM_PREFIX}/SESSION_SECRET`]: 'your-production-session-secret-here-minimum-32-characters',
  
  // Database
  [`${PARAM_PREFIX}/DATABASE_URL`]: 'postgresql://username:password@your-aws-rds-endpoint:5432/influmojo-prod',
  
  // Google OAuth
  [`${PARAM_PREFIX}/GOOGLE_CLIENT_ID`]: '401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com',
  [`${PARAM_PREFIX}/GOOGLE_CLIENT_SECRET`]: 'your-google-client-secret',
  [`${PARAM_PREFIX}/GOOGLE_CALLBACK_URL`]: 'https://api.influmojo.com/api/auth/google/callback',
  [`${PARAM_PREFIX}/NEXT_PUBLIC_WEBAPP_URL`]: 'https://staging.influmojo.com',
  
  // Facebook OAuth
  [`${PARAM_PREFIX}/FACEBOOK_APP_SECRET`]: 'your-facebook-app-secret',
  
  // StreamChat
  [`${PARAM_PREFIX}/STREAM_API_SECRET`]: 'your-stream-api-secret',
  
  // Twilio
  [`${PARAM_PREFIX}/TWILIO_ACCOUNT_SID`]: 'your-twilio-account-sid',
  [`${PARAM_PREFIX}/TWILIO_AUTH_TOKEN`]: 'your-twilio-auth-token',
  [`${PARAM_PREFIX}/TWILIO_VERIFY_SERVICE_SID`]: 'your-twilio-verify-service-sid',
  
  // API Keys
  [`${PARAM_PREFIX}/SENDGRID_API_KEY`]: 'your-sendgrid-api-key',
  
  // Zoho CRM
  [`${PARAM_PREFIX}/ZOHO_CLIENT_ID`]: 'your-zoho-client-id',
  [`${PARAM_PREFIX}/ZOHO_CLIENT_SECRET`]: 'your-zoho-client-secret',
  [`${PARAM_PREFIX}/ZOHO_REFRESH_TOKEN`]: 'your-zoho-refresh-token',
  
  // Cloudinary
  [`${PARAM_PREFIX}/CLOUDINARY_CLOUD_NAME`]: 'your-cloudinary-cloud-name',
  [`${PARAM_PREFIX}/CLOUDINARY_API_KEY`]: 'your-cloudinary-api-key',
  [`${PARAM_PREFIX}/CLOUDINARY_API_SECRET`]: 'your-cloudinary-api-secret'
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
  console.log('🚀 Setting up AWS Parameter Store for Influmojo Backend...\n');
  
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

function createProductionEnvTemplate() {
  console.log('\n📝 Creating production .env template...');
  
  const templateContent = `# ========================================
# INFLUMOJO PRODUCTION ENVIRONMENT TEMPLATE
# ========================================
# This file contains non-sensitive variables for production
# Sensitive variables are loaded from AWS Parameter Store

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=3002
NODE_ENV=production
AWS_REGION=us-east-1

# ========================================
# PUBLIC OAUTH CONFIGURATION
# ========================================
GOOGLE_CLIENT_ID=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=401925027822-br2fn6ohtatmpckjlgfl8eqivb5ernrg.apps.googleusercontent.com
FACEBOOK_APP_ID=1457804359003690

# ========================================
# PUBLIC STREAMCHAT CONFIGURATION
# ========================================
STREAM_API_KEY=v8bkzb3hh26z

# ========================================
# DOMAIN CONFIGURATION
# ========================================
WEBAPP_URL=https://influmojo.com
NEXT_PUBLIC_API_URL=https://api.influmojo.com
EXPO_PUBLIC_API_URL=https://api.influmojo.com

# ========================================
# SENSITIVE VARIABLES (LOADED FROM AWS)
# ========================================
# These are loaded from AWS Parameter Store:
# - JWT_SECRET
# - SESSION_SECRET
# - DATABASE_URL
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_VERIFY_SERVICE_SID
# - GOOGLE_CLIENT_SECRET
# - FACEBOOK_APP_SECRET
# - SENDGRID_API_KEY
# - STREAM_API_SECRET
`;
  
  const templatePath = path.join(__dirname, '.env.production.template');
  fs.writeFileSync(templatePath, templateContent);
  console.log(`✅ Created .env.production.template file`);
}

function createDeploymentGuide() {
  console.log('\n📚 Creating deployment guide...');
  
  const guideContent = `# AWS Deployment Guide for Influmojo Backend

## 🚀 Quick Start

### 1. Set up AWS Parameter Store
\`\`\`bash
# Run the setup script
node setup-aws-params.js

# Update parameter values in the script
# Run again to create all parameters
\`\`\`

### 2. Deploy to AWS
\`\`\`bash
# Copy production environment template
cp .env.production.template .env

# Update non-sensitive values in .env
nano .env

# Start the server
NODE_ENV=production node src/server.js
\`\`\`

### 3. Verify Deployment
\`\`\`bash
# Check health endpoint
curl http://your-server:3002/api/health

# Check AWS Parameter Store status
curl http://your-server:3002/api/admin/aws-params/cache-stats
\`\`\`

## 🔐 Required AWS Parameters

The following parameters must be set in AWS Parameter Store:

- \`/influmojo/prod/jwt-secret\` - JWT signing secret
- \`/influmojo/prod/session-secret\` - Session encryption secret
- \`/influmojo/prod/database-url\` - PostgreSQL connection string
- \`/influmojo/prod/twilio-account-sid\` - Twilio account SID
- \`/influmojo/prod/twilio-auth-token\` - Twilio auth token
- \`/influmojo/prod/twilio-verify-service-sid\` - Twilio verify service SID
- \`/influmojo/prod/google-client-secret\` - Google OAuth client secret
- \`/influmojo/prod/facebook-app-secret\` - Facebook OAuth app secret
- \`/influmojo/prod/sendgrid-api-key\` - SendGrid API key
- \`/influmojo/prod/stream-api-secret\` - StreamChat API secret

## 🔒 Security Notes

- All sensitive parameters are stored as \`SecureString\` in Parameter Store
- Parameters are automatically decrypted when loaded
- Cache timeout is set to 5 minutes for performance
- Environment variables are validated on server startup
`;
  
  const guidePath = path.join(__dirname, 'AWS_DEPLOYMENT_GUIDE.md');
  fs.writeFileSync(guidePath, guideContent);
  console.log(`✅ Created AWS_DEPLOYMENT_GUIDE.md`);
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
    createProductionEnvTemplate();
    createDeploymentGuide();
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Update the parameter values in this script');
    console.log('2. Run the script again to create all parameters');
    console.log('3. Use .env.production.template for your AWS deployment');
    console.log('4. Check AWS_DEPLOYMENT_GUIDE.md for detailed instructions');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupParameterStore, createProductionEnvTemplate };
