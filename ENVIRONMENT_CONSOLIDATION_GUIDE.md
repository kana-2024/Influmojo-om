# INFLUMOJO ENVIRONMENT CONSOLIDATION GUIDE

## 🎯 Overview

This guide explains the new consolidated environment structure that eliminates duplicate `.env` files and provides a single source of truth for all applications.

## 📁 New Environment Structure

```
Influmojo-om/
├── .env                          # 🎯 SINGLE SOURCE OF TRUTH
├── .env.production              # 🚀 AWS Production Template
├── webapp/
│   └── .env.local              # 📱 Web App Overrides (minimal)
├── admin-dashboard/
│   └── .env.local              # 🖥️ Admin Dashboard Overrides (minimal)
├── backend/                     # ❌ No .env needed
└── mobile/                      # ❌ No .env needed
```

## 🔧 What Changed

### ✅ **BEFORE (Multiple Files)**
- `backend/.env` - Backend configuration
- `mobile/.env` - Mobile configuration  
- `webapp/.env.local` - Web app configuration
- `admin-dashboard/.env.local` - Admin dashboard configuration
- **Result**: Duplicate variables, inconsistent values, hard to maintain

### ✅ **AFTER (Consolidated)**
- **Root `.env`** - All environment variables in one place
- **App-specific `.env.local`** - Only for overrides when needed
- **Result**: Single source of truth, consistent values, easy to maintain

## 🚀 AWS Deployment Process

### 1. **Prepare Root Environment File**
```bash
# Copy production template
cp .env.production .env

# Edit with your AWS values
nano .env
```

### 2. **Update Production Values**
```bash
# Update these in your .env file:
NODE_ENV=production
PORT=80
DATABASE_URL=postgresql://postgres:password@your-aws-rds-endpoint:5432/influmojo
AWS_ACCESS_KEY_ID=your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
```

### 3. **Set Up AWS Parameter Store**
```bash
# Run the AWS Parameter Store setup script
cd backend
node setup-aws-params.js
```

### 4. **Deploy to AWS Server**
```bash
# Copy environment files to AWS server
scp .env user@your-aws-server:/var/www/influmojo/
scp .env.production user@your-aws-server:/var/www/influmojo/

# SSH into your AWS server
ssh user@your-aws-server

# Navigate to your app directory
cd /var/www/influmojo

# Edit production values
nano .env
```

## 🔐 AWS Parameter Store Integration

### **Sensitive Variables (Automatically Loaded)**
The backend automatically loads these from AWS Parameter Store in production:

```bash
# Database
/influmojo/production/database_url

# Security
/influmojo/production/jwt_secret
/influmojo/production/session_secret

# Third-party Services
/influmojo/production/twilio_account_sid
/influmojo/production/twilio_auth_token
/influmojo/production/twilio_verify_service_sid
/influmojo/production/google_client_secret
/influmojo/production/facebook_app_secret
/influmojo/production/stream_api_secret
/influmojo/production/sendgrid_api_key

# CRM & Storage
/influmojo/production/zoho_client_id
/influmojo/production/zoho_client_secret
/influmojo/production/zoho_refresh_token
/influmojo/production/cloudinary_cloud_name
/influmojo/production/cloudinary_api_key
/influmojo/production/cloudinary_api_secret
```

### **Non-Sensitive Variables (Loaded from .env)**
These are loaded directly from the `.env` file:

```bash
# App Configuration
NODE_ENV=production
PORT=80
WEBAPP_URL=https://influmojo.com
API_URL=https://api.influmojo.com

# Public Keys
GOOGLE_CLIENT_ID=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com
STREAM_API_KEY=m7zjhhjc9bws

# Mobile App Variables
EXPO_PUBLIC_API_URL=https://api.influmojo.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com
```

## 📱 Application-Specific Configuration

### **Web App (Next.js)**
- **File**: `webapp/.env.local`
- **Purpose**: Web app specific overrides
- **Variables**: `NEXT_PUBLIC_*` prefixed variables
- **Loading**: Next.js automatically loads from root `.env`

### **Admin Dashboard (Next.js)**
- **File**: `admin-dashboard/.env.local`
- **Purpose**: Admin dashboard specific overrides
- **Variables**: `NEXT_PUBLIC_*` prefixed variables
- **Loading**: Next.js automatically loads from root `.env`

### **Backend (Node.js)**
- **File**: No `.env` needed
- **Purpose**: All variables loaded from root `.env`
- **Loading**: Backend server loads from root `.env` with path resolution

### **Mobile App (Expo)**
- **File**: No `.env` needed
- **Purpose**: Variables embedded during build
- **Loading**: Expo reads `EXPO_PUBLIC_*` variables from root `.env` during build

## 🧹 Cleanup Commands

### **Remove Old Environment Files**
```bash
# Remove duplicate backend .env
rm backend/.env

# Remove duplicate mobile .env  
rm mobile/.env

# Keep only root .env and app-specific .env.local files
```

### **Verify Clean Structure**
```bash
# Check for any remaining .env files
find . -name ".env*" -type f

# Should only show:
# ./.env
# ./.env.production
# ./webapp/.env.local
# ./admin-dashboard/.env.local
```

## 🔍 Verification Steps

### **1. Test Backend Loading**
```bash
cd backend
node -e "
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('✅ Backend environment loaded successfully');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
"
```

### **2. Test Web App Loading**
```bash
cd webapp
node -e "
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('✅ Web app environment loaded successfully');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
"
```

### **3. Test Admin Dashboard Loading**
```bash
cd admin-dashboard
node -e "
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('✅ Admin dashboard environment loaded successfully');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
"
```

## 🚨 Important Notes

### **Security**
- ✅ **Never commit `.env` files** to version control
- ✅ **Use AWS Parameter Store** for sensitive production values
- ✅ **Root `.env`** contains development values only
- ✅ **Production `.env`** contains production values

### **Deployment**
- ✅ **Copy root `.env`** to AWS server
- ✅ **Update production values** on AWS server
- ✅ **Set up AWS Parameter Store** for sensitive data
- ✅ **All apps** automatically use the same environment

### **Development**
- ✅ **Single `.env` file** to manage all variables
- ✅ **No duplicate configuration** across apps
- ✅ **Easy to maintain** and update
- ✅ **Consistent values** across all applications

## 📞 Support

If you encounter any issues:

1. **Check file paths** - Ensure root `.env` exists
2. **Verify variable names** - Check for typos in variable names
3. **Test loading** - Use verification commands above
4. **Check AWS setup** - Ensure Parameter Store is configured

## 🎉 Benefits

- **🚀 Single Source of Truth** - One `.env` file for all apps
- **🔒 Secure** - Sensitive data in AWS Parameter Store
- **📱 Consistent** - Same values across all applications
- **🛠️ Maintainable** - Easy to update and manage
- **☁️ AWS Ready** - Optimized for production deployment
