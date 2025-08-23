# AWS Deployment Guide for Influmojo

This guide explains how to deploy Influmojo to AWS using the consolidated environment configuration.

## 🎯 Overview

Instead of managing multiple `.env` files across different applications, we've consolidated everything into:
1. **Root `.env`** - All environment variables in one place
2. **AWS Parameter Store** - Secure storage for sensitive variables
3. **Public `.env.public`** - Non-sensitive variables for client apps

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install AWS SDK
npm install aws-sdk

# Configure AWS credentials
aws configure
```

### 2. Update Environment Values
Edit the root `.env` file and replace placeholder values:
- `your-aws-domain.com` → Your actual AWS domain
- `your-aws-rds-endpoint` → Your RDS endpoint
- `username:password` → Your database credentials
- Generate new secrets for JWT and session

### 3. Setup AWS Parameter Store
```bash
# Run the setup script
node setup-aws-params.js
```

### 4. Update Your Applications
Use the generated `env-loader.js` in your backend applications.

## 📁 File Structure

```
Influmojo-om/
├── .env                          # Consolidated environment file
├── .env.public                   # Public variables (auto-generated)
├── setup-aws-params.js          # AWS Parameter Store setup
├── env-loader.js                 # Environment variable loader
├── server-usage-example.js       # Usage examples
├── backend/                      # Backend application
├── mobile/                       # Mobile application
└── webapp/                       # Web application
```

## 🔐 Environment Variables by Category

### Sensitive Variables (AWS Parameter Store)
- Database credentials
- JWT secrets
- API keys (Twilio, SendGrid, StreamChat)
- OAuth secrets
- Session secrets

### Public Variables (.env.public)
- Server configuration
- Public OAuth client IDs
- Web application URLs and endpoints
- Mobile app configuration
- AWS region

## 🛠️ Integration Steps

### Backend Integration

1. **Update server.js**
```javascript
const EnvLoader = require('../env-loader');

async function startServer() {
  try {
    // Load sensitive environment variables
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

2. **Update package.json**
```json
{
  "dependencies": {
    "aws-sdk": "^2.1000.0"
  }
}
```

### Mobile/Web Integration

1. **Copy `.env.public` to your app directories**
2. **Update import statements** to use the new file locations
3. **Remove old `.env` files** from subdirectories

## 🚀 AWS Deployment

### 1. EC2 Instance Setup
```bash
# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository
git clone <your-repo>
cd Influmojo-om

# Install dependencies
npm install
npm install aws-sdk

# Configure AWS credentials
aws configure
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env .env.public ./

# Update values for production
nano .env

# Setup AWS Parameter Store
node setup-aws-params.js
```

### 3. Start Applications
```bash
# Start backend
cd backend
node server.js

# Start web app (in another terminal)
cd webapp
npm run build
npm start
```

## 🔒 Security Best Practices

### 1. IAM Roles
Create minimal IAM roles for your EC2 instances:
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

### 2. Parameter Store Security
- Use `SecureString` for sensitive parameters
- Enable parameter encryption
- Use least-privilege access

### 3. Environment File Security
- Never commit `.env` files to version control
- Use `.env.public` for non-sensitive variables
- Rotate secrets regularly

## 📊 Monitoring and Maintenance

### 1. Parameter Store Monitoring
```bash
# List all parameters
aws ssm describe-parameters --filters "Key=Name,Values=/influmojo/prod/"

# Get parameter value
aws ssm get-parameter --name "/influmojo/prod/database-url" --with-decryption
```

### 2. Environment Variable Validation
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

## 🔄 Migration Checklist

- [ ] Update root `.env` with AWS production values
- [ ] Run `setup-aws-params.js` to create Parameter Store
- [ ] Update backend applications to use `env-loader.js`
- [ ] Copy `.env.public` to mobile and web app directories
- [ ] Remove old `.env` files from subdirectories
- [ ] Test environment variable loading
- [ ] Deploy to AWS
- [ ] Verify all applications work correctly

## 🆘 Troubleshooting

### Common Issues

1. **AWS Credentials Not Found**
   ```bash
   aws configure
   # Enter your Access Key ID, Secret Access Key, and region
   ```

2. **Parameter Store Access Denied**
   - Check IAM permissions
   - Verify parameter names match exactly
   - Ensure region is correct

3. **Environment Variables Not Loading**
   - Check AWS credentials
   - Verify parameter names in Parameter Store
   - Check network connectivity to AWS

### Debug Commands
```bash
# Test AWS connectivity
aws sts get-caller-identity

# Test Parameter Store access
aws ssm get-parameter --name "/influmojo/prod/port" --region us-east-1

# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"
```

## 📞 Support

If you encounter issues:
1. Check AWS CloudTrail for API call logs
2. Verify IAM permissions
3. Test with AWS CLI commands
4. Check application logs for specific error messages

## 🎉 Benefits of This Approach

1. **Single Source of Truth** - All environment variables in one place
2. **Enhanced Security** - Sensitive data stored in AWS Parameter Store
3. **Easier Deployment** - One configuration file to manage
4. **Better CI/CD Integration** - Simplified deployment pipelines
5. **Cost Effective** - Parameter Store is very affordable
6. **Scalable** - Easy to manage across multiple environments
