# Unified Agent Ticket System Implementation

## Overview

This implementation provides a unified agent-mediated ticket system where agents can view and manage all communication between brands and creators in a single, scoped interface. The system follows the principle: **One Ticket → One Channel → One Agent**.

## Key Features

### ✅ Agent Contact Logic: Unified Scoped View
- **Principle**: One Ticket → One Channel → One Agent
- **Members**: `brand_<id>`, `creator_<id>`, `agent_<id>`
- **Channel ID**: `ticket_<ticket_id>` (e.g., `ticket_123`)

### 🎯 Agent Capabilities
- **See messages**: ✅ View both sides (brand + creator + agent)
- **Send message**: ✅ Send to both (as mediator)
- **See order info**: ✅ Full view
- **See status changes**: ✅ Control status, updates, timestamps

## Implementation Details

### 1. StreamChat Channel Structure

#### Unified Channel Creation
```javascript
// Backend: streamService.js
async createUnifiedTicketChannel(ticketId, agentId, brandId, creatorId) {
  const channelId = `ticket_${ticketId}`;
  const channel = stream.channel('messaging', channelId, {
    name: `Ticket #${ticketId}`,
    members: [`agent_${agentId}`, `brand_${brandId}`, `creator_${creatorId}`],
    created_by_id: `agent_${agentId}`,
    data: {
      ticket_id: ticketId,
      order_id: ticketId,
      agent_id: agentId,
      brand_id: brandId,
      creator_id: creatorId,
      status: 'open',
      created_at: new Date().toISOString(),
      channel_type: 'ticket_support'
    }
  });
}
```

#### Message Structure
```javascript
// Message format with sender roles
{
  text: "Hi Brand, we've received your query.",
  customType: 'agent_message',
  sender_role: 'agent', // 'brand', 'creator', 'agent', 'system'
  sender_id: 'agent_42',
  user_id: 'agent_42'
}
```

### 2. Backend Implementation

#### CRM Service Updates
- **`createTicket()`**: Now creates unified channels with all members
- **`addMessage()`**: Supports sender roles
- **`getTicketMessages()`**: Returns messages with sender roles

#### Key Changes
```javascript
// crmService.js
async createTicket(orderId, streamChannelId = null) {
  // Get order details for brand and creator IDs
  const order = await prisma.order.findUnique({
    where: { id: BigInt(orderId) },
    include: {
      brand: { select: { id: true } },
      creator: { select: { id: true } }
    }
  });

  // Create unified StreamChat channel
  streamChannelId = await streamService.createUnifiedTicketChannel(
    orderId.toString(),
    assignedAgentId.toString(),
    order.brand.id.toString(),
    order.creator.id.toString()
  );
}
```

### 3. Frontend Implementation

#### TicketViewModal Updates
- **Unified Chat Interface**: Shows all messages in single timeline
- **Role-based Styling**: Different colors for brand, creator, agent, system
- **Agent Controls**: Full control over ticket status and communication

#### Message Styling
```typescript
const getMessageStyle = (message: Message) => {
  const senderRole = message.sender_role || message.sender;
  
  switch (senderRole) {
    case 'brand':
      return {
        container: 'justify-start',
        bubble: 'bg-blue-100 text-blue-900 border border-blue-200',
        sender: 'text-blue-700 font-medium'
      };
    case 'creator':
      return {
        container: 'justify-start',
        bubble: 'bg-green-100 text-green-900 border border-green-200',
        sender: 'text-green-700 font-medium'
      };
    case 'agent':
      return {
        container: 'justify-end',
        bubble: 'bg-gray-800 text-white',
        sender: 'text-gray-300 font-medium'
      };
    case 'system':
      return {
        container: 'justify-center',
        bubble: 'bg-yellow-50 text-yellow-800 border border-yellow-200 text-center',
        sender: 'text-yellow-600 font-medium'
      };
  }
};
```

#### TicketChat Component
- **Real-time Messaging**: Live chat with StreamChat integration
- **Role-based Display**: Shows sender names and roles
- **Agent Interface**: Dedicated agent controls and messaging

### 4. Database Schema Updates

#### Message Table
```sql
-- Added sender_role field for unified view
ALTER TABLE messages ADD COLUMN sender_role VARCHAR(20);
```

#### Type Definitions
```typescript
// types/index.ts
export interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender: 'brand' | 'creator' | 'agent' | 'system';
  sender_name: string;
  sender_role?: 'brand' | 'creator' | 'agent' | 'system'; // For unified agent view
  text: string;
  timestamp: string;
  created_at: string;
}
```

## Usage Flow

### 1. Ticket Creation
```
[Brand places order] → [Ticket auto-created] → [Stream channel auto-created]
                        ↓
               [Agent assigned by round-robin]
                        ↓
               [Agent joins channel]
                        ↓
        Agent talks to both → Sends updates / tracks messages
                        ↓
              Ticket is resolved → Channel marked inactive
```

### 2. Agent Interface
```
💬 Live Chat Timeline (like WhatsApp)
├── Message from brand_123: "Can I update the deadline?"
├── Agent: "Sure, let me check with the creator."
├── Message from creator_456: "Yes, I can extend by 2 days."
└── Agent: "Updated delivery to 5th Aug. Confirmed."

🧾 Order Summary Panel
├── Package type, payment, deadlines
└── Updateable fields for agent

🕹️ Agent Controls
├── Push custom system message
├── Change ticket priority/status
└── Assign another agent (if necessary)
```

## API Endpoints

### Ticket Management
- `POST /crm/tickets` - Create ticket with unified channel
- `GET /crm/tickets/:id/messages` - Get messages with sender roles
- `POST /crm/tickets/:id/messages` - Send message with role
- `PUT /crm/tickets/:id/status` - Update ticket status
- `PUT /crm/tickets/:id/priority` - Update ticket priority

### StreamChat Integration
- `GET /chat/token` - Get StreamChat token
- `POST /chat/tickets/:id/join` - Join unified ticket channel
- `POST /chat/tickets/:id/leave` - Leave ticket channel

## Benefits

### 🎯 For Agents
- **Unified View**: See all communication in one place
- **Better Context**: Full order and user information
- **Efficient Communication**: Direct access to both parties
- **Status Control**: Full control over ticket lifecycle

### 🎯 For Brands & Creators
- **Agent-Mediated**: Professional support experience
- **Consistent Communication**: Single point of contact
- **Transparent Process**: Can see all relevant information
- **Quick Resolution**: Direct agent intervention

### 🎯 For System
- **Scalable**: Round-robin agent assignment
- **Auditable**: Complete message history
- **Flexible**: Easy to extend with new features
- **Real-time**: Live chat capabilities

## Technical Implementation

### File Structure
```
admin-dashboard/
├── components/
│   ├── TicketViewModal.tsx     # Unified agent interface
│   ├── TicketChat.tsx          # Real-time chat component
│   └── StreamChatProvider.tsx  # StreamChat context
├── lib/
│   ├── api.ts                  # API client
│   └── streamChat.ts           # StreamChat utilities
└── types/
    └── index.ts                # Type definitions

backend/
├── src/
│   ├── services/
│   │   ├── crmService.js       # Ticket management
│   │   └── streamService.js    # StreamChat integration
│   └── routes/
│       └── crm.js              # Ticket API endpoints
```

### Key Dependencies
- **Frontend**: React, TypeScript, StreamChat React
- **Backend**: Node.js, Express, Prisma, StreamChat
- **Database**: PostgreSQL
- **Real-time**: StreamChat WebSocket integration

## Future Enhancements

### 🚀 Planned Features
1. **File Attachments**: Support for images, documents
2. **Message Templates**: Pre-defined agent responses
3. **Auto-assignment**: Smart agent assignment based on expertise
4. **Analytics**: Ticket resolution metrics
5. **Mobile Support**: Mobile-optimized agent interface

### 🔧 Technical Improvements
1. **Performance**: Message pagination and lazy loading
2. **Security**: Enhanced authentication and authorization
3. **Monitoring**: Real-time system health monitoring
4. **Backup**: Automated data backup and recovery

## Conclusion

This unified agent ticket system provides a comprehensive solution for agent-mediated communication between brands and creators. The implementation follows best practices for real-time chat systems and provides a scalable, maintainable architecture for future enhancements.

The system successfully addresses the core requirements:
- ✅ Unified scoped view for agents
- ✅ Agent-mediated communication
- ✅ Real-time messaging capabilities
- ✅ Comprehensive ticket management
- ✅ Scalable architecture

This implementation serves as a solid foundation for the Influmojo platform's support system. 