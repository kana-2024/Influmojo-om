# JWT Generation for Super Admin Login

This guide explains how to generate JWT tokens for super admin login in the Influmojo system.

## 🎯 Overview

There are two ways to generate JWT tokens for super admin login:

1. **Full Mode** - Connects to database to verify super admin exists
2. **Simple Mode** - Generates token without database connection (for testing)

## 📁 Available Scripts

### 1. `generate-super-admin-jwt.js` (Full Mode)
- ✅ Connects to database
- ✅ Verifies super admin user exists
- ✅ Uses actual user data from database
- ❌ Requires database connection
- ❌ Requires Prisma setup

### 2. `generate-super-admin-jwt-simple.js` (Simple Mode)
- ✅ No database connection required
- ✅ Works offline
- ✅ Quick token generation
- ❌ Uses hardcoded user data
- ❌ Doesn't verify user exists

## 🚀 Quick Start

### Option 1: Simple Mode (Recommended for Testing)

```bash
# Navigate to backend directory
cd backend

# Generate JWT token without database connection
node generate-super-admin-jwt-simple.js
```

This will:
- Generate a JWT token for super admin
- Display the token and usage instructions
- Work immediately without any setup

### Option 2: Full Mode (Production)

```bash
# Navigate to backend directory
cd backend

# First, ensure super admin user exists
node create-super-admin.js

# Then generate JWT token
node generate-super-admin-jwt.js
```

## 🔧 Prerequisites

### For Full Mode:
1. **Database Setup**
   ```bash
   # Ensure database is running
   # Check if .env file exists with DATABASE_URL
   ```

2. **Super Admin User**
   ```bash
   # Create super admin user if not exists
   node create-super-admin.js
   ```

3. **Dependencies**
   ```bash
   # Install required packages (if not already installed)
   npm install jsonwebtoken bcryptjs
   ```

### For Simple Mode:
- No prerequisites required
- Works with just `jsonwebtoken` package

## 📋 Usage Instructions

### 1. Generate the Token

Run one of the scripts from the backend directory:

```bash
# Navigate to backend directory
cd backend

# Simple mode (recommended)
node generate-super-admin-jwt-simple.js

# OR Full mode
node generate-super-admin-jwt.js
```

### 2. Copy the Token

The script will output a JWT token like this:
```
🎯 Generated JWT Token:
================================================================================
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcl90eXBlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3MzQ5NjgwMDAwLCJleHAiOjE3MzU1NzI4MDB9.signature
================================================================================
```

### 3. Use the Token

#### For Admin Dashboard:
1. Open your admin dashboard
2. Open browser developer tools (F12)
3. Go to **Application** tab → **Storage** → **Local Storage**
4. Find your domain
5. Add/update the `authToken` key with the generated token
6. Refresh the page

#### For API Testing:
```bash
# Use in curl requests
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     https://your-api-url/api/endpoint
```

#### For Mobile App Testing:
```javascript
// Add to API requests
const headers = {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json'
};
```

## 🔍 Token Details

### Token Payload Structure:
```json
{
  "userId": "1",
  "user_type": "super_admin",
  "iat": 1734968000000,
  "exp": 1735572800000
}
```

### Token Properties:
- **Expiration**: 7 days from generation
- **Algorithm**: HS256
- **Secret**: Uses `JWT_SECRET` environment variable or defaults to `'your_jwt_secret'`

## 🛠️ Troubleshooting

### Common Issues:

1. **"No super admin user found"**
   ```bash
   # Solution: Create super admin user first
   cd backend
   node create-super-admin.js
   ```

2. **"Database connection failed"**
   ```bash
   # Solution: Use simple mode instead
   cd backend
   node generate-super-admin-jwt-simple.js
   ```

3. **"Token verification failed"**
   - Check if `JWT_SECRET` environment variable is set correctly
   - Ensure the same secret is used across your application

4. **"Invalid token" in admin dashboard**
   - Clear browser storage and try again
   - Ensure token is copied completely (no extra spaces)
   - Check if token has expired

### Environment Variables:

Create a `.env` file in the backend directory:
```env
# JWT Secret (optional - defaults to 'your_jwt_secret')
JWT_SECRET=your_secure_jwt_secret_here

# Database URL (for full mode only)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

## 🔒 Security Notes

1. **JWT Secret**: Always use a strong, unique secret in production
2. **Token Expiration**: Tokens expire in 7 days by default
3. **Environment Variables**: Store sensitive data in environment variables
4. **HTTPS**: Always use HTTPS in production for token transmission

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your database connection (for full mode)
3. Ensure all dependencies are installed
4. Check the console output for specific error messages

## 🎉 Success Indicators

When successful, you should see:
- ✅ Token generated and displayed
- ✅ Token verification successful
- ✅ Expiration date shown
- ✅ Usage instructions provided

The generated token can then be used to authenticate as a super admin in your application.
