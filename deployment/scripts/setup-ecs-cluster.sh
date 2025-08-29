#!/bin/bash

# 🚀 Influmojo ECS Cluster Setup Script
# This script creates the ECS cluster for running containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up ECS cluster for Influmojo...${NC}"
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

# Cluster configuration
CLUSTER_NAME="influmojo-cluster"
VPC_ID="vpc-03984787c0fc19328"  # Your existing VPC

echo -e "${YELLOW}📋 Cluster Configuration:${NC}"
echo -e "  Cluster Name: ${CLUSTER_NAME}"
echo -e "  VPC ID: ${VPC_ID}"
echo -e "  Region: ${REGION}"
echo -e "  Capacity Providers: FARGATE, FARGATE_SPOT"
echo ""

# Check if cluster already exists
if aws ecs describe-clusters --clusters "$CLUSTER_NAME" --region "$REGION" --query 'clusters[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
    echo -e "${YELLOW}⚠️  Cluster ${CLUSTER_NAME} already exists and is active.${NC}"
    echo -e "${GREEN}✅ Skipping cluster creation...${NC}"
else
    echo -e "${BLUE}🔨 Creating ECS cluster: ${CLUSTER_NAME}${NC}"
    
    # Create ECS cluster
    aws ecs create-cluster \
        --cluster-name "$CLUSTER_NAME" \
        --region "$REGION" \
        --capacity-providers FARGATE FARGATE_SPOT \
        --default-capacity-provider-strategy capacityProvider=FARGATE_SPOT,weight=1,base=1 capacityProvider=FARGATE,weight=0,base=0 \
        --settings name=containerInsights,value=enabled \
        --tags key=Project,value=Influmojo key=Environment,value=Production key=Purpose,value=ECS_Cluster
    
    echo -e "${GREEN}✅ ECS cluster created successfully!${NC}"
fi

# Wait for cluster to be active
echo -e "${YELLOW}⏳ Waiting for cluster to become active...${NC}"
aws ecs wait cluster-stable --clusters "$CLUSTER_NAME" --region "$REGION"
echo -e "${GREEN}✅ Cluster is now active!${NC}"

# Display cluster information
echo ""
echo -e "${BLUE}📋 ECS Cluster Information:${NC}"
echo ""

CLUSTER_INFO=$(aws ecs describe-clusters --clusters "$CLUSTER_NAME" --region "$REGION" --query 'clusters[0]')

echo -e "${GREEN}Cluster Name:${NC} $(echo "$CLUSTER_INFO" | jq -r '.clusterName')"
echo -e "${GREEN}Status:${NC} $(echo "$CLUSTER_INFO" | jq -r '.status')"
echo -e "${GREEN}Active Services:${NC} $(echo "$CLUSTER_INFO" | jq -r '.activeServicesCount')"
echo -e "${GREEN>Running Tasks:${NC} $(echo "$CLUSTER_INFO" | jq -r '.runningTasksCount')"
echo -e "${GREEN>Capacity Providers:${NC} $(echo "$CLUSTER_INFO" | jq -r '.capacityProviders[]' | tr '\n' ', ' | sed 's/,$//')"

echo ""
echo -e "${GREEN}🎉 ECS cluster setup complete!${NC}"
echo ""

echo -e "${YELLOW}🔐 Next steps:${NC}"
echo "1. Create IAM roles for ECS tasks"
echo "2. Create ECS task definitions"
echo "3. Create ECS services"
echo "4. Set up Application Load Balancer"
echo ""

echo -e "${GREEN}✅ Your ECS cluster is ready to run containers!${NC}"
