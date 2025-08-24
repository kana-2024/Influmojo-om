# 🚀 Influmojo Production Deployment Guide

This guide covers the complete setup of production deployment using AWS Parameter Store, CodeDeploy, and secure environment management with a **consolidated environment approach**.

## 🔄 **Consolidated Environment Architecture**

Your Influmojo project uses a **single source of truth** for environment variables:

```
AWS Parameter Store (/influmojo/prod/api/*)
                    ↓
            Consolidated .env file
                    ↓
    ┌─────────────┬─────────────┬─────────────┐
    │   Backend   │   Webapp    │    Admin    │
    │   (API)     │  (Next.js)  │ Dashboard   │
    │  Port 3002  │             │ (Next.js)   │
    └─────────────┴─────────────┴─────────────┘
```

**Benefits:**
- ✅ **Single source of truth** for all environment variables
- ✅ **Consistent configuration** across all applications
- ✅ **Easier maintenance** - update once, affects all apps
- ✅ **Secure secret management** via AWS Parameter Store
- ✅ **No duplicate configuration** files

## 📋 Prerequisites

- AWS CLI configured with appropriate permissions
- EC2 instance running Amazon Linux 2 or similar
- Domain pointing to your EC2 instance
- Nginx installed and configured
- PM2 installed for process management

## 🔐 Step 1: Security First - Rotate Compromised Secrets

**CRITICAL**: Before proceeding, rotate these compromised secrets:

- Google OAuth client secret
- Stream API secret  
- JWT_SECRET
- SENDGRID_API_KEY
- AWS access keys
- Twilio credentials
- Zoho credentials
- Cloudinary credentials

## 🏗️ Step 2: Set Up AWS Parameter Store

### 2.1 Run the Parameter Store Setup Script

```bash
cd backend
npm install aws-sdk
node setup-ssm-params.js
```

This will create all parameters under `/influmojo/prod/api/` namespace that match your consolidated `.env.prod` structure.

### 2.2 Update Placeholder Values

After running the script, update these parameters in AWS Console with real values:

```bash
# Example: Update JWT secret
aws ssm put-parameter \
  --region ap-south-1 \
  --name "/influmojo/prod/api/JWT_SECRET" \
  --type "SecureString" \
  --value "your-actual-jwt-secret-here" \
  --overwrite

# Example: Update database URL
aws ssm put-parameter \
  --region ap-south-1 \
  --name "/influmojo/prod/api/DATABASE_URL" \
  --type "SecureString" \
  --value "postgresql://user:pass@your-aws-rds-endpoint:5432/influmojo" \
  --overwrite
```

## 🔑 Step 3: Configure EC2 Instance Role

### 3.1 Attach IAM Policy

Attach the `iam-policy-ssm-access.json` policy to your `InflumojoEC2Role`:

```bash
# Create the policy
aws iam create-policy \
  --policy-name InflumojoSSMAccess \
  --policy-document file://iam-policy-ssm-access.json

# Attach to your EC2 role
aws iam attach-role-policy \
  --role-name InflumojoEC2Role \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/InflumojoSSMAccess
```

### 3.2 Verify Role Permissions

Ensure your EC2 instance has the role attached and can access SSM:

```bash
# Test from EC2 instance
aws ssm get-parameters-by-path \
  --region ap-south-1 \
  --path "/influmojo/prod/api" \
  --with-decryption
```

## 🚀 Step 4: Set Up CodeDeploy

### 4.1 Create CodeDeploy Application

```bash
aws deploy create-application --application-name influmojo-api
```

### 4.2 Create Deployment Group

```bash
aws deploy create-deployment-group \
  --application-name influmojo-api \
  --deployment-group-name influmojo-api-prod \
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/AWSCodeDeployRole \
  --deployment-style deploymentType=IN_PLACE,deploymentOption=WITH_TRAFFIC_CONTROL \
  --ec2-tag-set Key=Environment,Value=Production
```

### 4.3 Install CodeDeploy Agent

On your EC2 instance:

```bash
sudo yum update
sudo yum install ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-ap-south-1.s3.ap-south-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent start
sudo service codedeploy-agent status
```

## 🌐 Step 5: Update Nginx Configuration

### 5.1 Run Nginx Update Script

```bash
cd backend/scripts
chmod +x update-nginx.sh
sudo ./update-nginx.sh
```

This will:
- Update Nginx to proxy to port 3002
- Add security headers
- Configure health check endpoint
- Set up proper logging

### 5.2 Verify Nginx Configuration

```bash
sudo nginx -t
sudo systemctl status nginx
curl -I http://localhost/health
```

## 🔧 Step 6: Configure GitHub Actions

### 6.1 Add Required Secrets

In your GitHub repository, add these secrets:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key  
- `S3_BUCKET`: S3 bucket for deployment packages
- `CODEDEPLOY_APPLICATION_NAME`: `influmojo-api`
- `CODEDEPLOY_DEPLOYMENT_GROUP`: `influmojo-api-prod`

### 6.2 Test Deployment

Push to `main`, `production`, or `nandini_dev` branch to trigger deployment.

## 📁 Step 7: Directory Structure

After deployment, your EC2 instance should have:

```
/home/ec2-user/
├── deploys/
│   └── influmojo-api/
│       ├── releases/
│       │   └── 20241201-143022/
│       └── current -> releases/20241201-143022/
└── apps/
    ├── influmojo-api/           # Backend API (port 3002)
    │   ├── .env (consolidated)  # ← Single source of truth
    │   ├── src/
    │   ├── package.json
    │   └── ...
    ├── influmojo-webapp/        # Webapp (Next.js)
    │   ├── .env.local           # ← Copy of consolidated .env
    │   ├── .next/               # Built files
    │   └── ...
    └── influmojo-admin/         # Admin Dashboard (Next.js)
        ├── .env.local           # ← Copy of consolidated .env
        ├── .next/               # Built files
        └── ...
```

## 🏗️ Step 8: Build Frontend Applications

### 8.1 Build with Consolidated Environment

After the backend deployment creates the consolidated `.env`, build your frontend apps:

```bash
cd backend/scripts
chmod +x build-frontend-apps.sh
./build-frontend-apps.sh
```

This script will:
- Use the consolidated `.env` from SSM
- Build the webapp (Next.js)
- Build the admin dashboard (Next.js)
- Build the mobile app (Expo web export)

### 8.2 Manual Build (Alternative)

If you prefer to build manually:

```bash
# Build Webapp
cd /home/ec2-user/apps/influmojo-webapp
cp /home/ec2-user/apps/influmojo-api/.env .env.local
npm ci --production
npm run build

# Build Admin Dashboard
cd /home/ec2-user/apps/influmojo-admin
cp /home/ec2-user/apps/influmojo-api/.env .env.local
npm ci --production
npm run build
```

## 🧪 Step 9: Test the Deployment

### 9.1 Check Application Status

```bash
# Check PM2 status
pm2 list
pm2 logs influmojo-api

# Check if app is listening
netstat -tlnp | grep :3002

# Test local endpoint
curl http://localhost:3002/api/health
```

### 9.2 Test External Access

```bash
# Test through Nginx
curl -I http://api.influmojo.com/health

# Test API endpoint
curl -I https://api.influmojo.com/api/health
```

### 9.3 Test Frontend Applications

```bash
# Test webapp (if served by Nginx)
curl -I https://influmojo.com

# Test admin dashboard (if served by Nginx)
curl -I https://admin.influmojo.com
```

## 🔍 Troubleshooting

### Common Issues

1. **SSM Access Denied**
   - Verify EC2 instance role has correct permissions
   - Check IAM policy is attached

2. **Environment Variables Not Loading**
   - Check SSM parameters exist
   - Verify parameter names match exactly
   - Check `build_env_from_ssm.sh` logs

3. **App Not Starting**
   - Check PM2 logs: `pm2 logs influmojo-api`
   - Verify .env file exists and has content
   - Check if port 3002 is available

4. **Frontend Build Failures**
   - Ensure consolidated .env exists
   - Check that all required variables are set
   - Verify Next.js dependencies are installed

5. **Nginx Proxy Issues**
   - Verify Nginx configuration: `nginx -t`
   - Check Nginx error logs
   - Ensure app is listening on port 3002

### Debug Commands

```bash
# Check SSM parameters
aws ssm get-parameters-by-path \
  --region ap-south-1 \
  --path "/influmojo/prod/api" \
  --with-decryption

# Check deployment logs
tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Check application logs
pm2 logs influmojo-api --lines 100

# Check Nginx logs
sudo tail -f /var/log/nginx/api_influmojo_error.log

# Verify consolidated environment
cat /home/ec2-user/apps/influmojo-api/.env | head -10
```

## 🔄 Step 10: Ongoing Maintenance

### 10.1 Update Secrets

To update a secret:

```bash
aws ssm put-parameter \
  --region ap-south-1 \
  --name "/influmojo/prod/api/SECRET_NAME" \
  --type "SecureString" \
  --value "new-secret-value" \
  --overwrite
```

### 10.2 Redeploy After Secret Changes

After updating secrets, redeploy to pick up changes:

```bash
# Trigger new deployment via GitHub Actions
# or manually on EC2:
cd /home/ec2-user/apps/influmojo-api
./scripts/build_env_from_ssm.sh
pm2 reload influmojo-api

# Rebuild frontend apps if needed
./scripts/build-frontend-apps.sh
```

### 10.3 Monitor Application

```bash
# Check PM2 status
pm2 monit

# Monitor logs
pm2 logs influmojo-api --lines 0 -f

# Check system resources
htop
df -h
```

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ CodeDeploy deployment completes without errors
- ✅ Backend starts on port 3002
- ✅ Consolidated .env file created from SSM
- ✅ Frontend applications build successfully
- ✅ Nginx proxies requests correctly
- ✅ Health check endpoint returns 200
- ✅ External API calls work
- ✅ All environment variables are loaded from SSM
- ✅ No secrets are committed to repository

## 🔒 Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate secrets regularly** (every 90 days)
3. **Use least privilege** for IAM roles
4. **Monitor access logs** for suspicious activity
5. **Keep dependencies updated** for security patches
6. **Use HTTPS** for all external communications
7. **Regular security audits** of your infrastructure

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review CodeDeploy deployment logs
3. Check PM2 application logs
4. Verify AWS IAM permissions
5. Ensure all prerequisites are met

---

**Remember**: This setup provides enterprise-grade security and deployment automation with a consolidated environment approach. All your applications (backend, webapp, admin-dashboard) will share the same secure environment configuration from AWS Parameter Store!
