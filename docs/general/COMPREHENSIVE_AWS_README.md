# 🚀 INFLUMOJO COMPREHENSIVE AWS SETUP & DEPLOYMENT GUIDE

## 📁 **Complete Project Structure**

```
Influmojo-om/
├── 📄 .env                          # 🎯 SINGLE SOURCE OF TRUTH - All environment variables
├── 📄 .env.production              # 🚀 AWS Production template
├── 📄 .env.public                  # 🌐 Public variables (auto-generated)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Root package dependencies
├── 📄 README.md                    # Main project documentation
│
├── 🔧 **AWS Setup Files**
│   ├── 📄 setup-aws-params.js      # AWS Parameter Store configuration
│   ├── 📄 env-loader.js            # Environment variable loader utility
│   ├── 📄 server-usage-example.js  # Backend integration example
│   └── 📄 AWS_DEPLOYMENT_GUIDE.md  # Detailed AWS deployment guide
│
├── 🖥️ **Admin Dashboard** (`/admin-dashboard`)
│   ├── 📄 package.json             # Next.js admin dashboard
│   ├── 📄 .env.local               # Admin-specific overrides (minimal)
│   ├── 📁 app/                     # Next.js app router
│   ├── 📁 components/              # React components
│   ├── 📁 hooks/                   # Custom React hooks
│   ├── 📁 lib/                     # Utility libraries
│   └── 📁 types/                   # TypeScript type definitions
│
├── ⚙️ **Backend API** (`/backend`)
│   ├── 📄 package.json             # Node.js backend dependencies
│   ├── 📁 prisma/                  # Database schema and migrations
│   ├── 📁 src/                     # Backend source code
│   ├── 📁 scripts/                 # Utility scripts
│   └── 📄 appspec.yml              # AWS CodeDeploy configuration
│
├── 📱 **Mobile App** (`/mobile`)
│   ├── 📄 package.json             # React Native/Expo dependencies
│   ├── 📄 app.config.js            # Expo configuration
│   ├── 📄 App.tsx                  # Main app component
│   ├── 📁 android/                 # Android-specific files
│   ├── 📁 assets/                  # Images, fonts, and static assets
│   ├── 📁 components/              # React Native components
│   ├── 📁 config/                  # Configuration files
│   ├── 📁 screens/                 # App screens
│   ├── 📁 services/                # API and external services
│   ├── 📁 store/                   # State management (Redux)
│   └── 📁 utils/                   # Utility functions
│
├── 🌐 **Web Application** (`/webapp`)
│   ├── 📄 package.json             # Next.js web app dependencies
│   ├── 📄 .env.local               # Web app overrides (minimal)
│   ├── 📁 src/                     # Source code
│   ├── 📁 scripts/                 # Build and deployment scripts
│   └── 📄 appspec.yml              # AWS CodeDeploy configuration
│
└── 📚 **Documentation**
    ├── 📄 AWS_DEPLOYMENT_GUIDE.md       # AWS deployment guide
    ├── 📄 AWS_DEPLOYMENT_SUMMARY.md     # AWS deployment summary
    ├── 📄 AWS_DEPLOYMENT_STEPS.md       # Step-by-step AWS deployment
    ├── 📄 ENVIRONMENT_CONSOLIDATION_GUIDE.md # Environment setup guide
    ├── 📄 INFLUMOJO_COMPLETE_SYSTEM_README.md # Complete system overview
    ├── 📄 BACKEND_IMPLEMENTATION_README.md # Backend implementation details
    ├── 📄 MOBILE_IMPLEMENTATION_README.md # Mobile app implementation
    ├── 📄 STREAMCHAT_INTEGRATION_README.md # Chat integration guide
    └── 📄 DATABASE_SETUP.md              # Database setup guide
```

## 🎯 **Environment Configuration Strategy**

### **Root Environment File (`.env`)**
**Location**: `/Influmojo-om/.env`
**Purpose**: Single source of truth for all applications
**Contains**: All environment variables organized by category

```bash
# ========================================
# INFLUMOJO ENVIRONMENT CONFIGURATION
# ========================================

# 🗄️ Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/influmojo-dev"

# 🔐 Security & Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
SESSION_SECRET="your-session-secret-here"

# 🌐 Server Configuration
PORT=3002
NODE_ENV=development

# 🔑 Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
GOOGLE_ANDROID_CLIENT_ID="your_google_android_client_id_here"
GOOGLE_IOS_CLIENT_ID="your_google_ios_client_id_here"

# 📱 Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_VERIFY_SERVICE_SID="your-twilio-verify-service-sid"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# 💬 StreamChat Configuration
STREAM_API_KEY="v8bkzb3hh26z"
STREAM_API_SECRET="your-stream-api-secret"

# 📧 SendGrid Configuration (Email)
SENDGRID_API_KEY="your-sendgrid-api-key"

# 🏢 Zoho CRM Configuration
ZOHO_CLIENT_ID="your-zoho-client-id"
ZOHO_CLIENT_SECRET="your-zoho-client-secret"
ZOHO_REFRESH_TOKEN="your-zoho-refresh-token"
ZOHO_BASE_URL="https://www.zohoapis.in"
ZOHO_CHAT_BASE_URL="https://salesiq.zoho.in"

# ☁️ Cloudinary Configuration (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# 🌐 Application URLs
WEBAPP_URL="http://localhost:3000"
API_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3002"
EXPO_PUBLIC_API_URL="http://localhost:3002"

# 📱 Mobile App Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id_here"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID="your_google_android_client_id_here"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS="your_google_ios_client_id_here"

# 🚀 AWS Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
```

### **Production Environment Template (`.env.production`)**
**Location**: `/Influmojo-om/.env.production`
**Purpose**: Template for AWS production deployment
**Contains**: Production-ready values with AWS domains

```bash
# ========================================
# INFLUMOJO PRODUCTION ENVIRONMENT
# ========================================

# 🗄️ Database Configuration
DATABASE_URL="postgresql://postgres:password@your-aws-rds-endpoint:5432/influmojo-prod"

# 🔐 Security & Authentication
JWT_SECRET="your-production-jwt-secret-here"
SESSION_SECRET="your-production-session-secret-here"

# 🌐 Server Configuration
PORT=80
NODE_ENV=production

# 🔑 Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_production_google_client_secret_here"
GOOGLE_ANDROID_CLIENT_ID="your_google_android_client_id_here"
GOOGLE_IOS_CLIENT_ID="your_google_ios_client_id_here"

# 📱 Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID="your-production-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-production-twilio-auth-token"
TWILIO_VERIFY_SERVICE_SID="your-production-twilio-verify-service-sid"
TWILIO_PHONE_NUMBER="your-production-twilio-phone-number"

# 💬 StreamChat Configuration
STREAM_API_KEY="v8bkzb3hh26z"
STREAM_API_SECRET="your-production-stream-api-secret"

# 📧 SendGrid Configuration (Email)
SENDGRID_API_KEY="your-production-sendgrid-api-key"

# 🏢 Zoho CRM Configuration
ZOHO_CLIENT_ID="your-production-zoho-client-id"
ZOHO_CLIENT_SECRET="your-production-zoho-client-secret"
ZOHO_REFRESH_TOKEN="your-production-zoho-refresh-token"
ZOHO_BASE_URL="https://www.zohoapis.in"
ZOHO_CHAT_BASE_URL="https://salesiq.zoho.in"

# ☁️ Cloudinary Configuration (File Storage)
CLOUDINARY_CLOUD_NAME="your-production-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-production-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-production-cloudinary-api-secret"

# 🌐 Application URLs (Production)
WEBAPP_URL="https://influmojo.com"
API_URL="https://api.influmojo.com"
NEXT_PUBLIC_API_URL="https://api.influmojo.com"
EXPO_PUBLIC_API_URL="https://api.influmojo.com"

# 📱 Mobile App Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID="401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID="401925027822-br2fn6ohtatmpckjlgfl8eqivb5ernrg.apps.googleusercontent.com"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS="401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com"

# 🚀 AWS Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-production-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-production-aws-secret-key"
```

### **Public Environment File (`.env.public`)**
**Location**: `/Influmojo-om/.env.public`
**Purpose**: Non-sensitive variables for client applications
**Generated**: Automatically by `setup-aws-params.js`

```bash
# ========================================
# INFLUMOJO PUBLIC ENVIRONMENT VARIABLES
# ========================================
# This file contains non-sensitive variables
# Sensitive variables are stored in AWS Parameter Store

# 🌐 Server Configuration
PORT=80
NODE_ENV=production

# 🔑 Google OAuth (Public)
GOOGLE_CLIENT_ID=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=401925027822-br2fn6ohtatmpckjlgfl8eqivb5ernrg.apps.googleusercontent.com

# 💬 StreamChat (Public)
STREAM_API_KEY=v8bkzb3hh26z

# 🌐 URLs
WEBAPP_URL=https://influmojo.com
NEXT_PUBLIC_API_URL=https://api.influmojo.com
EXPO_PUBLIC_API_URL=https://api.influmojo.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=401925027822-br2fn6ohtatmpckjlgfl8eqivb5ernrg.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com

# 🚀 AWS
AWS_REGION=us-east-1
```

### **App-Specific Environment Files**
**Location**: `/{app-name}/.env.local`
**Purpose**: Minimal overrides for specific applications
**Content**: Only variables that need to differ from root

#### **Web App (`.env.local`)**
```bash
# webapp/.env.local
# Minimal overrides for web application
NEXT_PUBLIC_API_URL=https://api.influmojo.com
```

#### **Admin Dashboard (`.env.local`)**
```bash
# admin-dashboard/.env.local
# Minimal overrides for admin dashboard
NEXT_PUBLIC_API_URL=https://api.influmojo.com
```

## 🚀 **AWS Setup Process**

### **Phase 1: Local Environment Preparation**

#### **1. Install AWS Dependencies**
```bash
# Install AWS SDK
npm install aws-sdk

# Configure AWS credentials
aws configure
```

#### **2. Update Environment Values**
```bash
# Copy production template
cp .env.production .env

# Edit with your actual values
nano .env

# Update these key values:
# - DATABASE_URL with your AWS RDS endpoint
# - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
# - All third-party service credentials
```

#### **3. Setup AWS Parameter Store**
```bash
# Run the setup script
node setup-aws-params.js

# This will:
# ✅ Create AWS Parameter Store parameters
# ✅ Generate .env.public file
# ✅ Create env-loader.js utility
# ✅ Create usage examples
```

### **Phase 2: AWS Infrastructure Setup**

#### **1. AWS Services Required**
- **EC2**: Application hosting
- **RDS**: PostgreSQL database
- **Parameter Store**: Environment variable storage
- **CodeDeploy**: Application deployment
- **Route 53**: Domain management
- **Certificate Manager**: SSL certificates

#### **2. EC2 Instance Setup**
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone <your-repo-url>
cd Influmojo-om

# Install dependencies
npm install
```

#### **3. Environment Setup on AWS**
```bash
# Copy environment files
cp .env .env.public ./

# Edit production values
nano .env

# Update these values:
DATABASE_URL="postgresql://postgres:password@your-aws-rds-endpoint:5432/influmojo-prod"
WEBAPP_URL="https://influmojo.com"
NEXT_PUBLIC_API_URL="https://api.influmojo.com"
EXPO_PUBLIC_API_URL="https://api.influmojo.com"

# Setup AWS Parameter Store
node setup-aws-params.js
```

### **Phase 3: Application Deployment**

#### **1. Backend Deployment**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
pm2 start server.js --name "influmojo-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### **2. Web App Deployment**
```bash
# Navigate to webapp directory
cd webapp

# Install dependencies
npm install

# Build for production
npm run build

# Start the server
pm2 start npm --name "influmojo-webapp" -- start

# Save PM2 configuration
pm2 save
```

#### **3. Admin Dashboard Deployment**
```bash
# Navigate to admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Start the server
pm2 start npm --name "influmojo-admin" -- start

# Save PM2 configuration
pm2 save
```

## 🔐 **AWS Parameter Store Structure**

### **Parameter Hierarchy**
```
/influmojo/
├── /prod/                          # Production environment
│   ├── database-url               # Database connection string
│   ├── jwt-secret                 # JWT signing secret
│   ├── session-secret             # Session encryption secret
│   ├── twilio-account-sid         # Twilio account SID
│   ├── twilio-auth-token          # Twilio authentication token
│   ├── google-client-secret       # Google OAuth client secret
│   ├── stream-api-secret          # StreamChat API secret
│   ├── sendgrid-api-key           # SendGrid API key
│   ├── zoho-client-id             # Zoho CRM client ID
│   ├── zoho-client-secret         # Zoho CRM client secret
│   ├── cloudinary-api-key         # Cloudinary API key
│   └── cloudinary-api-secret      # Cloudinary API secret
└── /staging/                      # Staging environment (future)
```

### **Parameter Store Commands**
```bash
# List all parameters
aws ssm describe-parameters --filters "Key=Name,Values=/influmojo/prod/"

# Get parameter value
aws ssm get-parameter --name "/influmojo/prod/database-url" --with-decryption

# Update parameter
aws ssm put-parameter --name "/influmojo/prod/jwt-secret" --value "new-secret" --type "SecureString" --overwrite
```

## 📱 **Application Integration**

### **Backend Integration**
**File**: `backend/src/server.js`
**Integration**: Uses `env-loader.js` to load sensitive variables

```javascript
const EnvLoader = require('../env-loader');

async function startServer() {
  try {
    // Load sensitive environment variables from AWS Parameter Store
    const envLoader = new EnvLoader();
    await envLoader.loadSensitiveEnvVars();
    
    // Your existing server code
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
**Integration**: Reads from root `.env` during build

```typescript
// Environment configuration for mobile app
const FORCE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.influmojo.com';

export const ENV = {
  // API Configuration
  API_BASE_URL: FORCE_API_URL,
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  // App Configuration
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
};
```

### **Web App Integration**
**File**: `webapp/src/config/env.ts`
**Integration**: Reads from root `.env` automatically

```typescript
// Environment configuration for webapp
const FORCE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.influmojo.com';

export const ENV = {
  // API Configuration
  API_BASE_URL: FORCE_API_URL,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  // App Configuration
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
};
```

### **Admin Dashboard Integration**
**File**: `admin-dashboard/src/config/env.ts`
**Integration**: Reads from root `.env` automatically

```typescript
// Environment configuration for admin dashboard
const FORCE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.influmojo.com';

export const ENV = {
  // API Configuration
  API_BASE_URL: FORCE_API_URL,
  
  // App Configuration
  APP_NAME: 'Influmojo Admin',
  APP_VERSION: '1.0.0',
};
```

## 🚨 **Security Best Practices**

### **1. IAM Roles and Permissions**
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

### **2. Parameter Store Security**
- **SecureString**: All sensitive parameters encrypted
- **Parameter Encryption**: Automatic encryption at rest
- **Access Control**: Least-privilege access principle
- **Audit Logging**: All access logged via CloudTrail

### **3. Environment File Security**
- **Never Commit**: `.env` files excluded from version control
- **Public Variables**: Only non-sensitive data in `.env.public`
- **Production Values**: Stored securely in AWS Parameter Store
- **Secret Rotation**: Easy to rotate sensitive values

## 📊 **Monitoring and Maintenance**

### **1. Health Checks**
```bash
# Backend health check
curl https://api.influmojo.com/health

# Web app health check
curl https://influmojo.com/health

# Admin dashboard health check
curl https://admin.influmojo.com/health
```

### **2. PM2 Process Management**
```bash
# View all processes
pm2 list

# Monitor processes
pm2 monit

# View logs
pm2 logs influmojo-backend
pm2 logs influmojo-webapp
pm2 logs influmojo-admin

# Restart processes
pm2 restart all
```

### **3. Environment Variable Validation**
```javascript
// Add to your startup scripts
function validateEnvVars() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
}

validateEnvVars();
```

## 🔄 **Deployment Workflow**

### **1. Development Workflow**
```bash
# 1. Make changes to code
# 2. Test locally with root .env
# 3. Commit changes to git
# 4. Push to repository
```

### **2. Staging Workflow**
```bash
# 1. Deploy to staging environment
# 2. Test with staging .env
# 3. Validate all functionality
# 4. Get approval for production
```

### **3. Production Workflow**
```bash
# 1. Deploy to production environment
# 2. Use production .env values
# 3. Load sensitive data from Parameter Store
# 4. Monitor application health
# 5. Rollback if issues detected
```

## 🆘 **Troubleshooting**

### **Common Issues and Solutions**

#### **1. AWS Credentials Not Found**
```bash
# Solution: Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, and region
```

#### **2. Parameter Store Access Denied**
```bash
# Check IAM permissions
aws iam get-user

# Verify parameter names match exactly
aws ssm describe-parameters --filters "Key=Name,Values=/influmojo/prod/"

# Ensure region is correct
aws configure get region
```

#### **3. Environment Variables Not Loading**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Test Parameter Store access
aws ssm get-parameter --name "/influmojo/prod/port" --region us-east-1

# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"
```

#### **4. Applications Not Starting**
```bash
# Check PM2 status
pm2 list

# View error logs
pm2 logs

# Check environment variables
pm2 env 0

# Restart processes
pm2 restart all
```

## 📞 **Support and Resources**

### **1. AWS Documentation**
- [AWS Parameter Store User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/latest/userguide/)
- [AWS RDS User Guide](https://docs.aws.amazon.com/rds/latest/userguide/)

### **2. Application Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)

### **3. Monitoring Tools**
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/)
- [PM2 Monitoring](https://pm2.keymetrics.io/docs/usage/monitoring/)
- [Application Health Checks](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html)

## 🎉 **Success Indicators**

### **1. Environment Setup**
- ✅ Root `.env` file contains all necessary variables
- ✅ AWS Parameter Store configured with sensitive data
- ✅ `.env.public` file generated with non-sensitive variables
- ✅ All applications can access environment variables

### **2. AWS Deployment**
- ✅ EC2 instance running with all applications
- ✅ RDS database accessible and responsive
- ✅ Parameter Store parameters accessible
- ✅ Domain URLs resolving correctly

### **3. Application Health**
- ✅ Backend API responding to requests
- ✅ Web application accessible via domain
- ✅ Admin dashboard functional
- ✅ Mobile app builds successfully
- ✅ All integrations working correctly

## 📋 **Complete Checklist**

### **Pre-Deployment**
- [ ] AWS account configured with necessary services
- [ ] Domain names registered and configured
- [ ] SSL certificates generated
- [ ] Environment files prepared with production values
- [ ] AWS Parameter Store setup completed
- [ ] All dependencies installed locally

### **Deployment**
- [ ] EC2 instance launched and configured
- [ ] Security groups configured correctly
- [ ] Environment files copied to AWS server
- [ ] Production values updated on AWS server
- [ ] AWS Parameter Store accessible from EC2
- [ ] All applications deployed and running

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Domain URLs accessible
- [ ] SSL certificates working
- [ ] All integrations functional
- [ ] Monitoring and logging configured
- [ ] Backup procedures tested

## 🚀 **Next Steps**

1. **Review and Update**: Update all placeholder values in `.env.production`
2. **AWS Setup**: Follow the AWS setup process step by step
3. **Test Locally**: Ensure all applications work with the new environment structure
4. **Deploy**: Deploy to AWS following the deployment workflow
5. **Monitor**: Set up monitoring and health checks
6. **Optimize**: Optimize performance and security based on production usage

---

**🎯 This comprehensive guide provides everything you need to understand the Influmojo project structure, set up the consolidated environment system, and deploy to AWS successfully. Follow each section carefully to ensure a smooth deployment process.**
