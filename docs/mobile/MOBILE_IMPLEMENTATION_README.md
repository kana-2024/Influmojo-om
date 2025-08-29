# Mobile App Implementation - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [App Architecture](#app-architecture)
4. [Navigation & Routing](#navigation--routing)
5. [Authentication Flow](#authentication-flow)
6. [User Onboarding](#user-onboarding)
7. [Brand Experience](#brand-experience)
8. [Creator Experience](#creator-experience)
9. [UI Components & Design System](#ui-components--design-system)
10. [State Management](#state-management)
11. [API Integration](#api-integration)
12. [Chat & Communication](#chat--communication)
13. [Build & Deployment](#build--deployment)

## System Overview

The Influmojo mobile app is a React Native application built with Expo, designed to facilitate connections between brands and content creators. The app provides a comprehensive platform for influencer marketing, package creation, order management, and real-time communication.

### App Features
- **Multi-role Support**: Brand, Creator, Agent, and Admin roles
- **Authentication**: Email/password, Google OAuth, and phone OTP
- **Profile Management**: Comprehensive profile setup and customization
- **Package Creation**: Content creators can create and manage service packages
- **Discovery**: Brands can browse and filter creators by various criteria
- **Order Management**: Complete order lifecycle from creation to completion
- **Real-time Chat**: Integrated messaging system for collaboration
- **Portfolio Management**: Creators can showcase their work
- **Payment Integration**: Secure payment processing for orders

## Tech Stack & Dependencies

### Core Framework
- **React Native**: 0.79.5
- **Expo**: 53.0.20 (Managed workflow)
- **TypeScript**: 5.8.3
- **React**: 19.0.0

### Navigation & Routing
- **React Navigation**: 7.1.6
- **Native Stack Navigator**: 7.1.6
- **Safe Area Context**: 5.4.0

### State Management
- **Redux Toolkit**: 2.5.0
- **React Redux**: 9.1.2
- **Redux Persist**: 6.0.0

### UI & Styling
- **Expo Vector Icons**: 14.1.0
- **React Native Reanimated**: 3.17.4
- **Linear Gradient**: 14.1.5
- **Gesture Handler**: 2.24.0

### Authentication & Communication
- **Google Sign-In**: 11.0.0
- **Stream Chat**: 9.14.0
- **Stream Chat React Native**: 8.3.2

## App Architecture

### Project Structure
```
mobile/
├── App.tsx                 # Main app entry point
├── app.config.js           # Expo configuration
├── package.json            # Dependencies and scripts
├── screens/                # Screen components
│   ├── brand/             # Brand-specific screens
│   ├── creator/           # Creator-specific screens
│   ├── agent/             # Agent-specific screens
│   └── shared/            # Common screens
├── components/             # Reusable UI components
├── services/              # API and external services
├── store/                 # Redux store and slices
├── config/                # Configuration files
└── utils/                 # Utility functions
```

## Navigation & Routing

### Navigation Structure
```typescript
// Main navigation stack
const Stack = createNativeStackNavigator();

// Screen hierarchy
├── SplashScreen
├── WelcomeScreen
├── UserRoleScreen
├── SignUpScreen
├── LoginScreen
├── OtpVerificationScreen
├── ProfileSetupScreen
├── BrandPreferencesScreen
├── CreatorPreferencesScreen
├── BrandHome
├── CreatorProfile
├── CreatePackageScreen
├── OrdersScreen
└── Chat screens
```

## Authentication Flow

### Signup Process
1. **Welcome Screen**: App introduction and get started button
2. **Role Selection**: User chooses between Brand, Creator, or Agent
3. **Signup Method**: Email/password or Google OAuth
4. **Phone Verification**: OTP sent via SMS for verification
5. **Profile Setup**: Basic information collection
6. **Preferences**: Role-specific preference selection
7. **Completion**: Profile completion and app access

### Google OAuth Integration
- **Configuration**: Google Client ID setup in app.config.js
- **Sign-in Flow**: Native Google Sign-In implementation
- **Token Handling**: JWT token generation and storage
- **Profile Sync**: Google profile data integration

## User Onboarding

### Profile Setup Screen
The `ProfileSetupScreen` handles comprehensive user profile creation:

```typescript
// Key profile fields
const [gender, setGender] = useState('Male');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [dob, setDob] = useState('');
const [city, setCity] = useState('');
const [age, setAge] = useState<number | null>(null);
```

**Features:**
- Date picker for birth date
- City selection modal
- Phone number verification
- Email verification
- Age calculation and validation
- Google account integration

### Brand Preferences Screen
`BrandPreferencesScreen` collects brand-specific information:

```typescript
// Brand preference categories
const industries = [
  'IT & Technology', 'Entertainment', 'Fashion & Beauty',
  'Food & Beverage', 'Healthcare', 'Education'
];

const businessTypes = ['SME', 'Startup', 'Enterprise'];
const languages = ['English', 'Hindi', 'Spanish', 'French'];
```

### Creator Preferences Screen
`CreatorPreferencesScreen` handles creator-specific setup:

```typescript
// Creator preference options
const contentCategories = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel',
  'Technology', 'Lifestyle', 'Business', 'Education'
];

const availabilityOptions = ['Available', 'Busy', 'Unavailable'];
const rateCurrencies = ['USD', 'EUR', 'INR'];
```

## Brand Experience

### Brand Home Screen
The `BrandHome` screen serves as the main dashboard for brands:

```typescript
// Creator discovery and filtering
const [creators, setCreators] = useState<any>({
  youtube: [],
  instagram: [],
  tiktok: [],
  twitter: [],
  facebook: []
});

const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [followerRange, setFollowerRange] = useState({ min: 5000, max: 800000 });
const [priceRange, setPriceRange] = useState<string>('all');
```

**Features:**
- Creator discovery by platform
- Advanced filtering system
- Category-based browsing
- Follower range selection
- Price range filtering
- Cart integration

### Creator Discovery Flow
1. **Platform Selection**: Choose social media platforms
2. **Category Filtering**: Filter by content categories
3. **Follower Range**: Set minimum/maximum follower counts
4. **Price Range**: Filter by package pricing
5. **Results Display**: Grid/list view of matching creators
6. **Creator Profile**: Detailed creator information and packages

## Creator Experience

### Creator Profile Screen
The `CreatorProfile` screen serves as the creator's main dashboard:

```typescript
// Profile sections and data
const [profileData, setProfileData] = useState<any>({
  basic: {},
  preferences: {},
  packages: [],
  portfolio: [],
  reviews: []
});

const [activeTab, setActiveTab] = useState('overview');
```

**Profile Sections:**
- **Overview**: Basic information and stats
- **Packages**: Service offerings and pricing
- **Portfolio**: Work showcase and examples
- **Reviews**: Client feedback and ratings
- **Settings**: Profile and preference management

### Package Creation
`CreatePackageScreen` enables creators to create service packages:

```typescript
// Package configuration options
const platforms = ['Instagram', 'Facebook', 'Youtube', 'Snapchat'];
const contentTypes = ['Reel', 'Story', 'Feed post', 'Carousel Post'];
const durations = ['30 Seconds', '45 Seconds', '1 Minute', '2 Minutes', '3 Minutes'];

// Package form state
const [platform, setPlatform] = useState('Instagram');
const [contentType, setContentType] = useState('Reel');
const [quantity, setQuantity] = useState('1');
const [revisions, setRevisions] = useState('1');
const [price, setPrice] = useState('50000');
const [desc, setDesc] = useState('');
```

### Portfolio Management
`CreatePortfolioScreen` handles creator portfolio creation:

```typescript
// Portfolio item structure
interface PortfolioItem {
  title: string;
  description: string;
  platform: string;
  category: string;
  mediaUrls: string[];
  metrics: {
    views: number;
    likes: number;
    shares: number;
  };
}
```

## UI Components & Design System

### Color Scheme
The app uses a comprehensive color system defined in `config/colors.ts`:

```typescript
export const COLORS = {
  // Primary colors
  primary: '#ffffff',    // White
  secondary: '#f37135',  // Orange
  
  // Text colors
  textDark: '#1A1D1F',
  textGray: '#6B7280',
  
  // Border and background colors
  borderLight: '#E5E7EB',
  backgroundLight: '#FFFFFF',
  
  // Chip colors (5th and 6th colors)
  chipBlue: '#aad6f3',   // 5th color - Light blue
  chipYellow: '#ffd365', // 6th color - Light yellow
  
  // Brand tertiary color
  tertiary: '#20536d',
  
  // Additional colors
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  
  // Gradient colors
  gradientOrange: ['rgb(254, 143, 0)', 'rgb(252, 82, 19)']
};
```

**Color Usage Guidelines:**
- **Primary**: Main backgrounds and containers
- **Secondary**: Primary actions and highlights
- **Tertiary (#20536d)**: Send OTP buttons and radio buttons
- **Chip Colors**: Profile page chips for brand and creator
- **Gradients**: Button backgrounds and highlights

### Component Library

#### Custom Components
- **CustomDropdown**: Platform-agnostic dropdown component
- **SelectionModal**: Multi-selection modal with search
- **PackageCard**: Package display and interaction
- **CreatorCard**: Creator profile preview
- **ChatButton**: Integrated chat functionality
- **AnimatedModalOverlay**: Smooth modal transitions

#### Modal Components
```typescript
// Modal types
const MODAL_TYPES = {
  CITY_SELECTION: 'city',
  DATE_PICKER: 'date',
  OTP_VERIFICATION: 'otp',
  GOOGLE_VERIFICATION: 'google',
  CANNED_MESSAGES: 'messages',
  FILTER: 'filter',
  CART: 'cart'
};
```

## State Management

### Redux Store Structure
```typescript
// Store configuration
const store = configureStore({
  reducer: {
    auth: authSlice,
    modal: modalSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

// Persistence configuration
const persistor = persistStore(store);
```

### Auth Slice
```typescript
// Authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Auth actions
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  }
});
```

## API Integration

### API Service Structure
```typescript
// API service organization
export const apiService = {
  authAPI: {
    signup: (data: SignupData) => apiCall('/auth/signup', 'POST', data),
    login: (data: LoginData) => apiCall('/auth/login', 'POST', data),
    verifyOtp: (data: OtpData) => apiCall('/auth/verify-otp', 'POST', data),
    getUserProfile: () => apiCall('/auth/me', 'GET')
  },
  profileAPI: {
    updateBasicInfo: (data: BasicInfoData) => apiCall('/profile/update-basic-info', 'POST', data),
    updatePreferences: (data: PreferencesData) => apiCall('/profile/update-preferences', 'POST', data),
    getCreators: () => apiCall('/profile/creators', 'GET'),
    uploadImage: (data: FormData) => apiCall('/profile/upload-image', 'POST', data)
  },
  packagesAPI: {
    createPackage: (data: PackageData) => apiCall('/packages/create', 'POST', data),
    getCreatorPackages: (creatorId: string) => apiCall(`/packages/creator/${creatorId}`, 'GET'),
    updatePackage: (id: string, data: PackageData) => apiCall(`/packages/${id}`, 'PUT', data)
  },
  ordersAPI: {
    createOrder: (data: OrderData) => apiCall('/orders/create', 'POST', data),
    getOrders: () => apiCall('/orders', 'GET'),
    updateOrderStatus: (id: string, status: string) => apiCall(`/orders/${id}/status`, 'PUT', { status })
  }
};
```

## Chat & Communication

### StreamChat Integration
```typescript
// Chat configuration
const chatConfig = {
  apiKey: process.env.EXPO_PUBLIC_STREAMCHAT_API_KEY,
  user: {
    id: user.id,
    name: user.name,
    image: user.profile_image_url
  },
  token: streamChatToken
};

// Chat components
const ChatScreen = () => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  useEffect(() => {
    const initChat = async () => {
      const newClient = StreamChat.getInstance(chatConfig.apiKey);
      await newClient.connectUser(chatConfig.user, chatConfig.token);
      setClient(newClient);
    };
    initChat();
  }, []);
};
```

### Chat Features
- **Real-time Messaging**: Instant message delivery
- **File Sharing**: Media and document uploads
- **Order-specific Channels**: Dedicated chat for each order
- **Read Receipts**: Message status tracking
- **Typing Indicators**: Real-time typing feedback
- **Push Notifications**: Message alerts

## Build & Deployment

### Expo Configuration
```javascript
// app.config.js
export default {
  expo: {
    name: 'Influmojo',
    slug: 'influmojo-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.influmojo.mobile'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.influmojo.mobile'
    },
    plugins: [
      '@react-native-google-signin/google-signin',
      'expo-document-picker'
    ]
  }
};
```

### Build Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "prebuild": "expo prebuild --clean",
    "build:android": "node scripts/build-android.js",
    "build:ios": "eas build --platform ios --profile development"
  }
}
```

### Environment Configuration
```bash
# Environment variables
EXPO_PUBLIC_API_URL=https://api.influmojo.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_STREAMCHAT_API_KEY=your_streamchat_api_key
```

This mobile implementation provides a comprehensive, user-friendly experience for both brands and creators, with robust error handling, performance optimization, and a scalable architecture that supports the platform's growth and feature expansion.
