# Backend Implementation - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Architecture](#api-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [User Management Flow](#user-management-flow)
6. [Brand & Creator System](#brand--creator-system)
7. [Package & Order Management](#package--order-management)
8. [Chat & Communication](#chat--communication)
9. [Payment & Billing](#payment--billing)
10. [Admin & Agent System](#admin--agent-system)
11. [File Upload & Media](#file-upload--media)
12. [Security & Validation](#security--validation)
13. [Error Handling](#error-handling)
14. [Deployment & Environment](#deployment--environment)

## System Overview

The Influmojo backend is a Node.js/Express.js REST API built with Prisma ORM and PostgreSQL database. It serves as the central hub for the influencer marketing platform, handling user authentication, profile management, package creation, order processing, chat functionality, and administrative operations.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens, Google OAuth, Phone OTP
- **File Upload**: Multer for multipart/form-data
- **Chat**: StreamChat integration
- **Payment**: Integration ready for payment gateways
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Database Schema

### Core User System

#### User Table
```sql
model User {
  id                        BigInt                 @id @default(autoincrement())
  email                     String?                @unique
  password_hash             String?
  user_type                 UserType               // creator, brand, agent, admin
  name                      String
  first_name                String?
  last_name                 String?
  profile_image_url         String?
  cover_image_url           String?
  phone                     String?                @unique
  timezone                  String?
  language                  String?                @default("en")
  email_verified            Boolean                @default(false)
  status                    UserStatus             @default(pending)
  created_at                DateTime               @default(now())
  updated_at                DateTime               @updatedAt
  last_login_at             DateTime?
  auth_provider             String?                @default("email")
  phone_verified            Boolean                @default(false)
  onboarding_completed      Boolean                @default(false)
  onboarding_step           Int?                   @default(0)
  age                       Int?
  is_online                 Boolean                @default(true)
  last_online_at            DateTime?
  agent_status              AgentStatus            @default(available)
}
```

#### User Types & Status
- **UserType**: creator, brand, agent, admin
- **UserStatus**: pending, active, suspended, banned
- **AgentStatus**: available, busy, offline

### Brand Profile System

#### BrandProfile Table
```sql
model BrandProfile {
  id                   BigInt          @id @default(autoincrement())
  user_id              BigInt
  company_name         String
  industry             String?         // Primary industry
  industries           Json?           // Array of selected industries
  role_in_organization String?
  business_type        String?         // SME, Startup, Enterprise
  website_url          String?
  description          String?
  logo_url             String?
  location_country     String?
  location_state       String?
  location_city        String?
  location_pincode     String?
  languages            Json?           // Array of selected languages
  date_of_birth        DateTime?
  gender               String?
  verified             Boolean         @default(false)
  created_at           DateTime        @default(now())
  updated_at           DateTime        @updatedAt
}
```

**Brand Registration Flow:**
1. User signs up with email/phone or Google OAuth
2. User selects "brand" role during onboarding
3. Basic user record created in User table
4. BrandProfile record created with user_id reference
5. User completes profile setup with company details
6. Brand preferences saved (industries, languages, etc.)

### Creator Profile System

#### CreatorProfile Table
```sql
model CreatorProfile {
  id                    BigInt                @id @default(autoincrement())
  user_id               BigInt                @unique
  bio                   String?
  location_city         String?
  location_state        String?
  location_pincode      String?
  content_categories    Json?                 // Array of content categories
  min_rate              Decimal?
  max_rate              Decimal?
  rate_currency         String?               @default("USD")
  availability_status   AvailabilityStatus?   @default(available)
  verified              Boolean               @default(false)
  featured              Boolean               @default(false)
  rating                Decimal?              @default(0.00)
  total_collaborations  Int                   @default(0)
  created_at            DateTime              @default(now())
  updated_at            DateTime              @updatedAt
}
```

**Creator Registration Flow:**
1. User signs up with email/phone or Google OAuth
2. User selects "creator" role during onboarding
3. Basic user record created in User table
4. CreatorProfile record created with user_id reference
5. User completes profile setup with bio, categories, rates
6. Creator preferences saved (content categories, pricing, availability)

### Package & Order System

#### Package Table
```sql
model Package {
  id              BigInt        @id @default(autoincrement())
  creator_id      BigInt
  platform        String        // Instagram, YouTube, TikTok, etc.
  content_type    String        // Reel, Story, Feed post, etc.
  quantity        Int
  revisions       Int           @default(0)
  duration        String?       // Video duration
  price           Decimal
  description     String?
  is_active       Boolean       @default(true)
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  creator         CreatorProfile @relation(fields: [creator_id], references: [id])
  orders          Order[]
}
```

#### Order Table
```sql
model Order {
  id                BigInt        @id @default(autoincrement())
  brand_id          BigInt
  creator_id        BigInt
  package_id         BigInt?
  status            OrderStatus   @default(pending)
  total_amount      Decimal
  currency          String        @default("USD")
  requirements      String?
  deadline          DateTime?
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt
  brand             BrandProfile  @relation(fields: [brand_id], references: [id])
  creator           CreatorProfile @relation(fields: [creator_id], references: [id])
  package           Package?      @relation(fields: [package_id], references: [id])
  payments          Payment[]
  messages          Message[]
  content_submissions ContentSubmission[]
}
```

**Package Creation Flow:**
1. Creator navigates to CreatePackageScreen
2. Selects platform (Instagram, YouTube, TikTok, etc.)
3. Chooses content type (Reel, Story, Feed post, etc.)
4. Sets quantity, revisions, duration, price
5. Adds description and saves package
6. Package stored in Package table with creator_id reference

**Order Processing Flow:**
1. Brand browses creators on BrandHome screen
2. Clicks on creator to view profile and packages
3. Selects package and adds to cart
4. Proceeds to checkout with requirements and deadline
5. Order created in Order table linking brand, creator, and package
6. Payment processing initiated
7. Order status updated based on payment and fulfillment

### Chat & Communication System

#### Message Table
```sql
model Message {
  id              BigInt        @id @default(autoincrement())
  sender_id       BigInt
  receiver_id     BigInt
  order_id        BigInt?
  content         String
  message_type    MessageType   @default(text)
  is_read         Boolean       @default(false)
  created_at      DateTime      @default(now())
  sender          User          @relation("MessageSender", fields: [sender_id], references: [id])
  receiver        User          @relation("MessageReceiver", fields: [receiver_id], references: [id])
  order           Order?        @relation(fields: [order_id], references: [id])
}
```

**Chat Implementation:**
- StreamChat integration for real-time messaging
- Order-specific chat channels
- File sharing and media support
- Read receipts and typing indicators
- Chat history persistence

### Payment & Billing System

#### Payment Table
```sql
model Payment {
  id              BigInt          @id @default(autoincrement())
  order_id        BigInt
  amount          Decimal
  currency        String          @default("USD")
  payment_method  PaymentMethod
  status          PaymentStatus   @default(pending)
  transaction_id  String?
  payment_date    DateTime?
  created_at      DateTime        @default(now())
  updated_at      DateTime        @updatedAt
  order           Order           @relation(fields: [order_id], references: [id])
  admin           User?           @relation("AdminPayments", fields: [admin_id], references: [id])
  payee           User?           @relation("PaymentPayee", fields: [payee_id], references: [id])
  payer           User?           @relation("PaymentPayer", fields: [payer_id], references: [id])
}
```

**Payment Flow:**
1. Order created with total amount
2. Payment record created with pending status
3. Payment gateway integration (configurable)
4. Transaction processing and verification
5. Payment status updated (success/failed)
6. Order status updated based on payment

### Admin & Agent System

#### Ticket Table
```sql
model Ticket {
  id              BigInt          @id @default(autoincrement())
  user_id         BigInt
  agent_id        BigInt?
  subject         String
  description     String
  status          TicketStatus    @default(open)
  priority        TicketPriority  @default(medium)
  category        String?
  created_at      DateTime        @default(now())
  updated_at      DateTime        @updatedAt
  user            User            @relation("TicketUser", fields: [user_id], references: [id])
  agent           User?           @relation("TicketAgent", fields: [agent_id], references: [id])
}
```

**Admin Dashboard Features:**
- User management and verification
- Order monitoring and dispute resolution
- Payment processing and refunds
- Content review and approval
- Analytics and reporting
- System configuration

## API Architecture

### Route Structure
```
/src/routes/
├── auth.js          # Authentication endpoints
├── profile.js       # User profile management
├── packages.js      # Package CRUD operations
├── orders.js        # Order processing
├── chat.js          # Chat functionality
├── crm.js           # Customer relationship management
└── admin.js         # Administrative operations
```

### Authentication Endpoints

#### POST /auth/signup
- User registration with email/phone or Google OAuth
- Role selection (brand/creator)
- JWT token generation
- Profile initialization

#### POST /auth/login
- Email/password authentication
- Google OAuth verification
- Phone OTP verification
- Session management

#### POST /auth/verify-otp
- Phone number verification
- OTP validation and user activation
- Profile completion status update

### Profile Management Endpoints

#### POST /profile/update-basic-info
- Basic profile information update
- Validation and sanitization
- Profile completion tracking

#### POST /profile/update-preferences
- Industry and category preferences
- Language and location settings
- Brand/creator specific preferences

#### GET /profile/creators
- Creator discovery for brands
- Filtering by platform, category, location
- Pagination and search functionality

### Package Management Endpoints

#### POST /packages/create
- Package creation by creators
- Validation and pricing setup
- Active/inactive status management

#### GET /packages/creator/:id
- Creator's package portfolio
- Pricing and availability information
- Order history and reviews

### Order Processing Endpoints

#### POST /orders/create
- Order creation from package selection
- Requirements and deadline specification
- Payment initiation

#### PUT /orders/:id/status
- Order status updates
- Workflow progression tracking
- Notification triggers

## Security & Validation

### Input Validation
- Express-validator middleware
- Request sanitization
- SQL injection prevention
- XSS protection

### Authentication Security
- JWT token expiration
- Refresh token rotation
- Rate limiting
- CORS configuration

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Audit logging
- GDPR compliance

## Error Handling

### Global Error Handler
- Centralized error processing
- Consistent error response format
- Logging and monitoring
- Client-friendly error messages

### Validation Errors
- Field-level validation feedback
- Custom error messages
- Client-side validation support

## Deployment & Environment

### Environment Variables
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=google_oauth_client_id
TWILIO_ACCOUNT_SID=twilio_account_sid
TWILIO_AUTH_TOKEN=twilio_auth_token
STREAMCHAT_API_KEY=streamchat_api_key
STREAMCHAT_API_SECRET=streamchat_api_secret
```

### Database Migrations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Production Considerations
- Environment-specific configurations
- Database connection pooling
- Caching strategies
- Monitoring and logging
- Backup and recovery procedures

## Integration Points

### External Services
- **Google OAuth**: User authentication
- **Twilio**: SMS OTP verification
- **StreamChat**: Real-time messaging
- **Payment Gateways**: Order processing
- **File Storage**: Media uploads

### Mobile App Integration
- RESTful API endpoints
- JWT token authentication
- Real-time updates via WebSocket
- Push notifications
- Offline data synchronization

This backend implementation provides a robust foundation for the Influmojo platform, handling all aspects of user management, content creation, order processing, and communication between brands and creators.
