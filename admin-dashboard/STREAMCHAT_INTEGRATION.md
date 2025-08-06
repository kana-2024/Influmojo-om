# StreamChat Integration - Admin Dashboard

This document provides a complete guide to the StreamChat integration for the Influmojo Admin Dashboard, enabling real-time agent-mediated support conversations.

## 🎯 Overview

The StreamChat integration allows agents to:
- **Join ticket channels** when tickets are assigned or selected
- **See all messages** from brands and creators (scoped per ticket)
- **Send messages** as agent role
- **Push status updates** and deliverables
- **Real-time communication** with customers

## 🏗️ Architecture

### Component Structure
```
admin-dashboard/
├── components/
│   ├── StreamChatProvider.tsx     # StreamChat context provider
│   ├── TicketChat.tsx             # StreamChat chat component
│   └── TicketViewModal.tsx        # Updated with StreamChat integration
├── hooks/
│   └── useStreamChatAuth.ts       # StreamChat authentication hook
├── lib/
│   ├── api.ts                     # StreamChat API functions
│   └── streamChat.ts              # StreamChat service utilities
└── app/
    └── providers.tsx              # Updated with StreamChat provider
```

### Data Flow
1. **Authentication**: Agent logs in → JWT token stored → StreamChat token generated
2. **Channel Joining**: Agent selects ticket → Joins `ticket-{id}` channel
3. **Real-time Messaging**: Messages sent/received via StreamChat
4. **Status Updates**: Agent can push updates and deliverables

## 🔧 Setup & Installation

### 1. Install Dependencies
```bash
cd admin-dashboard
npm install stream-chat@^9.14.0 stream-chat-react@^11.10.0
```

### 2. Environment Configuration
Ensure your backend has the following environment variables:
```bash
# Backend .env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### 3. Backend Integration
The backend already includes StreamChat integration with:
- Token generation (`/api/chat/token`)
- Channel management (`/api/chat/tickets/:id/join`)
- User permissions and validation

## 🎯 Core Components

### 1. StreamChatProvider (`components/StreamChatProvider.tsx`)

**Purpose**: Provides StreamChat context and client management.

**Key Features**:
- StreamChat client initialization
- User connection management
- Channel joining functionality
- Error handling and toast notifications

**Usage**:
```tsx
import { useStreamChat } from '@/components/StreamChatProvider';

const { client, isConnected, connectUser, joinChannel } = useStreamChat();
```

### 2. TicketChat (`components/TicketChat.tsx`)

**Purpose**: Real-time chat interface for ticket conversations.

**Key Features**:
- Real-time messaging with StreamChat
- Channel joining and management
- Message history display
- Member management
- Error handling and loading states

**Props**:
```tsx
interface TicketChatProps {
  ticketId: string;           // Ticket ID for channel
  ticketTitle?: string;       // Display title
  onClose?: () => void;       // Close handler
}
```

### 3. useStreamChatAuth (`hooks/useStreamChatAuth.ts`)

**Purpose**: Manages StreamChat authentication and connection.

**Key Features**:
- Automatic token generation
- User connection management
- Error handling
- Loading states

**Usage**:
```tsx
import { useStreamChatAuth } from '@/hooks/useStreamChatAuth';

const { authenticate, disconnect, isConnected, isLoading, error } = useStreamChatAuth();
```

## 🔌 API Integration

### StreamChat API Functions (`lib/api.ts`)

```typescript
export const streamChatAPI = {
  // Get StreamChat token for current user
  getToken: async (): Promise<ApiResponse<{ token: string; userId: string; apiKey: string }>>,
  
  // Join ticket channel
  joinTicketChannel: async (ticketId: string): Promise<ApiResponse<{ channelId: string }>>,
  
  // Leave ticket channel
  leaveTicketChannel: async (ticketId: string): Promise<ApiResponse<{ message: string }>>,
  
  // Get user's channels
  getChannels: async (): Promise<ApiResponse<{ channels: any[] }>>,
  
  // Get channel information
  getChannelInfo: async (channelId: string): Promise<ApiResponse<{ channel: any }>>,
};
```

### Backend Endpoints

1. **Token Generation** (`GET /api/chat/token`)
   - Generates StreamChat token for authenticated user
   - Returns token, userId, and apiKey

2. **Join Channel** (`POST /api/chat/tickets/:ticketId/join`)
   - Adds user to ticket channel
   - Validates user permissions
   - Returns channel information

3. **Leave Channel** (`POST /api/chat/tickets/:ticketId/leave`)
   - Removes user from ticket channel
   - Cleans up channel membership

## 🎨 UI/UX Features

### Chat Interface
- **Real-time Messaging**: Instant message delivery
- **Message History**: Persistent chat history
- **Member Management**: See who's in the conversation
- **Status Indicators**: Online/offline status
- **Message Types**: Text, system messages, status updates

### Integration Points
- **Ticket View Modal**: Toggle between chat history and live chat
- **Agent Dashboard**: Real-time notifications
- **Status Updates**: Push updates and deliverables
- **Communication Tools**: Call, email, schedule integration

## 🔄 State Management

### StreamChat Context
```typescript
interface StreamChatContextType {
  client: StreamChatType | null;
  isConnected: boolean;
  connectUser: (userId: string, token: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
  joinChannel: (channelId: string) => Promise<any>;
}
```

### Authentication Flow
1. **Login**: JWT token stored → StreamChat token generated
2. **Connection**: User connected to StreamChat
3. **Channel Joining**: Agent joins ticket-specific channel
4. **Messaging**: Real-time communication enabled

## 🚀 Usage Examples

### 1. Basic Chat Integration
```tsx
import TicketChat from '@/components/TicketChat';

function TicketView({ ticketId }) {
  return (
    <TicketChat 
      ticketId={ticketId}
      ticketTitle={`Ticket #${ticketId}`}
    />
  );
}
```

### 2. Authentication Hook
```tsx
import { useStreamChatAuth } from '@/hooks/useStreamChatAuth';

function AgentDashboard() {
  const { authenticate, isConnected, isLoading } = useStreamChatAuth();

  useEffect(() => {
    if (!isConnected) {
      authenticate();
    }
  }, []);

  return (
    <div>
      {isLoading ? 'Connecting...' : 'Connected to chat'}
    </div>
  );
}
```

### 3. Channel Management
```tsx
import { useStreamChat } from '@/components/StreamChatProvider';

function TicketManager({ ticketId }) {
  const { joinChannel, isConnected } = useStreamChat();

  const handleJoinChannel = async () => {
    if (isConnected) {
      await joinChannel(`ticket-${ticketId}`);
    }
  };

  return (
    <button onClick={handleJoinChannel}>
      Join Chat
    </button>
  );
}
```

## 🔒 Security & Permissions

### User Permissions
- **Agents**: Can join assigned tickets
- **Admins**: Can join any ticket
- **Brands/Creators**: Can only join their own tickets

### Channel Security
- **Scoped Access**: Users can only access their ticket channels
- **Token-based**: Secure authentication with JWT
- **Role-based**: Different permissions for different user types

### Data Protection
- **Message Encryption**: StreamChat handles encryption
- **Access Control**: Backend validates permissions
- **Audit Trail**: All actions logged

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**
   ```bash
   # Check backend StreamChat configuration
   curl http://localhost:3002/api/chat/token
   ```

2. **Channel Not Found**
   ```bash
   # Verify ticket exists and has channel
   curl http://localhost:3002/api/chat/tickets/{ticketId}/join
   ```

3. **Authentication Error**
   ```bash
   # Check JWT token validity
   node test-auth.js
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

### Frontend Optimizations
- **Lazy Loading**: Chat components load on demand
- **Connection Pooling**: Reuse StreamChat client instances
- **Message Caching**: Cache recent messages locally
- **Error Boundaries**: Graceful error handling

### Backend Optimizations
- **Token Caching**: Cache StreamChat tokens
- **Channel Management**: Efficient channel creation/joining
- **Rate Limiting**: Prevent abuse
- **Connection Monitoring**: Track connection health

## 🔮 Future Enhancements

### Planned Features
1. **File Attachments**: Support for file uploads
2. **Voice Messages**: Audio message support
3. **Screen Sharing**: Agent screen sharing capabilities
4. **Chat Analytics**: Message analytics and reporting
5. **Automated Responses**: AI-powered responses

### Technical Improvements
1. **WebSocket Fallback**: Fallback when StreamChat unavailable
2. **Offline Support**: Offline message queuing
3. **Message Encryption**: End-to-end encryption
4. **Advanced Search**: Full-text message search

## 📚 API Reference

### StreamChat Service Methods
```typescript
// Initialize client
await initializeStreamChat(apiKey: string): Promise<StreamChat>

// Connect user
await connectUser(userId: string, token: string): Promise<StreamChat>

// Join channel
await joinTicketChannel(ticketId: string): Promise<Channel>

// Send message
await sendMessage(channelId: string, message: string): Promise<Message>

// Get messages
await getChannelMessages(channelId: string, limit: number): Promise<Message[]>
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

## 🎯 Summary

The StreamChat integration provides:

- ✅ **Real-time Messaging**: Instant communication between agents and customers
- ✅ **Agent-Mediated**: All conversations go through agents
- ✅ **Secure**: JWT-based authentication with role-based access
- ✅ **Scalable**: Handles multiple concurrent conversations
- ✅ **User-Friendly**: Intuitive chat interface
- ✅ **Production-Ready**: Comprehensive error handling and monitoring

This integration enables agents to provide superior customer support with real-time communication capabilities while maintaining security and scalability standards. 