# 🚀 ECS Cluster Quick Reference

## 📋 Essential Information

### **Cluster Details**
- **Name**: `influmojo-cluster`
- **Region**: `ap-south-1` (Mumbai)
- **VPC**: `vpc-03984787c0fc19328` (your existing)
- **Template**: Networking only (Fargate)

### **Capacity Providers**
- **Primary**: `FARGATE_SPOT` (cost-effective)
- **Fallback**: `FARGATE` (reliability)

### **Security Group**
- **Name**: `influmojo-ecs-sg`
- **Inbound**: HTTP (Port 80) from 0.0.0.0/0
- **Outbound**: All traffic to 0.0.0.0/0

## 🎯 AWS Console Steps

1. **ECS Service** → Create cluster
2. **Cluster name**: `influmojo-cluster`
3. **Template**: Networking only
4. **VPC**: Use existing (`vpc-03984787c0fc19328`)
5. **Subnets**: Select all in your VPC
6. **Security groups**: Create new (`influmojo-ecs-sg`)
7. **Container Insights**: Enable
8. **Create cluster**

## ✅ Success Indicators

- ✅ Cluster status: "Active"
- ✅ Capacity providers: FARGATE, FARGATE_SPOT
- ✅ VPC: Your existing VPC
- ✅ Container Insights: Enabled

## 💰 Cost Impact

- **FARGATE_SPOT**: 60-70% cost savings
- **Auto-scaling**: Pay only for what you use
- **Target**: $20-50/month total

---

**Next Step**: Create IAM roles for ECS tasks
