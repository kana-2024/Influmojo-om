# 🚀 AWS ECR Repository Setup Guide

## 📋 What We're Setting Up

**ECR (Elastic Container Registry)** is AWS's private Docker registry where we'll store our container images.

## 🎯 Step-by-Step AWS Console Configuration

### **Step 1: Navigate to ECR**
1. **Open AWS Console** → Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. **Search for "ECR"** in the services search bar
3. **Click "Elastic Container Registry"**

### **Step 2: Create First Repository (influmojo-webapp)**

1. **Click "Create repository"**
2. **Repository name**: `influmojo-webapp`
3. **Visibility settings**: 
   - ✅ **Private** (recommended for production)
4. **Image tag mutability**: 
   - ✅ **Mutable** (allows overwriting tags)
5. **Image scanning**: 
   - ✅ **Scan on push** (security best practice)
6. **Encryption**: 
   - ✅ **Use default encryption** (AES256)
7. **Cross-account access**: 
   - ❌ **Leave unchecked** (not needed)
8. **Click "Create repository"**

### **Step 3: Create Second Repository (influmojo-admin)**

1. **Click "Create repository"** again
2. **Repository name**: `influmojo-admin`
3. **Use same settings** as webapp:
   - ✅ **Private**
   - ✅ **Mutable**
   - ✅ **Scan on push**
   - ✅ **Default encryption**
4. **Click "Create repository"**

### **Step 4: Create Third Repository (influmojo-backend)**

1. **Click "Create repository"** again
2. **Repository name**: `influmojo-backend`
3. **Use same settings** as above
4. **Click "Create repository"**

## 🔐 Repository Details

### **Repository URIs (Save These!)**
After creation, you'll see repository URIs like:
```
424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-webapp
424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-admin
424592696132.dkr.ecr.ap-south-1.amazonaws.com/influmojo-backend
```

### **Region**: `ap-south-1` (Mumbai)
### **Account ID**: `424592696132`

## ✅ What You Should See

After creating all three repositories, your ECR dashboard should show:
- ✅ **influmojo-webapp** (0 images)
- ✅ **influmojo-admin** (0 images)  
- ✅ **influmojo-backend** (0 images)

## 🚀 Next Steps

1. **ECR repositories created** ✅
2. **Next**: Create ECS cluster
3. **Then**: Build and push Docker images
4. **Finally**: Deploy to ECS

## 🔍 Verification

To verify your repositories were created correctly:
1. **Check ECR dashboard** - should see all 3 repositories
2. **Repository names** - exactly as specified above
3. **Region** - should be ap-south-1
4. **Visibility** - should be Private

---

**🎉 Congratulations! You've successfully set up ECR repositories.**
**Next, we'll create the ECS cluster to run your containers.**
