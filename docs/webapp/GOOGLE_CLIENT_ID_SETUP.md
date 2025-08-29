# How to Get Your Google Client ID

## Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

## Step 2: Create or Select a Project
1. Click on the project dropdown at the top
2. Either select an existing project or click "New Project"
3. If creating new: Give it a name like "Influmojo Web App"

## Step 3: Enable Google Identity Services
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Enable the required APIs

## Step 4: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. Choose **"Web application"**
5. Give it a name like "Influmojo Web Client"

## Step 5: Configure Authorized Origins
Add these URLs to **Authorized JavaScript origins**:
- `http://localhost:3000` (for development)
- `https://yourdomain.com` (for production)

## Step 6: Copy Your Client ID
1. Copy the **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
2. Paste it into your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

## Important Notes
- ✅ **Client ID** is safe to use in frontend code
- ❌ **Client Secret** should NEVER be used in frontend code
- 🔄 You may need to wait a few minutes for changes to take effect
