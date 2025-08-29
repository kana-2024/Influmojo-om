# StreamChat Integration - Agent-Mediated Support System

This document provides a complete guide to the StreamChat integration for Influmojo's agent-mediated support system.

## 🎯 Overview

The StreamChat integration enables **agent-mediated support conversations** where:
- ✅ **Brand and Influencer cannot contact directly**
- ✅ **All conversations go through agents**
- ✅ **Automated status updates via backend**
- ✅ **Structured forms for requirements and revisions**
- ✅ **"Contact Support" button for agent assistance**

## 🏗️ Architecture

### Chat Flow
```
Order Created → Ticket Created → Agent Assigned → StreamChat Channel Created
     ↓
User clicks "Contact Support" → User joins channel → Agent mediates conversation
     ↓
Status updates via forms → Backend automation → Order page updates
```

### User Roles
- **Agent**: Always present in channel, mediates all conversations
- **Brand**: Can join when they click "Contact Support"
- **Influencer**: Can join when they click "Contact Support"
- **System**: Sends automated messages and status updates

## 🔧 Backend Setup

### 1. Environment Variables
Add to your `.env` file:
```bash
# StreamChat Configuration
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### 2. Install Dependencies
```bash
cd backend
npm install stream-chat@^9.14.0
```

### 3. Services

#### StreamService (`backend/src/services/streamService.js`)
Handles all StreamChat operations:
- Channel creation and management
- User token generation
- Channel membership management
- System messages

#### CRMService Integration (`backend/src/services/crmService.js`)
Updated to automatically create StreamChat channels when tickets are created.

### 4. API Routes

#### Chat Routes (`backend/src/routes/chat.js`)
- `GET /api/chat/token` - Get StreamChat token
- `POST /api/chat/tickets/:ticketId/join` - Join ticket channel
- `POST /api/chat/tickets/:ticketId/leave` - Leave ticket channel
- `GET /api/chat/channels` - Get user's channels
- `GET /api/chat/channels/:channelId` - Get channel info

## 📱 React Native Setup

### 1. Install Dependencies
```bash
cd mobile
npx expo install stream-chat@6.5.2 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1
```

**If you encounter peer dependency issues, use:**
```bash
npx expo install stream-chat@6.5.2 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1 --legacy-peer-deps
```

### 2. Configure Reanimated Plugin

Add the Reanimated plugin to your `app.config.js`:

```javascript
export default {
  expo: {
    // ... other config
    plugins: [
      "./plugins/withGoogleSignIn.js",
      "react-native-reanimated/plugin"
    ],
    // ... rest of config
  }
};
```

### 3. Services

#### StreamChatService (`mobile/services/streamChatService.ts`)
Handles StreamChat client initialization and operations:
- Client initialization
- User connection
- Channel management
- Message sending

### 4. Components

#### TicketChat (`mobile/components/TicketChat.tsx`)
Main chat interface component:
- Real-time messaging
- Channel management
- Error handling
- Loading states

#### ContactSupportButton (`mobile/components/ContactSupportButton.tsx`)
Button component for initiating support conversations:
- Authentication check
- Ticket validation
- Navigation to chat

## 🚀 Usage Examples

### 1. Adding Contact Support Button to Order Page

```tsx
import ContactSupportButton from '../components/ContactSupportButton';

// In your order component
<ContactSupportButton
  ticketId={order.ticket_id}
  orderId={order.id}
  style={{ marginTop: 16 }}
/>
```

### 2. Using TicketChat Component

```tsx
import TicketChat from '../components/TicketChat';

// In your navigation or modal
<TicketChat
  ticketId={ticketId}
  onClose={() => navigation.goBack()}
  navigation={navigation}
/>
```

### 3. Backend Ticket Creation

```javascript
// Automatically creates StreamChat channel
const ticket = await crmService.createTicket(orderId);
// ticket.stream_channel_id will contain the channel ID
```

## 🔄 Complete Flow Example

### 1. Order Creation
```javascript
// 1. Brand places order
const order = await orderService.createOrder(orderData);

// 2. Ticket automatically created with StreamChat channel
const ticket = await crmService.createTicket(order.id);
// Creates: ticket-{orderId} channel with agent assigned
```

### 2. User Contacts Support
```javascript
// 3. Brand clicks "Contact Support"
// Frontend calls: POST /api/chat/tickets/{ticketId}/join
// Backend adds brand-{userId} to channel
// Brand joins: ticket-{orderId} channel
```

### 3. Agent Mediation
```javascript
// 4. Agent is already in channel
// Agent sees: brand-{userId} joined
// Agent can send messages to brand
// Brand can send messages to agent
```

### 4. Influencer Contacts Support
```javascript
// 5. Influencer clicks "Contact Support"
// Frontend calls: POST /api/chat/tickets/{ticketId}/join
// Backend adds influencer-{userId} to channel
// Influencer joins: ticket-{orderId} channel
```

### 5. Agent Mediates Both
```javascript
// 6. Agent now sees both brand and influencer
// Agent can mediate between them
// Brand and influencer cannot see each other's messages
// Only agent sees the full conversation
```

## 🔒 Security & Permissions

### User ID Format
- **Agent**: `agent-{id}`
- **Brand**: `brand-{id}`
- **Influencer**: `influencer-{id}`

### Permission Checks
```javascript
// Backend validates user permissions
async function checkUserPermission(user, ticket) {
  // Admin users can join any ticket
  if (user.user_type === 'admin') return true;
  
  // Brand users can only join their orders
  if (user.user_type === 'brand' && ticket.order?.brand?.user_id === user.id) return true;
  
  // Creator users can only join their orders
  if (user.user_type === 'creator' && ticket.order?.creator?.user_id === user.id) return true;
  
  return false;
}
```

## 🎨 UI/UX Features

### Design System
- **Primary Color**: `#0ea5e9` (Blue)
- **Tertiary Color**: `#20536d` (Influmojo brand)
- **Support Button**: Uses tertiary color `#20536d`

### Loading States
- Connection loading with spinner
- Message sending indicators
- Error states with retry options

### Error Handling
- Network connectivity issues
- Authentication failures
- Channel access errors
- Message sending failures

## 🔧 Configuration

### StreamChat Dashboard Settings
1. **Permissions**: Set default permissions for users
2. **Message Types**: Configure allowed message types
3. **User Roles**: Define admin and user roles
4. **Channel Types**: Configure messaging channel type

### Environment Configuration
```bash
# Development
STREAM_API_KEY=your_dev_api_key
STREAM_API_SECRET=your_dev_api_secret

# Production
STREAM_API_KEY=your_prod_api_key
STREAM_API_SECRET=your_prod_api_secret
```

## 🧪 Testing

### Backend Testing
```bash
# Test StreamChat token generation
curl -X GET http://localhost:3002/api/chat/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test joining ticket channel
curl -X POST http://localhost:3002/api/chat/tickets/123/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing
```javascript
// Test StreamChat service
import { streamChatService } from '../services/streamChatService';

// Initialize and connect
const client = await streamChatService.initialize(apiKey);
const user = await streamChatService.connectUser(userId, token);

// Join channel
const channelId = await streamChatService.joinTicketChannel(ticketId);
```

## 🚨 Troubleshooting

### Common Issues

1. **StreamChat Client Not Initialized**
   ```javascript
   // Ensure client is initialized before use
   if (!streamChatService.isConnected()) {
     await streamChatService.initialize(apiKey);
   }
   ```

2. **User Not Added to Channel**
   ```javascript
   // Check user permissions
   const canJoin = await checkUserPermission(user, ticket);
   if (!canJoin) {
     // Handle permission denied
   }
   ```

3. **Token Generation Failed**
   ```javascript
   // Check authentication
   const token = await apiService.getAuthToken();
   if (!token) {
     // Redirect to login
   }
   ```

4. **Channel Not Found**
   ```javascript
   // Ensure ticket exists and has channel
   const ticket = await prisma.ticket.findUnique({
     where: { id: BigInt(ticketId) }
   });
   if (!ticket?.stream_channel_id) {
     // Create channel or handle error
   }
   ```

5. **Reanimated Plugin Issues**
   ```bash
   # Clear cache and restart
   npx expo start --clear
   
   # Reinstall reanimated
   npx expo install react-native-reanimated@3.7.0
   ```

### Debug Commands
```bash
# Check StreamChat connection
node -e "
const { StreamChat } = require('stream-chat');
const client = StreamChat.getInstance(process.env.STREAM_API_KEY);
console.log('StreamChat client:', client ? 'OK' : 'Failed');
"

# Test channel creation
node -e "
const streamService = require('./src/services/streamService');
streamService.createTicketChannel('test-123', 'agent-1')
  .then(channelId => console.log('Channel created:', channelId))
  .catch(err => console.error('Error:', err));
"
```

## 📈 Performance Optimization

### Backend Optimizations
- **Connection Pooling**: Reuse StreamChat client instances
- **Caching**: Cache user tokens and channel info
- **Error Handling**: Graceful degradation when StreamChat is unavailable

### Frontend Optimizations
- **Lazy Loading**: Load chat components on demand
- **Connection Management**: Reconnect on focus/blur
- **Message Caching**: Cache recent messages locally

## 🔮 Future Enhancements

### Planned Features
1. **Real-time Notifications**: Push notifications for new messages
2. **File Attachments**: Support for file uploads in chat
3. **Voice Messages**: Audio message support
4. **Screen Sharing**: Agent screen sharing capabilities
5. **Chat History**: Persistent chat history across sessions

### Technical Improvements
1. **WebSocket Fallback**: Fallback to WebSocket when StreamChat is unavailable
2. **Offline Support**: Offline message queuing
3. **Message Encryption**: End-to-end encryption for sensitive conversations
4. **Analytics**: Chat analytics and reporting

## 📚 API Reference

### StreamChat Service Methods
```typescript
// Initialize client
await streamChatService.initialize(apiKey: string): Promise<StreamChat>

// Connect user
await streamChatService.connectUser(userId: string, token: string): Promise<StreamChatUser>

// Get token
await streamChatService.getToken(): Promise<StreamChatToken>

// Join channel
await streamChatService.joinTicketChannel(ticketId: string): Promise<string>

// Leave channel
await streamChatService.leaveTicketChannel(ticketId: string): Promise<void>

// Send message
await streamChatService.sendMessage(channelId: string, message: string): Promise<any>

// Disconnect
await streamChatService.disconnectUser(): Promise<void>
```

### Backend API Endpoints
```bash
# Authentication
GET /api/chat/token

# Channel Management
POST /api/chat/tickets/:ticketId/join
POST /api/chat/tickets/:ticketId/leave
GET /api/chat/channels
GET /api/chat/channels/:channelId
```

---

## 🎯 Summary

This StreamChat integration provides a robust, secure, and scalable solution for agent-mediated support conversations in the Influmojo platform. The system ensures that:

- ✅ **Brand and Influencer never interact directly**
- ✅ **All conversations are agent-mediated**
- ✅ **Automated status updates work seamlessly**
- ✅ **Support is available on-demand**
- ✅ **Security and permissions are properly enforced**

The integration is production-ready and includes comprehensive error handling, loading states, and user experience optimizations. 