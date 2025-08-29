# 🚀 Influmojo ECS Deployment System

## 📁 Directory Structure

```
deployment/
├── aws/                          # AWS infrastructure configuration
│   ├── ecs/                      # ECS cluster & services
│   ├── alb/                      # Application Load Balancer
│   └── iam/                      # IAM roles & permissions
├── docker/                       # Docker configurations
│   ├── webapp/                   # Webapp Dockerfile & config
│   ├── admin/                    # Admin dashboard Dockerfile
│   └── backend/                  # Backend API Dockerfile
└── scripts/                      # Deployment automation scripts
    ├── deploy-webapp.sh          # Deploy webapp only
    ├── deploy-admin.sh           # Deploy admin only
    ├── deploy-backend.sh         # Deploy backend only
    ├── deploy-all.sh             # Deploy everything
    └── setup-aws.sh              # Initial AWS setup
```

## 🎯 What Each Component Does

### **AWS Infrastructure (aws/)**
- **ECS**: Container orchestration service (manages your apps)
- **ALB**: Load balancer (routes traffic to correct service)
- **IAM**: Permissions & security roles

### **Docker Containers (docker/)**
- **Webapp**: Next.js frontend application
- **Admin**: Admin dashboard application
- **Backend**: Node.js API server

### **Deployment Scripts (scripts/)**
- **Individual**: Deploy one service at a time
- **All-at-once**: Deploy everything together
- **Setup**: Initial AWS configuration

## 🚀 Deployment Options

### **Individual Deployments**
```bash
./deploy-webapp.sh      # Deploy webapp only
./deploy-admin.sh       # Deploy admin only
./deploy-backend.sh     # Deploy backend only
```

### **All-at-Once Deployment**
```bash
./deploy-all.sh         # Deploy all services
```

### **Status Check**
```bash
./status.sh             # See what's running
```

## 💰 Cost Target
- **Target**: $20-50/month
- **Strategy**: ECS Fargate Spot instances
- **Optimization**: Right-size resources, auto-scaling

## 🔧 Next Steps
1. **AWS Setup**: Create ECS cluster and ECR repositories
2. **Docker Build**: Create optimized containers
3. **Deployment**: Set up ECS services and load balancer
4. **Testing**: Verify all services work correctly

---
*This deployment system provides both individual control and all-at-once deployment capabilities.*
