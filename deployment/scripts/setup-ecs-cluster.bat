@echo off
echo ========================================
echo 🚀 Influmojo ECS Cluster Setup
echo ========================================
echo.

echo 📋 This script will guide you through creating an ECS cluster
echo    for running your containerized services.
echo.

echo 🔐 Prerequisites:
echo    1. AWS CLI installed and configured
echo    2. AWS credentials set up
echo    3. ECR repositories created (from previous step)
echo.

echo ⚠️  IMPORTANT: You need to manually create the ECS cluster in AWS Console
echo    This script provides the commands and guidance
echo.

echo 📋 AWS Console Steps:
echo    1. Go to AWS Console → ECS (Elastic Container Service)
echo    2. Click "Create cluster"
echo    3. Configure cluster settings:
echo       - Cluster name: influmojo-cluster
echo       - Cluster template: Networking only
echo       - VPC: Use existing (vpc-03984787c0fc19328)
echo       - Subnets: Select all subnets in your VPC
echo       - Security groups: Create new (influmojo-ecs-sg)
echo.

echo 🎯 Cluster Configuration:
echo    - Name: influmojo-cluster
echo    - Template: Networking only
echo    - VPC: vpc-03984787c0fc19328 (your existing)
echo    - Capacity Providers: FARGATE, FARGATE_SPOT
echo    - Container Insights: Enabled
echo.

echo 🔒 Security Group Settings:
echo    - Name: influmojo-ecs-sg
echo    - Inbound: HTTP (Port 80) from 0.0.0.0/0
echo    - Outbound: All traffic to 0.0.0.0/0
echo.

echo 💰 Cost Optimization:
echo    - Primary: FARGATE_SPOT (60-70% cost savings)
echo    - Fallback: FARGATE (when spot unavailable)
echo.

echo ✅ After cluster creation, you should see:
echo    - Cluster name: influmojo-cluster
echo    - Status: Active
echo    - Capacity providers: FARGATE, FARGATE_SPOT
echo.

echo 🚀 Next steps:
echo    1. Create IAM roles for ECS tasks
echo    2. Create ECS task definitions
echo    3. Create ECS services
echo    4. Set up Application Load Balancer
echo.

echo ✅ ECS cluster setup complete! You can now proceed to IAM roles.
echo.

pause
