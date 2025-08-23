# Mobile Environment Setup Guide for Influmojo

This guide explains how mobile environment variables are now consolidated with the main project configuration and how to use them effectively.

## 🎯 **Why Mobile Environment Variables Are Different**

Mobile apps have unique requirements that make them different from web applications:

### 1. **Build-Time vs Runtime**
- **Web apps**: Environment variables are loaded at runtime
- **Mobile apps**: Environment variables are bundled at build time

### 2. **Platform-Specific Variables**
- **Android**: Different OAuth client IDs, redirect URIs
- **iOS**: Different OAuth client IDs, redirect URIs, bundle identifiers

### 3. **Expo/React Native Requirements**
- Variables must be prefixed with `EXPO_PUBLIC_` to be accessible
- Some variables are platform-specific (Android vs iOS)

## 🔄 **How Consolidation Works Now**

### **Before (Multiple Files)**
```
backend/.env          # Backend variables
mobile/.env           # Mobile variables  
webapp/.env           # Web app variables
```

### **After (Consolidated)**
```
.env                  # All variables in one place
├── Backend variables
├── Web application variables
└── Mobile variables
    ├── EXPO_PUBLIC_* (public)
    ├── Platform-specific
    └── App configuration
```

## 📱 **Mobile Environment Variables Explained**

### **Public Variables (EXPO_PUBLIC_*)**
These are safe to expose in client-side code:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://your-aws-domain.com

# Google OAuth (public keys)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id
```

### **Mobile-Specific Variables**
These are used for app configuration:

```bash
# App Configuration
MOBILE_APP_NAME=Influmojo
MOBILE_APP_VERSION=1.0.0
MOBILE_BUILD_NUMBER=1
MOBILE_BUNDLE_ID=com.influmojo.mobile

# API Configuration
MOBILE_API_TIMEOUT=30000
MOBILE_CACHE_DURATION=3600000

# OAuth Redirects
MOBILE_GOOGLE_REDIRECT_URI=com.influmojo.mobile:/oauth2redirect
MOBILE_FACEBOOK_REDIRECT_URI=com.influmojo.mobile://authorize
```

## 🛠️ **Setup and Usage**

### **1. Generate Mobile .env File**
```bash
# From the project root
node mobile-env-loader.js
```

This will:
- Read the root `.env` file
- Extract mobile-specific variables
- Create `mobile/.env` file
- Generate platform-specific configs

### **2. Use in Your Mobile App**

#### **Option A: Direct Import (Recommended)**
```javascript
// In your React Native components
import { API_URL, GOOGLE_CLIENT_ID } from '@env';

const loginWithGoogle = async () => {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: GOOGLE_CLIENT_ID })
  });
};
```

#### **Option B: Environment Loader**
```javascript
// In your app initialization
import { loadMobileEnv } from './mobile-env-loader';

const initializeApp = async () => {
  const env = await loadMobileEnv();
  
  // Use environment variables
  console.log('API URL:', env.EXPO_PUBLIC_API_URL);
  console.log('App Name:', env.MOBILE_APP_NAME);
};
```

### **3. Platform-Specific Configuration**
The loader creates platform-specific configs:

```json
// config/android-env.json
{
  "apiUrl": "https://your-aws-domain.com",
  "googleClientId": "your-android-client-id",
  "appName": "Influmojo",
  "version": "1.0.0"
}

// config/ios-env.json
{
  "apiUrl": "https://your-aws-domain.com", 
  "googleClientId": "your-ios-client-id",
  "appName": "Influmojo",
  "version": "1.0.0"
}
```

## 🔒 **Security Considerations**

### **Safe to Expose (EXPO_PUBLIC_*)**
- API URLs (endpoints, not credentials)
- OAuth client IDs (public keys)
- App configuration (names, versions)

### **Keep Private**
- API keys and secrets
- Database credentials
- JWT secrets
- OAuth client secrets

## 🚀 **AWS Deployment for Mobile**

### **1. Update Root .env**
```bash
# Update with your AWS domain
EXPO_PUBLIC_API_URL=https://your-aws-domain.com
MOBILE_GOOGLE_REDIRECT_URI=com.influmojo.mobile:/oauth2redirect
```

### **2. Regenerate Mobile Config**
```bash
node mobile-env-loader.js
```

### **3. Build Mobile App**
```bash
# Android
expo build:android

# iOS  
expo build:ios
```

## 📋 **Migration Checklist**

- [ ] Update root `.env` with mobile variables
- [ ] Run `node mobile-env-loader.js` to generate mobile config
- [ ] Remove old `mobile/.env` file
- [ ] Update mobile app imports to use new configuration
- [ ] Test on both Android and iOS
- [ ] Verify OAuth flows work correctly
- [ ] Deploy to AWS and test production

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Environment variables not loading**
   - Check that variables are prefixed with `EXPO_PUBLIC_`
   - Verify the mobile `.env` file was generated
   - Restart your development server

2. **OAuth not working**
   - Verify redirect URIs match your OAuth configuration
   - Check that client IDs are correct for each platform
   - Ensure API URL is accessible from mobile devices

3. **Build errors**
   - Check that all required variables are defined
   - Verify variable names don't contain special characters
   - Ensure mobile `.env` file is in the correct location

### **Debug Commands**
```bash
# Validate mobile environment
node mobile-env-loader.js

# Check generated files
ls -la mobile/.env
ls -la mobile/config/

# Test environment loading
node -e "const { loadMobileEnv } = require('./mobile-env-loader'); console.log(loadMobileEnv());"
```

## 🎉 **Benefits of This Approach**

1. **Single Source of Truth** - All variables in one place
2. **Platform Consistency** - Same configuration across platforms
3. **Easy Updates** - Change once, update everywhere
4. **Better Security** - Clear separation of public vs private variables
5. **Simplified Deployment** - One file to manage for all platforms
6. **Automated Generation** - Mobile configs auto-generated from root

## 📞 **Need Help?**

If you encounter issues:
1. Check the generated mobile `.env` file
2. Verify all required variables are present
3. Test the mobile environment loader
4. Check platform-specific configurations
5. Review OAuth redirect URI configuration
