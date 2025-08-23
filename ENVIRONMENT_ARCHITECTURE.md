# 🌍 Environment Variable Architecture - Influmojo

## 🏗️ **How Environment Variables Actually Work**

### **Single Source of Truth: Root .env**
```bash
Influmojo-om/
├── .env                    # 🎯 SINGLE SOURCE OF TRUTH
├── backend/                # No .env needed
├── webapp/                 # No .env needed  
└── mobile/                 # No .env needed
```

## 🔄 **How Each App Loads Variables**

### **1. Backend (Node.js) - Runs on EC2**
```javascript
// backend/src/server.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Result: process.env.JWT_SECRET, process.env.DATABASE_URL, etc.
```

**What happens:**
- ✅ Loads from root `.env` file
- ✅ In production: AWS Parameter Store overrides sensitive values
- ✅ No duplicate `.env` files needed

### **2. Web App (Next.js) - Runs on EC2/CloudFront**
```javascript
// webapp/src/app/page.tsx
// Next.js automatically loads from root .env
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const webappUrl = process.env.WEBAPP_URL;
```

**What happens:**
- ✅ Next.js automatically loads from root `.env`
- ✅ `NEXT_PUBLIC_*` variables exposed to browser
- ✅ Other variables only available server-side
- ✅ **No .env.local needed** - Next.js finds root .env automatically

### **3. Mobile App (React Native) - Runs on devices**
```javascript
// mobile/App.tsx
// Expo automatically loads from root .env
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
```

**What happens:**
- ✅ Expo automatically loads from root `.env`
- ✅ `EXPO_PUBLIC_*` variables bundled into app
- ✅ Variables available at runtime
- ✅ **No .env in mobile directory needed** - Expo uses root .env automatically

## 🚀 **AWS Deployment Architecture**

### **EC2 Instance Structure:**
```bash
/var/www/influmojo/
├── .env                    # Root .env file (copied from your repo)
├── backend/                # Backend code
├── webapp/                 # Web app code
└── mobile/                 # Mobile app code (for building)
```

### **Environment Variable Flow:**
```bash
Root .env → Backend Server → AWS Parameter Store (sensitive)
     ↓
Root .env → Next.js Web App
     ↓  
Root .env → Expo Mobile App
```

## ✅ **Benefits of This Architecture**

### **1. Single Source of Truth**
- ✅ **One .env file** to manage all variables
- ✅ **No duplication** across apps
- ✅ **Easy updates** - change once, affects all apps
- ✅ **No subdirectory .env files** - clean and simple

### **2. AWS Integration**
- ✅ **Backend** loads sensitive data from AWS Parameter Store
- ✅ **Web/Mobile** use non-sensitive data from root .env
- ✅ **Automatic override** in production

### **3. Development Workflow**
- ✅ **Local development** - all apps use root .env
- ✅ **Production deployment** - copy entire repo to EC2
- ✅ **No environment switching** needed
- ✅ **No file management** - just one .env file

## 🔧 **How to Deploy**

### **Step 1: Prepare Your Code**
```bash
# Your repo structure
Influmojo-om/
├── .env                    # Production environment variables
├── backend/                # Backend code
├── webapp/                 # Web app code
└── mobile/                 # Mobile app code
```

### **Step 2: Deploy to EC2**
```bash
# Copy entire repo to EC2
scp -r Influmojo-om/ ec2-user@your-ec2-ip:/var/www/

# On EC2
cd /var/www/Influmojo-om
```

### **Step 3: Start Services**
```bash
# Backend
cd backend && npm install && node src/server.js

# Web App  
cd webapp && npm install && npm run build && npm start

# Mobile (build for distribution)
cd mobile && eas build
```

## 🎯 **Summary**

- ✅ **Root .env** - Single source of truth for all apps
- ✅ **Backend** - Loads from root .env + AWS Parameter Store
- ✅ **Web App** - Next.js automatically loads from root .env
- ✅ **Mobile App** - Expo automatically loads from root .env
- ✅ **No duplication** - One file manages all environments
- ✅ **No subdirectory .env files** - clean architecture
- ✅ **Easy deployment** - Copy entire repo to EC2

## 🧹 **What We Removed**

- ❌ **webapp/.env.local** - Not needed, Next.js uses root .env
- ❌ **mobile/.env** - Not needed, Expo uses root .env
- ✅ **Only root .env** - Single source of truth

**This is the correct, clean architecture for AWS deployment!** 🚀
