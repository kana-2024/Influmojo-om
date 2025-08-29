# Code Migration Guide for Influmojo

This guide explains what code changes you need to make after consolidating your environment variables to the root folder.

## 🚨 **IMPORTANT: Your Code MUST Be Updated**

Since we've changed variable names and moved the `.env` file to the root, you need to update your code in several places.

## 📋 **What Needs to Be Changed**

### **1. Variable Name Changes**
```bash
# OLD (needs to be updated)
FRONTEND_URL=https://your-domain.com

# NEW (updated in root .env)
WEBAPP_URL=https://your-domain.com
```

### **2. File Location Changes**
```bash
# OLD (subdirectory .env files)
backend/.env
mobile/.env
webapp/.env

# NEW (consolidated root .env)
.env  # (in project root)
```

## 🔍 **Files That Need Updates**

### **Backend Files**
- `backend/src/server.js`
- `backend/src/routes/auth.js`
- `backend/src/routes/chat.js`
- `backend/src/services/streamService.js`
- `backend/src/middlewares/auth.middleware.js`

### **Mobile Files**
- `mobile/config/env.ts`
- `mobile/services/apiService.ts`
- `mobile/services/streamChatService.ts`
- `mobile/app.config.js`

### **Web App Files**
- `admin-dashboard/lib/api.ts`
- `webapp/**/*.ts` (if any)

## 🛠️ **Manual Updates Required**

### **1. Update Backend Code**

#### **In `backend/src/server.js`**
```javascript
// OLD
const PORT = process.env.PORT || 3001;

// NEW (no change needed - this is correct)
const PORT = process.env.PORT || 3001;
```

#### **In `backend/src/routes/auth.js`**
```javascript
// OLD
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// NEW (no change needed - this is correct)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
```

### **2. Update Mobile Code**

#### **In `mobile/config/env.ts`**
```typescript
// OLD
API_BASE_URL: FORCE_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://modest-properly-orca.ngrok-free.app',

// NEW (update the hardcoded URL)
API_BASE_URL: FORCE_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://your-aws-domain.com',
```

#### **In `mobile/services/streamChatService.ts`**
```typescript
// OLD
const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/chat/token`, {

// NEW (update hardcoded URLs)
const response = await fetch(`${process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'https://your-aws-domain.com'}/api/chat/token`, {
```

### **3. Update Web App Code**

#### **In `admin-dashboard/lib/api.ts`**
```typescript
// OLD
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// NEW (no change needed - this is correct)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

## 🔄 **Automatic Migration Script**

Run this script to automatically update most references:

```bash
# From project root
node migrate-code.js
```

## 📝 **Manual Steps You Must Do**

### **1. Remove Old .env Files**
```bash
# Remove old environment files
rm backend/.env
rm mobile/.env
rm webapp/.env
rm admin-dashboard/.env
```

### **2. Update Import Paths**
If your code imports environment variables from specific paths, update them to use the root `.env`.

### **3. Test Environment Loading**
```bash
# Test backend
cd backend
node -e "console.log('PORT:', process.env.PORT); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');"

# Test mobile config
cd mobile
node -e "console.log('API_URL:', process.env.EXPO_PUBLIC_API_URL);"
```

## 🚀 **Quick Migration Commands**

### **1. Update Variable Names (if any)**
```bash
# Find all FRONTEND_URL references
grep -r "FRONTEND_URL" . --exclude-dir=node_modules --exclude-dir=.git

# Replace with WEBAPP_URL
find . -name "*.js" -o -name "*.ts" | xargs sed -i 's/FRONTEND_URL/WEBAPP_URL/g'
```

### **2. Update Hardcoded URLs**
```bash
# Find hardcoded URLs
grep -r "modest-properly-orca.ngrok-free.app" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "fair-legal-gar.ngrok-free.app" . --exclude-dir=node_modules --exclude-dir=.git
```

### **3. Regenerate Mobile Config**
```bash
# Generate new mobile environment files
node mobile-env-loader.js
```

## ✅ **Verification Checklist**

- [ ] All `FRONTEND_URL` references changed to `WEBAPP_URL`
- [ ] Hardcoded URLs replaced with environment variables
- [ ] Old `.env` files removed from subdirectories
- [ ] Mobile environment regenerated
- [ ] Backend can access environment variables
- [ ] Mobile app can access environment variables
- [ ] Web app can access environment variables

## 🆘 **Common Issues & Solutions**

### **Issue: Environment variables not loading**
```bash
# Solution: Check if root .env exists
ls -la .env

# Solution: Verify variable names match
grep "WEBAPP_URL" .env
```

### **Issue: Mobile app can't find variables**
```bash
# Solution: Regenerate mobile config
node mobile-env-loader.js

# Solution: Check mobile .env file
ls -la mobile/.env
```

### **Issue: Backend can't find variables**
```bash
# Solution: Check if running from root directory
pwd

# Solution: Verify environment loading
node -e "require('dotenv').config(); console.log(process.env.PORT);"
```

## 🎯 **Summary**

**YES, your code needs updates** because:

1. **Variable names changed** (`FRONTEND_URL` → `WEBAPP_URL`)
2. **File locations changed** (subdirectory `.env` → root `.env`)
3. **Hardcoded URLs** need to be replaced with environment variables

**But don't worry!** Most of your code will work without changes. The main updates are:
- Removing old `.env` files
- Updating a few hardcoded URLs
- Regenerating mobile configuration

Run the migration script and follow this guide to get everything working smoothly! 🚀
