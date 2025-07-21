const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔑 Getting SHA-1 Fingerprint for Android OAuth...');
console.log('');

// Check if keytool is available
try {
  // For development (debug keystore)
  const debugKeystorePath = path.join(process.env.USERPROFILE || process.env.HOME, '.android', 'debug.keystore');
  
  if (fs.existsSync(debugKeystorePath)) {
    console.log('📱 Found debug keystore, getting SHA-1...');
    try {
      const result = execSync(`keytool -list -v -keystore "${debugKeystorePath}" -alias androiddebugkey -storepass android -keypass android`, { encoding: 'utf8' });
      
      // Extract SHA-1 from output
      const sha1Match = result.match(/SHA1: ([A-F0-9:]+)/i);
      if (sha1Match) {
        console.log('✅ SHA-1 Fingerprint (Debug):', sha1Match[1]);
        console.log('');
        console.log('📋 Use this SHA-1 for Google Cloud Console:');
        console.log('   1. Go to https://console.cloud.google.com/apis/credentials');
        console.log('   2. Create OAuth client ID for Android');
        console.log('   3. Package name: com.influmojo.mobile');
        console.log('   4. SHA-1: ' + sha1Match[1]);
      } else {
        console.log('❌ Could not extract SHA-1 from keytool output');
      }
    } catch (error) {
      console.log('❌ Error running keytool:', error.message);
    }
  } else {
    console.log('❌ Debug keystore not found at:', debugKeystorePath);
    console.log('');
    console.log('💡 Alternative methods:');
    console.log('   1. Run your app in development mode first');
    console.log('   2. Use Expo\'s development build');
    console.log('   3. Or get SHA-1 from your production keystore');
  }
} catch (error) {
  console.log('❌ keytool not found. Make sure Java is installed.');
}

console.log('');
console.log('📱 For Expo Development:');
console.log('   1. Use Expo\'s development build');
console.log('   2. Or get SHA-1 from Expo\'s servers');
console.log('   3. Package name: com.influmojo.mobile'); 