# 🚀 Zoho CRM Plus & Chat Integration

This document outlines the complete implementation of Zoho CRM Plus and Chat integration for the Influ Mojo platform, following official Zoho documentation and best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Mobile Integration](#mobile-integration)
- [Environment Variables](#environment-variables)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Official Documentation References](#official-documentation-references)

## 🎯 Overview

The Zoho integration provides:
- **CRM Contact Management**: Automatic sync of users to Zoho CRM
- **Deal/Opportunity Tracking**: Collaboration deals mapped to Zoho CRM
- **Task Management**: Follow-up tasks and reminders
- **Live Chat Support**: Real-time customer support via Zoho Chat
- **Webhook Integration**: Real-time updates from Zoho CRM

## ✨ Features

### 🏢 Zoho CRM Integration
- ✅ Automatic user contact creation/update
- ✅ Collaboration deal tracking
- ✅ Task creation for follow-ups
- ✅ Custom field mapping for influencer marketing
- ✅ Webhook handling for real-time updates

### 💬 Zoho Chat Integration
- ✅ Live chat widget for mobile app
- ✅ Visitor profile creation
- ✅ Chat history management
- ✅ Real-time messaging
- ✅ Agent typing indicators
- ✅ Custom visitor fields

### 🔄 Data Synchronization
- ✅ User profile sync to Zoho CRM
- ✅ Collaboration data mapping
- ✅ Bidirectional webhook communication
- ✅ Error handling and retry logic

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │   Zoho Services │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ChatButton   │ │    │ │ZohoService  │ │    │ │Zoho CRM     │ │
│ │ZohoChatWidget│ │◄──►│ │Zoho Routes  │ │◄──►│ │Zoho Chat    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │Webhooks     │ │
└─────────────────┘    └─────────────────┘    │ └─────────────┘ │
                                              └─────────────────┘
```

## 🛠️ Setup Instructions

### 1. Zoho Developer Account Setup

1. **Create Zoho Developer Account**
   - Go to [Zoho Developer Console](https://api-console.zoho.com/)
   - Create a new account or sign in

2. **Create Self-Client Application**
   ```bash
   # Navigate to Developer Console
   # Create new client application
   # Set redirect URI: https://your-domain.com/zoho/callback
   ```

3. **Generate OAuth Tokens**
   ```bash
   # Get authorization code
   https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=YOUR_CLIENT_ID&scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&redirect_uri=YOUR_REDIRECT_URI&access_type=offline

   # Exchange for refresh token
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "code=AUTHORIZATION_CODE" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=YOUR_REDIRECT_URI" \
     -d "grant_type=authorization_code"
   ```

### 2. Backend Configuration

1. **Install Dependencies**
   ```bash
   cd backend
   npm install axios
   ```

2. **Environment Variables**
   ```bash
   # Add to .env file
   ZOHO_CLIENT_ID=your_client_id
   ZOHO_CLIENT_SECRET=your_client_secret
   ZOHO_REFRESH_TOKEN=your_refresh_token
   ZOHO_BASE_URL=https://www.zohoapis.com
   ZOHO_CHAT_BASE_URL=https://livechat.zoho.com
   ZOHO_WEBHOOK_SECRET=your_webhook_secret
   ```

3. **Database Schema Updates**
   ```sql
   -- Add Zoho integration fields to existing tables
   ALTER TABLE users ADD COLUMN zoho_contact_id VARCHAR(255);
   ALTER TABLE collaborations ADD COLUMN zoho_deal_id VARCHAR(255);
   ```

### 3. Mobile App Configuration

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install react-native-webview
   ```

2. **Environment Variables**
   ```bash
   # Add to .env file
   EXPO_PUBLIC_ZOHO_CHAT_LICENSE=your_chat_license
   EXPO_PUBLIC_ZOHO_CHAT_DEPARTMENT=your_department
   ```

## 🔌 API Endpoints

### CRM Endpoints

#### Sync Contact
```http
POST /api/zoho/sync-contact
Content-Type: application/json

{
  "userData": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "user_type": "creator",
    "auth_provider": "google"
  }
}
```

#### Create Deal
```http
POST /api/zoho/create-deal
Content-Type: application/json

{
  "collaborationData": {
    "id": "456",
    "campaign_title": "Summer Campaign",
    "brand_name": "Brand XYZ",
    "creator_name": "John Doe",
    "agreed_rate": 1000,
    "currency": "USD",
    "status": "active"
  }
}
```

#### Create Task
```http
POST /api/zoho/create-task
Content-Type: application/json

{
  "taskData": {
    "subject": "Follow up with creator",
    "description": "Check on campaign progress",
    "due_date": "2024-01-15T10:00:00Z",
    "related_to": "contact_id",
    "priority": "High"
  }
}
```

### Chat Endpoints

#### Initialize Chat
```http
POST /api/zoho/chat/initialize
Content-Type: application/json

{
  "userData": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Send Message
```http
POST /api/zoho/chat/send-message
Content-Type: application/json

{
  "visitorId": "visitor_123",
  "message": "Hello, I need help",
  "messageType": "text"
}
```

#### Get Chat History
```http
GET /api/zoho/chat/history/visitor_123?limit=50
```

### Configuration Endpoints

#### Test Connection
```http
POST /api/zoho/test-connection
```

#### Get Config Status
```http
GET /api/zoho/config/status
```

## 📱 Mobile Integration

### Adding Chat Button to Screens

```tsx
import { ChatButton } from '../components';

const MyScreen = () => {
  return (
    <View style={styles.container}>
      {/* Your screen content */}
      
      {/* Add chat button */}
      <ChatButton 
        position="bottom-right"
        showBadge={true}
        badgeCount={3}
      />
    </View>
  );
};
```

### Using Chat Widget Directly

```tsx
import { ZohoChatWidget } from '../components';

const MyComponent = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowChat(true)}>
        <Text>Open Chat</Text>
      </TouchableOpacity>

      <ZohoChatWidget
        visible={showChat}
        onClose={() => setShowChat(false)}
        onMessageSent={(message) => {
          console.log('Message sent:', message);
        }}
      />
    </>
  );
};
```

### API Service Usage

```tsx
import { zohoAPI } from '../services/apiService';

// Sync user contact
const syncUser = async (userData) => {
  try {
    const response = await zohoAPI.syncContact(userData);
    console.log('Contact synced:', response);
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

// Create collaboration deal
const createDeal = async (collaborationData) => {
  try {
    const response = await zohoAPI.createDeal(collaborationData);
    console.log('Deal created:', response);
  } catch (error) {
    console.error('Deal creation failed:', error);
  }
};
```

## 🔧 Environment Variables

### Backend (.env)
```bash
# Zoho OAuth Configuration
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REFRESH_TOKEN=your_refresh_token_here

# Zoho API URLs
ZOHO_BASE_URL=https://www.zohoapis.com
ZOHO_CHAT_BASE_URL=https://livechat.zoho.com

# Webhook Security
ZOHO_WEBHOOK_SECRET=your_webhook_secret_here
```

### Mobile (.env)
```bash
# Zoho Chat Configuration
EXPO_PUBLIC_ZOHO_CHAT_LICENSE=your_chat_license_here
EXPO_PUBLIC_ZOHO_CHAT_DEPARTMENT=your_department_here
```

## 📝 Usage Examples

### 1. User Registration Flow

```tsx
// When user completes registration
const handleUserRegistration = async (userData) => {
  // Create user in local database
  const user = await createUser(userData);
  
  // Sync to Zoho CRM
  try {
    await zohoAPI.syncContact({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      auth_provider: user.auth_provider
    });
  } catch (error) {
    console.error('Failed to sync to Zoho:', error);
  }
};
```

### 2. Collaboration Creation Flow

```tsx
// When collaboration is created
const handleCollaborationCreated = async (collaboration) => {
  try {
    await zohoAPI.createDeal({
      id: collaboration.id,
      campaign_title: collaboration.campaign.title,
      brand_name: collaboration.brand.name,
      creator_name: collaboration.creator.name,
      agreed_rate: collaboration.agreed_rate,
      currency: collaboration.currency,
      status: collaboration.status
    });
  } catch (error) {
    console.error('Failed to create deal:', error);
  }
};
```

### 3. Follow-up Task Creation

```tsx
// Create follow-up task
const createFollowUpTask = async (userId, subject, description) => {
  try {
    await zohoAPI.createTask({
      subject: subject,
      description: description,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      related_to: userId,
      priority: 'Medium',
      task_type: 'Follow-up'
    });
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};
```

## 🔍 Troubleshooting

### Common Issues

#### 1. OAuth Token Expired
```bash
# Error: Invalid refresh token
# Solution: Regenerate refresh token from Zoho Developer Console
```

#### 2. Chat Widget Not Loading
```bash
# Check environment variables
echo $EXPO_PUBLIC_ZOHO_CHAT_LICENSE
echo $EXPO_PUBLIC_ZOHO_CHAT_DEPARTMENT

# Verify network connectivity
curl -I https://livechat.zoho.com
```

#### 3. Webhook Not Receiving Events
```bash
# Check webhook URL accessibility
curl -X POST https://your-domain.com/api/zoho/webhook

# Verify webhook secret
echo $ZOHO_WEBHOOK_SECRET
```

#### 4. API Rate Limits
```bash
# Zoho CRM API: 100 requests per minute
# Zoho Chat API: 1000 requests per minute
# Implement exponential backoff for retries
```

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=zoho:* npm start

# Mobile
console.log('Zoho Debug:', zohoConfig);
```

### Error Handling

```tsx
// Implement proper error handling
const handleZohoError = (error) => {
  if (error.response?.status === 401) {
    // Token expired, refresh
    refreshZohoToken();
  } else if (error.response?.status === 429) {
    // Rate limited, retry with backoff
    setTimeout(() => retryRequest(), 60000);
  } else {
    // Log and notify user
    console.error('Zoho error:', error);
    Alert.alert('Error', 'Service temporarily unavailable');
  }
};
```

## 📚 Official Documentation References

### Zoho CRM API
- [Zoho CRM API Documentation](https://www.zoho.com/crm/developer/docs/api/)
- [OAuth 2.0 Setup](https://www.zoho.com/crm/developer/docs/api/oauth-overview.html)
- [Contacts API](https://www.zoho.com/crm/developer/docs/api/contacts-api.html)
- [Deals API](https://www.zoho.com/crm/developer/docs/api/deals-api.html)
- [Tasks API](https://www.zoho.com/crm/developer/docs/api/tasks-api.html)

### Zoho Chat API
- [Zoho Chat Developer Guide](https://www.zoho.com/chat/developer-guide/)
- [Chat Widget API](https://www.zoho.com/chat/developer-guide/widget-api.html)
- [Visitor Management](https://www.zoho.com/chat/developer-guide/visitor-management.html)

### Webhooks
- [Zoho CRM Webhooks](https://www.zoho.com/crm/developer/docs/api/webhooks.html)
- [Webhook Security](https://www.zoho.com/crm/developer/docs/api/webhooks.html#webhook-security)

## 🚀 Next Steps

1. **Advanced Features**
   - Implement chat bot integration
   - Add analytics dashboard
   - Set up automated workflows

2. **Performance Optimization**
   - Implement caching for API responses
   - Add connection pooling
   - Optimize webhook processing

3. **Security Enhancements**
   - Add IP whitelisting
   - Implement request signing
   - Add audit logging

4. **Monitoring & Analytics**
   - Set up error tracking
   - Add performance monitoring
   - Implement usage analytics

---

**Note**: This integration follows Zoho's official documentation and best practices. Always refer to the latest Zoho documentation for any updates or changes to their API. 