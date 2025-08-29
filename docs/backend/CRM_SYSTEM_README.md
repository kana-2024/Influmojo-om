# 🛡️ InfluMojo CRM System

A comprehensive Customer Relationship Management system built with StreamChat, SendGrid, and Twilio integration.

## 🏗️ Architecture Overview

### Core Components
- **Ticket System**: One ticket per order with round-robin agent assignment
- **StreamChat Integration**: Real-time chat functionality for each ticket
- **SendGrid**: Email automation and notifications
- **Twilio**: SMS/voice communications
- **Agent Management**: Secure admin interface for agent creation and management

## 📊 Database Schema

### Key Models

#### Ticket Model
```prisma
model Ticket {
  id               BigInt     @id @default(autoincrement())
  order_id         BigInt     @unique
  agent_id         BigInt
  stream_channel_id String
  status           TicketStatus @default(open)
  created_at       DateTime   @default(now())
  updated_at       DateTime   @updatedAt

  order            Order      @relation(fields: [order_id], references: [id])
  agent            User       @relation("TicketAgent", fields: [agent_id], references: [id])
  messages         Message[]
}
```

#### Message Model
```prisma
model Message {
  id           BigInt       @id @default(autoincrement())
  ticket_id    BigInt
  sender_id    BigInt
  message_text String
  message_type MessageType @default(text)
  file_url     String?
  file_name    String?
  read_at      DateTime?
  created_at   DateTime     @default(now())

  ticket       Ticket       @relation(fields: [ticket_id], references: [id])
  sender       User         @relation("MessageSender", fields: [sender_id], references: [id], onDelete: Cascade)
}
```

#### User Model (Updated)
```prisma
enum UserType {
  brand
  creator
  admin
  super_admin  // New: For agent management
}
```

## 🔐 Security & Authentication

### Authentication System
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different access levels for different user types
- **Middleware-based Protection**: Clean separation of authentication and authorization

### Middleware Components

#### Authentication Middleware (`auth.middleware.js`)
```javascript
// JWT verification and user population
const { authenticateJWT, optionalAuth } = require('../middlewares/auth.middleware');

// Adds req.user with: { id, email, user_type }
router.use(authenticateJWT);
```

#### Authorization Middleware (`isSuperAdmin.js`)
```javascript
// Role-based access control
const { isSuperAdmin, isAdmin, hasRole } = require('../middlewares/isSuperAdmin');

// Super admin only
router.use(isSuperAdmin);

// Admin or super admin
router.use(isAdmin);

// Custom role check
router.use(hasRole(['admin', 'super_admin']));
```

### Agent Management
- **Super Admin Only**: Agent creation and management restricted to `super_admin` users
- **Round-robin Assignment**: Automatic agent assignment for new tickets
- **Status Management**: Active, suspended, pending statuses for agents

### API Endpoints Protection
All admin endpoints require super admin authentication:
```javascript
// Apply authentication and super admin middleware to all routes
router.use(authenticateJWT);
router.use(isSuperAdmin);
```

## 🛠️ API Endpoints

### CRM Endpoints (`/api/crm`)
- `POST /tickets` - Create new ticket
- `GET /tickets/order/:orderId` - Get ticket by order ID
- `PUT /tickets/:ticketId/status` - Update ticket status
- `POST /tickets/:ticketId/messages` - Add message to ticket
- `GET /agent/:agentId/tickets` - Get agent's tickets
- `GET /tickets` - Get all tickets (admin dashboard)
- `PUT /tickets/:ticketId/reassign` - Reassign ticket to different agent

### Admin Endpoints (`/api/admin`)
- `POST /agents` - Create new agent (super admin only)
- `GET /agents` - Get all agents
- `GET /agents/stats` - Get agent statistics
- `GET /agents/:agentId` - Get agent by ID
- `PUT /agents/:agentId/status` - Update agent status
- `DELETE /agents/:agentId` - Delete agent (soft delete)

## 🎯 Agent Management System

### Features
1. **Secure Creation**: Only super admins can create agents
2. **Round-robin Assignment**: Automatic distribution of tickets among agents
3. **Status Management**: Active, suspended, pending statuses
4. **Statistics Dashboard**: Real-time agent performance metrics
5. **Web Interface**: Beautiful admin panel for management

### Admin Panel
Access the admin panel at: `backend/admin-panel.html`

**Features:**
- 📊 Real-time statistics
- ➕ Agent creation form
- 👥 Agent management grid
- 🔄 Status updates
- 📱 Responsive design

## 🔄 Round-robin Assignment Logic

```javascript
async createTicket(orderId, streamChannelId) {
  // Get all admin users
  const adminUsers = await prisma.user.findMany({
    where: { user_type: 'admin' },
    select: { id: true }
  });

  // Get last assigned ticket for round-robin
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { created_at: 'desc' },
    select: { agent_id: true }
  });

  // Calculate next agent index
  let nextAgentIndex = 0;
  if (lastTicket) {
    const currentAgentIndex = adminUsers.findIndex(user => user.id === lastTicket.agent_id);
    nextAgentIndex = (currentAgentIndex + 1) % adminUsers.length;
  }

  const assignedAgentId = adminUsers[nextAgentIndex].id;
  // Create ticket with assigned agent...
}
```

## 📧 Integration Points

### StreamChat Integration
- Each ticket gets a unique StreamChat channel
- Real-time messaging through StreamChat SDK
- Message persistence in database

### SendGrid Integration (Planned)
- Email notifications for ticket updates
- Agent assignment notifications
- Customer support emails

### Twilio Integration (Planned)
- SMS notifications for urgent tickets
- Voice call integration for premium support
- WhatsApp Business API integration

## 🚀 Getting Started

### 1. Database Setup
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 2. Create Super Admin
```sql
-- Create a super admin user
INSERT INTO "User" (email, name, user_type, status, email_verified, onboarding_completed)
VALUES ('admin@influmojo.com', 'Super Admin', 'super_admin', 'active', true, true);
```

### 3. Start the Server
```bash
npm start
```

### 4. Generate Test Token
```bash
node test-auth.js
```

### 5. Access Admin Panel
Open `backend/admin-panel.html` in your browser and use the JWT token from step 4

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# JWT Authentication
JWT_SECRET="your_secure_jwt_secret_key"

# StreamChat (to be added)
STREAMCHAT_API_KEY="your_streamchat_api_key"
STREAMCHAT_API_SECRET="your_streamchat_api_secret"

# SendGrid (to be added)
SENDGRID_API_KEY="your_sendgrid_api_key"

# Twilio (to be added)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
```

## 📋 Ticket Status Flow

1. **Open** - Initial status when ticket is created
2. **In Progress** - Agent is actively working on the ticket
3. **Resolved** - Issue has been resolved
4. **Closed** - Ticket is closed and archived

## 🔍 Monitoring & Analytics

### Agent Performance Metrics
- Total tickets assigned
- Average response time
- Resolution rate
- Customer satisfaction scores

### System Health
- Ticket creation rate
- Agent availability
- Response time trends
- Customer satisfaction trends

## 🛡️ Security Best Practices

1. **Authentication**: JWT-based authentication for all endpoints
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Comprehensive request validation
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **Audit Logging**: All admin actions are logged
6. **Data Encryption**: Sensitive data encryption at rest

## 🔄 Migration from Zoho

### Completed
- ✅ Removed all Zoho dependencies
- ✅ Updated database schema
- ✅ Created new CRM service layer
- ✅ Implemented agent management system
- ✅ Created admin interface

### Next Steps
- 🔄 Integrate StreamChat SDK
- 🔄 Set up SendGrid email automation
- 🔄 Configure Twilio SMS/voice
- 🔄 Update mobile app to use new CRM
- 🔄 Implement real-time notifications

## 📞 Support

For technical support or questions about the CRM system:
- Email: support@influmojo.com
- Documentation: [CRM System Wiki]
- Issues: [GitHub Issues]

---

**Built with ❤️ for InfluMojo** 