# Separate Channels Implementation for CRM System

## Overview

This implementation provides **separate channels** for brand-agent and creator-agent communication while maintaining a unified ticket system. Each order gets one ticket, but the communication is split into two distinct channels:

- **Brand-Agent Channel**: `ticket_${ticketId}_brand_agent`
- **Creator-Agent Channel**: `ticket_${ticketId}_creator_agent`

## 🎯 Key Benefits

1. **Clear Separation**: Brands and creators can only see their respective conversations
2. **Simplified UX**: No confusion about message ownership
3. **Better Privacy**: Users only see relevant messages
4. **Easier Maintenance**: Simpler filtering logic
5. **Scalable Architecture**: Easy to extend with new features

## 🏗️ Architecture Changes

### Database Schema Updates

```sql
-- Ticket table updates
ALTER TABLE "Ticket" ADD COLUMN "brand_agent_channel" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "creator_agent_channel" TEXT;

-- Message table updates
ALTER TABLE "Message" ADD COLUMN "sender_role" TEXT;
ALTER TABLE "Message" ADD COLUMN "channel_type" TEXT;
```

### New Fields

#### Ticket Model
- `brand_agent_channel`: Separate StreamChat channel for brand-agent communication
- `creator_agent_channel`: Separate StreamChat channel for creator-agent communication

#### Message Model
- `sender_role`: Explicit sender role (brand, creator, agent, system)
- `channel_type`: Which channel the message belongs to (brand_agent, creator_agent)

## 🔧 Implementation Details

### 1. StreamChat Service Updates

#### New Method: `createSeparateTicketChannels()`
```javascript
async createSeparateTicketChannels(ticketId, agentId, brandId, creatorId) {
  // Create brand-agent channel
  const brandAgentChannelId = `ticket_${ticketId}_brand_agent`;
  const brandAgentChannel = stream.channel('messaging', brandAgentChannelId, {
    name: `Ticket #${ticketId} - Brand Support`,
    members: [`agent-${agentId}`, `brand-${brandId}`],
    created_by_id: `agent-${agentId}`,
    data: {
      ticket_id: ticketId,
      order_id: ticketId,
      agent_id: agentId,
      brand_id: brandId,
      status: 'open',
      created_at: new Date().toISOString(),
      channel_type: 'brand_agent'
    }
  });

  // Create creator-agent channel
  const creatorAgentChannelId = `ticket_${ticketId}_creator_agent`;
  const creatorAgentChannel = stream.channel('messaging', creatorAgentChannelId, {
    name: `Ticket #${ticketId} - Creator Support`,
    members: [`agent-${agentId}`, `creator-${creatorId}`],
    created_by_id: `agent-${agentId}`,
    data: {
      ticket_id: ticketId,
      order_id: ticketId,
      agent_id: agentId,
      creator_id: creatorId,
      status: 'open',
      created_at: new Date().toISOString(),
      channel_type: 'creator_agent'
    }
  });

  return {
    brandAgentChannel: brandAgentChannelId,
    creatorAgentChannel: creatorAgentChannelId
  };
}
```

### 2. CRM Service Updates

#### Updated `createTicket()` Method
```javascript
async createTicket(orderId, streamChannelId = null) {
  // ... existing code ...

  // Create separate StreamChat channels
  let brandAgentChannel = null;
  let creatorAgentChannel = null;
  
  if (!streamChannelId) {
    try {
      const channels = await streamService.createSeparateTicketChannels(
        orderId.toString(),
        assignedAgent.id.toString(),
        order.brand.id.toString(),
        order.creator.id.toString()
      );
      
      brandAgentChannel = channels.brandAgentChannel;
      creatorAgentChannel = channels.creatorAgentChannel;
    } catch (streamError) {
      console.error('⚠️ Failed to create separate StreamChat channels:', streamError);
      brandAgentChannel = 'no-brand-channel';
      creatorAgentChannel = 'no-creator-channel';
    }
  }

  // Create ticket with separate channels
  const ticketData = {
    order_id: BigInt(orderId),
    agent_id: assignedAgent.id,
    stream_channel_id: streamChannelId || 'no-channel', // Legacy field
    brand_agent_channel: brandAgentChannel,
    creator_agent_channel: creatorAgentChannel,
    status: 'open'
  };
}
```

#### Updated `addMessage()` Method
```javascript
async addMessage(ticketId, senderId, messageText, messageType = 'text', fileUrl = null, fileName = null, senderRole = null, channelType = null) {
  // Determine channel type if not provided
  let finalChannelType = channelType;
  if (!finalChannelType) {
    if (role === 'brand') {
      finalChannelType = 'brand_agent';
    } else if (role === 'creator') {
      finalChannelType = 'creator_agent';
    } else if (role === 'agent' || role === 'super_admin') {
      finalChannelType = 'brand_agent'; // Default to brand_agent
    } else {
      finalChannelType = 'system';
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

#### Updated `getTicketMessages()` Method
```javascript
async getTicketMessages(ticketId, requestingUserId = null, requestingUserType = null, loadOlderMessages = false, channelType = null) {
  // Filter by channel type if specified
  if (channelType) {
    whereClause.channel_type = channelType;
  }

  // Filter messages based on user role and channel type
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
    
    filteredMessages = allMessages.filter(message => {
      const isOwnMessage = senderIdString === requestingUserIdString;
      const isAgentMessage = senderType === 'agent' || senderType === 'super_admin';
      const isSystemMessage = senderType === 'system';
      const isCorrectChannel = !userChannelType || messageChannelType === userChannelType;
      
      return (isOwnMessage || isAgentMessage || isSystemMessage) && isCorrectChannel;
    });
  }
}
```

### 3. API Routes Updates

#### Updated Message Endpoints
```javascript
// Get messages with channel filtering
router.get('/tickets/:ticketId/messages', asyncHandler(async (req, res) => {
  const { channelType: queryChannelType } = req.query;
  
  // Determine channel type based on user type if not provided
  let finalChannelType = queryChannelType;
  if (!finalChannelType) {
    if (userType === 'brand') {
      finalChannelType = 'brand_agent';
    } else if (userType === 'creator') {
      finalChannelType = 'creator_agent';
    }
  }

  const result = await crmService.getTicketMessages(
    ticketId, 
    userId.toString(), 
    userType, 
    loadOlderMessages === 'true',
    finalChannelType
  );
}));

// Send message with channel type
router.post('/tickets/:ticketId/messages', asyncHandler(async (req, res) => {
  const { channel_type, target_tab } = req.body;
  
  // Determine channel type if not provided
  let finalChannelType = channel_type;
  if (!finalChannelType) {
    if (userType === 'brand') {
      finalChannelType = 'brand_agent';
    } else if (userType === 'creator') {
      finalChannelType = 'creator_agent';
    } else if (userType === 'agent' || userType === 'super_admin') {
      if (target_tab === 'brand') {
        finalChannelType = 'brand_agent';
      } else if (target_tab === 'creator') {
        finalChannelType = 'creator_agent';
      } else {
        finalChannelType = 'brand_agent';
      }
    }
  }

  const messageData = await crmService.addMessage(
    ticketId, 
    userId.toString(),
    messageContent.trim(), 
    message_type, 
    file_url, 
    file_name,
    finalSenderRole,
    finalChannelType
  );
}));
```

### 4. Frontend Updates

#### Mobile App Updates

##### BrandChatScreen.tsx
```typescript
const messageData = {
  message_text: messageText,
  sender_role: 'brand' as const,
  channel_type: 'brand_agent' as const,
  message_type: 'text' as const
};
```

##### CreatorChatScreen.tsx
```typescript
const messageData = {
  message_text: messageText,
  sender_role: 'creator' as const,
  channel_type: 'creator_agent' as const,
  message_type: 'text' as const
};
```

#### Admin Dashboard Updates

##### TicketViewModal.tsx
```typescript
// Add tabs for switching between channels
const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand');

// Fetch messages for the active tab
const {
  data: messagesData,
  isLoading: messagesLoading,
  refetch: refetchMessages
} = useQuery({
  queryKey: ['ticket-messages', ticket?.id, activeTab],
  queryFn: () => ticketsAPI.getMessages(ticket?.id || '', activeTab),
  enabled: !!ticket?.id,
});

// Send message to the active tab
const sendMessageMutation = useMutation({
  mutationFn: (message: string) => ticketsAPI.sendMessage(ticket?.id || '', message, activeTab),
  onSuccess: () => {
    setNewMessage('');
    refetchMessages();
    toast.success('Message sent successfully');
  },
});
```

## 🎨 User Experience

### For Brands
- ✅ Only see brand-agent messages
- ✅ Clear message ownership
- ✅ Simplified interface
- ✅ No confusion about creator messages

### For Creators
- ✅ Only see creator-agent messages
- ✅ Clear message ownership
- ✅ Simplified interface
- ✅ No confusion about brand messages

### For Agents
- ✅ See all messages from both channels
- ✅ Tabbed interface to switch between brand and creator
- ✅ Clear channel separation
- ✅ Unified ticket management

## 🔄 Migration Process

### 1. Database Migration
```bash
# Run the migration
npx prisma migrate dev --name add_separate_channels

# Or manually run the SQL
psql -d your_database -f backend/prisma/migrations/add_separate_channels.sql
```

### 2. Update Existing Tickets
```javascript
// Script to update existing tickets with separate channels
async function updateExistingTickets() {
  const tickets = await prisma.ticket.findMany({
    where: {
      brand_agent_channel: null,
      creator_agent_channel: null
    }
  });

  for (const ticket of tickets) {
    // Create separate channels for existing tickets
    const channels = await streamService.createSeparateTicketChannels(
      ticket.id.toString(),
      ticket.agent_id.toString(),
      ticket.order.brand.id.toString(),
      ticket.order.creator.id.toString()
    );

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        brand_agent_channel: channels.brandAgentChannel,
        creator_agent_channel: channels.creatorAgentChannel
      }
    });
  }
}
```

## 🚀 Benefits Summary

1. **Improved User Experience**: Clear separation of concerns
2. **Better Privacy**: Users only see relevant messages
3. **Simplified Logic**: Easier message filtering and display
4. **Scalable Architecture**: Easy to extend with new features
5. **Maintainable Code**: Cleaner, more organized codebase
6. **Better Performance**: Optimized queries with proper indexing

## 🔍 Testing

### Test Cases

1. **Brand Chat**: Verify brands only see brand-agent messages
2. **Creator Chat**: Verify creators only see creator-agent messages
3. **Agent Interface**: Verify agents can see both channels with tabs
4. **Message Sending**: Verify messages go to correct channels
5. **Channel Creation**: Verify separate channels are created for new tickets

### Manual Testing Checklist

- [ ] Brand can send and receive messages in brand-agent channel
- [ ] Creator can send and receive messages in creator-agent channel
- [ ] Agent can see both channels with tabbed interface
- [ ] Messages are properly filtered by channel type
- [ ] New tickets create separate channels automatically
- [ ] Existing tickets work with the new system

## 📝 Conclusion

This implementation successfully addresses the message differentiation problem by creating separate channels for brand-agent and creator-agent communication while maintaining a unified ticket system. The solution provides:

- ✅ Clear message ownership
- ✅ Simplified user experience
- ✅ Better privacy and security
- ✅ Scalable architecture
- ✅ Maintainable codebase

The separate channels approach is the recommended solution for the CRM system as it provides the best user experience and maintainability.
