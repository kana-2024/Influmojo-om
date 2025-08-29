# 🚀 AWS ECS Services Setup Guide

## 📋 What We're Setting Up

**ECS Services** will:
- **Deploy your containers** using the task definitions
- **Manage container lifecycle** (start, stop, restart)
- **Enable auto-scaling** based on traffic
- **Integrate with ALB** for load balancing
- **Handle rolling deployments** with zero downtime

## 🎯 Services to Deploy

1. **Webapp Service** - Serves your Next.js frontend
2. **Admin Dashboard Service** - Serves your admin interface
3. **Backend API Service** - Serves your Node.js API

## 🔧 Prerequisites Completed

- ✅ **IAM Roles Created**
- ✅ **ECS Cluster Created**: `influmojo-cluster`
- ✅ **ECS Task Definitions Created**
- ✅ **ALB and Target Groups Created**
- ✅ **Docker Images Pushed to ECR**

## 🎯 Step-by-Step AWS Console Configuration

### **Step 1: Navigate to ECS Services**
1. **Open AWS Console** → Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. **Search for "ECS"** in the services search bar
3. **Click "Elastic Container Service"**
4. **Click on your cluster**: `influmojo-cluster`
5. **Click "Services"** tab
6. **Click "Create"**

### **Step 2: Configure Webapp Service**
1. **Launch type**: 
   - ✅ **FARGATE** (serverless)
2. **Task Definition**: 
   - ✅ **Use existing task definition**
   - **Select**: `influmojo-webapp-task`
3. **Service name**: `influmojo-webapp-service`
4. **Service type**: 
   - ✅ **REPLICA** (maintains desired count)
5. **Number of tasks**: `2` (for high availability)
6. **Click "Next"**

### **Step 3: Configure Network for Webapp**
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
5. **Load balancer**: 
   - ✅ **Application Load Balancer**
   - **Load balancer name**: `influmojo-alb`
   - **Target group**: `influmojo-webapp-tg`
   - **Container name**: `webapp`
   - **Container port**: `3000`
6. **Click "Next"**

### **Step 4: Configure Auto Scaling for Webapp**
1. **Service Auto Scaling**: 
   - ✅ **Configure Service Auto Scaling to adjust your service's desired count**
2. **Minimum number of tasks**: `2`
3. **Maximum number of tasks**: `10`
4. **Target tracking scaling policies**:
   - **Policy name**: `influmojo-webapp-cpu-scaling`
   - **Metric type**: `ECSServiceAverageCPUUtilization`
   - **Target value**: `70` (scale when CPU > 70%)
   - **Scale-in cooldown**: `60` seconds
   - **Scale-out cooldown**: `60` seconds
5. **Click "Next"**

### **Step 5: Review and Create Webapp Service**
1. **Review configuration**
2. **Click "Create Service"**
3. **Wait for creation** (usually 2-3 minutes)

## 🔄 Repeat for Admin Dashboard Service

### **Create Admin Dashboard Service**
1. **Click "Create"** again
2. **Launch type**: FARGATE
3. **Task Definition**: `influmojo-admin-task`
4. **Service name**: `influmojo-admin-service`
5. **Service type**: REPLICA
6. **Number of tasks**: `1` (admin typically needs less capacity)

### **Network Configuration**
1. **VPC**: Same as webapp
2. **Subnets**: Same as webapp
3. **Security groups**: Same as webapp
4. **Load balancer**: 
   - **Target group**: `influmojo-admin-tg`
   - **Container name**: `admin-dashboard`
   - **Container port**: `3000`

### **Auto Scaling Configuration**
1. **Service Auto Scaling**: Enabled
2. **Minimum tasks**: `1`
3. **Maximum tasks**: `5`
4. **Target tracking**: CPU utilization at 70%

## 🔄 Repeat for Backend API Service

### **Create Backend Service**
1. **Click "Create"** again
2. **Launch type**: FARGATE
3. **Task Definition**: `influmojo-backend-task`
4. **Service name**: `influmojo-backend-service`
5. **Service type**: REPLICA
6. **Number of tasks**: `2` (API needs more capacity)

### **Network Configuration**
1. **VPC**: Same as other services
2. **Subnets**: Same as other services
3. **Security groups**: Same as other services
4. **Load balancer**: 
   - **Target group**: `influmojo-backend-tg`
   - **Container name**: `backend`
   - **Container port**: `5000`

### **Auto Scaling Configuration**
1. **Service Auto Scaling**: Enabled
2. **Minimum tasks**: `2`
3. **Maximum tasks**: `8`
4. **Target tracking**: CPU utilization at 70%

## 🔄 Create Additional Auto Scaling Policies

### **Memory-Based Scaling**
For each service, add memory utilization scaling:
1. **Go to your service** → **"Auto Scaling"** tab
2. **Click "Add scaling policy"**
3. **Policy name**: `influmojo-[service]-memory-scaling`
4. **Metric type**: `ECSServiceAverageMemoryUtilization`
5. **Target value**: `80` (scale when memory > 80%)
6. **Same cooldown settings** as CPU scaling

### **Custom Metric Scaling**
For backend service, add request count scaling:
1. **Policy name**: `influmojo-backend-request-scaling`
2. **Metric type**: `ALBRequestCountPerTarget`
3. **Target value**: `1000` (scale when requests > 1000 per target)
4. **This scales based on actual traffic**

## 📊 Service Configuration Summary

| Service | Tasks | Min | Max | Target Group | Port |
|---------|-------|-----|-----|--------------|------|
| **Webapp** | 2 | 2 | 10 | `influmojo-webapp-tg` | 3000 |
| **Admin Dashboard** | 1 | 1 | 5 | `influmojo-admin-tg` | 3000 |
| **Backend API** | 2 | 2 | 8 | `influmojo-backend-tg` | 5000 |

## 🔄 Deployment Strategies

### **Rolling Deployment**
1. **ECS automatically** handles rolling deployments
2. **New tasks** start before old ones stop
3. **Zero downtime** during updates
4. **Health checks** ensure new tasks are ready

### **Blue-Green Deployment**
1. **Create new task definition** with updated image
2. **Update service** to use new definition
3. **ECS gradually** replaces old tasks
4. **Rollback** by reverting to old definition

## ✅ What You Should See

After creating all services, you should see:
- ✅ **influmojo-webapp-service** (Running with 2 tasks)
- ✅ **influmojo-admin-service** (Running with 1 task)
- ✅ **influmojo-backend-service** (Running with 2 tasks)
- ✅ **All services** showing "Active" status
- ✅ **Tasks** showing "Running" status
- ✅ **Load balancer** showing healthy targets

## 🚀 Next Steps

1. **ECS services created** ✅
2. **Next**: Test the complete setup
3. **Then**: Monitor and optimize
4. **Finally**: Set up monitoring and alerts

## 🔍 Verification

To verify your services are running correctly:
1. **Check ECS dashboard** → Services tab
2. **Service status** - should be "Active"
3. **Task status** - should show "Running" tasks
4. **Load balancer** - should show healthy targets
5. **Test endpoints**:
   - **Webapp**: `https://your-alb-domain.com/`
   - **Admin**: `https://your-alb-domain.com/admin`
   - **API**: `https://your-alb-domain.com/api/health`

## 💰 Cost Optimization

### **FARGATE vs FARGATE_SPOT**
- **Current setup**: FARGATE (reliable, predictable pricing)
- **Cost savings**: Switch to FARGATE_SPOT later (60-70% savings)
- **Risk**: Spot instances can be interrupted (acceptable for web services)

### **Auto Scaling Benefits**
- **Pay only for what you use**
- **Scale down** during low traffic
- **Scale up** during high traffic
- **Prevent over-provisioning**

## 🚨 Troubleshooting

### **Common Issues**
1. **Tasks not starting**: Check IAM roles and security groups
2. **Health check failures**: Verify health check endpoints
3. **Load balancer issues**: Check target group health
4. **Auto scaling not working**: Verify CloudWatch metrics

### **Debug Commands**
```bash
# Check service events
aws ecs describe-services --cluster influmojo-cluster --services influmojo-webapp-service

# Check task logs
aws logs describe-log-groups --log-group-name-prefix /ecs/influmojo
```

---

**🎉 Congratulations! You've successfully created ECS services.**
**Your Influmojo application is now deployed and running on AWS ECS!**

## 🌐 Access Your Application

Once everything is running:
- **Main website**: `https://your-alb-domain.com/`
- **Admin dashboard**: `https://your-alb-domain.com/admin`
- **API endpoints**: `https://your-alb-domain.com/api/*`

## 📈 Monitor and Optimize

- **Use CloudWatch** to monitor performance
- **Set up alerts** for high CPU/memory usage
- **Review costs** monthly and optimize resources
- **Update images** regularly for security patches
