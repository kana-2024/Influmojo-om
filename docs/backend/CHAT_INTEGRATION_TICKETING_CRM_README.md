# Influmojo Chat Integration, Ticketing System & CRM - Complete Documentation

## 🎯 Overview

Influmojo's comprehensive chat integration, ticketing system, and CRM functionality provides a complete customer support solution with real-time messaging, automated ticket management, and agent workflow optimization. This system is designed to handle support requests for orders between brands and creators with dedicated agent support.

## 🏗️ System Architecture

### Core Components

1. **StreamChat Integration** - Real-time messaging platform
2. **Ticket Management System** - Automated ticket creation and assignment
3. **Agent Dashboard** - Comprehensive agent interface
4. **CRM Service Layer** - Business logic and data management
5. **Admin Panel** - Super admin and agent management interface

### Database Schema

```prisma
// Core Ticket System
model Ticket {
  id                    BigInt        @id @default(autoincrement())
  order_id              BigInt        @unique
  agent_id              BigInt
  stream_channel_id     String        // Legacy field
  brand_agent_channel   String?       // New: Separate brand-agent channel
  creator_agent_channel String?       // New: Separate creator-agent channel
  status                TicketStatus  @default(open)
  priority              TicketPriority @default(medium)
  created_at            DateTime      @default(now())
  updated_at            DateTime      @updatedAt

  order                 Order         @relation(fields: [order_id], references: [id])
  agent                 User          @relation("TicketAgent", fields: [agent_id], references: [id])
  messages              Message[]
}

// Message System
model Message {
  id           BigInt       @id @default(autoincrement())
  ticket_id    BigInt
  sender_id    BigInt
  message_text String
  message_type MessageType  @default(text)
  file_url     String?
  file_name    String?
  read_at      DateTime?
  sender_role  String?      // brand, creator, agent, system
  channel_type String?      // brand_agent, creator_agent
  target_tab   String?      // Track which tab agent was in
  created_at   DateTime     @default(now())

  ticket       Ticket       @relation(fields: [ticket_id], references: [id])
  sender       User         @relation("MessageSender", fields: [sender_id], references: [id])
}

// User Management
model User {
  id            BigInt      @id @default(autoincrement())
  user_type     UserType    // brand, creator, super_admin, agent
  name          String
  email         String?     @unique
  phone         String?     @unique
  is_online     Boolean     @default(true)
  last_online_at DateTime?
  agent_status  AgentStatus @default(available)
  // ... other fields
}
```

## 💬 Chat Integration (StreamChat)

### Features

#### Real-time Messaging
- **Instant Communication**: Real-time message delivery between agents, brands, and creators
- **File Attachments**: Support for file sharing in conversations
- **Message History**: Complete conversation thread preservation
- **Read Receipts**: Message read status tracking

#### Separate Channel Architecture
```javascript
// Brand-Agent Channel
brandAgentChannel: `ticket_${ticketId}_brand_agent`
// Creator-Agent Channel  
creatorAgentChannel: `ticket_${ticketId}_creator_agent`
```

#### Channel Management
- **Automatic Creation**: Channels created when tickets are generated
- **Member Management**: Automatic user addition/removal
- **Channel Freezing**: Ability to freeze channels when tickets are closed
- **System Messages**: Automated welcome and status messages

### StreamChat Service Implementation

```javascript
// Channel Creation
async createSeparateTicketChannels(ticketId, agentId, brandId, creatorId) {
  // Create brand-agent channel
  const brandAgentChannel = stream.channel('messaging', brandAgentChannelId, {
    name: `Ticket #${ticketId} - Brand Support`,
    members: [`agent-${agentId}`, `brand-${brandId}`],
    data: { channel_type: 'brand_agent' }
  });

  // Create creator-agent channel
  const creatorAgentChannel = stream.channel('messaging', creatorAgentChannelId, {
    name: `Ticket #${ticketId} - Creator Support`, 
    members: [`agent-${agentId}`, `creator-${creatorId}`],
    data: { channel_type: 'creator_agent' }
  });
}
```

### Token Generation
- **User Authentication**: JWT-based token generation for StreamChat
- **Role-based Access**: Different permissions for agents vs users
- **Session Management**: Secure token handling and refresh

## 🎫 Ticketing System

### Ticket Lifecycle

#### 1. Ticket Creation
```javascript
// Automatic ticket creation when order is placed
async createTicket(orderId, streamChannelId = null) {
  // Round-robin agent assignment
  const agentUsers = await prisma.user.findMany({
    where: { user_type: 'agent' }
  });
  
  // Create separate StreamChat channels
  const channels = await streamService.createSeparateTicketChannels(
    orderId.toString(),
    assignedAgent.id.toString(),
    order.brand.id.toString(),
    order.creator.id.toString()
  );
  
  // Create ticket with channel references
  const ticket = await prisma.ticket.create({
    data: {
      order_id: BigInt(orderId),
      agent_id: assignedAgent.id,
      brand_agent_channel: channels.brandAgentChannel,
      creator_agent_channel: channels.creatorAgentChannel,
      status: 'open'
    }
  });
}
```

#### 2. Ticket Assignment
- **Round-robin Assignment**: Automatic agent assignment based on workload
- **Manual Reassignment**: Admin ability to reassign tickets
- **Agent Status Tracking**: Online/offline status monitoring

#### 3. Ticket Status Management
```javascript
enum TicketStatus {
  open           // New ticket, awaiting agent response
  in_progress    // Agent actively working on ticket
  resolved       // Issue resolved, awaiting confirmation
  closed         // Ticket closed and archived
}
```

#### 4. Priority System
```javascript
enum TicketPriority {
  low      // Non-urgent issues
  medium   // Standard priority (default)
  high     // Urgent issues
  urgent   // Critical issues requiring immediate attention
}
```

### Ticket View Components

#### Agent Dashboard Features
1. **Ticket List View**
   - All assigned tickets
   - Ticket status and priority indicators
   - Last message preview
   - Quick action buttons

2. **Comprehensive Ticket Modal**
   - **Ticket Information**: ID, status, priority, creation date
   - **Order Details**: Package info, amount, quantity
   - **Participant Information**: Brand and creator contact details
   - **Communication Options**: Chat, phone, email integration
   - **Chat History**: Complete message thread
   - **Administrative Actions**: Status updates, reassignment, priority changes

3. **Dual Channel Interface**
   - **Brand Tab**: Brand-agent communication channel
   - **Creator Tab**: Creator-agent communication channel
   - **Message Filtering**: Channel-specific message display
   - **Real-time Updates**: Live message polling and updates

## 👨‍💼 Agent Management

### Agent Status System
```javascript
enum AgentStatus {
  available   // Agent is online and available
  busy        // Agent is working on tickets
  offline     // Agent is offline
  away        // Agent is temporarily unavailable
}
```

### Agent Dashboard Features

#### 1. Ticket Overview
- **Assigned Tickets**: Tickets assigned to the current agent
- **Overview Mode**: All tickets in the system (for super admins)
- **Status Filtering**: Filter by ticket status
- **Priority Sorting**: Sort by priority level

#### 2. Real-time Communication
- **Live Chat**: Real-time messaging with brands and creators
- **Message History**: Complete conversation threads
- **File Sharing**: Support for file attachments
- **System Messages**: Automated notifications and updates

#### 3. Administrative Tools
- **Status Updates**: Change ticket status
- **Priority Management**: Update ticket priority
- **Agent Reassignment**: Transfer tickets to other agents
- **Communication Logging**: Track all interactions

### Agent Workflow

#### 1. Ticket Assignment
```javascript
// Round-robin assignment logic
const lastTicket = await prisma.ticket.findFirst({
  orderBy: { created_at: 'desc' },
  select: { agent_id: true }
});

let nextAgentIndex = 0;
if (lastTicket) {
  const currentAgentIndex = agentUsers.findIndex(user => user.id === lastTicket.agent_id);
  nextAgentIndex = (currentAgentIndex + 1) % agentUsers.length;
}

const assignedAgent = agentUsers[nextAgentIndex];
```

#### 2. Message Handling
```javascript
// Message filtering by channel type
if (requestingUserType === 'agent' || requestingUserType === 'super_admin') {
  // Agents can see all messages from both channels
  filteredMessages = allMessages;
} else {
  // Brands and creators can only see messages from their respective channels
  let userChannelType = null;
  if (requestingUserType === 'brand') {
    userChannelType = 'brand_agent';
  } else if (requestingUserType === 'creator') {
    userChannelType = 'creator_agent';
  }
  
  filteredMessages = allMessages.filter(message => 
    message.channel_type === userChannelType
  );
}
```

## 🔧 CRM Functionality

### Core CRM Features

#### 1. Customer Relationship Management
- **User Profiles**: Complete brand and creator profiles
- **Contact Information**: Email, phone, company details
- **Interaction History**: Complete communication history
- **Order Tracking**: Order status and history

#### 2. Communication Management
- **Multi-channel Support**: Chat, email, phone integration
- **Message Templates**: Pre-formatted response templates
- **Automated Notifications**: System-generated messages
- **Communication Logging**: Complete interaction tracking

#### 3. Analytics and Reporting
- **Ticket Metrics**: Response times, resolution rates
- **Agent Performance**: Productivity and efficiency metrics
- **Customer Satisfaction**: Feedback and rating systems
- **System Health**: Overall system performance monitoring

### CRM Service Layer

#### Message Management
```javascript
async addMessage(ticketId, senderId, messageText, messageType = 'text', fileUrl = null, fileName = null, senderRole = null, channelType = null) {
  // Determine sender role if not provided
  let role = senderRole;
  if (!role) {
    const sender = await prisma.user.findUnique({
      where: { id: BigInt(senderId) },
      select: { user_type: true }
    });
    role = sender?.user_type || 'agent';
  }

  // Determine channel type if not provided
  let finalChannelType = channelType;
  if (!finalChannelType) {
    if (role === 'brand') {
      finalChannelType = 'brand_agent';
    } else if (role === 'creator') {
      finalChannelType = 'creator_agent';
    } else if (role === 'agent' || role === 'super_admin') {
      finalChannelType = 'brand_agent';
    }
  }

  const message = await prisma.message.create({
    data: {
      ticket_id: BigInt(ticketId),
      sender_id: BigInt(senderId),
      message_text: messageText,
      message_type: messageType,
      file_url: fileUrl,
      file_name: fileName,
      sender_role: role,
      channel_type: finalChannelType
    }
  });
}
```

#### Ticket Management
```javascript
async getTicketMessages(ticketId, requestingUserId = null, requestingUserType = null, loadOlderMessages = false, channelType = null) {
  // Get ticket and agent information
  const ticket = await prisma.ticket.findUnique({
    where: { id: BigInt(ticketId) },
    include: {
      agent: { select: { id: true, name: true, user_type: true, is_online: true, last_online_at: true, agent_status: true } }
    }
  });

  // Determine message filtering based on user type
  if (requestingUserType === 'agent' || requestingUserType === 'super_admin') {
    // Agents can see all messages from both channels
    filteredMessages = allMessages;
  } else {
    // Brands and creators can only see messages from their respective channels
    let userChannelType = null;
    if (requestingUserType === 'brand') {
      userChannelType = 'brand_agent';
    } else if (requestingUserType === 'creator') {
      userChannelType = 'creator_agent';
    }
    
    filteredMessages = allMessages.filter(message => 
      message.channel_type === userChannelType
    );
  }
}
```

## 🎨 User Interface

### Admin Dashboard Components

#### 1. TicketViewModal.tsx
```typescript
interface TicketViewModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Comprehensive ticket information display
// - Dual-channel chat interface (brand/creator tabs)
// - Real-time message updates
// - Administrative actions (status, priority, reassignment)
// - Communication tools (phone, email integration)
```

#### 2. TicketChat.tsx
```typescript
interface TicketChatProps {
  ticketId: string;
  ticketTitle?: string;
  onClose?: () => void;
}

// Features:
// - Real-time messaging interface
// - Message history with timestamps
// - File attachment support
// - Channel switching (brand/creator)
// - Message status indicators
```

#### 3. TicketList.tsx
```typescript
// Features:
// - Paginated ticket listing
// - Status and priority filtering
// - Search functionality
// - Quick action buttons
// - Real-time updates
```

### Mobile App Integration

#### Chat Features
- **Real-time Messaging**: Live chat with agents
- **Message History**: Complete conversation threads
- **File Sharing**: Support for media attachments
- **Push Notifications**: Real-time message notifications

#### Ticket Management
- **Ticket Creation**: Automatic ticket creation for orders
- **Status Tracking**: Real-time ticket status updates
- **Agent Communication**: Direct messaging with assigned agents
- **Order Integration**: Seamless order-ticket linking

## 🔌 API Endpoints

### Ticket Management
```javascript
// Get all tickets (admin only)
GET /api/crm/tickets?status=&limit=&offset=

// Get tickets for current agent
GET /api/crm/tickets/my?view=assigned|overview

// Get specific ticket
GET /api/crm/tickets/:ticketId

// Create ticket (admin only)
POST /api/crm/tickets

// Update ticket status
PUT /api/crm/tickets/:ticketId/status

// Update ticket priority
PUT /api/crm/tickets/:ticketId/priority

// Reassign ticket
PUT /api/crm/tickets/:ticketId/reassign
```

### Message Management
```javascript
// Get ticket messages
GET /api/crm/tickets/:ticketId/messages?loadOlderMessages=&userId=&userType=&channelType=

// Add message to ticket
POST /api/crm/tickets/:ticketId/messages

// Get ticket by order ID
GET /api/crm/tickets/order/:orderId
```

### Agent Management
```javascript
// Update agent status
PUT /api/agent/status

// Get agent status for ticket
GET /api/crm/tickets/:ticketId/agent-status

// Get all agents
GET /api/admin/agents
```

### StreamChat Integration
```javascript
// Get StreamChat token
GET /api/chat/token

// Join ticket channel
POST /api/chat/tickets/:ticketId/join
```

## 🔒 Security & Authentication

### Authentication System
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Different permissions for users, agents, and admins
- **Session Management**: Secure session handling and refresh

### Authorization Levels
```javascript
// User Types and Permissions
enum UserType {
  brand        // Can access brand-agent channel only
  creator      // Can access creator-agent channel only
  agent        // Can access all channels and manage tickets
  super_admin  // Full system access and agent management
}
```

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Frontend security measures
- **Data Encryption**: Sensitive data encryption

## 📊 Monitoring & Analytics

### System Monitoring
- **API Health Checks**: Endpoint availability monitoring
- **Database Performance**: Query optimization and monitoring
- **Error Logging**: Comprehensive error tracking
- **User Activity**: User interaction analytics

### Performance Metrics
- **Response Times**: API response time tracking
- **Ticket Resolution**: Average resolution times
- **Agent Productivity**: Agent performance metrics
- **System Uptime**: Overall system availability

## 🚀 Deployment & Configuration

### Environment Variables
```bash
# StreamChat Configuration
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/influmojo

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Production Setup
1. **Database Migration**: Run Prisma migrations
2. **Environment Configuration**: Set up environment variables
3. **StreamChat Setup**: Configure StreamChat API credentials
4. **SSL Configuration**: Set up HTTPS for production
5. **Monitoring Setup**: Configure logging and monitoring

## 🔄 Integration Points

### Current Integrations
- **StreamChat**: Real-time messaging platform
- **PostgreSQL**: Primary database
- **Prisma ORM**: Database management
- **JWT**: Authentication system

### Future Integrations
- **Twilio**: Voice and SMS communication
- **SendGrid**: Automated email notifications
- **Calendar APIs**: Advanced scheduling
- **File Storage**: Cloud storage for attachments
- **Analytics Platforms**: Advanced reporting and analytics

## 🛠️ Development & Testing

### Development Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Testing
```bash
# Run automated tests
npm test

# Test specific features
node test-ticket-system.js
node test-chat-integration.js
node test-crm-functionality.js
```

### Debug Mode
```javascript
// Enable detailed logging
console.log('🔍 Debug information:', {
  ticketId,
  userId,
  userType,
  channelType
});
```

## 📈 Future Enhancements

### Planned Features
1. **AI-Powered Responses**: Automated response suggestions
2. **Advanced Analytics**: Detailed performance metrics
3. **Mobile App**: Native mobile interface
4. **Integration APIs**: Third-party service connections
5. **Automated Workflows**: Rule-based ticket routing

### Scalability Improvements
1. **Microservices**: Service decomposition
2. **Load Balancing**: Multiple server instances
3. **Database Sharding**: Horizontal scaling
4. **CDN Integration**: Global content delivery

## 🆘 Troubleshooting

### Common Issues

#### Chat Messages Not Displaying
- Check CSS for `.chat-messages` height
- Verify API endpoint responses
- Check browser console for errors
- Ensure proper channel filtering

#### Ticket Creation Issues
- Verify order exists in database
- Check agent availability
- Ensure StreamChat credentials are configured
- Review error logs for details

#### Agent Assignment Problems
- Check agent user type in database
- Verify round-robin assignment logic
- Ensure agents are online and available
- Review agent status updates

### Debug Commands
```bash
# Check database connection
node test-connection.js

# Test StreamChat integration
node test-streamchat-config.js

# Verify ticket system
node test-ticket-system.js

# Test agent functionality
node test-agent-login.js
```

## 📞 Support

### Documentation
- **API Documentation**: Complete endpoint documentation
- **Component Documentation**: React component guides
- **Database Schema**: Complete schema documentation
- **Integration Guides**: Third-party integration guides

### Contact Information
- **Technical Support**: Development team contact
- **Bug Reports**: Issue tracking system
- **Feature Requests**: Enhancement request process
- **Documentation Updates**: Documentation maintenance

---

## 🎯 Conclusion

The Influmojo Chat Integration, Ticketing System, and CRM provides a comprehensive, production-ready solution for customer support operations. With its modular architecture, real-time messaging capabilities, automated ticket management, and extensive administrative tools, it serves as a solid foundation for scalable customer support operations.

The system is designed to be:
- **Scalable**: Handles growing user base and ticket volume
- **Maintainable**: Clear code structure and comprehensive documentation
- **User-friendly**: Intuitive interfaces for all user types
- **Secure**: Robust authentication and authorization
- **Extensible**: Easy to add new features and integrations

This documentation serves as a complete guide for understanding, implementing, and maintaining the chat integration, ticketing system, and CRM functionality in the Influmojo platform.
