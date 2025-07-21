# 📱 Mobile Screens Organization

This directory contains all the screens for the Influ Mojo mobile app, organized by user type and functionality.

## 📁 Directory Structure

```
mobile/screens/
├── index.ts                    # Main export file for all screens
├── README.md                   # This documentation file
├── creator/                    # Creator-specific screens
│   ├── CreatorPreferencesScreen.tsx
│   ├── CreatePortfolioScreen.tsx
│   └── CreatePackageScreen.tsx
├── brand/                      # Brand-specific screens
│   ├── BrandPreferencesScreen.tsx
│   ├── CreateCampaignScreen.tsx
│   └── CreateProjectScreen.tsx
└── [common screens]            # Shared screens for both user types
    ├── ProfileSetupScreen.tsx
    ├── SignUpScreen.tsx
    ├── OtpVerificationScreen.tsx
    ├── SplashScreen.tsx
    ├── UserRoleScreen.tsx
    ├── WelcomeScreen.tsx
    ├── Profile.tsx
    ├── ProfileCompleteScreen.tsx
    ├── GoogleVerifiedScreen.tsx
    └── MobileVerifiedScreen.tsx
```

## 🎯 Screen Categories

### **Common Screens** (Shared between Creator and Brand)
These screens are used by both user types and contain the same logic and design:

- **ProfileSetupScreen** - User profile setup with dynamic email/phone fields
- **SignUpScreen** - User registration with Google/Phone options
- **OtpVerificationScreen** - OTP verification for phone signup
- **SplashScreen** - App loading screen
- **UserRoleScreen** - User type selection (Creator/Brand)
- **WelcomeScreen** - Welcome screen after role selection
- **Profile** - User profile management
- **ProfileCompleteScreen** - Profile completion confirmation
- **GoogleVerifiedScreen** - Google OAuth success screen
- **MobileVerifiedScreen** - Phone verification success screen

### **Creator-Specific Screens**
These screens are designed specifically for content creators:

- **CreatorPreferencesScreen** - Creator preferences and categories
- **CreatePortfolioScreen** - Portfolio item creation and upload
- **CreatePackageScreen** - Service package creation for creators

### **Brand-Specific Screens**
These screens are designed specifically for brands:

- **BrandPreferencesScreen** - Brand preferences and categories
- **CreateCampaignScreen** - Campaign creation and media upload
- **CreateProjectScreen** - Project creation for brands

## 🔄 Screen Flow

### Creator Flow:
1. SplashScreen → WelcomeScreen → UserRoleScreen (select "Creator")
2. SignUpScreen → OtpVerificationScreen (if phone) / GoogleVerifiedScreen (if Google)
3. CreatorPreferencesScreen → ProfileSetupScreen → ProfileCompleteScreen
4. Profile (with access to CreatePortfolioScreen and CreatePackageScreen)

### Brand Flow:
1. SplashScreen → WelcomeScreen → UserRoleScreen (select "Brand")
2. SignUpScreen → OtpVerificationScreen (if phone) / GoogleVerifiedScreen (if Google)
3. BrandPreferencesScreen → ProfileSetupScreen → ProfileCompleteScreen
4. Profile (with access to CreateCampaignScreen and CreateProjectScreen)

## 🎨 Design Consistency

- **Same Design Language**: All screens maintain the same visual design and UX patterns
- **Consistent Styling**: Uses the same color scheme, typography, and component styles
- **Responsive Layout**: All screens are optimized for different screen sizes
- **Accessibility**: Consistent accessibility features across all screens

## 🔧 Technical Implementation

### Importing Screens:
```typescript
// Import from the main index file
import { 
  CreatorPreferencesScreen, 
  BrandPreferencesScreen,
  ProfileSetupScreen 
} from '../screens';

// Or import directly from specific folders
import CreatorPreferencesScreen from '../screens/creator/CreatorPreferencesScreen';
import BrandPreferencesScreen from '../screens/brand/BrandPreferencesScreen';
```

### Navigation:
```typescript
// Navigate based on user type
if (userType === 'creator') {
  navigation.navigate('CreatorPreferences');
} else {
  navigation.navigate('BrandPreferences');
}
```

## 📝 Key Differences Between Creator and Brand Screens

### Creator vs Brand Preferences:
- **Creator**: "Welcome to the creator community!" + content creation focus
- **Brand**: "Welcome to the brand community!" + brand collaboration focus

### Creator vs Brand Content Creation:
- **Creator**: Portfolio items and service packages
- **Brand**: Campaigns and projects

### API Endpoints:
- **Creator**: Uses `createPortfolio` and `createPackage` APIs
- **Brand**: Uses `createCampaign` and `createProject` APIs (to be implemented)

## 🚀 Future Enhancements

1. **Brand-specific API endpoints** need to be implemented in the backend
2. **Campaign management** features for brands
3. **Project tracking** for brand campaigns
4. **Creator discovery** features for brands
5. **Analytics dashboard** for both user types

## 🔍 Notes

- All screens maintain the same design and UX patterns
- Only the content, labels, and API calls differ between creator and brand versions
- The user type is determined by the selection in UserRoleScreen
- Navigation flows are identical, just with different screen names
- Import paths have been updated to reflect the new folder structure 