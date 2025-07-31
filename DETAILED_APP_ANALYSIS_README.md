# 🚀 Influ Mojo - Complete App Analysis & Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [App Architecture](#app-architecture)
3. [User Types & Flows](#user-types--flows)
4. [Technical Stack](#technical-stack)
5. [Database Schema](#database-schema)
6. [Key Features](#key-features)
7. [API Structure](#api-structure)
8. [Mobile App Structure](#mobile-app-structure)
9. [Backend Services](#backend-services)
10. [Integration Services](#integration-services)
11. [State Management](#state-management)
12. [Navigation Flow](#navigation-flow)
13. [Security & Authentication](#security--authentication)
14. [Development Setup](#development-setup)
15. [Deployment](#deployment)

## 🎯 Overview

**Influ Mojo** is a comprehensive influencer marketing platform that connects brands with content creators. The app facilitates collaboration between brands seeking influencer partnerships and creators offering their services.

### Core Value Proposition
- **For Brands**: Discover and collaborate with verified influencers across multiple social media platforms
- **For Creators**: Showcase portfolios, create service packages, and connect with brands
- **Platform Features**: Order management, payment processing, KYC verification, and live chat support

## 🏗️ App Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │   External      │
│   (React Native)│◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Creator Flow  │    │ • Express.js    │    │ • Zoho CRM      │
│ • Brand Flow    │    │ • Prisma ORM    │    │ • Zoho Chat     │
│ • Authentication│    │ • PostgreSQL    │    │ • Twilio SMS    │
│ • State Mgmt    │    │ • JWT Auth      │    │ • Google OAuth  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth + Phone OTP
- **State Management**: Redux Toolkit with Redux Persist
- **External Integrations**: Zoho CRM, Zoho Chat, Twilio, Google OAuth

## 👥 User Types & Flows

### 1. Creator User Flow
```
Sign Up → Role Selection (Creator) → Preferences Setup → Profile Creation → Package/Portfolio Setup → KYC Verification → Start Receiving Orders
```

**Creator Features:**
- Profile management with social media accounts
- Package creation (predefined services)
- Portfolio showcase
- Order management
- KYC verification
- Payment tracking

### 2. Brand User Flow
```
Sign Up → Role Selection (Brand) → Preferences Setup → Profile Creation → Campaign Creation → Creator Discovery → Order Placement → Collaboration Management
```

**Brand Features:**
- Brand profile management
- Campaign creation
- Creator discovery and filtering
- Order placement
- Collaboration tracking
- Payment processing

## 💻 Technical Stack

### Mobile App (React Native + Expo)
```json
{
  "framework": "React Native 0.79.5",
  "expo": "53.0.20",
  "navigation": "@react-navigation/native",
  "state": "@reduxjs/toolkit + redux-persist",
  "storage": "@react-native-async-storage/async-storage",
  "ui": "Custom components + @expo/vector-icons",
  "auth": "@react-native-google-signin/google-signin",
  "chat": "react-native-zohosalesiq-mobilisten"
}
```

### Backend (Node.js + Express)
```json
{
  "runtime": "Node.js",
  "framework": "Express.js 4.18.2",
  "database": "PostgreSQL + Prisma ORM",
  "authentication": "JWT + bcryptjs",
  "validation": "express-validator",
  "security": "helmet + cors + rate-limiting",
  "external": "axios, twilio, google-auth-library"
}
```

## 🗄️ Database Schema

### Core Models

#### User Management
- **User**: Base user model with authentication and profile data
- **BrandProfile**: Brand-specific information and preferences
- **CreatorProfile**: Creator-specific information and social media accounts
- **SocialMediaAccount**: Creator's social media platform details

#### Content & Services
- **Package**: Creator service packages
- **PortfolioItem**: Creator portfolio showcase
- **Campaign**: Brand campaign definitions
- **CampaignApplication**: Creator applications to campaigns

#### Collaboration & Orders
- **Order**: Package orders between brands and creators
- **Collaboration**: Active collaborations from campaigns
- **ContentSubmission**: Submitted content for review
- **ContentReview**: Review and feedback system

#### Communication & Support
- **Message**: In-app messaging system
- **CollaborationChannel**: Communication channels
- **Notification**: System notifications
- **KYC**: Know Your Customer verification

#### Financial
- **Payment**: Payment transactions
- **Invoice**: Invoice generation and tracking

### Key Relationships
```sql
-- User can be either Brand or Creator
User (1) ←→ (1) BrandProfile
User (1) ←→ (1) CreatorProfile

-- Creator can have multiple social accounts
CreatorProfile (1) ←→ (N) SocialMediaAccount

-- Orders connect Brands and Creators through Packages
BrandProfile (1) ←→ (N) Order (N) ←→ (1) CreatorProfile
Package (1) ←→ (N) Order

-- Campaigns and Applications
BrandProfile (1) ←→ (N) Campaign (1) ←→ (N) CampaignApplication (N) ←→ (1) CreatorProfile
```

## ✨ Key Features

### 1. Authentication System
- **Multi-provider**: Google OAuth + Phone OTP + Email/Password
- **Role-based**: Creator vs Brand user types
- **Secure**: JWT tokens with refresh mechanism
- **Verification**: Phone and email verification flows

### 2. Profile Management
- **Dynamic Profiles**: Different fields for creators vs brands
- **Media Upload**: Profile images and cover photos
- **Social Integration**: Social media account linking
- **Preferences**: User preferences and categories

### 3. Creator Features
- **Package Creation**: Predefined service packages
- **Portfolio Management**: Showcase previous work
- **Social Media Integration**: Platform-specific metrics
- **KYC Verification**: Identity and bank verification

### 4. Brand Features
- **Campaign Creation**: Define campaign requirements
- **Creator Discovery**: Filter and search creators
- **Order Management**: Place and track orders
- **Collaboration Tracking**: Monitor campaign progress

### 5. Order System
- **Package Orders**: Direct package purchases
- **Campaign Applications**: Creator applications to campaigns
- **Status Tracking**: Order lifecycle management
- **Payment Integration**: Secure payment processing

### 6. Communication
- **In-app Messaging**: Real-time chat between users
- **Zoho Chat Integration**: Live customer support
- **Notifications**: System and user notifications
- **Review System**: Mutual rating and feedback

### 7. External Integrations
- **Zoho CRM**: Contact and deal management
- **Zoho Chat**: Live customer support
- **Twilio**: SMS verification
- **Google OAuth**: Social login
- **Cloudinary**: Media upload and management

## 🔌 API Structure

### Authentication Endpoints
```
POST /api/auth/google-mobile          # Google OAuth login
POST /api/auth/send-phone-verification-code  # Send OTP
POST /api/auth/verify-phone-code      # Verify OTP
POST /api/auth/update-name            # Update user name
GET  /api/auth/profile                # Get user profile
POST /api/auth/check-user-exists      # Check user existence
```

### Profile Management
```
PUT  /api/profile/update-basic-info   # Update basic profile
PUT  /api/profile/update-preferences  # Update user preferences
PUT  /api/profile/update-cover-image  # Upload cover image
GET  /api/profile/industries          # Get industry list
POST /api/profile/create-package      # Create service package
PUT  /api/profile/update-package      # Update package
DELETE /api/profile/delete-package    # Delete package
POST /api/profile/create-portfolio    # Create portfolio item
POST /api/profile/create-campaign     # Create campaign
POST /api/profile/submit-kyc          # Submit KYC documents
GET  /api/profile/profile             # Get user profile
GET  /api/profile/creator-profile     # Get creator profile
GET  /api/profile/brand-profile       # Get brand profile
```

### Creator Discovery
```
GET  /api/profile/creators            # Get all creators
GET  /api/profile/creators?platform=  # Filter by platform
GET  /api/profile/creators/:id        # Get specific creator
```

### Order Management
```
GET  /api/orders                      # Get user orders
GET  /api/orders/:id                  # Get order details
POST /api/orders/checkout             # Process order checkout
```

### Zoho Integration
```
POST /api/zoho/sync-contact           # Sync user to Zoho CRM
POST /api/zoho/create-deal            # Create Zoho deal
POST /api/zoho/create-task            # Create Zoho task
POST /api/zoho/chat/initialize        # Initialize chat
POST /api/zoho/chat/send-message      # Send chat message
GET  /api/zoho/chat/history           # Get chat history
GET  /api/zoho/test-connection        # Test Zoho connection
GET  /api/zoho/config/status          # Check config status
```

## 📱 Mobile App Structure

### Screen Organization
```
mobile/screens/
├── common/                    # Shared screens
│   ├── SplashScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── UserRoleScreen.tsx
│   ├── OtpVerificationScreen.tsx
│   ├── ProfileSetupScreen.tsx
│   └── ProfileCompleteScreen.tsx
├── creator/                   # Creator-specific screens
│   ├── CreatorPreferencesScreen.tsx
│   ├── CreatorProfile.tsx
│   ├── CreatePackageScreen.tsx
│   ├── CreatePortfolioScreen.tsx
│   └── EditPackageScreen.tsx
├── brand/                     # Brand-specific screens
│   ├── BrandPreferencesScreen.tsx
│   ├── BrandProfile.tsx
│   ├── BrandHome.tsx
│   ├── CreateCampaignScreen.tsx
│   ├── CreateProjectScreen.tsx
│   └── CreateCampaignModal.tsx
└── shared/                    # Shared functionality
    ├── OrdersScreen.tsx
    └── OrderDetailsScreen.tsx
```

### Component Architecture
```
mobile/components/
├── modals/                    # Modal components
│   ├── ModalWrapper.tsx
│   ├── OtpModal.tsx
│   ├── KycModal.tsx
│   ├── CartModal.tsx
│   └── [other modals]
├── navigation/
│   └── BottomNavBar.tsx
├── cards/
│   ├── CreatorCard.tsx
│   ├── PackageCard.tsx
│   └── CreatorSection.tsx
├── forms/
│   ├── CustomDropdown.tsx
│   ├── CheckboxItem.tsx
│   └── SelectionModal.tsx
└── chat/
    ├── ChatButton.tsx
    └── ZohoChatWidget.tsx
```

### State Management
```typescript
// Redux Store Structure
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    userType: 'creator' | 'brand' | null,
    signupForm: SignupForm,
    isLoading: boolean,
    error: string | null
  },
  modal: {
    showOtpModal: boolean,
    showKycModal: boolean,
    showCartModal: boolean,
    // ... other modal states
  }
}
```

## 🔧 Backend Services

### Core Services
- **AuthService**: Authentication and user management
- **ProfileService**: Profile CRUD operations
- **OrderService**: Order processing and management
- **PackageService**: Package CRUD operations
- **ZohoService**: Zoho CRM and Chat integration
- **ImageService**: Media upload and management

### Middleware
- **Authentication**: JWT token validation
- **Validation**: Request data validation
- **Rate Limiting**: API rate limiting
- **CORS**: Cross-origin resource sharing
- **Error Handling**: Global error handling

### Database Operations
- **Prisma ORM**: Type-safe database queries
- **Migrations**: Database schema versioning
- **Seeding**: Initial data population
- **Connection Pooling**: Optimized database connections

## 🔗 Integration Services

### Zoho CRM Integration
- **Contact Sync**: Automatic user profile sync
- **Deal Creation**: Order/collaboration tracking
- **Task Management**: Follow-up task creation
- **Webhook Handling**: Real-time updates

### Zoho Chat Integration
- **Live Chat Widget**: In-app customer support
- **Visitor Profiles**: User context in chat
- **Chat History**: Persistent chat sessions
- **Agent Management**: Support team coordination

### Twilio Integration
- **SMS Verification**: Phone number verification
- **OTP Delivery**: Secure one-time passwords
- **Rate Limiting**: SMS sending limits

### Google OAuth
- **Social Login**: Google account authentication
- **Profile Sync**: Google profile data import
- **Token Management**: OAuth token handling

## 🎨 Design System

### Color Palette
```typescript
const COLORS = {
  primary: '#f8f4e8',    // Cream background
  secondary: '#f37135',  // Orange accent
  tertiary: '#20536d',   // Blue tertiary (for buttons)
  textDark: '#1A1D1F',   // Dark text
  textGray: '#6B7280',   // Gray text
  chipBlue: '#aad6f3',   // Light blue chips
  chipYellow: '#ffd365', // Light yellow chips
}
```

### Typography
- **Primary Font**: System fonts with fallbacks
- **Secondary Font**: Italic fonts for headings
- **Font Weights**: Regular, Medium, SemiBold, Bold

### Component Patterns
- **Consistent Spacing**: 8px grid system
- **Rounded Corners**: 8px border radius
- **Shadow System**: Subtle elevation shadows
- **Modal Overlays**: Animated modal presentations

## 🔐 Security & Authentication

### Authentication Flow
1. **User Registration**: Email/Phone + Google OAuth
2. **Phone Verification**: SMS OTP verification
3. **Role Assignment**: Creator or Brand selection
4. **Profile Setup**: Basic information collection
5. **JWT Token**: Secure session management

### Security Measures
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Cross-origin security
- **Input Validation**: Request data sanitization
- **HTTPS**: Secure communication

### Data Protection
- **User Privacy**: Minimal data collection
- **KYC Verification**: Secure document handling
- **Payment Security**: Secure payment processing
- **Data Encryption**: Sensitive data encryption

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Expo CLI
- Android Studio / Xcode

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run db:generate
npm run db:push
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
cp .env.example .env
# Configure environment variables
npx expo start
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
ZOHO_CLIENT_ID="your-zoho-client-id"
ZOHO_CLIENT_SECRET="your-zoho-client-secret"

# Mobile (.env)
EXPO_PUBLIC_API_URL="http://localhost:3001"
EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

## 📦 Deployment

### Backend Deployment
- **Platform**: Node.js hosting (Heroku, Railway, etc.)
- **Database**: PostgreSQL hosting (Supabase, Railway, etc.)
- **Environment**: Production environment variables
- **Monitoring**: Error tracking and logging

### Mobile Deployment
- **Platform**: Expo Application Services (EAS)
- **Build**: Android APK + iOS IPA
- **Distribution**: App Store + Google Play Store
- **Updates**: Over-the-air updates via Expo

### CI/CD Pipeline
- **Code Quality**: ESLint + Prettier
- **Testing**: Unit and integration tests
- **Build**: Automated build process
- **Deployment**: Automated deployment pipeline

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Analytics**: Performance tracking and insights
2. **Payment Gateway**: Integrated payment processing
3. **Content Management**: Advanced content creation tools
4. **AI Recommendations**: Smart creator-brand matching
5. **Multi-language Support**: Internationalization
6. **Push Notifications**: Real-time notifications
7. **Video Calling**: In-app video consultations
8. **Advanced Search**: AI-powered creator discovery

### Technical Improvements
1. **Performance Optimization**: Code splitting and lazy loading
2. **Caching Strategy**: Redis caching implementation
3. **Microservices**: Service decomposition
4. **Real-time Features**: WebSocket integration
5. **Offline Support**: Offline-first architecture
6. **Testing Coverage**: Comprehensive test suite

## 📚 Documentation References

- [Navigation Flow](./mobile/NAVIGATION_FLOW.md)
- [Zoho Integration](./ZOHO_INTEGRATION_README.md)
- [Database Setup](./DATABASE_SETUP.md)
- [Orders Feature](./ORDERS_FEATURE_README.md)
- [Package System](./PACKAGES_CAMPAIGNS_SEPARATION.md)
- [User Management](./USER_MANAGEMENT_README.md)

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configuration
2. **Git Flow**: Feature branches with pull requests
3. **Testing**: Write tests for new features
4. **Documentation**: Update documentation for changes
5. **Code Review**: Peer review for all changes

### Project Structure
- **Modular Architecture**: Clear separation of concerns
- **Type Safety**: TypeScript throughout the codebase
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging for debugging
- **Monitoring**: Performance and error monitoring

---

**Influ Mojo** represents a modern, scalable influencer marketing platform with comprehensive features for both creators and brands. The architecture supports growth and can be extended with additional features as the platform evolves. 