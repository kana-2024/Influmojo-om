# Influmojo AWS ECS Deployment Guide

## 🚀 **Project Overview**

Influmojo is a multi-service application deployed on AWS ECS (Elastic Container Service) with the following components:

- **Webapp**: Next.js frontend application
- **Admin Dashboard**: Next.js admin interface  
- **Backend API**: Node.js/Express backend service

## 🏗️ **Architecture**

```
Internet → ALB → ECS Services → Fargate Containers
                ├── Webapp (Port 3000)
                ├── Admin Dashboard (Port 3000) 
                └── Backend API (Port 5000)
```

## 📋 **Prerequisites**

- AWS Account with appropriate permissions
- Docker Desktop installed locally
- AWS CLI configured
- IAM roles and policies set up

## 🔧 **AWS Infrastructure Setup**

### **1. IAM Roles (✅ COMPLETED)**

Two IAM roles have been created:

- **`influmojo-ecs-task-execution-role`**: For ECS system permissions
- **`influmojo-ecs-task-role`**: For application permissions

**Policy**: `AmazonECSTaskExecutionRolePolicy`

### **2. ECS Cluster (✅ COMPLETED)**

- **Cluster Name**: `influmojo-cluster`
- **Launch Type**: Fargate
- **VPC**: Default VPC
- **Security Group**: `influmojo-ecs-sg`

### **3. ECS Task Definitions (✅ COMPLETED)**

#### **Webapp Task Definition**
- **Family**: `influmojo-webapp-task`
- **Container**: `webapp`
- **Image**: `424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp:latest`
- **Port**: 3000
- **CPU**: 256 units (0.25 vCPU)
- **Memory**: 512 MiB

#### **Admin Dashboard Task Definition**
- **Family**: `influmojo-admin-task`
- **Container**: `admin`
- **Image**: `424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin:latest`
- **Port**: 3000
- **CPU**: 256 units (0.25 vCPU)
- **Memory**: 512 MiB

#### **Backend Task Definition**
- **Family**: `influmojo-backend-task`
- **Container**: `backend`
- **Image**: `424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend:latest`
- **Port**: 5000
- **CPU**: 256 units (0.25 vCPU)
- **Memory**: 512 MiB

### **4. Application Load Balancer (✅ COMPLETED)**

- **Name**: `influmojo-alb`
- **Scheme**: Internet-facing
- **VPC**: Default VPC
- **Security Group**: `influmojo-alb-sg`

#### **Target Groups**
- **`influmojo-webapp-tg`**: Port 3000, Protocol HTTP
- **`influmojo-admin-tg`**: Port 3000, Protocol HTTP
- **`influmojo-backend-tg`**: Port 5000, Protocol HTTP

#### **Listeners**
- **HTTP:80**: Redirects to HTTPS:443
- **HTTPS:443**: Path-based routing
  - `/` → `influmojo-webapp-tg`
  - `/admin*` → `influmojo-admin-tg`
  - `/api*` → `influmojo-backend-tg`

### **5. ECS Services (✅ COMPLETED)**

#### **Webapp Service**
- **Service Name**: `influmojo-webapp-service`
- **Status**: ✅ **RUNNING**
- **Desired Tasks**: 2
- **Auto Scaling**: CPU/Memory based

#### **Backend Service**
- **Service Name**: `influmojo-backend-service`
- **Status**: 🔄 **DEPLOYING**
- **Desired Tasks**: 2
- **Auto Scaling**: CPU/Memory based

#### **Admin Service**
- **Service Name**: `influmojo-admin-service`
- **Status**: ❌ **STOPPED** (temporarily)
- **Desired Tasks**: 0

## 🐳 **Docker Configuration**

### **Webapp Dockerfile**
```dockerfile
# Multi-stage build for Next.js
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/BUILD_ID ./.next/BUILD_ID

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
USER 1001

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["node","server.js"]
```

### **Backend Dockerfile**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
USER 1001

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:5000/health >/dev/null 2>&1 || exit 1

CMD ["npm", "start"]
```

### **Admin Dashboard Dockerfile**
```dockerfile
# Similar to webapp but with /admin health check
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/BUILD_ID ./.next/BUILD_ID

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
USER 1001

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:3000/admin >/dev/null 2>&1 || exit 1

CMD ["node","server.js"]
```

## 🔑 **Environment Configuration**

### **Local Development**
```bash
# Switch to development environment
scripts\switch-env.bat dev

# Environment files:
# - webapp/.env.development
# - backend/.env.development
```

### **Production (AWS)**
```bash
# Switch to production environment
scripts\switch-env.bat prod

# Environment files:
# - webapp/.env.production
# - backend/.env.production
```

## 🚀 **Build and Deploy Process**

### **Step 1: Build Docker Images Locally**
```bash
# Build webapp
cd webapp
docker build -t influmojo-webapp .

# Build backend
cd ../backend
docker build -t influmojo-backend .

# Build admin dashboard (when ready)
cd ../admin-dashboard
docker build -t influmojo-admin .
```

### **Step 2: Tag Images for ECR**
```bash
# Tag webapp
docker tag influmojo-webapp:latest 424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp:latest

# Tag backend
docker tag influmojo-backend:latest 424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend:latest

# Tag admin (when ready)
docker tag influmojo-admin:latest 424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin:latest
```

### **Step 3: Login to ECR**
```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 424592696132.dkr.ecr.ap-south-1.amazonaws.com
```

### **Step 4: Push Images to ECR**
```bash
# Push webapp
docker push 424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp:latest

# Push backend
docker push 424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend:latest

# Push admin (when ready)
docker push 424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin:latest
```

### **Step 5: Force ECS Service Updates**
```bash
# In AWS Console:
# 1. Go to ECS Cluster → influmojo-cluster
# 2. Select service → Update Service
# 3. Check "Force new deployment"
# 4. Update Service
```

## 🌐 **Access URLs**

### **Production URLs**
- **Webapp**: `https://influmojo-alb-1333681522.ap-south-1.elb.amazonaws.com/`
- **Admin Dashboard**: `https://influmojo-alb-1333681522.ap-south-1.elb.amazonaws.com/admin`
- **Backend API**: `https://influmojo-alb-1333681522.ap-south-1.elb.amazonaws.com/api`

### **Local Development URLs**
- **Webapp**: `http://localhost:3000`
- **Backend API**: `http://localhost:3002`
- **Admin Dashboard**: `http://localhost:3001`

## 🔍 **Monitoring and Troubleshooting**

### **Check Service Status**
```bash
# ECS Services
aws ecs describe-services --cluster influmojo-cluster --services influmojo-webapp-service influmojo-backend-service

# ALB Target Health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

### **Common Issues and Solutions**

#### **1. ECS Deployment Circuit Breaker**
- **Cause**: Container health check failures
- **Solution**: Check security groups, health check endpoints, and container logs

#### **2. Security Group Issues**
- **ECS Security Group**: Must allow traffic from ALB security group on container ports
- **ALB Security Group**: Must allow HTTP/HTTPS from internet

#### **3. Health Check Failures**
- **Webapp**: `/` endpoint must return 200
- **Backend**: `/health` endpoint must return 200
- **Admin**: `/admin` endpoint must return 200

## 📊 **Current Status**

- ✅ **Infrastructure**: Complete
- ✅ **Webapp Service**: Running (2 tasks)
- 🔄 **Backend Service**: Deploying
- ❌ **Admin Service**: Stopped (temporarily)

## 🎯 **Next Steps**

1. **Wait for backend deployment** to complete
2. **Test webapp and backend** functionality
3. **Fix admin dashboard** TypeScript errors
4. **Deploy admin service** when ready
5. **Configure custom domain** (optional)

## 💰 **Cost Estimation**

- **ECS Fargate**: ~$15-25/month (2 services, 2 tasks each)
- **ALB**: ~$20/month
- **ECR**: ~$5-10/month (storage and data transfer)
- **Total**: ~$40-55/month

## 🔐 **Security Features**

- **HTTPS/SSL**: Enabled with ACM certificate
- **IAM Roles**: Least privilege access
- **Security Groups**: Network-level firewall
- **Container Security**: Non-root user execution

## 📚 **Useful Commands**

```bash
# Check ECS cluster status
aws ecs describe-clusters --clusters influmojo-cluster

# List ECS services
aws ecs list-services --cluster influmojo-cluster

# Check task status
aws ecs list-tasks --cluster influmojo-cluster --service-name influmojo-webapp-service

# View container logs
aws logs describe-log-groups --log-group-name-prefix /ecs/
```

## 🆘 **Support**

For issues or questions:
1. Check ECS service events
2. Review container logs
3. Verify security group configurations
4. Check ALB target health

---

**Last Updated**: August 28, 2025  
**Status**: 2/3 Services Running  
**Next Milestone**: Admin Dashboard Deployment
