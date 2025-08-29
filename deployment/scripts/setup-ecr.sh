#!/bin/bash

# 🚀 Influmojo ECR Repository Setup Script
# This script creates ECR repositories for webapp, admin, and backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up ECR repositories for Influmojo...${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Get AWS account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "ap-south-1")

echo -e "${GREEN}✅ AWS Account ID: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}✅ AWS Region: ${REGION}${NC}"
echo ""

# ECR repository names
REPOS=("influmojo-webapp" "influmojo-admin" "influmojo-backend")

echo -e "${YELLOW}📦 Creating ECR repositories...${NC}"

for repo in "${REPOS[@]}"; do
    echo -e "${BLUE}Creating repository: ${repo}${NC}"
    
    # Check if repository already exists
    if aws ecr describe-repositories --repository-names "$repo" --region "$REGION" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Repository ${repo} already exists, skipping...${NC}"
    else
        # Create repository
        aws ecr create-repository \
            --repository-name "$repo" \
            --region "$REGION" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        
        echo -e "${GREEN}✅ Created repository: ${repo}${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 ECR repositories setup complete!${NC}"
echo ""

# Display repository information
echo -e "${BLUE}📋 ECR Repository Information:${NC}"
echo ""

for repo in "${REPOS[@]}"; do
    REPO_URI=$(aws ecr describe-repositories --repository-names "$repo" --region "$REGION" --query 'repositories[0].repositoryUri' --output text)
    echo -e "${GREEN}${repo}:${NC}"
    echo -e "  Repository URI: ${REPO_URI}"
    echo -e "  Region: ${REGION}"
    echo ""
done

echo -e "${YELLOW}🔐 Next steps:${NC}"
echo "1. Login to ECR: aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
echo "2. Build Docker images for each service"
echo "3. Tag and push images to ECR"
echo ""

echo -e "${GREEN}✅ ECR setup complete! You can now proceed to build and push Docker images.${NC}"
