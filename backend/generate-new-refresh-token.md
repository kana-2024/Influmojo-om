# 🔄 Generate New Zoho Refresh Token

## 📋 Prerequisites
- Zoho Developer Account
- Your existing Zoho Client ID and Client Secret
- Access to Zoho Developer Console

## 🚀 Step-by-Step Process

### 1. **Access Zoho Developer Console**
- Go to: https://api-console.zoho.com/
- Sign in with your Zoho account

### 2. **Navigate to Your App**
- Click on your existing app (or create a new one if needed)
- Go to "Client" tab

### 3. **Generate New Refresh Token**

#### Option A: Using Self-Client (Recommended)
1. In your app's "Client" tab, find the "Self-Client" section
2. Click "Generate Code" button
3. Copy the generated code (it's a one-time use code)

#### Option B: Using Authorization URL
1. Use this URL format:
```
https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI
```

2. Replace:
   - `YOUR_CLIENT_ID` with your actual client ID
   - `YOUR_REDIRECT_URI` with your redirect URI (e.g., `https://yourdomain.com/callback`)

### 4. **Exchange Code for Refresh Token**
Use this curl command or Postman:

```bash
curl -X POST https://accounts.zoho.in/oauth/v2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=GENERATED_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "grant_type=authorization_code"
```

### 5. **Update Your Environment Variables**
Once you get the new refresh token, update your `.env` file:

```env
ZOHO_REFRESH_TOKEN=your_new_refresh_token_here
```

## 🔧 Current Configuration
Your current Zoho configuration:
- Client ID: `1000.7KMAZLTHW8YZCYLMVKL0H6KVVMZCCX`
- Client Secret: `b7cd37590ec98fe8ecb3d1e174bff9fe629ecf840f`
- Base URL: `https://www.zohoapis.in`

## ⚠️ Important Notes
1. **Refresh tokens expire** after 60 days of inactivity
2. **Keep your refresh token secure** - don't commit it to version control
3. **Test the new token** before deploying to production
4. **Backup your old token** in case you need to rollback

## 🧪 Test the New Token
After updating the refresh token, test it with:

```bash
node test-zoho-auth.js
```

## 📞 Need Help?
If you encounter issues:
1. Check Zoho API documentation: https://www.zoho.com/crm/developer/docs/api/oauth-overview.html
2. Verify your app permissions in Zoho Developer Console
3. Ensure your redirect URI matches exactly 