#!/usr/bin/env node

/**
 * Apply Cart Database Changes Script
 * 
 * This script safely applies the cart persistence changes to your database.
 * Run this after updating your Prisma schema.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🛒 Applying Cart Persistence Changes...\n');

try {
  // Change to backend directory
  process.chdir(path.join(__dirname, '..'));
  
  console.log('📋 Step 1: Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully\n');
  
  console.log('📋 Step 2: Pushing schema changes to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema updated successfully\n');
  
  console.log('📋 Step 3: Verifying database connection...');
  execSync('npx prisma db pull', { stdio: 'inherit' });
  console.log('✅ Database connection verified\n');
  
  console.log('🎉 Cart persistence setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test cart endpoints: GET /api/cart');
  console.log('3. Your existing cart system will continue working');
  console.log('4. Cart data will now persist across login sessions');
  
} catch (error) {
  console.error('\n❌ Error applying cart changes:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Ensure your database is running');
  console.log('2. Check your DATABASE_URL in .env.development');
  console.log('3. Verify you have write permissions to the database');
  console.log('4. Run manually: npx prisma db push');
  
  process.exit(1);
}
