/**
 * Mobile Environment Loader for Influmojo
 * 
 * This utility helps mobile apps load environment variables from the consolidated
 * root .env file or AWS Parameter Store for production.
 * 
 * Usage in React Native/Expo:
 * import { loadMobileEnv } from './mobile-env-loader';
 * 
 * // Load environment variables
 * const env = await loadMobileEnv();
 */

const fs = require('fs');
const path = require('path');

// Mobile-specific environment variables
const MOBILE_ENV_VARS = {
  // API Configuration
  EXPO_PUBLIC_API_URL: '',
  MOBILE_API_TIMEOUT: '30000',
  MOBILE_CACHE_DURATION: '3600000',
  
  // Google OAuth
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: '',
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID: '',
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS: '',
  MOBILE_GOOGLE_REDIRECT_URI: '',
  
  // Facebook OAuth
  MOBILE_FACEBOOK_REDIRECT_URI: '',
  
  // App Configuration
  MOBILE_APP_NAME: 'Influmojo',
  MOBILE_APP_VERSION: '1.0.0',
  MOBILE_BUILD_NUMBER: '1',
  MOBILE_BUNDLE_ID: 'com.influmojo.mobile'
};

/**
 * Load environment variables from root .env file
 */
function loadFromRootEnv() {
  try {
    const rootEnvPath = path.join(__dirname, '..', '.env');
    
    if (!fs.existsSync(rootEnvPath)) {
      console.warn('⚠️  Root .env file not found, using defaults');
      return {};
    }
    
    const envContent = fs.readFileSync(rootEnvPath, 'utf8');
    const envVars = {};
    
    // Parse .env file
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading root .env:', error.message);
    return {};
  }
}

/**
 * Load mobile-specific environment variables
 */
function loadMobileEnv() {
  try {
    const rootEnv = loadFromRootEnv();
    const mobileEnv = {};
    
    // Extract mobile-specific variables
    Object.keys(MOBILE_ENV_VARS).forEach(key => {
      if (rootEnv[key]) {
        mobileEnv[key] = rootEnv[key];
      } else if (MOBILE_ENV_VARS[key]) {
        mobileEnv[key] = MOBILE_ENV_VARS[key];
      }
    });
    
    // Validate required variables
    const required = ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_GOOGLE_CLIENT_ID'];
    const missing = required.filter(key => !mobileEnv[key]);
    
    if (missing.length > 0) {
      console.warn(`⚠️  Missing required mobile environment variables: ${missing.join(', ')}`);
    }
    
    return mobileEnv;
  } catch (error) {
    console.error('❌ Error loading mobile environment:', error.message);
    return MOBILE_ENV_VARS;
  }
}

/**
 * Create mobile .env file from root configuration
 */
function createMobileEnvFile() {
  try {
    const mobileEnv = loadMobileEnv();
    const mobileEnvPath = path.join(__dirname, '.env');
    
    let envContent = `# ========================================\n`;
    envContent += `# INFLUMOJO MOBILE ENVIRONMENT\n`;
    envContent += `# ========================================\n`;
    envContent += `# This file is auto-generated from root .env\n`;
    envContent += `# Do not edit manually - update root .env instead\n\n`;
    
    Object.entries(mobileEnv).forEach(([key, value]) => {
      envContent += `${key}=${value}\n`;
    });
    
    fs.writeFileSync(mobileEnvPath, envContent);
    console.log(`✅ Created mobile .env file at: ${mobileEnvPath}`);
    
    return mobileEnvPath;
  } catch (error) {
    console.error('❌ Error creating mobile .env:', error.message);
    return null;
  }
}

/**
 * Create mobile environment configuration for different platforms
 */
function createPlatformConfigs() {
  try {
    const mobileEnv = loadMobileEnv();
    
    // Android configuration
    const androidConfig = {
      apiUrl: mobileEnv.EXPO_PUBLIC_API_URL,
      googleClientId: mobileEnv.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      facebookRedirectUri: mobileEnv.MOBILE_FACEBOOK_REDIRECT_URI,
      appName: mobileEnv.MOBILE_APP_NAME,
      version: mobileEnv.MOBILE_APP_VERSION,
      buildNumber: mobileEnv.MOBILE_BUILD_NUMBER
    };
    
    // iOS configuration
    const iosConfig = {
      apiUrl: mobileEnv.EXPO_PUBLIC_API_URL,
      googleClientId: mobileEnv.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      facebookRedirectUri: mobileEnv.MOBILE_FACEBOOK_REDIRECT_URI,
      appName: mobileEnv.MOBILE_APP_NAME,
      version: mobileEnv.MOBILE_APP_VERSION,
      buildNumber: mobileEnv.MOBILE_BUILD_NUMBER
    };
    
    // Write platform configs
    const configsDir = path.join(__dirname, 'config');
    if (!fs.existsSync(configsDir)) {
      fs.mkdirSync(configsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(configsDir, 'android-env.json'),
      JSON.stringify(androidConfig, null, 2)
    );
    
    fs.writeFileSync(
      path.join(configsDir, 'ios-env.json'),
      JSON.stringify(iosConfig, null, 2)
    );
    
    console.log(`✅ Created platform-specific configs in: ${configsDir}`);
    
    return { androidConfig, iosConfig };
  } catch (error) {
    console.error('❌ Error creating platform configs:', error.message);
    return null;
  }
}

/**
 * Validate mobile environment configuration
 */
function validateMobileEnv() {
  const mobileEnv = loadMobileEnv();
  const issues = [];
  
  // Check required variables
  if (!mobileEnv.EXPO_PUBLIC_API_URL) {
    issues.push('EXPO_PUBLIC_API_URL is required');
  }
  
  if (!mobileEnv.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
    issues.push('EXPO_PUBLIC_GOOGLE_CLIENT_ID is required');
  }
  
  // Check URL format
  if (mobileEnv.EXPO_PUBLIC_API_URL && !mobileEnv.EXPO_PUBLIC_API_URL.startsWith('http')) {
    issues.push('EXPO_PUBLIC_API_URL must be a valid URL');
  }
  
  if (issues.length === 0) {
    console.log('✅ Mobile environment validation passed');
    return true;
  } else {
    console.error('❌ Mobile environment validation failed:');
    issues.forEach(issue => console.error(`   - ${issue}`));
    return false;
  }
}

// Export functions
module.exports = {
  loadMobileEnv,
  createMobileEnvFile,
  createPlatformConfigs,
  validateMobileEnv,
  MOBILE_ENV_VARS
};

// Run if called directly
if (require.main === module) {
  console.log('🚀 Mobile Environment Setup for Influmojo...\n');
  
  // Create mobile .env file
  createMobileEnvFile();
  
  // Create platform configs
  createPlatformConfigs();
  
  // Validate configuration
  validateMobileEnv();
  
  console.log('\n🎉 Mobile environment setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Review the generated .env file');
  console.log('2. Update your mobile app to use the new configuration');
  console.log('3. Test the configuration on both platforms');
}
