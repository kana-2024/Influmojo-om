# 🚀 AWS ECS Task Definitions Setup Guide

## 📋 What We're Setting Up

**ECS Task Definitions** define how your containers should run, including:
- **Container specifications** (image, ports, environment variables)
- **Resource requirements** (CPU, memory)
- **Network configuration** (VPC, subnets, security groups)
- **IAM roles** (execution and task roles)
- **Logging configuration** (CloudWatch)

## 🎯 Services to Deploy

1. **Webapp** (Next.js frontend) - Port 3000
2. **Admin Dashboard** (React/Next.js admin) - Port 3000  
3. **Backend API** (Node.js/Express) - Port 5000

## 🔧 Prerequisites Completed

- ✅ **IAM Roles Created**:
  - `influmojo-ecs-task-execution-role`
  - `influmojo-ecs-task-role`
- ✅ **ECS Cluster Created**: `influmojo-cluster`
- ✅ **ECR Repositories**: Your Docker images should be pushed to ECR

## 🎯 Step-by-Step AWS Console Configuration

### **Step 1: Navigate to ECS Task Definitions**
1. **Open AWS Console** → Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. **Search for "ECS"** in the services search bar
3. **Click "Elastic Container Service"**
4. **Click "Task Definitions"** in the left sidebar
5. **Click "Create new Task Definition"**

### **Step 2: Configure Task Definition**
1. **Task Definition Name**: `influmojo-webapp-task`
2. **Task Role**: 
   - ✅ **Use existing role**
   - **Select**: `influmojo-ecs-task-role`
3. **Task execution role**: 
   - ✅ **Use existing role**
   - **Select**: `influmojo-ecs-task-execution-role`
4. **Task memory**: `512 MB`
5. **Task CPU**: `256 (.25 vCPU)`
6. **Click "Next"**

### **Step 3: Configure Container for Webapp**
1. **Container name**: `webapp`
2. **Image**: 
   - **URI**: `[YOUR-ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp:latest`
   - **Replace** `[YOUR-ACCOUNT-ID]` with your actual AWS account ID
3. **Port mappings**:
   - **Container port**: `3000`
   - **Protocol**: `tcp`
4. **Environment variables**:
   - **Key**: `NODE_ENV`, **Value**: `production`
   - **Key**: `PORT`, **Value**: `3000`
5. **Advanced container configuration**:
   - **Memory**: `512 MB`
   - **Memory reservation**: `256 MB`
   - **CPU units**: `256`
6. **Click "Next"**

### **Step 4: Configure Task Definition Settings**
1. **VPC**: 
   - ✅ **Use existing VPC**
   - **Select**: `vpc-03984787c0fc19328`
2. **Subnets**: 
   - ✅ **Select all subnets** in your VPC
3. **Security groups**: 
   - ✅ **Use existing security group**
   - **Select**: `influmojo-ecs-sg`
4. **Auto-assign public IP**: 
   - ✅ **Enabled** (for internet access)
5. **Load balancing**: 
   - ✅ **Application Load Balancer**
   - **Target group**: `influmojo-webapp-tg` (we'll create this later)
   - **Container name**: `webapp`
   - **Container port**: `3000`
6. **Click "Next"**

### **Step 5: Review and Create Webapp Task Definition**
1. **Review configuration**
2. **Click "Create"**
3. **Wait for creation** (usually 1-2 minutes)

## 🔄 Repeat for Admin Dashboard

### **Create Admin Dashboard Task Definition**
1. **Task Definition Name**: `influmojo-admin-task`
2. **Task Role**: `influmojo-ecs-task-role`
3. **Task execution role**: `influmojo-ecs-task-execution-role`
4. **Task memory**: `512 MB`
5. **Task CPU**: `256 (.25 vCPU)`

### **Container Configuration**
1. **Container name**: `admin-dashboard`
2. **Image**: `[YOUR-ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin:latest`
3. **Port mappings**: Container port `3000`
4. **Environment variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
5. **Load balancing**: Target group `influmojo-admin-tg`

## 🔄 Repeat for Backend API

### **Create Backend Task Definition**
1. **Task Definition Name**: `influmojo-backend-task`
2. **Task Role**: `influmojo-ecs-task-role`
3. **Task execution role**: `influmojo-ecs-task-execution-role`
4. **Task memory**: `1024 MB` (more memory for backend)
5. **Task CPU**: `512 (.5 vCPU)` (more CPU for backend)

### **Container Configuration**
1. **Container name**: `backend`
2. **Image**: `[YOUR-ACCOUNT-ID].dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend:latest`
3. **Port mappings**: Container port `5000`
4. **Environment variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DATABASE_URL`: `[FROM_PARAMETER_STORE]`
   - `JWT_SECRET`: `[FROM_PARAMETER_STORE]`
5. **Load balancing**: Target group `influmojo-backend-tg`

## 🔐 Environment Variables from Parameter Store

### **For Backend Service**
Instead of hardcoding sensitive values, use Parameter Store references:
1. **In environment variables section**:
   - **Key**: `DATABASE_URL`
   - **Value**: `{{resolve:ssm:/influmojo/production/database-url}}`
2. **Key**: `JWT_SECRET`
   - **Value**: `{{resolve:ssm:/influmojo/production/jwt-secret}}`

## 📊 Resource Allocation Summary

| Service | Memory | CPU | Port | Target Group |
|---------|--------|-----|------|--------------|
| **Webapp** | 512 MB | 256 (.25 vCPU) | 3000 | `influmojo-webapp-tg` |
| **Admin Dashboard** | 512 MB | 256 (.25 vCPU) | 3000 | `influmojo-admin-tg` |
| **Backend API** | 1024 MB | 512 (.5 vCPU) | 5000 | `influmojo-backend-tg` |

## ✅ What You Should See

After creating all task definitions, you should see:
- ✅ **influmojo-webapp-task** (Active)
- ✅ **influmojo-admin-task** (Active)
- ✅ **influmojo-backend-task** (Active)
- ✅ **All using correct IAM roles**
- ✅ **All configured with load balancing**

## 🚀 Next Steps

1. **ECS task definitions created** ✅
2. **Next**: Create Application Load Balancer (ALB)
3. **Then**: Create target groups
4. **Finally**: Create ECS services

## 🔍 Verification

To verify your task definitions were created correctly:
1. **Check ECS dashboard** → Task Definitions
2. **Task definition names** - exactly as specified above
3. **IAM roles** - should show correct execution and task roles
4. **Container configurations** - should show correct ports and images
5. **Load balancing** - should show target group configurations

## 💰 Cost Optimization

### **Resource Sizing**
- **Webapp/Admin**: 512 MB, 256 CPU units (lightweight frontend)
- **Backend**: 1024 MB, 512 CPU units (more processing power needed)
- **FARGATE_SPOT**: Will use spot instances for cost savings

### **Auto-scaling Ready**
- **Task definitions** are configured for auto-scaling
- **Load balancer integration** enables health checks
- **Resource limits** prevent runaway costs

---

**🎉 Congratulations! You've successfully created ECS task definitions.**
**Next, we'll create the Application Load Balancer to route traffic to your services.**
