# Quick Login Guide

## 🚀 **Quick Start**

### **For Super Admins**

1. **Create super admin**
   ```bash
   cd backend
   node create-super-admin.js
   ```

2. **Copy the JWT token** from console output

3. **Login**
   - Go to `http://localhost:3000`
   - Paste token → Click "Sign In"
   - Redirected to `/super-admin`

### **For Agents**

1. **Create agent**
   ```bash
   cd backend
   node create-agent.js
   ```

2. **Copy the JWT token** from console output

3. **Login**
   - Go to `http://localhost:3000`
   - Paste token → Click "Sign In"
   - Redirected to `/agent`

## 🔐 **JWT Token Format**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJ1c2VyX3R5cGUiOiJhZ2VudCIsImlhdCI6MTczNDU2Nzg5MH0...
```

## 🎯 **Dashboard URLs**

- **Main Login**: `http://localhost:3000`
- **Super Admin**: `http://localhost:3000/super-admin`
- **Agent**: `http://localhost:3000/agent`

## ⚠️ **Common Issues**

| Issue | Solution |
|-------|----------|
| "Access denied" | Check user_type in token |
| "Authentication failed" | Generate new token |
| "No tickets assigned" | Super admin needs to assign tickets |
| Chat not connecting | Check StreamChat credentials |

## 📞 **Need Help?**

- **Technical Issues**: Check troubleshooting in README.md
- **Access Problems**: Contact super admin
- **Agent Setup**: See AGENT_LOGIN_GUIDE.md 