# 🚀 INFLUMOJO COMPLETE AWS SETUP GUIDE

## 📁 **Project Structure & What Goes Where**

### **Root Level Files**
```
Influmojo-om/
├── .env                    # 🎯 ALL environment variables (single source of truth)
├── .env.production        # 🚀 Production template for AWS
├── .env.public            # 🌐 Public variables (auto-generated)
├── setup-aws-params.js    # 🔧 AWS Parameter Store setup
├── env-loader.js          # 📥 Environment variable loader
└── package.json           # Root dependencies
```

### **Application Directories**
```
├── admin-dashboard/        # 🖥️ Admin dashboard (Next.js)
│   ├── .env.local         # Minimal overrides only
│   └── src/config/env.ts  # Reads from root .env
│
├── backend/               # ⚙️ Backend API (Node.js)
│   ├── src/server.js     # Loads from root .env
│   └── package.json      # Backend dependencies
│
├── mobile/                # 📱 Mobile app (React Native/Expo)
│   ├── config/env.ts     # Reads from root .env during build
│   └── package.json      # Mobile dependencies
│
└── webapp/                # 🌐 Web application (Next.js)
    ├── .env.local        # Minimal overrides only
    └── src/config/env.ts # Reads from root .env
```

## 🎯 **Environment Configuration Strategy**

### **1. Root .env File (Single Source of Truth)**
**Location**: `/Influmojo-om/.env`
**Contains**: ALL environment variables for ALL applications

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/influmojo-dev"

# Security
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Twilio
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"

# StreamChat
STREAM_API_KEY="your-stream-key"
STREAM_API_SECRET="your-stream-secret"

# URLs
WEBAPP_URL="http://localhost:3000"
API_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3002"
EXPO_PUBLIC_API_URL="http://localhost:3002"

# Mobile
EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

### **2. Production Template (.env.production)**
**Location**: `/Influmojo-om/.env.production`
**Contains**: Production values with AWS domains

```bash
# Database
DATABASE_URL="postgresql://postgres:password@your-aws-rds:5432/influmojo-prod"

# URLs (Production)
WEBAPP_URL="https://influmojo.com"
API_URL="https://api.influmojo.com"
NEXT_PUBLIC_API_URL="https://api.influmojo.com"
EXPO_PUBLIC_API_URL="https://api.influmojo.com"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
```

### **3. Public Variables (.env.public)**
**Location**: `/Influmojo-om/.env.public`
**Generated**: Automatically by setup script
**Contains**: Non-sensitive variables only

```bash
# Public variables (safe for client apps)
PORT=80
NODE_ENV=production
GOOGLE_CLIENT_ID=your-public-google-id
STREAM_API_KEY=your-public-stream-key
WEBAPP_URL=https://influmojo.com
NEXT_PUBLIC_API_URL=https://api.influmojo.com
EXPO_PUBLIC_API_URL=https://api.influmojo.com
```

### **4. App-Specific Overrides (.env.local)**
**Location**: `/{app-name}/.env.local`
**Purpose**: Minimal overrides when needed
**Content**: Only variables that differ from root

```bash
# webapp/.env.local
NEXT_PUBLIC_API_URL=https://api.influmojo.com

# admin-dashboard/.env.local
NEXT_PUBLIC_API_URL=https://api.influmojo.com
```

## 🚀 **AWS Setup Process**

### **Phase 1: Local Setup**
```bash
# 1. Install AWS SDK
npm install aws-sdk

# 2. Configure AWS credentials
aws configure

# 3. Copy production template
cp .env.production .env

# 4. Edit with your values
nano .env

# 5. Setup AWS Parameter Store
node setup-aws-params.js
```

### **Phase 2: AWS Infrastructure**
```bash
# 1. Launch EC2 instance
# 2. Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 3. Clone repository
git clone <your-repo>
cd Influmojo-om

# 4. Copy environment files
cp .env .env.public ./

# 5. Update production values
nano .env

# 6. Setup Parameter Store
node setup-aws-params.js
```

### **Phase 3: Deploy Applications**
```bash
# 1. Backend
cd backend
npm install
pm2 start server.js --name "influmojo-backend"

# 2. Web App
cd webapp
npm install
npm run build
pm2 start npm --name "influmojo-webapp" -- start

# 3. Admin Dashboard
cd admin-dashboard
npm install
npm run build
pm2 start npm --name "influmojo-admin" -- start

# 4. Save PM2 configuration
pm2 save
pm2 startup
```

## 🔐 **AWS Parameter Store Structure**

### **Parameter Hierarchy**
```
/influmojo/prod/
├── database-url           # Database connection
├── jwt-secret            # JWT signing secret
├── session-secret        # Session encryption
├── twilio-account-sid    # Twilio credentials
├── twilio-auth-token     # Twilio auth token
├── google-client-secret  # Google OAuth secret
├── stream-api-secret     # StreamChat secret
├── sendgrid-api-key      # SendGrid API key
├── zoho-client-id        # Zoho CRM ID
├── zoho-client-secret    # Zoho CRM secret
├── cloudinary-api-key    # Cloudinary API key
└── cloudinary-api-secret # Cloudinary API secret
```

### **Parameter Store Commands**
```bash
# List parameters
aws ssm describe-parameters --filters "Key=Name,Values=/influmojo/prod/"

# Get parameter
aws ssm get-parameter --name "/influmojo/prod/database-url" --with-decryption

# Update parameter
aws ssm put-parameter --name "/influmojo/prod/jwt-secret" --value "new-secret" --type "SecureString" --overwrite
```

## 📱 **Application Integration**

### **Backend Integration**
**File**: `backend/src/server.js`
```javascript
const EnvLoader = require('../env-loader');

async function startServer() {
  try {
    // Load sensitive variables from AWS Parameter Store
    const envLoader = new EnvLoader();
    await envLoader.loadSensitiveEnvVars();
    
    // Start server
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### **Mobile App Integration**
**File**: `mobile/config/env.ts`
```typescript
const FORCE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.influmojo.com';

export const ENV = {
  API_BASE_URL: FORCE_API_URL,
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
};
```

### **Web App Integration**
**File**: `webapp/src/config/env.ts`
```typescript
const FORCE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.influmojo.com';

export const ENV = {
  API_BASE_URL: FORCE_API_URL,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
};
```

## 🚨 **Security & Best Practices**

### **IAM Roles**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/influmojo/prod/*"
    }
  ]
}
```

### **Security Checklist**
- ✅ **SecureString**: All sensitive parameters encrypted
- ✅ **IAM Roles**: Minimal permissions for EC2
- ✅ **Parameter Encryption**: Automatic encryption at rest
- ✅ **Access Control**: Least-privilege access
- ✅ **Never Commit**: .env files excluded from git
- ✅ **Public Variables**: Only non-sensitive data in .env.public

## 📊 **Monitoring & Health Checks**

### **Health Check Commands**
```bash
# Backend
curl https://api.influmojo.com/health

# Web App
curl https://influmojo.com/health

# Admin Dashboard
curl https://admin.influmojo.com/health
```

### **PM2 Management**
```bash
# View processes
pm2 list

# Monitor
pm2 monit

# View logs
pm2 logs influmojo-backend
pm2 logs influmojo-webapp
pm2 logs influmojo-admin

# Restart
pm2 restart all
```

## 🔄 **Deployment Workflow**

### **Development**
1. Make code changes
2. Test with root .env
3. Commit and push

### **Staging**
1. Deploy to staging
2. Test with staging .env
3. Validate functionality

### **Production**
1. Deploy to AWS
2. Use production .env
3. Load from Parameter Store
4. Monitor health
5. Rollback if needed

## 🆘 **Troubleshooting**

### **Common Issues**
```bash
# AWS credentials not found
aws configure

# Parameter store access denied
aws iam get-user
aws ssm describe-parameters --filters "Key=Name,Values=/influmojo/prod/"

# Environment variables not loading
aws sts get-caller-identity
aws ssm get-parameter --name "/influmojo/prod/port" --region us-east-1
node -e "console.log(process.env.DATABASE_URL)"

# Applications not starting
pm2 list
pm2 logs
pm2 env 0
pm2 restart all
```

## 📋 **Complete Deployment Checklist**

### **Pre-Deployment**
- [ ] AWS account configured
- [ ] Domain names registered
- [ ] SSL certificates generated
- [ ] Environment files prepared
- [ ] Parameter Store setup
- [ ] Dependencies installed

### **Deployment**
- [ ] EC2 instance launched
- [ ] Security groups configured
- [ ] Environment files copied
- [ ] Production values updated
- [ ] Parameter Store accessible
- [ ] All apps deployed

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Domain URLs accessible
- [ ] SSL working
- [ ] All integrations functional
- [ ] Monitoring configured
- [ ] Backups tested

## 🎉 **What You Achieve**

1. **🚀 Single Source of Truth** - One .env file for all apps
2. **🔒 Enhanced Security** - Sensitive data in AWS Parameter Store
3. **📱 Consistent Configuration** - Same values across all applications
4. **🛠️ Easy Maintenance** - Simple to update and manage
5. **☁️ AWS Ready** - Optimized for production deployment
6. **💰 Cost Effective** - Parameter Store is very affordable
7. **📈 Scalable** - Easy to manage across multiple environments

## 🚀 **Next Steps**

1. **Update Values**: Replace placeholders in .env.production
2. **Follow Setup**: Execute AWS setup process step by step
3. **Test Locally**: Ensure all apps work with new structure
4. **Deploy**: Deploy to AWS following the workflow
5. **Monitor**: Set up monitoring and health checks
6. **Optimize**: Optimize based on production usage

---

**🎯 This guide provides everything needed to understand the Influmojo project structure, set up the consolidated environment system, and deploy to AWS successfully. Follow each section carefully for a smooth deployment process.**
