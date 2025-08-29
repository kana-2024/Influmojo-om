# 🚀 Complete AWS Deployment Guide for Influmojo

## 📋 Deployment Overview

This guide covers the complete AWS deployment of your Influmojo application using:
- **ECS (Elastic Container Service)** for container orchestration
- **Fargate** for serverless container execution
- **Application Load Balancer (ALB)** for traffic routing
- **Auto-scaling** for cost optimization
- **SSL/TLS** for secure connections

## 🎯 What Gets Deployed

1. **Webapp** (Next.js frontend) - Port 3000
2. **Admin Dashboard** (React/Next.js admin) - Port 3000
3. **Backend API** (Node.js/Express) - Port 5000

## 📚 Step-by-Step Deployment Process

### **Phase 1: IAM Setup** ✅
- **File**: `deployment/aws/iam/iam-roles-setup-guide.md`
- **What**: Create IAM roles for ECS to access AWS resources
- **Duration**: 15-20 minutes
- **Status**: Ready to proceed

### **Phase 2: ECS Cluster** ✅
- **File**: `deployment/aws/ecs/ecs-cluster-setup-guide.md`
- **What**: Create ECS cluster with Fargate capacity providers
- **Duration**: 10-15 minutes
- **Status**: Ready to proceed

### **Phase 3: ECS Task Definitions** 🆕
- **File**: `deployment/aws/ecs/ecs-task-definitions-setup-guide.md`
- **What**: Define how your containers should run
- **Duration**: 30-45 minutes
- **Status**: **NEXT STEP**

### **Phase 4: Application Load Balancer** 🆕
- **File**: `deployment/aws/alb/alb-setup-guide.md`
- **What**: Create ALB with path-based routing and SSL
- **Duration**: 45-60 minutes
- **Status**: After task definitions

### **Phase 5: ECS Services** 🆕
- **File**: `deployment/aws/ecs/ecs-services-setup-guide.md`
- **What**: Deploy containers and enable auto-scaling
- **Duration**: 30-45 minutes
- **Status**: After ALB setup

## 🔧 Prerequisites Checklist

Before starting deployment, ensure you have:

- ✅ **AWS Account** with appropriate permissions
- ✅ **VPC and Subnets** configured (`vpc-03984787c0fc19328`)
- ✅ **Docker Images** built and ready for ECR
- ✅ **Domain Name** (for SSL certificate)
- ✅ **Environment Variables** documented
- ✅ **Database** accessible from ECS

## 🚀 Quick Start Commands

### **1. Build and Push Docker Images**
```bash
# Build images
docker build -t influmojo-webapp ./webapp
docker build -t influmojo-admin ./admin-dashboard
docker build -t influmojo-backend ./backend

# Tag for ECR
docker tag influmojo-webapp:latest [ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp:latest
docker tag influmojo-admin:latest [ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin:latest
docker tag influmojo-backend:latest [ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend:latest

# Push to ECR
docker push [ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp:latest
docker push [ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin:latest
docker push [ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend:latest
```

### **2. Set Up Parameter Store Values**
```bash
# Store sensitive configuration
aws ssm put-parameter --name "/influmojo/production/database-url" --value "your-database-url" --type "SecureString"
aws ssm put-parameter --name "/influmojo/production/jwt-secret" --value "your-jwt-secret" --type "SecureString"
```

## 📊 Architecture Diagram

```
Internet
    ↓
[Route 53] → [Application Load Balancer]
    ↓                    ↓
[SSL/TLS]           [Path-Based Routing]
    ↓                    ↓
[Domain]         /webapp/* → [Webapp Service] (Port 3000)
                        /admin/* → [Admin Service] (Port 3000)
                        /api/* → [Backend Service] (Port 5000)
```

## 💰 Cost Estimation

### **Monthly Costs (Mumbai Region)**
- **ECS Fargate**: ~$50-100 (depending on traffic)
- **Application Load Balancer**: ~$16
- **Data Transfer**: ~$5-20 (depending on usage)
- **CloudWatch**: ~$5-10
- **Total Estimated**: **$76-146/month**

### **Cost Optimization Tips**
1. **Use FARGATE_SPOT** for 60-70% savings
2. **Right-size containers** (don't over-provision)
3. **Enable auto-scaling** to scale down during low traffic
4. **Monitor usage** with CloudWatch

## 🔐 Security Features

- **IAM Roles**: Least privilege access
- **Security Groups**: Network-level security
- **SSL/TLS**: Encrypted data in transit
- **Parameter Store**: Secure configuration storage
- **VPC Isolation**: Network isolation

## 📈 Monitoring and Scaling

### **Auto-Scaling Policies**
- **CPU-based**: Scale when CPU > 70%
- **Memory-based**: Scale when memory > 80%
- **Request-based**: Scale when requests > 1000 per target

### **Monitoring Metrics**
- **ECS**: CPU, memory, task count
- **ALB**: Request count, response time, error rate
- **Application**: Custom business metrics

## 🚨 Troubleshooting Guide

### **Common Issues and Solutions**

1. **Tasks Not Starting**
   - Check IAM roles and permissions
   - Verify security group rules
   - Check task definition configuration

2. **Health Check Failures**
   - Verify health check endpoints exist
   - Check container logs
   - Ensure proper port configuration

3. **Load Balancer Issues**
   - Verify target group health
   - Check security group rules
   - Ensure proper routing configuration

4. **Auto-Scaling Not Working**
   - Check CloudWatch metrics
   - Verify scaling policies
   - Check service limits

### **Debug Commands**
```bash
# Check ECS service status
aws ecs describe-services --cluster influmojo-cluster --services influmojo-webapp-service

# Check task logs
aws logs describe-log-groups --log-group-name-prefix /ecs/influmojo

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

## 🔄 Deployment Workflow

### **Initial Deployment**
1. **Follow Phase 1-5** in order
2. **Test each phase** before proceeding
3. **Verify connectivity** between services
4. **Test auto-scaling** functionality

### **Updates and Maintenance**
1. **Build new Docker images**
2. **Push to ECR**
3. **Update task definitions**
4. **Update ECS services**
5. **Monitor deployment**

### **Rollback Procedure**
1. **Identify the issue**
2. **Revert to previous task definition**
3. **Update service**
4. **Verify functionality**

## 📋 Post-Deployment Checklist

- ✅ **All services running** and healthy
- ✅ **Load balancer** routing correctly
- ✅ **SSL certificate** working
- ✅ **Auto-scaling** functioning
- ✅ **Monitoring** set up
- ✅ **Backup strategy** implemented
- ✅ **Documentation** updated

## 🌐 Access URLs

After successful deployment:
- **Main Website**: `https://your-domain.com/`
- **Admin Dashboard**: `https://your-domain.com/admin`
- **API Endpoints**: `https://your-domain.com/api/*`

## 📞 Support and Resources

### **AWS Documentation**
- [ECS User Guide](https://docs.aws.amazon.com/ecs/)
- [ALB User Guide](https://docs.aws.amazon.com/elasticloadbalancing/)
- [Fargate Pricing](https://aws.amazon.com/fargate/pricing/)

### **Troubleshooting Resources**
- [ECS Troubleshooting](https://docs.aws.amazon.com/ecs/latest/userguide/troubleshooting.html)
- [ALB Troubleshooting](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/troubleshooting.html)

---

## 🎯 **NEXT ACTION**

**You're ready to proceed with Phase 3: ECS Task Definitions**

Follow the guide at: `deployment/aws/ecs/ecs-task-definitions-setup-guide.md`

This will take approximately **30-45 minutes** and is the foundation for deploying your containers.

---

**🎉 Good luck with your deployment! Your Influmojo application will be running on AWS ECS soon.**
