# Google OAuth Setup for Mobile App

## 🚨 **Current Issue**
You're using a web client ID for mobile authentication, which doesn't work. Mobile apps need platform-specific OAuth client IDs.

## 🛠️ **Step-by-Step Setup**

### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** > **Credentials**

### **Step 2: Create Android OAuth Client ID**
1. Click **"Create Credentials"** > **"OAuth client ID"**
2. Choose **"Android"** as application type
3. Fill in:
   - **Package name**: `com.influmojo.mobile`
   - **SHA-1 certificate fingerprint**: Get this from your development environment

### **Step 3: Create iOS OAuth Client ID**
1. Click **"Create Credentials"** > **"OAuth client ID"**
2. Choose **"iOS"** as application type
3. Fill in:
   - **Bundle ID**: `com.influmojo.mobile`

### **Step 4: Get SHA-1 Fingerprint for Android**

#### **Option A: Using Expo Development Build**
```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build development version
eas build --platform android --profile development
```

#### **Option B: Using Android Studio/Emulator**
```bash
# For debug keystore (development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### **Option C: Using Expo's SHA-1**
1. Go to https://expo.dev
2. Select your project
3. Go to **Credentials** > **Android**
4. Copy the SHA-1 fingerprint

### **Step 5: Update Environment Variables**

After creating the OAuth client IDs, update your `mobile/.env` file:

```env
# Android OAuth Client ID
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_google_android_client_id_here

# iOS OAuth Client ID  
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=YOUR_IOS_CLIENT_ID_HERE
```

### **Step 6: Test the Setup**

1. **Restart your mobile app** to load the new environment variables
2. **Test Google signup** - it should now work properly

## 📱 **Your App Configuration**
- **Android Package**: `com.influmojo.mobile`
- **iOS Bundle ID**: `com.influmojo.mobile`
- **Current Web Client ID**: `401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com`

## 🔧 **What's Already Fixed**
- ✅ Backend is working and accessible via ngrok
- ✅ Mobile app configuration updated for platform-specific OAuth
- ✅ Token type issue fixed (now using idToken instead of accessToken)
- ✅ Database connection working

## 🎯 **Next Steps**
1. Create Android and iOS OAuth client IDs in Google Cloud Console
2. Add the client IDs to your `.env` file
3. Test Google signup in your mobile app

## ❓ **Need Help?**
- If you can't get the SHA-1 fingerprint, use Expo's development build
- The web client ID can stay as is (it's used for server-side verification)
- Make sure to enable Google Sign-In API in your Google Cloud Console 