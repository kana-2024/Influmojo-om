// Test script to verify Google OAuth setup
// Run this with: node test-google-setup.js

console.log('🔍 Testing Google OAuth Configuration...\n');

// Check environment variables
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (googleClientId) {
  console.log('✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID is set');
  console.log(`   Value: ${googleClientId.substring(0, 20)}...`);
  
  // Validate format
  if (googleClientId.includes('.apps.googleusercontent.com')) {
    console.log('✅ Client ID format looks correct');
  } else {
    console.log('⚠️  Client ID format may be incorrect (should end with .apps.googleusercontent.com)');
  }
} else {
  console.log('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
  console.log('   Please add it to your .env.local file');
}

console.log('\n📋 Setup Checklist:');
console.log('□ Google Cloud Console project created');
console.log('□ OAuth client ID created (Web application type)');
console.log('□ Authorized JavaScript origins configured:');
console.log('  - http://localhost:3000');
console.log('  - https://your-production-domain.com');
console.log('□ NEXT_PUBLIC_GOOGLE_CLIENT_ID added to .env.local');
console.log('□ Google Identity Services script loaded in layout.tsx');

console.log('\n🔧 If you get CORS errors:');
console.log('1. Double-check your authorized origins in Google Cloud Console');
console.log('2. Make sure the domain matches exactly (including http/https)');
console.log('3. Wait a few minutes for Google changes to propagate');
console.log('4. Clear browser cache and cookies');

console.log('\n📚 Need help? Check: webapp/GOOGLE_CLIENT_ID_SETUP.md');
