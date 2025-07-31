# 🚀 Influmojo Quick Start Guide

## 🎯 Unified Development Environment

This guide helps you set up the unified development environment using `influmojo.in` domain with Cloudflare Tunnel.

## ⚡ Quick Setup (5 minutes)

### 1. Prerequisites
- ✅ Own `influmojo.in` domain
- ✅ Cloudflare account (free)
- ✅ Node.js & npm installed

### 2. Domain Setup
1. Add `influmojo.in` to Cloudflare
2. Update nameservers in your domain registrar
3. Wait 5-15 minutes for DNS propagation

### 3. Run Setup Script

**macOS/Linux:**
```bash
chmod +x setup-unified-environment.sh
./setup-unified-environment.sh
```

**Windows:**
```powershell
.\setup-unified-environment.ps1
```

### 4. Configure Credentials
Update the generated `.env` files with your actual credentials:
- `backend/.env` - Database, JWT, Zoho, Twilio
- `mobile/.env` - Google OAuth, Zoho Chat

### 5. Start Development
```bash
# macOS/Linux
./start-dev.sh

# Windows
.\start-dev.ps1
```

## 🌐 Your Unified Endpoints

Once setup is complete, you'll have these stable endpoints:

| Service | URL | Purpose |
|---------|-----|---------|
| **API** | `https://api.influmojo.in` | Backend API calls |
| **Webhook** | `https://webhook.influmojo.in` | Zoho, Stripe webhooks |
| **Auth** | `https://auth.influmojo.in` | OAuth callbacks |
| **Chat** | `https://chat.influmojo.in` | Zoho SalesIQ |
| **Health** | `https://health.influmojo.in` | Health checks |

## 🔧 External Service Configuration

### Zoho CRM
- **OAuth Redirect**: `https://auth.influmojo.in/api/auth/zoho/callback`
- **Webhook URL**: `https://webhook.influmojo.in/api/zoho/webhook`

### Zoho SalesIQ Chat
- **Chat Origin**: `https://chat.influmojo.in`
- **JS SDK Origin**: `https://api.influmojo.in`

### Google OAuth
- **Redirect URI**: `https://auth.influmojo.in/api/auth/google/callback`

### Stripe
- **Webhook Endpoint**: `https://webhook.influmojo.in/api/stripe/webhook`

## 🧪 Testing

```bash
# Health check
curl https://health.influmojo.in/api/health

# API test
curl https://api.influmojo.in/api/health

# Webhook test
curl -X POST https://webhook.influmojo.in/api/zoho/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## 🔄 For New Team Members

New developers only need to:

1. **Clone repository**
2. **Run setup script** (see step 3 above)
3. **Update credentials** in `.env` files
4. **Start development** (see step 5 above)

**No URL configuration needed!** 🎉

## 🚨 Common Issues

### Tunnel Not Working
```bash
# Check tunnel status
cloudflared tunnel list

# Check logs
cloudflared tunnel run influmojo-dev --loglevel debug
```

### DNS Issues
```bash
# Check DNS propagation
nslookup api.influmojo.in
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3002  # macOS/Linux
netstat -ano | findstr :3002  # Windows
```

## 📱 Mobile Development

The mobile app automatically uses the unified endpoints:

```typescript
// All API calls go through unified domain
const API_BASE_URL = "https://api.influmojo.in";

// Webhook endpoints
const WEBHOOK_URL = "https://webhook.influmojo.in";

// OAuth callbacks
const AUTH_URL = "https://auth.influmojo.in";
```

## 🎉 Benefits

- ✅ **No more random Ngrok URLs**
- ✅ **Consistent OAuth redirects**
- ✅ **Unified webhook endpoints**
- ✅ **Team collaboration ready**
- ✅ **Production-like testing**
- ✅ **SSL certificates included**
- ✅ **DDoS protection via Cloudflare**

## 📞 Need Help?

1. Check the troubleshooting section above
2. Verify Cloudflare tunnel is running: `cloudflared tunnel list`
3. Check logs: `cloudflared tunnel run influmojo-dev --loglevel debug`
4. Ensure DNS propagation is complete

---

**🎯 Goal Achieved**: All developers can now work with the same stable endpoints without URL configuration hassles! 