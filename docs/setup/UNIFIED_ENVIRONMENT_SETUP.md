# 🚀 Influmojo Unified Environment Setup

This document explains how to set up a unified development environment using `influmojo.in` domain with Cloudflare Tunnel, eliminating the need for random Ngrok URLs and ensuring consistent endpoints across all developers.

## 🎯 What This Solves

- ✅ **No more random Ngrok URLs** - All developers use the same stable endpoints
- ✅ **Consistent OAuth redirects** - Zoho, Google, and other services work for everyone
- ✅ **Unified webhook endpoints** - Zoho CRM, Stripe, and other webhooks work seamlessly
- ✅ **Team collaboration** - New developers can start immediately without URL configuration
- ✅ **Production-like testing** - Use real HTTPS endpoints with SSL certificates

## 🌐 Domain Structure

```
influmojo.in
├── api.influmojo.in          → Backend API (port 3002)
├── dev.influmojo.in          → Frontend/Web App (port 3000)
├── webhook.influmojo.in      → Webhook Receiver (port 3002)
├── auth.influmojo.in         → OAuth Callbacks (port 3002)
├── chat.influmojo.in         → Chat Integration (port 3002)
└── health.influmojo.in       → Health Checks (port 3002)
```

## 🛠️ Prerequisites

1. **Domain Ownership**: You must own `influmojo.in` domain
2. **Cloudflare Account**: Free account at [cloudflare.com](https://cloudflare.com)
3. **Node.js & npm**: For running the backend and mobile app
4. **Expo CLI**: For mobile development

## 📋 Step-by-Step Setup

### Step 1: Domain DNS Configuration

1. **Add Domain to Cloudflare**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Click "Add a site" and enter `influmojo.in`
   - Choose the Free plan
   - Cloudflare will scan your current DNS

2. **Update Nameservers**:
   - In your domain registrar (where you bought influmojo.in)
   - Replace the nameservers with Cloudflare's (they'll provide 2 nameservers)
   - Wait 5-15 minutes for propagation

### Step 2: Install Cloudflare Tunnel

**macOS**:
```bash
brew install cloudflared
```

**Linux**:
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**Windows**:
```bash
choco install cloudflared
# Or download from: https://github.com/cloudflare/cloudflared/releases
```

### Step 3: Run Setup Script

```bash
# Make the script executable
chmod +x setup-unified-environment.sh

# Run the setup
./setup-unified-environment.sh
```

This script will:
- ✅ Install cloudflared if not present
- ✅ Authenticate with Cloudflare
- ✅ Create the tunnel and DNS routes
- ✅ Set up environment files
- ✅ Install dependencies
- ✅ Create a start script

### Step 4: Configure Environment Files

The setup script creates `.env` files from `.env.unified` templates. Update them with your actual credentials:

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/influmojo-test"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Zoho CRM
ZOHO_CLIENT_ID="your_zoho_client_id_here"
ZOHO_CLIENT_SECRET="your_zoho_client_secret_here"
ZOHO_REFRESH_TOKEN="your_zoho_refresh_token_here"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
```

**Mobile** (`mobile/.env`):
```env
# API Configuration
EXPO_PUBLIC_API_URL="https://api.influmojo.in"

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID="your-google-client-id-android"

# Zoho Chat
EXPO_PUBLIC_ZOHO_CHAT_LICENSE="your_chat_license_key_here"
EXPO_PUBLIC_ZOHO_CHAT_DEPARTMENT="your_department_id_here"
```

### Step 5: Start Development Environment

```bash
# Start all services
./start-dev.sh
```

This will start:
- 🌐 Cloudflare Tunnel
- 🔧 Backend server (port 3002)
- 📱 Mobile development server (port 8081)

## 🔧 Configuration for External Services

### Zoho CRM Configuration

**OAuth Redirect URI**:
```
https://auth.influmojo.in/api/auth/zoho/callback
```

**Webhook URL**:
```
https://webhook.influmojo.in/api/zoho/webhook
```

### Zoho SalesIQ Chat Configuration

**Chat Origin**:
```
https://chat.influmojo.in
```

**JavaScript SDK Origin**:
```
https://api.influmojo.in
```

### Google OAuth Configuration

**Redirect URI**:
```
https://auth.influmojo.in/api/auth/google/callback
```

### Stripe Webhooks

**Webhook Endpoint**:
```
https://webhook.influmojo.in/api/stripe/webhook
```

## 🧪 Testing Your Setup

### Health Check
```bash
curl https://health.influmojo.in/api/health
```

### API Test
```bash
curl https://api.influmojo.in/api/health
```

### Webhook Test
```bash
curl -X POST https://webhook.influmojo.in/api/zoho/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## 🔄 For New Team Members

New developers only need to:

1. **Clone the repository**
2. **Run the setup script**:
   ```bash
   ./setup-unified-environment.sh
   ```
3. **Update credentials** in `.env` files
4. **Start development**:
   ```bash
   ./start-dev.sh
   ```

No URL configuration needed! 🎉

## 🚨 Troubleshooting

### Tunnel Not Working
```bash
# Check tunnel status
cloudflared tunnel list

# Check tunnel logs
cloudflared tunnel run influmojo-dev --loglevel debug
```

### DNS Issues
```bash
# Check DNS propagation
nslookup api.influmojo.in

# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3002

# Kill the process
kill -9 <PID>
```

### CORS Issues
- Ensure your domain is in the `ALLOWED_ORIGINS` in `backend/.env`
- Check that the request includes proper headers

## 📱 Mobile App Configuration

The mobile app automatically uses the unified endpoints:

```typescript
// All API calls go through the unified domain
const API_BASE_URL = "https://api.influmojo.in";

// Webhook endpoints
const WEBHOOK_URL = "https://webhook.influmojo.in";

// OAuth callbacks
const AUTH_URL = "https://auth.influmojo.in";
```

## 🔒 Security Considerations

- ✅ All traffic is encrypted via HTTPS
- ✅ Cloudflare provides DDoS protection
- ✅ SSL certificates are automatically managed
- ✅ Rate limiting is configured
- ✅ CORS is properly configured

## 🚀 Production Deployment

When ready for production, simply update the domain references:

```env
# Development
EXPO_PUBLIC_API_URL="https://api.influmojo.in"

# Production
EXPO_PUBLIC_API_URL="https://api.influmojo.com"
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Cloudflare tunnel is running: `cloudflared tunnel list`
3. Check logs: `cloudflared tunnel run influmojo-dev --loglevel debug`
4. Ensure DNS propagation is complete

---

**🎉 Congratulations!** You now have a unified development environment that works seamlessly for all team members without URL configuration hassles. 