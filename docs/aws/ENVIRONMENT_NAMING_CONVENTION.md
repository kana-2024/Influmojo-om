# Environment Variable Naming Convention for Influmojo

This document explains the contextual naming convention used in the consolidated `.env` file to make it clear which variables belong to which part of the system.

## 🎯 **Naming Convention Overview**

Since we now have a **single consolidated `.env` file**, we use **contextual prefixes** to clearly identify which variables belong to which part of the system.

## 📋 **Variable Categories and Naming**

### **1. Backend Variables (No Prefix)**
These are used by the Node.js backend server:
```bash
# Database
DATABASE_URL="postgresql://username:password@your-aws-rds-endpoint:5432/influmojo-prod"

# Server
PORT=3002
NODE_ENV=production

# JWT & Session
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# API Keys (Sensitive)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SENDGRID_API_KEY=your-sendgrid-key
STREAM_API_SECRET=your-stream-secret
```

### **2. Web Application Variables (WEBAPP_*)**
These are used by the Next.js web application:
```bash
# Web App URLs
WEBAPP_URL=https://your-aws-domain.com
NEXT_PUBLIC_API_URL=https://your-aws-domain.com

# OAuth Callbacks (Web)
GOOGLE_CALLBACK_URL=https://your-aws-domain.com/api/auth/google/callback
FACEBOOK_CALLBACK_URL=https://your-aws-domain.com/api/auth/facebook/callback
```

### **3. Mobile Application Variables (MOBILE_*)**
These are used by the React Native mobile app:
```bash
# Mobile App Configuration
MOBILE_APP_NAME=Influmojo
MOBILE_APP_VERSION=1.0.0
MOBILE_BUILD_NUMBER=1
MOBILE_BUNDLE_ID=com.influmojo.mobile

# Mobile API Configuration
MOBILE_API_TIMEOUT=30000
MOBILE_CACHE_DURATION=3600000

# Mobile OAuth Redirects
MOBILE_GOOGLE_REDIRECT_URI=com.influmojo.mobile:/oauth2redirect
MOBILE_FACEBOOK_REDIRECT_URI=com.influmojo.mobile://authorize
```

### **4. Public Variables (EXPO_PUBLIC_*)**
These are safe to expose in client-side code (both web and mobile):
```bash
# API URLs (Public)
EXPO_PUBLIC_API_URL=https://your-aws-domain.com

# OAuth Client IDs (Public Keys)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id
```

### **5. AWS Configuration Variables (AWS_*)**
These are specific to AWS deployment:
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 🔄 **Migration from Old Naming**

### **Before (Generic Names)**
```bash
FRONTEND_URL=https://your-domain.com          # ❌ Too generic
API_URL=https://your-domain.com               # ❌ Unclear context
```

### **After (Contextual Names)**
```bash
WEBAPP_URL=https://your-domain.com            # ✅ Clear - web app specific
NEXT_PUBLIC_API_URL=https://your-domain.com   # ✅ Clear - Next.js public API
MOBILE_API_TIMEOUT=30000                      # ✅ Clear - mobile specific
```

## 📱 **Usage in Different Applications**

### **Backend Usage**
```javascript
// server.js
const port = process.env.PORT || 3002;
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

### **Web App Usage**
```javascript
// Next.js components
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const webappUrl = process.env.WEBAPP_URL;
```

### **Mobile App Usage**
```javascript
// React Native components
import { 
  EXPO_PUBLIC_API_URL,
  MOBILE_APP_NAME,
  MOBILE_API_TIMEOUT 
} from '@env';
```

## 🎨 **Benefits of This Naming Convention**

1. **Clear Context** - Immediately know which part of the system uses each variable
2. **No Confusion** - Eliminates ambiguity between similar variables
3. **Easy Maintenance** - Developers can quickly find relevant variables
4. **Better Security** - Clear separation of public vs private variables
5. **Simplified Deployment** - One file with clear organization

## 📝 **Adding New Variables**

When adding new environment variables, follow this pattern:

```bash
# Backend variable (no prefix)
NEW_BACKEND_FEATURE=value

# Web app variable
WEBAPP_NEW_FEATURE=value

# Mobile app variable
MOBILE_NEW_FEATURE=value

# Public variable (safe for client-side)
EXPO_PUBLIC_NEW_FEATURE=value

# AWS specific variable
AWS_NEW_FEATURE=value
```

## 🔍 **Finding Variables by Category**

### **Backend Variables**
```bash
grep -E "^[A-Z_]+=" .env | grep -v -E "(WEBAPP_|MOBILE_|EXPO_PUBLIC_|AWS_)"
```

### **Web App Variables**
```bash
grep -E "^WEBAPP_|^NEXT_PUBLIC_" .env
```

### **Mobile Variables**
```bash
grep -E "^MOBILE_|^EXPO_PUBLIC_" .env
```

### **AWS Variables**
```bash
grep -E "^AWS_" .env
```

## 🎯 **Summary**

The new naming convention makes it **immediately clear** which variables belong to which part of your system:

- **No prefix** = Backend variables
- **WEBAPP_** = Web application variables  
- **MOBILE_** = Mobile application variables
- **EXPO_PUBLIC_** = Public variables (safe for client-side)
- **AWS_** = AWS-specific configuration

This eliminates confusion and makes your consolidated `.env` file much easier to manage! 🚀
