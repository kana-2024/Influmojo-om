# Database Setup Guide

## 🚀 Quick Setup Options

### **Option 1: Supabase (Recommended - Free)**

1. **Create Supabase Account:**
   - Go to: https://supabase.com/
   - Click "Start your project"
   - Sign up with GitHub/Google
   - Create new project

2. **Get Database URL:**
   - Go to Settings → Database
   - Copy the connection string
   - It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Update .env file:**
   ```env
   DATABASE_URL="your_supabase_connection_string"
   ```

### **Option 2: Local PostgreSQL**

1. **Install PostgreSQL:**
   - Download from: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember the password you set

2. **Create Database:**
   ```bash
   # Open pgAdmin or psql
   createdb influmojo-test
   ```

3. **Update .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/influmojo-test"
   ```

### **Option 3: Railway (Free Tier)**

1. **Create Railway Account:**
   - Go to: https://railway.app/
   - Sign up with GitHub
   - Create new project

2. **Add PostgreSQL:**
   - Click "New Service"
   - Choose "Database" → "PostgreSQL"
   - Copy the connection URL

3. **Update .env file:**
   ```env
   DATABASE_URL="your_railway_connection_string"
   ```

## 🔧 Update Your .env File

Once you have your database URL, update the `backend/.env` file:

```env
# Replace this line:
DATABASE_URL="postgresql://username:password@localhost:5432/influmojo-test"

# With your actual database URL:
DATABASE_URL="your_actual_database_url_here"
```

## 🧪 Test Database Connection

After updating the DATABASE_URL:

```bash
cd backend
npm run db:migrate
```

## ❓ Need Help?

- **Supabase Issues:** Check Supabase documentation
- **Local PostgreSQL:** Check PostgreSQL installation guide
- **Railway Issues:** Check Railway documentation

## 🎯 Recommended: Supabase

I recommend using **Supabase** because:
- ✅ Free tier available
- ✅ Easy setup
- ✅ Web interface for database management
- ✅ Automatic backups
- ✅ No local installation needed