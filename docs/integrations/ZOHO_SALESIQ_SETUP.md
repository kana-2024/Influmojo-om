# Zoho SalesIQ React Native SDK Setup Guide

## 🎯 **Overview**

This guide explains how to set up the **official Zoho SalesIQ React Native SDK** for your Influ Mojo app. This is the recommended approach as it provides:

- ✅ **Native performance** - Built specifically for React Native
- ✅ **Official support** - Direct from Zoho
- ✅ **Full features** - All Zoho SalesIQ capabilities
- ✅ **Easy integration** - Simple setup process

## 📦 **What We've Installed**

```bash
npm install react-native-zohosalesiq-mobilisten --save
```

## 🚀 **Step-by-Step Setup**

### **Step 1: Get Zoho SalesIQ App Keys**

1. **Go to Zoho SalesIQ Console:**
   - Visit: https://salesiq.zoho.com/
   - Sign in to your Zoho SalesIQ account

2. **Generate iOS App Key and Access Key:**
   - Go to **Settings** → **Brands** → **Installation**
   - Choose **iOS**
   - Enter your app's bundle ID: `com.influmojo.mobile`
   - Click **Generate Token**
   - Copy the **App Key** and **Access Key**

3. **Generate Android App Key and Access Key:**
   - Go to **Settings** → **Brands** → **Installation**
   - Choose **Android**
   - Enter your app's package name: `com.influmojo.mobile`
   - Click **Generate**
   - Copy the **App Key** and **Access Key**

### **Step 2: Update Environment Variables**

Update your `mobile/.env` file with the actual keys:

```env
# Zoho SalesIQ Configuration
EXPO_PUBLIC_ZOHO_IOS_APP_KEY="your_actual_ios_app_key"
EXPO_PUBLIC_ZOHO_IOS_ACCESS_KEY="your_actual_ios_access_key"
EXPO_PUBLIC_ZOHO_ANDROID_APP_KEY="your_actual_android_app_key"
EXPO_PUBLIC_ZOHO_ANDROID_ACCESS_KEY="your_actual_android_access_key"
```

### **Step 3: iOS Configuration (if needed)**

If you're building for iOS, you may need to:

1. **Navigate to iOS folder:**
   ```bash
   cd ios
   pod install
   ```

2. **Update Info.plist** (optional):
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
   </dict>
   ```

### **Step 4: Android Configuration (if needed)**

If you're building for Android, you may need to:

1. **Add Maven repository** to `android/settings.gradle`:
   ```gradle
   dependencyResolutionManagement {
       repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
       repositories {
           google()
           mavenCentral()
           maven { url 'https://maven.zohodl.com' }
       }
   }
   ```

2. **Add permissions** to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
   ```

## 🔧 **How the Integration Works**

### **1. Initialization**
```typescript
// The SDK automatically initializes when the chat widget is opened
ZohoSalesIQ.initWithCallback(appKey, accessKey, (success) => {
  if (success) {
    // Chat is ready to use
    ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.ALWAYS);
  }
});
```

### **2. Chat Launcher**
- Shows a floating chat button
- Users can tap to start chatting
- Integrates seamlessly with your app

### **3. Visitor Information**
- Automatically tracks user information
- Links chat sessions to your app users
- Provides context to support agents

## 📱 **Features Available**

### **✅ What's Included:**
- **Real-time chat** with support agents
- **File sharing** capabilities
- **Chat history** preservation
- **Push notifications** for new messages
- **Visitor tracking** and analytics
- **Custom branding** options
- **Multi-language support**
- **Offline message queuing**

### **✅ Benefits:**
- **Native performance** - No WebView overhead
- **Official support** - Direct from Zoho
- **Full customization** - Brand colors, fonts, etc.
- **Analytics** - Track chat usage and satisfaction
- **Integration** - Works with Zoho CRM/Desk

## 🎨 **Customization Options**

### **1. Chat Launcher Appearance**
```typescript
// Customize the floating chat button
ZohoSalesIQ.Launcher.setVisibilityModeToCustomLauncher(
  ZohoSalesIQ.Launcher.VisibilityMode.ALWAYS
);
```

### **2. Brand Colors**
- Configure in Zoho SalesIQ console
- Match your app's color scheme
- Custom fonts and styling

### **3. Chat Widget**
- Custom welcome messages
- Department routing
- Operating hours
- Auto-responses

## 🧪 **Testing the Integration**

### **1. Development Testing:**
```bash
cd mobile
npx expo start --clear
```

### **2. Test Flow:**
1. Open your app
2. Navigate to Orders screen
3. Tap "Chat with Support"
4. Verify Zoho SalesIQ launcher appears
5. Start a test conversation

### **3. Production Testing:**
- Deploy to TestFlight/Play Store
- Test with real Zoho SalesIQ agents
- Verify all features work correctly

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"App Key Invalid" Error:**
   - Verify app keys in Zoho console
   - Check bundle ID/package name matches
   - Ensure keys are for correct platform

2. **Chat Not Appearing:**
   - Check internet connection
   - Verify initialization success
   - Check console logs for errors

3. **iOS Build Issues:**
   - Run `cd ios && pod install`
   - Clean build folder
   - Check Xcode settings

4. **Android Build Issues:**
   - Verify Maven repository added
   - Check Gradle sync
   - Clean and rebuild

## 📞 **Support Resources**

### **Zoho Documentation:**
- [React Native SDK Guide](https://www.zoho.com/salesiq/help/developer-section/react-native-sdk-installation.html)
- [API Reference](https://www.zoho.com/salesiq/help/developer-section/react-native-sdk-api-reference.html)
- [Sample App](https://www.zoho.com/salesiq/help/developer-section/react-native-sdk-sample-app.html)

### **Contact Support:**
- **Zoho SalesIQ Support:** support@zohosalesiq.com
- **Technical Issues:** Check Zoho community forums

## 🎉 **Next Steps**

1. **Get your App Keys** from Zoho SalesIQ console
2. **Update environment variables** with real keys
3. **Test the integration** in development
4. **Deploy to production** when ready
5. **Train your support team** on Zoho SalesIQ

## 💡 **Best Practices**

1. **Test thoroughly** before production
2. **Configure branding** to match your app
3. **Set up departments** for different support areas
4. **Train agents** on the new system
5. **Monitor analytics** for chat performance
6. **Gather feedback** from users

---

**🎯 Result:** You now have a fully functional, native Zoho SalesIQ chat integration that provides excellent user experience and full feature support!