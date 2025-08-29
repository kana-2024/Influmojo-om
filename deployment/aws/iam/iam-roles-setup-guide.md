# 🔐 AWS IAM Roles Setup Guide for ECS

## 📋 What We're Setting Up

**IAM (Identity and Access Management)** roles that give ECS permission to:
- ✅ **Pull Docker images** from ECR
- ✅ **Access Parameter Store** (your environment variables)
- ✅ **Write logs** to CloudWatch
- ✅ **Connect to RDS** database
- ✅ **Upload files** to S3
- ✅ **Send emails** via SES

## 🔑 **IMPORTANT: Trusted Entity Type**

**Trusted Entity Type = "AWS service"** means:
- **ECS** (AWS service) can assume these roles
- **Your containers** will run with these permissions
- **AWS automatically** handles the security relationship
- **This is the correct choice** for ECS task roles

## 🎯 Step-by-Step AWS Console Configuration

### **Step 1: Navigate to IAM**
1. **Open AWS Console** → Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. **Search for "IAM"** in the services search bar
3. **Click "Identity and Access Management"**

### **Step 2: Create ECS Task Execution Role**
1. **Click "Roles"** in the left sidebar
2. **Click "Create role"**
3. **Trusted entity type**: 
   - ✅ **AWS service** ← **This allows ECS to use this role**
4. **Use case**: 
   - ✅ **Elastic Container Service**
   - ✅ **Elastic Container Service Task**
5. **Click "Next"**

### **Step 3: Attach Permissions to Execution Role**
1. **Search for policies**:
   - ✅ **AmazonECSTaskExecutionRolePolicy** (AWS managed policy)
2. **Click "Next"**
3. **Role name**: `influmojo-ecs-task-execution-role`
4. **Description**: `ECS task execution role for Influmojo services`
5. **Click "Create role"**

### **Step 4: Create Custom Policy for Execution Role**
1. **Go back to "Policies"** in left sidebar
2. **Click "Create policy"**
3. **JSON tab**: Copy and paste the content from `ecs-task-execution-role.json`
4. **Click "Next: Tags"**
5. **Add tags**:
   - **Key**: `Project`, **Value**: `Influmojo`
   - **Key**: `Purpose`, **Value**: `ECS Task Execution`
6. **Click "Next: Review"**
7. **Policy name**: `influmojo-ecs-execution-policy`
8. **Click "Create policy"**

### **Step 5: Attach Custom Policy to Execution Role**
1. **Go back to "Roles"**
2. **Click on** `influmojo-ecs-task-execution-role`
3. **Click "Attach policies"**
4. **Search for** `influmojo-ecs-execution-policy`
5. **Select it** and click "Attach policy"

### **Step 6: Create ECS Task Role**
1. **Click "Create role"** again
2. **Trusted entity type**: 
   - ✅ **AWS service** ← **This allows ECS to use this role**
3. **Use case**: 
   - ✅ **Elastic Container Service**
   - ✅ **Elastic Container Service Task**
4. **Click "Next"**
5. **Skip permissions** (we'll add custom ones)
6. **Click "Next"**
7. **Role name**: `influmojo-ecs-task-role`
8. **Description**: `ECS task role for Influmojo application permissions`
9. **Click "Create role"**

### **Step 7: Create Custom Policy for Task Role**
1. **Go to "Policies"**
2. **Click "Create policy"**
3. **JSON tab**: Copy and paste the content from `ecs-task-role.json`
4. **Click "Next: Tags"**
5. **Add tags**:
   - **Key**: `Project`, **Value**: `Influmojo`
   - **Key**: `Purpose`, **Value**: `ECS Task Application`
6. **Click "Next: Review"**
7. **Policy name**: `influmojo-ecs-task-policy`
8. **Click "Create policy"**

### **Step 8: Attach Custom Policy to Task Role**
1. **Go back to "Roles"**
2. **Click on** `influmojo-ecs-task-role`
3. **Click "Attach policies"**
4. **Search for** `influmojo-ecs-task-policy`
5. **Select it** and click "Attach policy"

## 🔐 Role Details

### **Execution Role** (`influmojo-ecs-task-execution-role`)
- **Purpose**: ECS system permissions (ECR, CloudWatch, Parameter Store)
- **Used by**: ECS to pull images and write logs
- **Attached policies**: 
  - `AmazonECSTaskExecutionRolePolicy` (AWS managed)
  - `influmojo-ecs-execution-policy` (custom)

### **Task Role** (`influmojo-ecs-task-role`)
- **Purpose**: Application permissions (RDS, S3, SES, SNS)
- **Used by**: Your applications inside containers
- **Attached policies**: 
  - `influmojo-ecs-task-policy` (custom)

## ✅ What You Should See

After creating both roles, you should see:
- ✅ **influmojo-ecs-task-execution-role** (with 2 attached policies)
- ✅ **influmojo-ecs-task-role** (with 1 attached policy)
- ✅ **influmojo-ecs-execution-policy** (custom policy)
- ✅ **influmojo-ecs-task-policy** (custom policy)

## 🚀 Next Steps

1. **IAM roles created** ✅
2. **Next**: Create ECS task definitions
3. **Then**: Create ECS services
4. **Finally**: Deploy containers

## 🔍 Verification

To verify your roles were created correctly:
1. **Check IAM dashboard** - should see both roles
2. **Role names** - exactly as specified above
3. **Attached policies** - should show the correct policies
4. **Trust relationships** - should show ECS as trusted entity

---

**🎉 Congratulations! You've successfully created IAM roles for ECS.**
**Next, we'll create ECS task definitions that define how your containers should run.**
