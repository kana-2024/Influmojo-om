# 🌐 AWS Application Load Balancer (ALB) Setup Guide

## 📋 What We're Setting Up

**Application Load Balancer (ALB)** will:
- **Route traffic** to your three services
- **Handle SSL termination** (HTTPS)
- **Perform health checks** on your containers
- **Enable auto-scaling** based on traffic
- **Provide a single entry point** for your application

## 🎯 Load Balancer Architecture

```
Internet → ALB → Target Groups → ECS Services
    ↓           ↓              ↓
  HTTPS    /webapp/*      Webapp (Port 3000)
           /admin/*       Admin Dashboard (Port 3000)
           /api/*         Backend API (Port 5000)
```

## 🔧 Prerequisites Completed

- ✅ **IAM Roles Created**
- ✅ **ECS Cluster Created**: `influmojo-cluster`
- ✅ **ECS Task Definitions Created**
- ✅ **VPC and Subnets**: `vpc-03984787c0fc19328`

## 🎯 Step-by-Step AWS Console Configuration

### **Step 1: Navigate to Load Balancers**
1. **Open AWS Console** → Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. **Search for "EC2"** in the services search bar
3. **Click "EC2"**
4. **Click "Load Balancers"** in the left sidebar
5. **Click "Create load balancer"**

### **Step 2: Choose Load Balancer Type**
1. **Load balancer type**: 
   - ✅ **Application Load Balancer**
2. **Click "Create"**

### **Step 3: Configure Basic Settings**
1. **Load balancer name**: `influmojo-alb`
2. **Scheme**: 
   - ✅ **internet-facing** (accessible from internet)
3. **IP address type**: 
   - ✅ **ipv4**

### **Step 4: Configure Network Settings**
1. **VPC**: 
   - ✅ **Use existing VPC**
   - **Select**: `vpc-03984787c0fc19328`
2. **Mappings**: 
   - ✅ **Select all availability zones**
   - **ap-south-1a**: `subnet-0f024ef4e5e3b6c96`
   - **ap-south-1b**: `subnet-0666ab349c1eb41e0`
   - **ap-south-1c**: `subnet-017e629ec5de70bf4`

### **Step 5: Configure Security Groups**
1. **Security group**: 
   - ✅ **Create a new security group**
   - **Name**: `influmojo-alb-sg`
   - **Description**: `Security group for Influmojo ALB`
2. **Inbound rules**:
   - **Type**: HTTP (Port 80)
   - **Source**: 0.0.0.0/0
   - **Description**: Allow HTTP from internet
   - **Type**: HTTPS (Port 443)
   - **Source**: 0.0.0.0/0
   - **Description**: Allow HTTPS from internet
3. **Outbound rules**:
   - **Type**: All traffic
   - **Destination**: 0.0.0.0/0
   - **Description**: Allow all outbound traffic

### **Step 6: Configure Routing**
1. **Target group**: 
   - ✅ **Create a new target group**
   - **Target group name**: `influmojo-webapp-tg`
   - **Target type**: 
     - ✅ **IP addresses** (for Fargate)
2. **Protocol**: HTTP
3. **Port**: 3000
4. **VPC**: `vpc-03984787c0fc19328`
5. **Health check settings**:
   - **Protocol**: HTTP
   - **Path**: `/` (health check endpoint)
   - **Port**: 3000
   - **Healthy threshold**: 2
   - **Unhealthy threshold**: 2
   - **Timeout**: 5 seconds
   - **Interval**: 30 seconds
   - **Success codes**: 200

### **Step 7: Register Targets**
1. **Targets**: 
   - ✅ **Register targets later** (ECS will handle this)
2. **Click "Next: Review"**
3. **Review configuration**
4. **Click "Create load balancer"**

## 🔄 Create Additional Target Groups

### **Admin Dashboard Target Group**
1. **Go to "Target Groups"** in left sidebar
2. **Click "Create target group"**
3. **Target group name**: `influmojo-admin-tg`
4. **Target type**: IP addresses
5. **Protocol**: HTTP
6. **Port**: 3000
7. **VPC**: `vpc-03984787c0fc19328`
8. **Health check settings**:
   - **Path**: `/admin` (or `/` if admin has health endpoint)
   - **Port**: 3000
   - **Same thresholds** as webapp

### **Backend API Target Group**
1. **Click "Create target group"**
2. **Target group name**: `influmojo-backend-tg`
3. **Target type**: IP addresses
4. **Protocol**: HTTP
5. **Port**: 5000
6. **VPC**: `vpc-03984787c0fc19328`
7. **Health check settings**:
   - **Path**: `/health` (or `/api/health`)
   - **Port**: 5000
   - **Same thresholds** as webapp

## 🌐 Configure ALB Listeners

### **HTTP Listener (Port 80)**
1. **Go to your ALB** → `influmojo-alb`
2. **Click "Listeners"** tab
3. **Click "Add listener"**
4. **Protocol**: HTTP
5. **Port**: 80
6. **Default action**: 
   - ✅ **Redirect to HTTPS**
   - **Protocol**: HTTPS
   - **Port**: 443
   - **Status code**: 301 (permanent redirect)

### **HTTPS Listener (Port 443)**
1. **Click "Add listener"**
2. **Protocol**: HTTPS
3. **Port**: 443
4. **Default action**: 
   - ✅ **Forward to target group**
   - **Target group**: `influmojo-webapp-tg`

## 🛣️ Configure Path-Based Routing

### **Add Admin Dashboard Route**
1. **In HTTPS listener**, click **"Add rule"**
2. **Rule priority**: 1
3. **IF**: Path is `/admin*`
4. **THEN**: Forward to `influmojo-admin-tg`
5. **Click "Save"**

### **Add Backend API Route**
1. **Click "Add rule"**
2. **Rule priority**: 2
3. **IF**: Path is `/api*`
4. **THEN**: Forward to `influmojo-backend-tg`
5. **Click "Save"**

### **Default Route (Webapp)**
1. **Default action** should already forward to `influmojo-webapp-tg`
2. **This catches all other traffic**

## 🔐 SSL Certificate Configuration

### **Request SSL Certificate**
1. **Go to "Certificate Manager"** in AWS Console
2. **Click "Request certificate"**
3. **Certificate type**: 
   - ✅ **Request a public certificate**
4. **Domain name**: 
   - **Your domain**: `influmojo.com` (or your actual domain)
   - **Wildcard**: `*.influmojo.com` (optional)
5. **Validation method**: 
   - ✅ **DNS validation** (recommended)
6. **Click "Request"**

### **Attach Certificate to ALB**
1. **Go back to your ALB** → `influmojo-alb`
2. **Click "Listeners"** tab
3. **Edit HTTPS listener** (Port 443)
4. **SSL Certificate**: 
   - ✅ **Select from ACM**
   - **Choose your certificate**
5. **Click "Save"**

## 📊 Target Group Summary

| Target Group | Port | Health Check Path | Service |
|--------------|------|-------------------|---------|
| `influmojo-webapp-tg` | 3000 | `/` | Webapp (Next.js) |
| `influmojo-admin-tg` | 3000 | `/admin` | Admin Dashboard |
| `influmojo-backend-tg` | 5000 | `/health` | Backend API |

## ✅ What You Should See

After ALB setup, you should see:
- ✅ **Load balancer**: `influmojo-alb` (Active)
- ✅ **Target groups**: All three target groups created
- ✅ **Listeners**: HTTP (80) and HTTPS (443)
- ✅ **Routing rules**: Path-based routing configured
- ✅ **SSL certificate**: Attached and validated

## 🚀 Next Steps

1. **ALB and target groups created** ✅
2. **Next**: Create ECS services
3. **Then**: Deploy containers
4. **Finally**: Test the complete setup

## 🔍 Verification

To verify your ALB setup:
1. **Check ALB status** - should be "Active"
2. **Target groups** - should show all three groups
3. **Listeners** - should show HTTP and HTTPS
4. **Routing rules** - should show path-based routing
5. **SSL certificate** - should be attached and valid

## 💰 Cost Optimization

### **ALB Pricing**
- **Per hour**: ~$0.0225 per hour
- **Per GB processed**: ~$0.006 per GB
- **Health checks**: Included in pricing

### **Traffic Distribution**
- **Path-based routing** efficiently distributes traffic
- **Health checks** ensure only healthy containers receive traffic
- **Auto-scaling** prevents over-provisioning

---

**🎉 Congratulations! You've successfully created the Application Load Balancer.**
**Next, we'll create ECS services to deploy your containers.**
