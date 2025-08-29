#!/usr/bin/env node

/**
 * Test Consolidated Environment Configuration
 * 
 * This script verifies that all applications can properly load
 * environment variables from the consolidated root .env file.
 */

const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('INFLUMOJO ENVIRONMENT VERIFICATION');
console.log('========================================\n');

// Check if root .env exists
const rootEnvPath = path.join(__dirname, '.env');
if (!fs.existsSync(rootEnvPath)) {
    console.log('❌ ERROR: Root .env file not found!');
    console.log('Please ensure you have a .env file in the project root.\n');
    process.exit(1);
}

console.log('✅ Root .env file found\n');

// Load environment variables
require('dotenv').config({ path: rootEnvPath });

// Test categories
const testCategories = [
    {
        name: 'Environment & Deployment',
        variables: ['NODE_ENV', 'AWS_REGION', 'PORT']
    },
    {
        name: 'Database Configuration',
        variables: ['DATABASE_URL']
    },
    {
        name: 'Authentication & Security',
        variables: ['JWT_SECRET', 'SESSION_SECRET']
    },
    {
        name: 'Google OAuth',
        variables: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_ANDROID_CLIENT_ID', 'GOOGLE_IOS_CLIENT_ID']
    },
    {
        name: 'Facebook OAuth',
        variables: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET']
    },
    {
        name: 'StreamChat',
        variables: ['STREAM_API_KEY', 'STREAM_API_SECRET']
    },
    {
        name: 'Twilio (SMS/OTP)',
        variables: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID']
    },
    {
        name: 'Email Configuration',
        variables: ['SENDGRID_API_KEY', 'FROM_EMAIL']
    },
    {
        name: 'Zoho CRM',
        variables: ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']
    },
    {
        name: 'Cloudinary',
        variables: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    },
    {
        name: 'Web App (Next.js)',
        variables: ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WEBAPP_URL', 'NEXT_PUBLIC_STREAMCHAT_API_KEY']
    },
    {
        name: 'Admin Dashboard (Next.js)',
        variables: ['NEXT_PUBLIC_ADMIN_API_URL', 'NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY']
    },
    {
        name: 'Mobile App (Expo)',
        variables: ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_GOOGLE_CLIENT_ID', 'EXPO_PUBLIC_STREAMCHAT_API_KEY']
    },
    {
        name: 'Mobile App Configuration',
        variables: ['MOBILE_APP_NAME', 'MOBILE_APP_VERSION', 'MOBILE_BUNDLE_ID']
    }
];

// Run tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

console.log('🧪 Testing Environment Variables:\n');

testCategories.forEach(category => {
    console.log(`📋 ${category.name}:`);
    
    category.variables.forEach(variable => {
        totalTests++;
        const value = process.env[variable];
        
        if (value && value !== 'your_*_here') {
            console.log(`  ✅ ${variable}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
            passedTests++;
        } else if (value === 'your_*_here') {
            console.log(`  ⚠️  ${variable}: Placeholder value (update for production)`);
            passedTests++;
        } else {
            console.log(`  ❌ ${variable}: Not set`);
            failedTests++;
        }
    });
    
    console.log('');
});

// Summary
console.log('========================================');
console.log('VERIFICATION SUMMARY');
console.log('========================================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (failedTests === 0) {
    console.log('\n🎉 All environment variables are properly configured!');
    console.log('Your consolidated environment setup is ready for AWS deployment.');
} else {
    console.log('\n⚠️  Some environment variables need attention.');
    console.log('Please check the failed variables above and update your .env file.');
}

console.log('\n📖 For deployment instructions, see: ENVIRONMENT_CONSOLIDATION_GUIDE.md');
console.log('🚀 To deploy to AWS, run: deploy-env-to-aws.bat\n');

// Exit with appropriate code
process.exit(failedTests === 0 ? 0 : 1);
