# Influmojo Admin Dashboard - Comprehensive Documentation

## 🎯 **Overview**

The Influmojo Admin Dashboard is a comprehensive CRM and support management system built with Next.js 14, TypeScript, and StreamChat for real-time communication. It provides role-based access control for agents and super admins with advanced ticket management capabilities.

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Real-time Chat**: StreamChat SDK
- **State Management**: React Query, Local Storage
- **UI Components**: Lucide React Icons, React Hook Form
- **Backend**: Node.js, Express, PostgreSQL, Prisma
- **Authentication**: JWT tokens
- **Real-time Communication**: StreamChat

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   StreamChat    │    │   JWT Auth      │    │   Prisma ORM    │
│   (Real-time)   │    │   (Tokens)      │    │   (Migrations)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **Folder Structure**

```
admin-dashboard/
├── 📁 app/                          # Next.js 14 App Router
│   ├── 📄 page.tsx                  # Main login page with role-based redirects
│   ├── 📄 layout.tsx                # Root layout with providers
│   ├── 📄 globals.css               # Global styles and Tailwind CSS
│   ├── 📄 providers.tsx             # React Query and StreamChat providers
│   ├── 📁 agent/                    # Agent-specific routes
│   │   └── 📄 page.tsx              # Agent dashboard (assigned tickets only)
│   ├── 📁 super-admin/              # Super admin routes
│   │   └── 📄 page.tsx              # Super admin dashboard (all tickets)
│   └── 📁 ticket/                   # Ticket-specific routes
│       └── 📁 [id]/                 # Dynamic ticket routes
│           └── 📄 page.tsx          # Individual ticket view
├── 📁 components/                   # Reusable React components
│   ├── 📄 StreamChatProvider.tsx    # StreamChat context provider
│   ├── 📄 TicketChat.tsx            # Real-time chat component
│   ├── 📄 TicketList.tsx            # Ticket list with filtering
│   └── 📄 TicketViewModal.tsx       # Ticket view modal
├── 📁 hooks/                        # Custom React hooks
│   └── 📄 useStreamChatAuth.ts      # StreamChat authentication hook
├── 📁 lib/                          # Utility libraries
│   ├── 📄 api.ts                    # API integration with role-based endpoints
│   └── 📄 streamChat.ts             # StreamChat utilities
├── 📁 types/                        # TypeScript type definitions
│   └── 📄 index.ts                  # All TypeScript interfaces
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 next.config.js                # Next.js configuration
└── 📄 README.md                     # Project documentation
```

## 🔄 **Data Flow & User Journey**

### **1. Authentication Flow**
```
User Access → JWT Token Validation → Role Detection → Dashboard Redirect
     │              │                    │                │
     ▼              ▼                    ▼                ▼
Login Page → Token Storage → User Type Check → Role-specific Dashboard
```

### **2. Ticket Management Flow**
```
Ticket Creation → Agent Assignment → Channel Creation → Real-time Chat
      │                │                │                │
      ▼                ▼                ▼                ▼
Order System → Round Robin → StreamChat → Agent Response
```

### **3. Real-time Chat Flow**
```
Agent Login → StreamChat Auth → Channel Join → Message Exchange
     │              │              │              │
     ▼              ▼              ▼              ▼
JWT Token → StreamChat Token → Ticket Channel → Real-time Messages
```

## 🎨 **Frontend Implementation**

### **Core Components**

#### **1. Main Login Page (`app/page.tsx`)**
- **Purpose**: Entry point with role-based authentication
- **Features**:
  - JWT token login
  - Email/password login for agents
  - Automatic role detection and redirect
  - Error handling and user feedback

```typescript
// Key functionality
const handleTokenLogin = async (e: React.FormEvent) => {
  // JWT token validation
  // Role-based redirect
  // User session management
};
```

#### **2. Agent Dashboard (`app/agent/page.tsx`)**
- **Purpose**: Agent-specific dashboard with assigned tickets
- **Features**:
  - Personal ticket statistics
  - Assigned tickets only
  - Real-time chat integration
  - Status updates and management

#### **3. Super Admin Dashboard (`app/super-admin/page.tsx`)**
- **Purpose**: System-wide dashboard with full access
- **Features**:
  - All tickets view
  - Agent management
  - System statistics
  - Intervention capabilities

### **Component Architecture**

#### **TicketList Component (`components/TicketList.tsx`)**
```typescript
interface TicketListProps {
  tickets?: Ticket[];
  showAgentInfo?: boolean;
  onViewTicket?: (ticket: Ticket) => void;
}
```

**Features**:
- Pagination support
- Status and priority indicators
- Real-time updates
- Role-based filtering

#### **TicketChat Component (`components/TicketChat.tsx`)**
```typescript
interface TicketChatProps {
  ticketId: string;
  ticketTitle?: string;
  onClose?: () => void;
}
```

**Features**:
- Real-time messaging with StreamChat
- Message history
- Channel management
- File attachments support

#### **StreamChatProvider Component (`components/StreamChatProvider.tsx`)**
```typescript
interface StreamChatContext {
  client: StreamChat | null;
  isConnected: boolean;
  connectUser: (userId: string, token: string) => Promise<void>;
  joinChannel: (channelId: string) => Promise<void>;
}
```

**Features**:
- StreamChat client management
- User connection handling
- Channel joining functionality
- Error handling and notifications

### **Custom Hooks**

#### **useStreamChatAuth Hook (`hooks/useStreamChatAuth.ts`)**
```typescript
const {
  authenticate,
  disconnect,
  isConnected,
  isLoading,
  error
} = useStreamChatAuth();
```

**Features**:
- Automatic token generation
- User connection management
- Error handling
- Loading states

## 🔧 **Backend Integration**

### **API Structure (`lib/api.ts`)**

#### **Authentication API**
```typescript
export const authAPI = {
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>>,
  agentLogin: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>>,
  login: async (token: string) => Promise<{ success: boolean }>,
  logout: () => void,
  isAuthenticated: () => boolean
};
```

#### **Tickets API**
```typescript
export const ticketsAPI = {
  getAllTickets: async (page: number, limit: number): Promise<ApiResponse<{ tickets: Ticket[]; total: number }>>,
  getMyTickets: async (): Promise<ApiResponse<{ tickets: Ticket[] }>>,
  getTicket: async (id: string): Promise<ApiResponse<{ ticket: Ticket }>>,
  getMessages: async (ticketId: string, activeTab: string): Promise<ApiResponse<{ messages: Message[] }>>,
  sendMessage: async (ticketId: string, message: string, activeTab: string): Promise<ApiResponse<{ message: Message }>>
};
```

#### **StreamChat API**
```typescript
export const streamChatAPI = {
  getToken: async (): Promise<ApiResponse<{ token: string; userId: string; apiKey: string }>>,
  joinTicketChannel: async (ticketId: string): Promise<ApiResponse<{ channelId: string }>>,
  leaveTicketChannel: async (ticketId: string): Promise<ApiResponse<{ message: string }>>,
  getChannels: async (): Promise<ApiResponse<{ channels: any[] }>>,
  getChannelInfo: async (channelId: string): Promise<ApiResponse<{ channel: any }>>
};
```

### **Type Definitions (`types/index.ts`)**

#### **Core Interfaces**
```typescript
interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  user_type: 'super_admin' | 'agent' | 'brand' | 'creator';
  profile_image_url?: string;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  last_login_at?: string;
}

interface Ticket {
  id: string;
  order_id: string;
  agent_id: string;
  stream_channel_id: string;
  brand_agent_channel?: string;
  creator_agent_channel?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  agent?: Agent;
  order?: Order;
  messages?: Message[];
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  read_at?: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    user_type: string;
  };
  sender_role?: 'brand' | 'creator' | 'agent' | 'system';
  channel_type?: 'brand_agent' | 'creator_agent';
}
```

## 🔐 **Authentication & Security**

### **JWT Token Management**
- **Token Storage**: LocalStorage for client-side persistence
- **Token Validation**: Automatic validation on API calls
- **Token Refresh**: Automatic token refresh mechanism
- **Security**: HTTPS-only token transmission

### **Role-Based Access Control**
- **Super Admin**: Full system access, all tickets, agent management
- **Agent**: Assigned tickets only, personal dashboard
- **Brand/Creator**: Limited access through mobile app

### **API Security**
- **Protected Routes**: All API endpoints require authentication
- **Role Validation**: Server-side role checking
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Rate Limiting**: API rate limiting for security

## 💬 **Real-time Chat System**

### **StreamChat Integration**
- **Real-time Messaging**: Instant message delivery
- **Channel Management**: Automatic channel creation and joining
- **User Attribution**: Messages show correct sender information
- **Role-based Access**: Different permissions for different user types

### **Chat Features**
- **Message History**: Complete conversation history
- **File Attachments**: Support for file uploads
- **Status Indicators**: Online/offline status
- **Typing Indicators**: Real-time typing notifications
- **Message Reactions**: Emoji reactions support

### **Channel Management**
- **Automatic Creation**: Channels created when tickets are assigned
- **Dynamic Joining**: Agents join channels when viewing tickets
- **Permission Control**: Role-based channel access
- **Channel Types**: Separate channels for brand-agent and creator-agent communication

## 📊 **Dashboard Features**

### **Super Admin Dashboard**
- **System Overview**: Total tickets, open tickets, resolved tickets, active agents
- **All Tickets**: View and manage all tickets in the system
- **Agent Management**: Monitor agent performance and assignments
- **Intervention Capability**: Join any conversation and intervene
- **Statistics**: Comprehensive system statistics

### **Agent Dashboard**
- **My Tickets**: View assigned tickets only
- **Ticket Statistics**: Personal ticket statistics
- **Quick Actions**: Respond to tickets, update status
- **Chat Interface**: Real-time messaging with customers
- **Performance Metrics**: Personal performance tracking

## 🎨 **UI/UX Design**

### **Design System**
- **Color Scheme**: Consistent color palette with brand colors
- **Typography**: Modern, readable typography
- **Spacing**: Consistent spacing and layout
- **Components**: Reusable component library

### **User Experience**
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Smooth loading experiences
- **Error Handling**: Comprehensive error handling
- **Accessibility**: WCAG compliant design

### **Interactive Elements**
- **Real-time Updates**: Live status indicators
- **Smooth Animations**: CSS transitions and animations
- **Intuitive Navigation**: Easy-to-use navigation
- **Feedback Systems**: Toast notifications and alerts

## 🚀 **Deployment & Setup**

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- StreamChat account and API credentials
- Environment variables configured

### **Installation Steps**
1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd admin-dashboard
   npm install
   ```

2. **Environment configuration**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3002/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### **Backend Setup**
1. **Navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**
   ```bash
   # .env
   DATABASE_URL="postgresql://..."
   STREAM_API_KEY="your_stream_api_key"
   STREAM_API_SECRET="your_stream_api_secret"
   JWT_SECRET="your_jwt_secret"
   ```

3. **Database setup**
   ```bash
   npx prisma migrate dev
   ```

4. **Create users**
   ```bash
   node create-super-admin.js
   node create-agent.js
   ```

## 🔧 **Development & Testing**

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### **Testing Strategy**
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load testing and optimization

### **Code Quality**
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 📈 **Performance & Optimization**

### **Frontend Optimization**
- **Code Splitting**: Automatic code splitting with Next.js
- **Lazy Loading**: Components load on demand
- **Image Optimization**: Next.js image optimization
- **Caching**: React Query caching strategy

### **Backend Optimization**
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Database connection management
- **Caching**: Redis caching for frequently accessed data
- **Load Balancing**: Horizontal scaling support

### **Real-time Optimization**
- **Connection Pooling**: StreamChat connection reuse
- **Message Caching**: Recent message caching
- **Error Boundaries**: Graceful error handling
- **Offline Support**: Offline message queuing

## 🔮 **Future Enhancements**

### **Planned Features**
1. **File Attachments**: Enhanced file upload support
2. **Voice Messages**: Audio message support
3. **Screen Sharing**: Agent screen sharing capabilities
4. **Chat Analytics**: Message analytics and reporting
5. **Automated Responses**: AI-powered responses

### **Technical Improvements**
1. **WebSocket Fallback**: Fallback when StreamChat unavailable
2. **Advanced Search**: Full-text message search
3. **Message Encryption**: End-to-end encryption
4. **Mobile App**: Native mobile application

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

## 📞 **Support & Documentation**

### **Documentation**
- **API Documentation**: Comprehensive API reference
- **Component Library**: Reusable component documentation
- **Setup Guides**: Step-by-step setup instructions
- **Troubleshooting**: Common issues and solutions

### **Support Channels**
- **Technical Support**: Development team contact
- **User Support**: Customer support channels
- **Documentation**: Comprehensive documentation
- **Community**: User community and forums

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Influmojo Development Team
