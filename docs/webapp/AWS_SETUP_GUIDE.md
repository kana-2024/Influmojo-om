# 🚀 AWS Setup Guide for GitHub Actions Deployment

## **Step 1: Create IAM Role for GitHub Actions**

### 1.1 Create Trust Policy
Create a file `github-actions-trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/Influmojo-om:*"
        }
      }
    }
  ]
}
```

### 1.2 Create Permission Policy
Create a file `github-actions-permissions.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::influmojo-deployments/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand",
        "ssm:GetCommandInvocation",
        "ssm:DescribeInstanceInformation"
      ],
      "Resource": [
        "arn:aws:ec2:ap-south-1:YOUR_ACCOUNT_ID:instance/i-0b338206ea637e1b4",
        "arn:aws:ssm:ap-south-1:YOUR_ACCOUNT_ID:document/AWS-RunShellScript"
      ]
    }
  ]
}
```

### 1.3 Create the Role
```bash
# Create the role
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://github-actions-trust-policy.json

# Attach the permission policy
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name GitHubActionsPermissions \
  --policy-document file://github-actions-permissions.json
```

## **Step 2: Set up OIDC Provider**

### 2.1 Create OIDC Provider
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --client-id-list sts.amazonaws.com
```

## **Step 3: Update GitHub Actions Workflow**

### 3.1 Replace Placeholders
In `webapp/.github/workflows/deploy.yml`, replace:
- `YOUR_ACCOUNT_ID` with your AWS account ID
- `YOUR_GITHUB_USERNAME` with your GitHub username

### 3.2 Example:
```yaml
role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
```

## **Step 4: Test the Pipeline**

### 4.1 Push to Trigger
```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin new-feature-branch
```

### 4.2 Monitor Deployment
1. Go to GitHub → Actions tab
2. Watch the "Deploy Webapp" workflow
3. Check AWS SSM → Run Command for execution logs

## **Step 5: Benefits of This Setup**

✅ **Zero Manual Work** - Push code, get deployment  
✅ **No SSH Keys** - Uses AWS IAM roles  
✅ **Fast Builds** - GitHub Actions runners are fast  
✅ **Automatic Rollbacks** - Keep previous releases  
✅ **Secure** - OIDC authentication  
✅ **Scalable** - Easy to add more environments  

## **Step 6: Manual Deployment (if needed)**

You can still use the manual script:
```bash
npm run deploy:auto
```

But GitHub Actions is much better! 🚀

## **Step 7: Troubleshooting**

### 7.1 Check IAM Role
```bash
aws iam get-role --role-name GitHubActionsRole
```

### 7.2 Check OIDC Provider
```bash
aws iam list-open-id-connect-providers
```

### 7.3 Check SSM Command
```bash
aws ssm list-command-invocations --instance-id i-0b338206ea637e1b4
```

## **Step 8: Next Steps**

1. **Set up staging environment** - Deploy to different branch
2. **Add database migrations** - Run migrations during deployment
3. **Add health checks** - Verify deployment success
4. **Add notifications** - Slack/Discord notifications
5. **Add rollback** - Automatic rollback on failure

---

**🎉 Once set up, you'll have the best deployment experience possible!**
