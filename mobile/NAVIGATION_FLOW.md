# Navigation Flow Documentation

## Overview
This document outlines the complete navigation flow for the Influ Mojo app, including both creator and brand user journeys.

## Screen Organization

### Root Level Screens
- `SplashScreen` - App launch screen
- `WelcomeScreen` - Welcome/landing page
- `LoginScreen` - User login
- `UserRoleScreen` - Role selection (Creator/Brand)
- `SignUpScreen` - User registration
- `OtpVerificationScreen` - Phone verification
- `MobileVerifiedScreen` - Mobile verification success
- `GoogleVerifiedScreen` - Google verification success
- `ProfileSetupScreen` - Basic profile setup
- `ProfileCompleteScreen` - Profile completion screen

### Creator Flow Screens (`/screens/creator/`)
- `CreatorPreferencesScreen` - Creator preferences setup
- `CreatorProfile` - Creator main profile
- `CreatePackageScreen` - Package creation modal
- `CreatePortfolioScreen` - Portfolio creation modal

### Brand Flow Screens (`/screens/brand/`)
- `BrandPreferencesScreen` - Brand preferences setup
- `BrandProfile` - Brand main profile
- `CreateCampaignScreen` - Campaign creation modal
- `CreateProjectScreen` - Project creation modal

## Navigation Flow

### 1. App Launch Flow
```
SplashScreen → WelcomeScreen
```

### 2. Login Flow
```
WelcomeScreen → LoginScreen
```

**Login Success Navigation:**
- **Existing User (Google)**: `LoginScreen → CreatorProfile` or `BrandProfile` (based on user_type)
- **Existing User (Phone)**: `LoginScreen → CreatorProfile` (default, should be updated based on user_type)
- **New User**: `LoginScreen → SignUp`

### 3. Signup Flow
```
WelcomeScreen → UserRoleScreen → CreatorPreferencesScreen/BrandPreferencesScreen
```

**Creator Signup:**
```
UserRoleScreen → CreatorPreferencesScreen → CreatorProfile
```

**Brand Signup:**
```
UserRoleScreen → BrandPreferencesScreen → BrandProfile
```

### 4. Profile Setup Flow
```
ProfileSetupScreen → CreatorProfile (default)
ProfileCompleteScreen → CreatorProfile (default)
```

### 5. Modal Navigation

**Creator Profile Modals:**
- `CreatorProfile` → `CreatePackageScreen` (modal)
- `CreatorProfile` → `CreatePortfolioScreen` (modal)
- `CreatorProfile` → `KycModal` (modal)

**Brand Profile Modals:**
- `BrandProfile` → `CreateCampaignScreen` (modal)
- `BrandProfile` → `CreateProjectScreen` (modal)
- `BrandProfile` → `KycModal` (modal)

## User Type Detection

### Google Login
The backend returns `user_type` in the response:
- `user_type: 'creator'` → Navigate to `CreatorProfile`
- `user_type: 'brand'` → Navigate to `BrandProfile`

### Phone Login
Currently defaults to `CreatorProfile`. Should be updated to check user type from backend.

## Screen Features

### CreatorProfile
- **Tabs**: Packages, Portfolio, KYC, Payments
- **Modals**: Create Package, Create Portfolio, KYC
- **Content**: Creator-specific information and actions

### BrandProfile
- **Tabs**: Campaigns, Projects, KYC, Payments
- **Modals**: Create Campaign, Create Project, KYC
- **Content**: Brand-specific information and actions

## Navigation Stack Configuration

```typescript
<Stack.Navigator initialRouteName="SplashScreen">
  <Stack.Screen name="SplashScreen" component={SplashScreen} />
  <Stack.Screen name="Welcome" component={WelcomeScreen} />
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="UserRole" component={UserRoleScreen} />
  <Stack.Screen name="SignUp" component={SignUpScreen} />
  <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
  <Stack.Screen name="MobileVerification" component={MobileVerifiedScreen} />
  <Stack.Screen name="GoogleVerification" component={GoogleVerifiedScreen} />
  <Stack.Screen name="CreatorPreferences" component={CreatorPreferencesScreen} />
  <Stack.Screen name="BrandPreferences" component={BrandPreferencesScreen} />
  <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  <Stack.Screen name="ProfileComplete" component={ProfileCompleteScreen} />
  <Stack.Screen name="CreatorProfile" component={CreatorProfile} />
  <Stack.Screen name="BrandProfile" component={BrandProfile} />
  <Stack.Screen name="ProfileComplete" component={ProfileCompleteScreen} />
  <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
</Stack.Navigator>
```

## Future Improvements

1. **User Type Detection**: Update phone login to properly detect user type
2. **Profile Setup**: Update ProfileSetupScreen to navigate based on user type
3. **Backend Integration**: Ensure all user type information is properly stored and retrieved
4. **Navigation Guards**: Add proper navigation guards based on authentication state
5. **Deep Linking**: Implement deep linking for specific screens

## Notes

- All screens maintain the same design language
- Modals are implemented using `AnimatedModalOverlay`
- Navigation uses React Navigation v6
- User type detection is primarily handled on the backend
- Default navigation is to CreatorProfile for backward compatibility 