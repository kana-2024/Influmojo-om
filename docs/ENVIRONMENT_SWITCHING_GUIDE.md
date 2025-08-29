# 🔄 Environment Switching Guide

## 🎯 **Overview**

This guide explains how to switch between development and production environments for all Influmojo apps. Each app now has its own `.env.development` file for local development, and automatically switches to AWS Parameter Store when deployed to production.

## 📱 **App Structure**

```
Influmojo/
├── backend/                 # Node.js/Express API
│   └── .env.development    # Local development config
├── webapp/                  # Next.js Web App
│   └── .env.development    # Local development config
├── admin-dashboard/         # Next.js Admin Dashboard
│   └── .env.development    # Local development config
├── mobile/                  # React Native/Expo App
│   └── .env.development    # Local development config
└── scripts/
    └── setup-aws-params.js # AWS Parameter Store setup
```

## 🔧 **Local Development**

### **Backend API**
```bash
cd backend
# Uses .env.development automatically
npm run dev
```

**Environment Variables:**
- `NODE_ENV=development`
- `PORT=3002`
- `DATABASE_URL=postgresql://localhost:5432/influmojo-test`
- `JWT_SECRET=dev_jwt_secret_here...`

### **Webapp (Next.js)**
```bash
cd webapp
# Uses .env.development automatically
npm run dev
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL=http://localhost:3002`
- `NEXT_PUBLIC_WEBAPP_URL=http://localhost:3000`
- `NEXT_PUBLIC_STREAMCHAT_API_KEY=m7zjhhjc9bws`

### **Admin Dashboard (Next.js)**
```bash
cd admin-dashboard
# Uses .env.development automatically
npm run dev
```

**Environment Variables:**
- `NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3002`
- `NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY=m7zjhhjc9bws`

### **Mobile App (Expo)**
```bash
cd mobile
# Uses .env.development automatically
npm start
```

**Environment Variables:**
- `EXPO_PUBLIC_API_URL=http://localhost:3002`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID=401925027822-...`
- `EXPO_PUBLIC_STREAMCHAT_API_KEY=m7zjhhjc9bws`

## 🚀 **Production Deployment**

### **1. Set Up AWS Parameter Store**

```bash
# Install AWS SDK
npm install aws-sdk

# Configure AWS credentials
aws configure

# Run the setup script
node scripts/setup-aws-params.js
```

This creates parameters under:
- `/influmojo/production/backend/*`
- `/influmojo/production/webapp/*`
- `/influmojo/production/admin-dashboard/*`
- `/influmojo/production/mobile/*`

### **2. Update Production Values**

After running the setup script, update the placeholder values in AWS Parameter Store with your actual production secrets:

```bash
# Example: Update JWT secret
aws ssm put-parameter \
  --name "/influmojo/production/backend/JWT_SECRET" \
  --value "your_actual_jwt_secret_here" \
  --type "SecureString" \
  --overwrite

# Example: Update database URL
aws ssm put-parameter \
  --name "/influmojo/production/backend/DATABASE_URL" \
  --value "postgresql://user:pass@your-rds-endpoint:5432/influmojo" \
  --type "SecureString" \
  --overwrite
```

### **3. Automatic Environment Switching**

When you deploy to production:

**Backend:**
- Sets `NODE_ENV=production`
- Automatically loads from AWS Parameter Store
- Falls back to `.env.development` if SSM fails

**Frontend Apps (Webapp, Admin Dashboard, Mobile):**
- Build process reads from AWS Parameter Store
- Creates production `.env.local` files
- No sensitive data in build artifacts

## 🔄 **Environment Switching Logic**

### **Backend Auto-Switching**

```javascript
// backend/src/utils/awsParameterStore.js
async loadProductionEnvVars() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔄 Not in production mode, skipping AWS Parameter Store');
    return {};
  }

  // Load from AWS Parameter Store
  const parameters = [
    '/influmojo/production/backend/JWT_SECRET',
    '/influmojo/production/backend/DATABASE_URL',
    // ... more parameters
  ];

  const loadedVars = await this.getParameters(parameters);
  
  // Override environment variables
  Object.entries(loadedVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
}
```

### **Frontend Build Process**

```bash
# Webapp build (example)
cd webapp
NODE_ENV=production npm run build

# This will:
# 1. Read from AWS Parameter Store
# 2. Create .env.local with production values
# 3. Build with production configuration
```

## 🛠️ **Development Workflow**

### **Daily Development**
1. **Start Backend:** `cd backend && npm run dev`
2. **Start Webapp:** `cd webapp && npm run dev`
3. **Start Admin:** `cd admin-dashboard && npm run dev`
4. **Start Mobile:** `cd mobile && npm start`

All apps use their local `.env.development` files automatically.

### **Testing Production Config**
```bash
# Test backend with production config locally
cd backend
NODE_ENV=production npm run dev

# This will attempt to load from AWS Parameter Store
# Falls back to .env.development if SSM is not accessible
```

### **Deploying to Production**
1. **Push to main branch** (triggers CI/CD)
2. **CI/CD sets NODE_ENV=production**
3. **Apps automatically load from AWS Parameter Store**
4. **No manual environment file management needed**

## 🔒 **Security Benefits**

### **Development**
- ✅ **Local secrets** in `.env.development` files
- ✅ **No production data** exposed locally
- ✅ **Easy debugging** with local values

### **Production**
- ✅ **Secrets stored securely** in AWS Parameter Store
- ✅ **No secrets in code** or build artifacts
- ✅ **Automatic rotation** support
- ✅ **Access control** via IAM policies

## 📋 **Environment Variable Mapping**

### **Backend Parameters**
| Local (.env.development) | AWS Parameter Store |
|--------------------------|---------------------|
| `JWT_SECRET` | `/influmojo/production/backend/JWT_SECRET` |
| `DATABASE_URL` | `/influmojo/production/backend/DATABASE_URL` |
| `GOOGLE_CLIENT_SECRET` | `/influmojo/production/backend/GOOGLE_CLIENT_SECRET` |

### **Webapp Parameters**
| Local (.env.development) | AWS Parameter Store |
|--------------------------|---------------------|
| `NEXT_PUBLIC_API_URL` | `/influmojo/production/webapp/NEXT_PUBLIC_API_URL` |
| `NEXT_PUBLIC_WEBAPP_URL` | `/influmojo/production/webapp/NEXT_PUBLIC_WEBAPP_URL` |

### **Mobile Parameters**
| Local (.env.development) | AWS Parameter Store |
|--------------------------|---------------------|
| `EXPO_PUBLIC_API_URL` | `/influmojo/production/mobile/EXPO_PUBLIC_API_URL` |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | `/influmojo/production/mobile/EXPO_PUBLIC_GOOGLE_CLIENT_ID` |

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend can't connect to AWS Parameter Store**
   - Check IAM permissions
   - Verify AWS region configuration
   - Check network connectivity

2. **Frontend build fails in production**
   - Ensure Parameter Store parameters exist
   - Check parameter names match exactly
   - Verify CI/CD has AWS access

3. **Environment variables not loading**
   - Check `NODE_ENV` is set correctly
   - Verify parameter paths in AWS
   - Check parameter values are not empty

### **Debug Commands**

```bash
# Check AWS Parameter Store parameters
aws ssm get-parameters-by-path \
  --path "/influmojo/production" \
  --recursive \
  --with-decryption

# Test backend environment loading
cd backend
NODE_ENV=production node -e "
const awsPS = require('./src/utils/awsParameterStore');
awsPS.loadProductionEnvVars().then(console.log);
"
```

## 🎯 **Summary**

This new approach provides:

- ✅ **Clean separation** between apps
- ✅ **Automatic switching** between dev/prod
- ✅ **Secure production secrets** in AWS Parameter Store
- ✅ **Easy local development** with `.env.development` files
- ✅ **No manual environment management** in production
- ✅ **Consistent structure** across all apps

**Remember:** Each app maintains its own environment configuration, but they all automatically switch to production values when deployed to AWS!
