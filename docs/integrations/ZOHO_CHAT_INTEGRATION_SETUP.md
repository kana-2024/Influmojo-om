# Zoho Chat Integration Setup Guide

## Overview
This guide explains how to set up Zoho Chat integration for orders in the Influ Mojo app. When brands add packages to cart and create orders, they will automatically have access to a chat widget to communicate with Zoho Desk agents.

## Prerequisites

### 1. Zoho CRM Account
- Active Zoho CRM account with API access
- Zoho Chat/Desk subscription
- API credentials (Client ID, Client Secret, Refresh Token)

### 2. Environment Variables

#### Backend (.env file)
```env
# Zoho CRM Configuration
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_BASE_URL=https://www.zohoapis.in
ZOHO_CHAT_BASE_URL=https://salesiq.zoho.in

# Zoho Chat Configuration
ZOHO_CHAT_LICENSE=your_chat_license_key
ZOHO_CHAT_DEPARTMENT=your_department_id
ZOHO_WEBHOOK_SECRET=your_webhook_secret
```

#### Mobile App (.env file)
```env
# Zoho Chat Widget Configuration
EXPO_PUBLIC_ZOHO_CHAT_LICENSE=your_chat_license_key
EXPO_PUBLIC_ZOHO_CHAT_DEPARTMENT=your_department_id
```

## Setup Steps

### Step 1: Zoho CRM API Setup

1. **Create Zoho App**
   - Go to https://api-console.zoho.com/
   - Create a new Self-Client application
   - Add scopes: `ZohoCRM.modules.ALL`, `ZohoCRM.settings.ALL`
   - Generate refresh token

2. **Configure Zoho Chat**
   - Go to Zoho Chat/Desk admin panel
   - Create a department for Influ Mojo support
   - Get department ID and license key
   - Configure chat widget settings

### Step 2: Database Migration

Run the database migration to add chat fields to orders:
```bash
cd backend
npm run db:migrate
```

### Step 3: Backend Configuration

1. **Update Zoho Service**
   - The `zohoService.js` is already configured
   - Verify environment variables are set correctly

2. **Test Zoho Connection**
   ```bash
   curl -X POST http://localhost:3002/api/zoho/test-connection
   ```

### Step 4: Mobile App Configuration

1. **Update Environment Variables**
   - Add Zoho chat configuration to mobile app environment

2. **Test Chat Widget**
   - Build and test the mobile app
   - Verify chat widget appears for brand users

## How It Works

### 1. Order Creation Flow
1. Brand adds package to cart
2. Brand checks out (creates order)
3. System automatically:
   - Creates order in database
   - Initializes Zoho chat session
   - Enables chat for the order
   - Stores visitor ID and session ID

### 2. Chat Access Flow
1. Brand views orders
2. Brand sees "Chat with Support" button
3. Brand clicks chat button
4. System:
   - Checks if chat is enabled for order
   - If not enabled, enables it automatically
   - Opens Zoho chat widget
   - Connects to Zoho Desk agent

### 3. Chat Session
1. Brand can chat with Zoho Desk agent
2. Agent can see order context
3. Chat history is preserved
4. Agent can help with order-related queries

## API Endpoints

### Orders API
- `POST /api/orders/checkout` - Creates orders with chat enabled
- `GET /api/orders/:orderId/chat` - Get chat info for order
- `POST /api/orders/:orderId/enable-chat` - Enable chat for existing order

### Zoho API
- `POST /api/zoho/chat/initialize` - Initialize chat widget
- `POST /api/zoho/chat/send-message` - Send chat message
- `GET /api/zoho/chat/history/:visitorId` - Get chat history

## Testing

### 1. Test Order Creation
```bash
# Create test order
curl -X POST http://localhost:3002/api/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "packageId": "1",
        "quantity": 1
      }
    ]
  }'
```

### 2. Test Chat Enablement
```bash
# Enable chat for order
curl -X POST http://localhost:3002/api/orders/1/enable-chat \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Chat Info
```bash
# Get chat info
curl -X GET http://localhost:3002/api/orders/1/chat \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **Chat Not Initializing**
   - Check Zoho credentials
   - Verify API permissions
   - Check network connectivity

2. **Chat Widget Not Appearing**
   - Verify user type is 'brand'
   - Check order chat_enabled status
   - Verify Zoho chat license

3. **Messages Not Sending**
   - Check visitor ID validity
   - Verify Zoho chat session
   - Check API rate limits

### Debug Logs
- Backend logs show chat initialization status
- Mobile app logs show chat widget state
- Zoho dashboard shows visitor sessions

## Security Considerations

1. **API Security**
   - All endpoints require authentication
   - User can only access their own orders
   - Chat sessions are user-specific

2. **Data Privacy**
   - Chat messages are stored in Zoho
   - Order data is not shared in chat
   - Visitor IDs are encrypted

3. **Rate Limiting**
   - Zoho API has rate limits
   - Implement proper error handling
   - Cache chat sessions when possible

## Support

For issues with:
- **Zoho Configuration**: Contact Zoho support
- **App Integration**: Check this documentation
- **API Issues**: Review backend logs
- **Mobile Issues**: Check mobile app logs

## Future Enhancements

1. **Chat Notifications**
   - Push notifications for new messages
   - Email notifications for offline users

2. **Chat Analytics**
   - Track chat usage patterns
   - Measure customer satisfaction

3. **Advanced Features**
   - File sharing in chat
   - Voice/video calls
   - Chat bot integration