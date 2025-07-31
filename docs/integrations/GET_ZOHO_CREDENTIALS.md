# Quick Guide: Getting Zoho Credentials

## 🚀 Step-by-Step Process

### **Step 1: Zoho Developer Account**
1. Go to: https://api-console.zoho.com/
2. Sign in with your Zoho account (create one if needed)

### **Step 2: Create API Client**
1. Click "Add Client"
2. Choose "Self-Client"
3. Fill in:
   - **Client Name:** `Influmojo Chat Integration`
   - **Homepage URL:** `https://influmojo.com`
   - **Redirect URI:** `https://influmojo.com/callback`
4. Click "Create"

### **Step 3: Get Client Credentials**
After creating the client, you'll see:
- **Client ID:** Copy this
- **Client Secret:** Copy this

### **Step 4: Generate Refresh Token**
1. Click "Generate Code" 
2. Copy the generated code
3. Open this URL in browser (replace with your values):
```
https://accounts.zoho.in/oauth/v2/token?code=YOUR_GENERATED_CODE&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=https://influmojo.com/callback&grant_type=authorization_code
```
4. Copy the `refresh_token` from the response

### **Step 5: Set Up Zoho Chat**
1. Go to: https://www.zoho.com/chat/
2. Sign up for a trial/paid plan
3. Go to Admin Panel → Departments
4. Create department: "Influ Mojo Support"
5. Note the **Department ID**
6. Go to Settings → Widgets
7. Create chat widget and copy **License Key**

## 📋 What You Need to Collect

| Credential | Where to Find | Example |
|------------|---------------|---------|
| **Client ID** | API Console → Your Client | `1000.ABC123...` |
| **Client Secret** | API Console → Your Client | `abc123def456...` |
| **Refresh Token** | Generated from code | `1000.xyz789...` |
| **Chat License** | Zoho Chat → Widgets | `1234567890abcdef` |
| **Department ID** | Zoho Chat → Departments | `123456789` |

## 🔧 Quick Setup Script

Run this to configure your environment:
```bash
node setup-zoho-integration.js
```

This will ask for your credentials and create the `.env` files automatically.

## 🧪 Test Your Setup

After getting credentials:

1. **Update your .env files** with the credentials
2. **Run database migration:**
   ```bash
   cd backend
   npm run db:migrate
   ```
3. **Test Zoho connection:**
   ```bash
   curl -X POST http://localhost:3002/api/zoho/test-connection
   ```

## ❓ Common Issues

### **"Invalid Client" Error**
- Check your Client ID and Secret
- Make sure you copied them correctly

### **"Invalid Refresh Token" Error**
- Generate a new refresh token
- Make sure you used the correct redirect URI

### **"Chat License Invalid" Error**
- Check your Zoho Chat subscription
- Verify the license key is correct

## 📞 Need Help?

- **Zoho API Issues:** Check Zoho API documentation
- **Chat Setup Issues:** Contact Zoho Chat support
- **Integration Issues:** Check the main setup guide

## 🎯 Next Steps

1. ✅ Get Zoho credentials (this guide)
2. ✅ Run setup script
3. ✅ Test integration
4. ✅ Deploy to production