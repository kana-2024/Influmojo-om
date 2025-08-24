# 🚀 Complete CI/CD Pipeline Setup for Influmojo

This guide covers the complete setup of GitHub Actions workflows and CodeDeploy for all three applications: **Backend API**, **Webapp**, and **Admin Dashboard**.

## 🔄 **Complete CI/CD Architecture**

```
GitHub Push → GitHub Actions → S3 Upload → CodeDeploy → EC2 Instance
                    ↓
            Coordinated Deployment
                    ↓
    ┌─────────────┬─────────────┬─────────────┐
    │   Backend   │   Webapp    │    Admin    │
    │   (API)     │  (Next.js)  │ Dashboard   │
    │  Port 3002  │             │ (Next.js)   │
    └─────────────┴─────────────┴─────────────┘
                    ↓
            Consolidated Environment
                    ↓
            AWS Parameter Store
```

## 📋 **What's Been Created**

### 1. **GitHub Actions Workflows**
- ✅ `backend/.github/workflows/deploy.yml` - Backend deployment
- ✅ `webapp/.github/workflows/deploy.yml` - Webapp deployment  
- ✅ `admin-dashboard/.github/workflows/deploy.yml` - Admin dashboard deployment
- ✅ `backend/.github/workflows/deploy-all.yml` - Master workflow (coordinates all)

### 2. **CodeDeploy Configuration**
- ✅ `backend/appspec.yml` - Backend deployment config
- ✅ `webapp/appspec.yml` - Webapp deployment config
- ✅ `admin-dashboard/appspec.yml` - Admin dashboard deployment config

### 3. **Deployment Scripts**
- ✅ Backend scripts (already created)
- ✅ `webapp/scripts/setup-webapp.sh` - Webapp setup
- ✅ `webapp/scripts/start-webapp.sh` - Webapp start
- ✅ `webapp/scripts/healthcheck-webapp.sh` - Webapp health check
- ✅ `admin-dashboard/scripts/setup-admin.sh` - Admin setup
- ✅ `admin-dashboard/scripts/start-admin.sh` - Admin start
- ✅ `admin-dashboard/scripts/healthcheck-admin.sh` - Admin health check

## 🚀 **Step-by-Step Setup**

### **Step 1: Create CodeDeploy Applications**

```bash
# Create backend application
aws deploy create-application --application-name influmojo-api

# Create webapp application
aws deploy create-application --application-name influmojo-webapp

# Create admin dashboard application
aws deploy create-application --application-name influmojo-admin
```

### **Step 2: Create CodeDeploy Deployment Groups**

```bash
# Backend deployment group
aws deploy create-deployment-group \
  --application-name influmojo-api \
  --deployment-group-name influmojo-api-prod \
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/AWSCodeDeployRole \
  --deployment-style deploymentType=IN_PLACE,deploymentOption=WITH_TRAFFIC_CONTROL \
  --ec2-tag-set Key=Environment,Value=Production

# Webapp deployment group
aws deploy create-deployment-group \
  --application-name influmojo-webapp \
  --deployment-group-name influmojo-webapp-prod \
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/AWSCodeDeployRole \
  --deployment-style deploymentType=IN_PLACE,deploymentOption=WITH_TRAFFIC_CONTROL \
  --ec2-tag-set Key=Environment,Value=Production

# Admin dashboard deployment group
aws deploy create-deployment-group \
  --application-name influmojo-admin \
  --deployment-group-name influmojo-admin-prod \
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/AWSCodeDeployRole \
  --deployment-style deploymentType=IN_PLACE,deploymentOption=WITH_TRAFFIC_CONTROL \
  --ec2-tag-set Key=Environment,Value=Production
```

### **Step 3: Configure GitHub Secrets**

In each repository, add these secrets:

#### **Backend Repository Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `CODEDEPLOY_APPLICATION_NAME` = `influmojo-api`
- `CODEDEPLOY_DEPLOYMENT_GROUP` = `influmojo-api-prod`

#### **Webapp Repository Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `CODEDEPLOY_APPLICATION_NAME` = `influmojo-webapp`
- `CODEDEPLOY_DEPLOYMENT_GROUP` = `influmojo-webapp-prod`

#### **Admin Dashboard Repository Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `CODEDEPLOY_APPLICATION_NAME` = `influmojo-admin`
- `CODEDEPLOY_DEPLOYMENT_GROUP` = `influmojo-admin-prod`

#### **Master Workflow Secrets (Backend Repository):**
- `WEBAPP_REPOSITORY` = `your-username/influmojo-webapp`
- `ADMIN_REPOSITORY` = `your-username/influmojo-admin`

### **Step 4: Deploy Applications**

#### **Option 1: Individual Deployments**
Push to any of the configured branches in each repository:
- `main`
- `production` 
- `nandini_dev`

#### **Option 2: Master Workflow (Recommended)**
Push to the backend repository to trigger the coordinated deployment:
```bash
cd backend
git add .
git commit -m "Trigger complete deployment"
git push origin main
```

## 🔄 **Deployment Flow**

### **Phase 1: Backend Deployment**
1. ✅ Backend code deployed to EC2
2. ✅ AWS Parameter Store environment loaded
3. ✅ Consolidated `.env` file created
4. ✅ Backend API starts on port 3002
5. ✅ Health checks pass

### **Phase 2: Webapp Deployment**
1. ✅ Webapp code deployed to EC2
2. ✅ Consolidated `.env` copied to webapp
3. ✅ Webapp build files verified
4. ✅ Health checks pass

### **Phase 3: Admin Dashboard Deployment**
1. ✅ Admin dashboard code deployed to EC2
2. ✅ Consolidated `.env` copied to admin dashboard
3. ✅ Admin dashboard build files verified
4. ✅ Health checks pass

## 📁 **Final Directory Structure**

After complete deployment:

```
/home/ec2-user/apps/
├── influmojo-api/           # Backend (port 3002)
│   ├── .env                 # ← Single source of truth
│   ├── src/
│   ├── package.json
│   └── ...
├── influmojo-webapp/        # Webapp (Next.js)
│   ├── .env.local           # ← Copy of consolidated .env
│   ├── .next/               # Built files
│   ├── package.json
│   └── ...
└── influmojo-admin/         # Admin Dashboard (Next.js)
    ├── .env.local           # ← Copy of consolidated .env
    ├── .next/               # Built files
    ├── package.json
    └── ...
```

## 🌐 **Nginx Configuration Updates**

You'll need to update your Nginx configuration to serve the webapp and admin dashboard:

```nginx
# Webapp
server {
    listen 80;
    server_name influmojo.com;
    
    location / {
        root /home/ec2-user/apps/influmojo-webapp/.next;
        try_files $uri $uri/ /_next/static/$uri;
    }
}

# Admin Dashboard
server {
    listen 80;
    server_name admin.influmojo.com;
    
    location / {
        root /home/ec2-user/apps/influmojo-admin/.next;
        try_files $uri $uri/ /_next/static/$uri;
    }
}
```

## 🧪 **Testing the Complete Pipeline**

### **1. Test Individual Deployments**
```bash
# Test backend
curl -I https://api.influmojo.com/api/health

# Test webapp
curl -I https://influmojo.com

# Test admin dashboard
curl -I https://admin.influmojo.com
```

### **2. Test Master Workflow**
```bash
# Push to backend repository
git push origin main

# Watch GitHub Actions
# All three applications should deploy in sequence
```

### **3. Verify Environment Consistency**
```bash
# Check that all apps use the same environment
diff /home/ec2-user/apps/influmojo-api/.env /home/ec2-user/apps/influmojo-webapp/.env.local
diff /home/ec2-user/apps/influmojo-api/.env /home/ec2-user/apps/influmojo-admin/.env.local
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Repository Access Errors**
   - Verify `WEBAPP_REPOSITORY` and `ADMIN_REPOSITORY` secrets
   - Ensure GitHub tokens have access to all repositories

2. **CodeDeploy Failures**
   - Check EC2 instance role permissions
   - Verify CodeDeploy agent is running
   - Check deployment logs in AWS Console

3. **Environment Variable Issues**
   - Ensure backend deployment completed first
   - Verify consolidated `.env` file exists
   - Check file permissions (should be 600)

### **Debug Commands**

```bash
# Check CodeDeploy status
aws deploy list-deployments --application-name influmojo-api
aws deploy list-deployments --application-name influmojo-webapp
aws deploy list-deployments --application-name influmojo-admin

# Check EC2 logs
tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Verify deployments
ls -la /home/ec2-user/apps/
```

## 🎯 **Success Criteria**

Your complete CI/CD pipeline is successful when:

- ✅ **All three applications** deploy automatically
- ✅ **Backend runs** on port 3002
- ✅ **Webapp serves** static files correctly
- ✅ **Admin dashboard serves** static files correctly
- ✅ **Consolidated environment** shared across all apps
- ✅ **Health checks** pass for all applications
- ✅ **No manual intervention** required for deployments

## 🚀 **Next Steps**

1. **Set up CodeDeploy applications** and deployment groups
2. **Configure GitHub secrets** in all repositories
3. **Test individual deployments** first
4. **Test master workflow** for coordinated deployment
5. **Update Nginx configuration** to serve frontend apps
6. **Monitor deployments** and verify all applications work

---

**Congratulations!** You now have a complete, enterprise-grade CI/CD pipeline that automatically deploys all three Influmojo applications with a consolidated environment approach.
