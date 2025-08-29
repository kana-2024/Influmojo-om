#!/usr/bin/env node

/**
 * AWS Parameter Store Setup Script for Influmojo Production
 * 
 * This script sets up all production environment variables in AWS Parameter Store
 * under the /influmojo/prod/api/ namespace for secure deployment.
 * 
 * This supports the consolidated .env approach where backend, webapp, and admin-dashboard
 * all share the same environment configuration.
 * 
 * Usage:
 * 1. Install AWS SDK: npm install aws-sdk
 * 2. Configure AWS credentials: aws configure
 * 3. Run: node setup-ssm-params.js
 * 
 * IMPORTANT: Rotate all secrets before running this script!
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');

// AWS Configuration
const region = process.env.AWS_REGION || 'ap-south-1';
const ssm = new AWS.SSM({ region });

// Parameter Store path prefix - matches consolidated .env structure
const PARAM_PREFIX = '/influmojo/prod/api';

// Generate secure random secrets
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Production parameters to store in Parameter Store
// This matches your consolidated .env.prod structure
const PRODUCTION_PARAMS = {
  // ========================================
  // ENVIRONMENT & DEPLOYMENT
  // ========================================
  [`${PARAM_PREFIX}/NODE_ENV`]: { value: 'production', secure: false },
  [`${PARAM_PREFIX}/PORT`]: { value: '3002', secure: false }, // Backend port
  [`${PARAM_PREFIX}/AWS_REGION`]: { value: region, secure: false },
  
  // ========================================
  // SERVER CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/WEBAPP_URL`]: { value: 'https://influmojo.com', secure: false },
  [`${PARAM_PREFIX}/API_URL`]: { value: 'https://api.influmojo.com', secure: false },
  
  // ========================================
  // DATABASE CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/DATABASE_URL`]: { 
    value: 'postgresql://postgres:YOUR_SECURE_PASSWORD@your-aws-rds-endpoint:5432/influmojo', 
    secure: true 
  },
  
  // ========================================
  // AUTHENTICATION & SECURITY
  // ========================================
  [`${PARAM_PREFIX}/JWT_SECRET`]: { 
    value: generateSecureSecret(64), 
    secure: true 
  },
  [`${PARAM_PREFIX}/SESSION_SECRET`]: { 
    value: generateSecureSecret(64), 
    secure: true 
  },
  
  // ========================================
  // GOOGLE OAUTH CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/GOOGLE_CLIENT_ID`]: { 
    value: '401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/GOOGLE_CLIENT_SECRET`]: { 
    value: 'YOUR_ROTATED_GOOGLE_CLIENT_SECRET', 
    secure: true 
  },
  [`${PARAM_PREFIX}/GOOGLE_ANDROID_CLIENT_ID`]: { 
    value: '401925027822-br2fn6ohtatmpckjlgfl8eqivb5ernrg.apps.googleusercontent.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/GOOGLE_IOS_CLIENT_ID`]: { 
    value: '401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/GOOGLE_CALLBACK_URL`]: { 
    value: 'https://api.influmojo.com/api/auth/google/callback', 
    secure: false 
  },
  
  // ========================================
  // FACEBOOK OAUTH CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/FACEBOOK_APP_ID`]: { 
    value: '1457804359003690', 
    secure: false 
  },
  [`${PARAM_PREFIX}/FACEBOOK_APP_SECRET`]: { 
    value: 'YOUR_ROTATED_FACEBOOK_APP_SECRET', 
    secure: true 
  },
  
  // ========================================
  // STREAMCHAT CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/STREAM_API_KEY`]: { 
    value: 'm7zjhhjc9bws', 
    secure: false 
  },
  [`${PARAM_PREFIX}/STREAM_API_SECRET`]: { 
    value: 'YOUR_ROTATED_STREAM_API_SECRET', 
    secure: true 
  },
  
  // ========================================
  // TWILIO CONFIGURATION (SMS/OTP)
  // ========================================
  [`${PARAM_PREFIX}/TWILIO_ACCOUNT_SID`]: { 
    value: 'YOUR_ROTATED_TWILIO_ACCOUNT_SID', 
    secure: true 
  },
  [`${PARAM_PREFIX}/TWILIO_AUTH_TOKEN`]: { 
    value: 'YOUR_ROTATED_TWILIO_AUTH_TOKEN', 
    secure: true 
  },
  [`${PARAM_PREFIX}/TWILIO_VERIFY_SERVICE_SID`]: { 
    value: 'YOUR_ROTATED_TWILIO_VERIFY_SERVICE_SID', 
    secure: true 
  },
  
  // ========================================
  // EMAIL CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/SENDGRID_API_KEY`]: { 
    value: 'YOUR_ROTATED_SENDGRID_API_KEY', 
    secure: true 
  },
  [`${PARAM_PREFIX}/FROM_EMAIL`]: { 
    value: 'noreply@influmojo.com', 
    secure: false 
  },
  
  // ========================================
  // ZOHO CRM CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/ZOHO_CLIENT_ID`]: { 
    value: 'YOUR_ROTATED_ZOHO_CLIENT_ID', 
    secure: true 
  },
  [`${PARAM_PREFIX}/ZOHO_CLIENT_SECRET`]: { 
    value: 'YOUR_ROTATED_ZOHO_CLIENT_SECRET', 
    secure: true 
  },
  [`${PARAM_PREFIX}/ZOHO_REFRESH_TOKEN`]: { 
    value: 'YOUR_ROTATED_ZOHO_REFRESH_TOKEN', 
    secure: true 
  },
  [`${PARAM_PREFIX}/ZOHO_BASE_URL`]: { 
    value: 'https://www.zohoapis.com', 
    secure: false 
  },
  
  // ========================================
  // CLOUDINARY CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/CLOUDINARY_CLOUD_NAME`]: { 
    value: 'YOUR_ROTATED_CLOUDINARY_CLOUD_NAME', 
    secure: true 
  },
  [`${PARAM_PREFIX}/CLOUDINARY_API_KEY`]: { 
    value: 'YOUR_ROTATED_CLOUDINARY_API_KEY', 
    secure: true 
  },
  [`${PARAM_PREFIX}/CLOUDINARY_API_SECRET`]: { 
    value: 'YOUR_ROTATED_CLOUDINARY_API_SECRET', 
    secure: true 
  },
  
  // ========================================
  // WEB APP (NEXT.JS) ENVIRONMENT VARIABLES
  // ========================================
  [`${PARAM_PREFIX}/NEXT_PUBLIC_API_URL`]: { 
    value: 'https://api.influmojo.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/NEXT_PUBLIC_WEBAPP_URL`]: { 
    value: 'https://influmojo.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/NEXT_PUBLIC_STREAMCHAT_API_KEY`]: { 
    value: 'm7zjhhjc9bws', 
    secure: false 
  },
  
  // ========================================
  // ADMIN DASHBOARD (NEXT.JS) ENVIRONMENT VARIABLES
  // ========================================
  [`${PARAM_PREFIX}/NEXT_PUBLIC_ADMIN_API_URL`]: { 
    value: 'https://api.influmojo.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY`]: { 
    value: 'm7zjhhjc9bws', 
    secure: false 
  },
  
  // ========================================
  // MOBILE APP CONFIGURATION
  // ========================================
  [`${PARAM_PREFIX}/EXPO_PUBLIC_API_URL`]: { 
    value: 'https://api.influmojo.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/EXPO_PUBLIC_GOOGLE_CLIENT_ID`]: { 
    value: '401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID`]: { 
    value: '401925027822-br2fn6ohtatmpckjlgfl8eqivb5ernrg.apps.googleusercontent.com', 
    secure: false 
  },
  [`${PARAM_PREFIX}/EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS`]: { 
    value: '401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com', 
    secure: false 
  }
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
    console.log(`✅ Created parameter: ${paramName} (${isSecure ? 'SecureString' : 'String'})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create parameter ${paramName}:`, error.message);
    return false;
  }
}

async function setupAllParameters() {
  console.log('🚀 Setting up AWS Parameter Store for Influmojo Production...');
  console.log(`📍 Region: ${region}`);
  console.log(`📍 Prefix: ${PARAM_PREFIX}`);
  console.log('');
  
  console.log('⚠️  IMPORTANT: Make sure to replace placeholder values with actual production secrets!');
  console.log('⚠️  Rotate all secrets that were previously exposed in your repository!');
  console.log('');
  
  console.log('📋 This setup supports your consolidated .env approach:');
  console.log('   - Backend API (port 3002)');
  console.log('   - Webapp (Next.js)');
  console.log('   - Admin Dashboard (Next.js)');
  console.log('   - Mobile App (Expo)');
  console.log('');

  let successCount = 0;
  let totalCount = Object.keys(PRODUCTION_PARAMS).length;

  for (const [paramName, config] of Object.entries(PRODUCTION_PARAMS)) {
    const success = await createParameter(paramName, config.value, config.secure);
    if (success) successCount++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('📊 Setup Summary:');
  console.log(`✅ Successfully created: ${successCount}/${totalCount} parameters`);
  
  if (successCount === totalCount) {
    console.log('🎉 All parameters created successfully!');
    console.log('');
    console.log('🔐 Next steps:');
    console.log('1. Update the placeholder values with actual production secrets');
    console.log('2. Ensure your EC2 instance role has the required SSM permissions');
    console.log('3. Deploy using the new CodeDeploy configuration');
    console.log('');
    console.log('📁 The consolidated .env will be created from these parameters');
    console.log('   and shared across all your applications (backend, webapp, admin-dashboard)');
  } else {
    console.log('⚠️  Some parameters failed to create. Check the errors above.');
  }
}

// Run the setup
if (require.main === module) {
  setupAllParameters().catch(console.error);
}

module.exports = { setupAllParameters, PRODUCTION_PARAMS };
