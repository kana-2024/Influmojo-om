# 🔐 IAM Roles Quick Reference

## 📋 Essential Information

### **Two Roles to Create**

#### **1. Execution Role** (`influmojo-ecs-task-execution-role`)
- **Purpose**: ECS system permissions
- **Policies**: 
  - `AmazonECSTaskExecutionRolePolicy` (AWS managed)
  - `influmojo-ecs-execution-policy` (custom)
- **Permissions**: ECR, CloudWatch, Parameter Store

#### **2. Task Role** (`influmojo-ecs-task-role`)
- **Purpose**: Application permissions
- **Policies**: 
  - `influmojo-ecs-task-policy` (custom)
- **Permissions**: RDS, S3, SES, SNS

## 🎯 AWS Console Steps

### **Execution Role**
1. **IAM** → Roles → Create role
2. **AWS service** → ECS → ECS Task
3. **Attach**: `AmazonECSTaskExecutionRolePolicy`
4. **Name**: `influmojo-ecs-task-execution-role`
5. **Create custom policy** from `ecs-task-execution-role.json`
6. **Attach custom policy** to role

### **Task Role**
1. **IAM** → Roles → Create role
2. **AWS service** → ECS → ECS Task
3. **Skip permissions** (add custom later)
4. **Name**: `influmojo-ecs-task-role`
5. **Create custom policy** from `ecs-task-role.json`
6. **Attach custom policy** to role

## ✅ Success Indicators

- ✅ **2 roles created** with exact names
- ✅ **3 policies created** (1 AWS managed + 2 custom)
- ✅ **All policies attached** to correct roles
- ✅ **Trust relationships** show ECS as trusted entity

## 🔐 Policy Files

- **Execution**: `deployment/aws/iam/ecs-task-execution-role.json`
- **Task**: `deployment/aws/iam/ecs-task-role.json`

## 💰 Cost Impact

- **IAM roles**: Free (no additional cost)
- **Required for**: ECS to function properly
- **Security**: Least privilege access model

---

**Next Step**: Create ECS task definitions
