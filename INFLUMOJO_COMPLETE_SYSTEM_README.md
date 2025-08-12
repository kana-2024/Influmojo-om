# Influmojo Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [User Journey & Flows](#user-journey--flows)
4. [Database Relationships](#database-relationships)
5. [API Endpoints Summary](#api-endpoints-summary)
6. [Mobile App Features](#mobile-app-features)
7. [Backend Services](#backend-services)
8. [Admin Dashboard](#admin-dashboard)
9. [Integration Points](#integration-points)
10. [Security & Compliance](#security--compliance)
11. [Deployment & Infrastructure](#deployment--infrastructure)

## System Overview

Influmojo is a comprehensive influencer marketing platform that connects brands with content creators. The system consists of three main components:

- **Mobile App**: React Native application for brands, creators, and agents
- **Backend API**: Node.js/Express.js REST API with PostgreSQL database
- **Admin Dashboard**: Web-based administrative interface for platform management

### Platform Purpose
The platform facilitates:
- **Brand Discovery**: Brands can find and connect with relevant creators
- **Package Creation**: Creators can create and manage service offerings
- **Order Management**: Complete workflow from order creation to completion
- **Communication**: Real-time chat between brands and creators
- **Payment Processing**: Secure financial transactions
- **Content Management**: Portfolio and content submission handling

## Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App   │    │  Backend API    │    │ Admin Dashboard │
│  (React Native)│◄──►│  (Node.js/      │◄──►│   (Web App)     │
│                │    │   Express.js)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   StreamChat    │    │   PostgreSQL    │    │   File Storage  │
│   (Real-time    │    │   Database      │    │   (Media &      │
│   Messaging)    │    │                 │    │   Documents)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React Native (Mobile), HTML/CSS/JS (Admin)
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, Google OAuth, Phone OTP
- **Chat**: StreamChat
- **File Upload**: Multer
- **Payment**: Integration ready for payment gateways

## User Journey & Flows

### Brand User Journey
1. **Registration & Onboarding**
   - Sign up with email/phone or Google OAuth
   - Select "brand" role
   - Complete profile setup (company details, industry, location)
   - Set preferences (industries, languages, target audience)

2. **Creator Discovery**
   - Browse creators by platform (Instagram, YouTube, TikTok, etc.)
   - Filter by categories, follower range, location, price
   - View creator profiles and portfolios
   - Review ratings and previous work

3. **Package Selection & Ordering**
   - Select desired packages from creators
   - Add to cart with quantity and requirements
   - Specify project requirements and deadlines
   - Complete checkout and payment

4. **Collaboration & Communication**
   - Real-time chat with creators
   - Share project requirements and feedback
   - Track order progress
   - Review and approve content

5. **Order Management**
   - View all active and completed orders
   - Track order status and progress
   - Manage payments and invoices
   - Provide feedback and ratings

### Creator User Journey
1. **Registration & Onboarding**
   - Sign up with email/phone or Google OAuth
   - Select "creator" role
   - Complete profile setup (bio, categories, location)
   - Set pricing and availability preferences

2. **Profile & Portfolio Setup**
   - Create comprehensive creator profile
   - Upload portfolio items with performance metrics
   - Set content categories and specialties
   - Configure pricing for different service types

3. **Package Creation**
   - Create service packages for different platforms
   - Set pricing, quantity, and revision limits
   - Define content types and delivery timelines
   - Manage package availability and status

4. **Order Management**
   - Receive and review incoming orders
   - Accept or reject order requests
   - Track order progress and deadlines
   - Submit content for review

5. **Communication & Delivery**
   - Chat with brands about requirements
   - Submit content and revisions
   - Handle feedback and modifications
   - Complete orders and receive payments

## Database Relationships

### Core User System
```
User (Base user table)
├── BrandProfile (Brand-specific information)
│   ├── Campaign (Marketing campaigns)
│   ├── Collaboration (Brand-creator partnerships)
│   └── Order (Orders placed by brand)
├── CreatorProfile (Creator-specific information)
│   ├── Package (Service offerings)
│   ├── PortfolioItem (Work showcase)
│   └── Order (Orders received by creator)
└── Admin/Agent (Platform management)
    ├── Ticket (Support tickets)
    ├── ContentReview (Content moderation)
    └── Payment (Financial management)
```

### Order Flow Relationships
```
Order
├── Brand (Order initiator)
├── Creator (Order executor)
├── Package (Service details)
├── Payment (Financial transaction)
├── Message (Communication history)
└── ContentSubmission (Delivered content)
```

### Key Database Tables
1. **User**: Base user information and authentication
2. **BrandProfile**: Brand-specific details and preferences
3. **CreatorProfile**: Creator-specific details and capabilities
4. **Package**: Service offerings with pricing and details
5. **Order**: Order management and workflow tracking
6. **Message**: Communication between users
7. **Payment**: Financial transaction records
8. **Ticket**: Support and administrative tickets

## API Endpoints Summary

### Authentication Routes (`/auth`)
- `POST /signup` - User registration
- `POST /login` - User authentication
- `POST /verify-otp` - Phone verification
- `POST /google-auth` - Google OAuth
- `GET /me` - Get user profile

### Profile Routes (`/profile`)
- `POST /update-basic-info` - Update basic information
- `POST /update-preferences` - Update user preferences
- `GET /creators` - Get creator listings
- `POST /upload-image` - Upload profile images

### Package Routes (`/packages`)
- `POST /create` - Create new package
- `GET /creator/:id` - Get creator packages
- `PUT /:id` - Update package
- `DELETE /:id` - Delete package

### Order Routes (`/orders`)
- `POST /create` - Create new order
- `GET /` - Get user orders
- `PUT /:id/status` - Update order status
- `GET /:id` - Get order details

### Chat Routes (`/chat`)
- `POST /token` - Get StreamChat token
- `GET /channels` - Get chat channels
- `POST /message` - Send message

### CRM Routes (`/crm`)
- `POST /ticket` - Create support ticket
- `GET /tickets` - Get user tickets
- `PUT /ticket/:id` - Update ticket

## Mobile App Features

### Core Functionality
- **Multi-role Support**: Brand, Creator, Agent, Admin
- **Authentication**: Multiple signup methods
- **Profile Management**: Comprehensive profile setup
- **Discovery**: Advanced creator filtering
- **Order Management**: Complete order lifecycle
- **Real-time Chat**: Integrated messaging
- **Portfolio Management**: Work showcase
- **Payment Integration**: Secure transactions

### User Experience Features
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Navigation**: Intuitive user flow
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Basic offline functionality
- **Push Notifications**: Important updates and alerts

### Technical Features
- **TypeScript**: Type-safe development
- **Redux State Management**: Centralized state
- **API Integration**: RESTful API consumption
- **File Upload**: Image and media handling
- **Performance Optimization**: Efficient rendering

## Backend Services

### Core Services
- **User Management**: Registration, authentication, profiles
- **Profile Management**: Brand and creator profile handling
- **Package Management**: Service package CRUD operations
- **Order Processing**: Order workflow management
- **Chat Integration**: StreamChat service integration
- **Payment Processing**: Financial transaction handling
- **File Management**: Media upload and storage
- **Notification System**: User alerts and updates

### Business Logic
- **Matching Algorithm**: Brand-creator matching
- **Order Workflow**: Status management and progression
- **Payment Flow**: Transaction processing and verification
- **Content Moderation**: Review and approval system
- **Analytics**: Platform usage and performance metrics

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request sanitization
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin security
- **Data Encryption**: Sensitive data protection

## Admin Dashboard

### Administrative Functions
- **User Management**: User verification and moderation
- **Order Monitoring**: Order tracking and dispute resolution
- **Content Review**: Content approval and moderation
- **Payment Management**: Financial oversight and refunds
- **Analytics**: Platform performance and usage metrics
- **System Configuration**: Platform settings and features

### Agent Support System
- **Ticket Management**: Support ticket handling
- **User Support**: Direct user assistance
- **Content Moderation**: Review and approval workflow
- **Dispute Resolution**: Order conflict management

### Reporting & Analytics
- **User Metrics**: Registration and activity statistics
- **Order Analytics**: Order volume and completion rates
- **Revenue Tracking**: Payment and financial metrics
- **Platform Performance**: System health and usage

## Integration Points

### External Services
- **Google OAuth**: User authentication
- **Twilio**: SMS OTP verification
- **StreamChat**: Real-time messaging
- **Payment Gateways**: Order processing
- **File Storage**: Media and document storage

### Mobile Integration
- **RESTful APIs**: Standard HTTP communication
- **WebSocket**: Real-time updates
- **Push Notifications**: Mobile alerts
- **Offline Sync**: Data synchronization

### Third-party Integrations
- **Social Media**: Platform-specific APIs
- **Analytics**: Usage tracking and metrics
- **Monitoring**: System health and performance
- **Backup**: Data protection and recovery

## Security & Compliance

### Security Measures
- **Authentication**: Multi-factor authentication
- **Authorization**: Role-based access control
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Request sanitization
- **Rate Limiting**: API abuse prevention

### Compliance Features
- **GDPR Compliance**: Data privacy protection
- **Data Retention**: Configurable data lifecycle
- **Audit Logging**: Comprehensive activity tracking
- **Privacy Controls**: User data management

### Data Protection
- **Encryption**: AES-256 encryption
- **Secure Storage**: Protected data storage
- **Access Control**: Limited data access
- **Backup Security**: Encrypted backups

## Deployment & Infrastructure

### Environment Configuration
```bash
# Core environment variables
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=google_oauth_client_id
TWILIO_ACCOUNT_SID=twilio_account_sid
STREAMCHAT_API_KEY=streamchat_api_key
```

### Deployment Process
1. **Development**: Local development environment
2. **Testing**: Staging environment testing
3. **Production**: Live production deployment
4. **Monitoring**: Performance and health monitoring

### Infrastructure Requirements
- **Database**: PostgreSQL with connection pooling
- **File Storage**: Scalable media storage
- **CDN**: Content delivery network
- **Load Balancer**: Traffic distribution
- **Monitoring**: System health tracking

### Scaling Considerations
- **Database Scaling**: Read replicas and sharding
- **API Scaling**: Horizontal scaling and load balancing
- **File Storage**: Distributed storage systems
- **Caching**: Redis and CDN caching
- **Microservices**: Service decomposition

## System Benefits

### For Brands
- **Efficient Discovery**: Find relevant creators quickly
- **Quality Assurance**: Verified creator profiles
- **Streamlined Process**: Simple order and payment flow
- **Communication Tools**: Direct chat with creators
- **Project Management**: Order tracking and management

### For Creators
- **Business Growth**: Access to brand opportunities
- **Profile Showcase**: Professional portfolio display
- **Secure Payments**: Reliable payment processing
- **Client Communication**: Direct brand interaction
- **Work Management**: Order and project tracking

### For Platform
- **Scalable Architecture**: Growth-ready infrastructure
- **Revenue Generation**: Transaction-based business model
- **Data Insights**: Comprehensive analytics
- **Quality Control**: Content and user moderation
- **Market Expansion**: Multi-platform support

This comprehensive system provides a robust foundation for influencer marketing, connecting brands with creators through a secure, scalable, and user-friendly platform. The architecture supports growth and feature expansion while maintaining high performance and security standards.
