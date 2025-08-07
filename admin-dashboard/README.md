# Influmojo Admin Dashboard

A comprehensive CRM and support management system with role-based access control for agents and super admins.

## 🎯 **Features**

### **Role-Based Access Control**
- **Super Admin Dashboard**: Full system access, can view all tickets and intervene in any conversation
- **Agent Dashboard**: Limited to assigned tickets only
- **Automatic Role Detection**: System automatically redirects users based on their role

### **Real-time Chat Integration**
- **StreamChat Integration**: Real-time messaging with instant delivery
- **Agent-Mediated Support**: All conversations go through assigned agents
- **Super Admin Intervention**: Super admins can join any conversation and intervene
- **Proper Attribution**: Messages show the correct agent name who sent them

### **Ticket Management**
- **Ticket Assignment**: Tickets are automatically assigned to agents
- **Status Tracking**: Track ticket status (open, in_progress, resolved, closed)
- **Priority Levels**: Support for different priority levels (low, medium, high, urgent)
- **Message History**: Complete conversation history with proper attribution

## 🏗️ **Architecture**

### **Frontend Structure**
```
admin-dashboard/
├── app/
│   ├── page.tsx                    # Main login page with role-based redirects
│   ├── agent/
│   │   └── page.tsx               # Agent dashboard (assigned tickets only)
│   ├── super-admin/
│   │   └── page.tsx               # Super admin dashboard (all tickets)
│   └── providers.tsx              # StreamChat provider setup
├── components/
│   ├── StreamChatProvider.tsx     # StreamChat context provider
│   ├── TicketChat.tsx             # Real-time chat component
│   ├── TicketList.tsx             # Ticket list with role-based filtering
│   └── TicketViewModal.tsx        # Ticket view modal
├── hooks/
│   └── useStreamChatAuth.ts       # StreamChat authentication hook
├── lib/
│   ├── api.ts                     # API integration with role-based endpoints
│   └── streamChat.ts              # StreamChat utilities
└── types/
    └── index.ts                   # TypeScript types
```

### **Backend Structure**
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js                # Authentication with /me endpoint
│   │   ├── crm.js                 # Ticket management with /tickets/my
│   │   └── chat.js                # StreamChat integration
│   ├── services/
│   │   └── streamService.js       # StreamChat service
│   └── middlewares/
│       └── auth.middleware.js     # JWT authentication
├── prisma/
│   └── schema.prisma              # Database schema
├── create-super-admin.js          # Super admin creation script
└── create-agent.js                # Agent creation script
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- StreamChat account and API credentials

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3002/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### **Backend Setup**

1. **Navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # .env
   DATABASE_URL="postgresql://..."
   STREAM_API_KEY="your_stream_api_key"
   STREAM_API_SECRET="your_stream_api_secret"
   JWT_SECRET="your_jwt_secret"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Create super admin user**
   ```bash
   node create-super-admin.js
   ```

5. **Create agent users**
   ```bash
   node create-agent.js
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

## 👥 **User Roles & Login**

### **Super Admin**
- **Access**: Full system access
- **Capabilities**:
  - View all tickets in the system
  - Intervene in any conversation
  - Monitor agent performance
  - Manage agent assignments
  - Access system-wide statistics
- **Dashboard**: `/super-admin`
- **Login**: Use JWT token from `create-super-admin.js`

### **Agent**
- **Access**: Assigned tickets only
- **Capabilities**:
  - View and respond to assigned tickets
  - Send messages with proper attribution
  - Update ticket status
  - View ticket history
- **Dashboard**: `/agent`
- **Login**: Use JWT token from `create-agent.js`

## 🔐 **Login Process**

### **For Super Admins**

1. **Create super admin**
   ```bash
   cd backend
   node create-super-admin.js
   ```

2. **Copy the JWT token** from the console output

3. **Login to dashboard**
   - Go to `http://localhost:3000`
   - Paste the JWT token
   - Click "Sign In"
   - You'll be redirected to `/super-admin`

### **For Agents**

1. **Create agent**
   ```bash
   cd backend
   node create-agent.js
   ```

2. **Copy the JWT token** from the console output

3. **Login to dashboard**
   - Go to `http://localhost:3000`
   - Paste the JWT token
   - Click "Sign In"
   - You'll be redirected to `/agent`

### **Automatic Role Detection**

The system automatically detects user roles and redirects accordingly:
- `user_type: 'super_admin'` → `/super-admin`
- `user_type: 'agent'` → `/agent`
- Other user types → Main dashboard with role selection

## 💬 **Chat System**

### **StreamChat Integration**
- **Real-time Messaging**: Instant message delivery
- **Channel Management**: Automatic channel creation and joining
- **User Attribution**: Messages show correct sender information
- **Role-based Access**: Different permissions for different user types

### **Message Attribution**
- **Agent Messages**: Show agent name and role
- **Super Admin Messages**: Show super admin name and role
- **Brand/Creator Messages**: Show customer name and role
- **System Messages**: Show system notifications

## 📊 **Dashboard Features**

### **Super Admin Dashboard**
- **System Overview**: Total tickets, open tickets, resolved tickets, active agents
- **All Tickets**: View and manage all tickets in the system
- **Agent Management**: Monitor agent performance and assignments
- **Intervention Capability**: Join any conversation and intervene

### **Agent Dashboard**
- **My Tickets**: View assigned tickets only
- **Ticket Statistics**: Personal ticket statistics
- **Quick Actions**: Respond to tickets, update status
- **Chat Interface**: Real-time messaging with customers

## 🔧 **API Endpoints**

### **Authentication**
```bash
GET /api/auth/me                    # Get current user
POST /api/auth/login               # Login with JWT token
```

### **Tickets**
```bash
GET /api/crm/tickets               # Get all tickets (super admin)
GET /api/crm/tickets/my           # Get agent's tickets
GET /api/crm/tickets/:id          # Get specific ticket
POST /api/crm/tickets/:id/messages # Send message
```

### **StreamChat**
```bash
GET /api/chat/token               # Get StreamChat token
POST /api/chat/tickets/:id/join   # Join ticket channel
POST /api/chat/tickets/:id/leave  # Leave ticket channel
```

## 🎨 **UI/UX Features**

### **Modern Design**
- **Responsive Layout**: Works on desktop and mobile
- **Clean Interface**: Modern, intuitive design
- **Real-time Updates**: Live status indicators
- **Loading States**: Smooth loading experiences

### **User Experience**
- **Role-based Navigation**: Automatic redirects based on user role
- **Intuitive Chat**: Easy-to-use chat interface
- **Status Indicators**: Clear visual status indicators
- **Error Handling**: Comprehensive error handling and user feedback

## 🔒 **Security**

### **Access Control**
- **Role-based Permissions**: Different access levels for different roles
- **JWT Authentication**: Secure token-based authentication
- **API Protection**: Protected endpoints with proper authorization
- **Data Isolation**: Agents can only access their assigned tickets

### **Data Protection**
- **Message Encryption**: StreamChat handles encryption
- **Secure Storage**: Tokens stored securely
- **Audit Trail**: All actions logged
- **Privacy Compliance**: GDPR-compliant data handling

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Authentication Failed**
   - Check JWT token validity
   - Verify backend is running
   - Check environment variables

2. **Chat Not Connecting**
   - Verify StreamChat credentials
   - Check network connectivity
   - Review browser console for errors

3. **Tickets Not Loading**
   - Check user permissions
   - Verify API endpoints
   - Review backend logs

### **Debug Commands**
```bash
# Check backend status
curl http://localhost:3002/api/auth/me

# Test StreamChat connection
curl http://localhost:3002/api/chat/token

# Check database connection
npx prisma studio
```

## 📈 **Performance**

### **Optimizations**
- **Lazy Loading**: Components load on demand
- **Connection Pooling**: Reuse StreamChat connections
- **Message Caching**: Cache recent messages
- **Error Boundaries**: Graceful error handling

### **Monitoring**
- **Real-time Metrics**: Live system metrics
- **Performance Tracking**: Response time monitoring
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage analytics and insights

## 🔮 **Future Enhancements**

### **Planned Features**
1. **File Attachments**: Support for file uploads in chat
2. **Voice Messages**: Audio message support
3. **Screen Sharing**: Agent screen sharing capabilities
4. **Chat Analytics**: Message analytics and reporting
5. **Automated Responses**: AI-powered responses

### **Technical Improvements**
1. **WebSocket Fallback**: Fallback when StreamChat unavailable
2. **Offline Support**: Offline message queuing
3. **Message Encryption**: End-to-end encryption
4. **Advanced Search**: Full-text message search

## 📞 **Support**

For technical support or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the backend logs
4. Contact the development team

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details. 