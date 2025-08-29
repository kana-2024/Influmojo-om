# EC2 Deployment Guide for Influmojo

This guide explains how to deploy Influmojo to an EC2 instance with proper port configuration and environment management.

## 🏗️ Architecture Overview

```
Internet → Load Balancer → EC2 Instance
                           ├── Webapp (Port 3000)
                           └── Backend API (Port 3002)
```

## 🌐 Port Configuration

### Webapp (Frontend)
- **Port**: 3000
- **URL**: `https://influmojo.com`
- **Purpose**: Next.js frontend application

### Backend API
- **Port**: 3002
- **URL**: `https://api.influmojo.com`
- **Purpose**: Express.js backend API

## 🔐 Environment Configuration

### 1. AWS Parameter Store Setup

Create the following parameters in AWS Systems Manager Parameter Store:

```
/influmojo/prod/webapp-api-url = https://api.influmojo.com
/influmojo/prod/google-client-id = your_google_client_id
/influmojo/prod/cors-origins = https://influmojo.com,https://www.influmojo.com,https://api.influmojo.com
/influmojo/prod/database-url = your_production_database_url
/influmojo/prod/jwt-secret = your_jwt_secret
/influmojo/prod/twilio-account-sid = your_twilio_account_sid
/influmojo/prod/twilio-auth-token = your_twilio_auth_token
/influmojo/prod/twilio-verify-service-sid = your_twilio_verify_service_sid
/influmojo/prod/google-client-secret = your_google_client_secret
/influmojo/prod/facebook-app-secret = your_facebook_app_secret
/influmojo/prod/sendgrid-api-key = your_sendgrid_api_key
/influmojo/prod/stream-api-secret = your_stream_api_secret
```

### 2. EC2 Security Group Configuration

Configure your EC2 security group to allow:

```
Inbound Rules:
- HTTP (Port 80) - From 0.0.0.0/0
- HTTPS (Port 443) - From 0.0.0.0/0
- Custom TCP (Port 3000) - From 0.0.0.0/0 (Webapp)
- Custom TCP (Port 3002) - From 0.0.0.0/0 (Backend API)
- SSH (Port 22) - From your IP address

Outbound Rules:
- All traffic - To 0.0.0.0/0
```

## 🚀 Deployment Steps

### Step 1: Prepare EC2 Instance

```bash
# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### Step 2: Deploy Backend

```bash
# Clone repository
git clone <your-repo-url>
cd Influmojo-om/backend

# Install dependencies
npm ci --only=production

# Set environment
export NODE_ENV=production
export PORT=3002

# Start with PM2
pm2 start src/server.js --name "influmojo-backend" --env production
pm2 save
pm2 startup
```

### Step 3: Deploy Webapp

```bash
cd ../webapp

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set environment
export NODE_ENV=production
export PORT=3000

# Start with PM2
pm2 start npm --name "influmojo-webapp" -- start
pm2 save
```

### Step 4: Configure Nginx (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/influmojo
server {
    listen 80;
    server_name influmojo.com www.influmojo.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.influmojo.com;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Management

### Development
- Uses `.env.development` files
- Backend: `http://localhost:3002`
- Webapp: `http://localhost:3000`

### Production
- Uses AWS Parameter Store
- Backend: `https://api.influmojo.com:3002`
- Webapp: `https://influmojo.com:3000`

## 📊 Monitoring

### PM2 Commands
```bash
# View all processes
pm2 list

# Monitor processes
pm2 monit

# View logs
pm2 logs influmojo-backend
pm2 logs influmojo-webapp

# Restart services
pm2 restart influmojo-backend
pm2 restart influmojo-webapp
```

### Health Checks
- Backend: `https://api.influmojo.com:3002/api/health`
- Webapp: `https://influmojo.com:3000`

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :3002
   ```

2. **Environment variables not loading**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Test parameter store access
   aws ssm get-parameter --name "/influmojo/prod/webapp-api-url" --with-decryption
   ```

3. **CORS issues**
   - Verify `CORS_ORIGINS` parameter in AWS Parameter Store
   - Check backend logs for CORS errors

## 🔒 Security Considerations

1. **Use HTTPS** for all production traffic
2. **Restrict SSH access** to your IP address only
3. **Regular security updates** for the EC2 instance
4. **Monitor logs** for suspicious activity
5. **Use IAM roles** instead of hardcoded AWS credentials

## 📝 Environment File Templates

The following environment files are provided:
- `webapp/.env.production` - Webapp production configuration
- `webapp/.env.development` - Webapp development configuration
- `backend/.env.production` - Backend production configuration
- `backend/.env.development` - Backend development configuration

## 🎯 Next Steps

1. Set up your domain DNS to point to your EC2 instance
2. Configure SSL certificates (Let's Encrypt recommended)
3. Set up monitoring and alerting
4. Configure automated backups
5. Set up CI/CD pipeline for automated deployments
