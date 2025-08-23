# 🚀 AWS Deployment Steps - Influmojo

## 📋 **What You Need to Deploy**

### **Essential Files (Must Have):**
```bash
Influmojo-om/
├── .env                    # 🎯 Environment variables
├── backend/                # Backend API server
│   ├── src/
│   ├── package.json
│   └── node_modules/      # Will be installed on EC2
└── webapp/                 # Next.js web application
    ├── src/
    ├── package.json
    └── node_modules/      # Will be installed on EC2
```

### **Optional Files (Not Needed on EC2):**
```bash
Influmojo-om/
├── mobile/                 # ❌ Not needed on EC2 (build locally)
├── admin-dashboard/        # ❌ Not needed on EC2
├── .git/                   # ❌ Not needed on EC2
├── *.md                    # ❌ Documentation not needed on EC2
└── test-*.js              # ❌ Test files not needed on EC2
```

## 🚀 **Deployment Process**

### **Step 1: Prepare Your Code**
```bash
# Option A: Deploy entire repo (simpler)
# Just zip your repo and upload

# Option B: Deploy only essentials (cleaner)
mkdir influmojo-production
cp .env influmojo-production/
cp -r backend/ influmojo-production/
cp -r webapp/ influmojo-production/
```

### **Step 2: Upload to EC2**
```bash
# Upload to EC2
scp -r influmojo-production/ ec2-user@your-ec2-ip:/var/www/

# On EC2, rename for clarity
ssh ec2-user@your-ec2-ip
cd /var/www
mv influmojo-production influmojo
```

### **Step 3: Set Up on EC2**
```bash
# On EC2 instance
cd /var/www/influmojo

# Install backend dependencies
cd backend
npm install --production

# Install webapp dependencies  
cd ../webapp
npm install --production
```

### **Step 4: Start Services**
```bash
# Start backend (in background)
cd /var/www/influmojo/backend
nohup node src/server.js > backend.log 2>&1 &

# Start webapp (in background)
cd /var/www/influmojo/webapp
nohup npm start > webapp.log 2>&1 &
```

## 🏗️ **Final EC2 Structure**

```bash
/var/www/influmojo/
├── .env                    # Your environment variables
├── backend/                # Backend code + node_modules
│   ├── src/
│   ├── package.json
│   └── node_modules/
└── webapp/                 # Web app code + node_modules
    ├── src/
    ├── package.json
    └── node_modules/
```

## 🔐 **Environment Variables on EC2**

### **Your .env File Contains:**
```bash
# Non-sensitive (used by all apps)
PORT=80
NODE_ENV=production
GOOGLE_CLIENT_ID=401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com
WEBAPP_URL=https://influmojo.com

# Sensitive (overridden by AWS Parameter Store)
JWT_SECRET=your-local-secret
DATABASE_URL=postgresql://localhost:5432/influmojo
```

### **What Happens When Backend Starts:**
```javascript
// 1. Loads from .env file (non-sensitive)
process.env.PORT = "80"
process.env.GOOGLE_CLIENT_ID = "401925027822-qndr5bi6p3co47b19rjdtnd5pbm3fd59.apps.googleusercontent.com"

// 2. AWS Parameter Store overrides sensitive values
process.env.JWT_SECRET = "aws-jwt-secret"
process.env.DATABASE_URL = "aws-database-url"
```

## 🎯 **Summary**

### **What You Deploy:**
- ✅ **Root .env file** - Goes to `/var/www/influmojo/.env`
- ✅ **Backend code** - Goes to `/var/www/influmojo/backend/`
- ✅ **Web app code** - Goes to `/var/www/influmojo/webapp/`

### **What You DON'T Deploy:**
- ❌ **Mobile app** - Build locally, upload APK/IPA
- ❌ **Documentation** - Not needed on EC2
- ❌ **Test files** - Not needed on EC2
- ❌ **Git history** - Not needed on EC2

### **Environment Variables:**
- ✅ **Non-sensitive** - Loaded from .env file
- ✅ **Sensitive** - Loaded from AWS Parameter Store
- ✅ **All apps** - Use the same .env file

**You deploy your entire repo OR just the essentials - both work!** 🚀
