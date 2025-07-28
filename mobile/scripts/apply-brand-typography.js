/**
 * Brand Typography Implementation Script
 * 
 * This script outlines the systematic application of Influmojo brand fonts:
 * - Primary: Poppins (for body text, buttons, inputs, captions)
 * - Secondary: Alice italic (for titles, headings, paragraph titles)
 * 
 * Font Hierarchy:
 * 1. Main headings/titles: Alice-Italic (24px)
 * 2. Section titles: Poppins-SemiBold (15px)
 * 3. Body text: Poppins-Regular (18px)
 * 4. Captions: Poppins-Regular (14px)
 * 5. Button text: Poppins-Medium (16px)
 * 6. Input text: Poppins-Regular (15px)
 * 7. Links: Poppins-Medium (16px)
 */

const screensToUpdate = [
  // Authentication screens
  'mobile/screens/SignUpScreen.tsx',
  'mobile/screens/LoginScreen.tsx',
  'mobile/screens/OtpVerificationScreen.tsx',
  'mobile/screens/GoogleVerifiedScreen.tsx',
  'mobile/screens/MobileVerifiedScreen.tsx',
  
  // Onboarding screens
  'mobile/screens/WelcomeScreen.tsx',
  'mobile/screens/UserRoleScreen.tsx',
  'mobile/screens/ProfileSetupScreen.tsx',
  'mobile/screens/ProfileCompleteScreen.tsx',
  
  // Main app screens
  'mobile/screens/OrdersScreen.tsx',
  'mobile/screens/OrderDetailsScreen.tsx',
  
  // Brand screens
  'mobile/screens/brand/BrandHome.tsx',
  'mobile/screens/brand/BrandProfile.tsx',
  'mobile/screens/brand/BrandProfileSetupScreen.tsx',
  'mobile/screens/brand/BrandPreferencesScreen.tsx',
  'mobile/screens/brand/CreateProjectScreen.tsx',
  'mobile/screens/brand/CreateCampaignModal.tsx',
  
  // Creator screens
  'mobile/screens/creator/CreatorProfile.tsx',
  'mobile/screens/creator/CreatorPreferencesScreen.tsx',
  'mobile/screens/creator/CreatePackageScreen.tsx',
  'mobile/screens/creator/EditPackageScreen.tsx',
  
  // Components
  'mobile/components/modals/CityModal.tsx',
  'mobile/components/modals/RoleModal.tsx',
  'mobile/components/modals/OtpModal.tsx',
  'mobile/components/modals/FollowerRangeModal.tsx',
  'mobile/components/navigation/BottomNavBar.tsx',
  'mobile/components/CreatorCard.tsx',
  'mobile/components/PackageCard.tsx',
];

const typographyRules = {
  // Main headings - Alice italic
  title: {
    fontFamily: 'FONTS.secondary.italic',
    fontSize: 24,
    fontWeight: '700'
  },
  
  // Section titles - Poppins semi-bold
  sectionTitle: {
    fontFamily: 'FONTS.primary.semiBold',
    fontSize: 15,
    fontWeight: '600'
  },
  
  // Body text - Poppins regular
  body: {
    fontFamily: 'FONTS.primary.regular',
    fontSize: 18,
    fontWeight: 'normal'
  },
  
  // Captions - Poppins regular
  caption: {
    fontFamily: 'FONTS.primary.regular',
    fontSize: 14,
    fontWeight: 'normal'
  },
  
  // Button text - Poppins medium
  button: {
    fontFamily: 'FONTS.primary.medium',
    fontSize: 16,
    fontWeight: '500'
  },
  
  // Input text - Poppins regular
  input: {
    fontFamily: 'FONTS.primary.regular',
    fontSize: 15,
    fontWeight: 'normal'
  },
  
  // Links - Poppins medium
  link: {
    fontFamily: 'FONTS.primary.medium',
    fontSize: 16,
    fontWeight: '500'
  }
};

console.log('Brand Typography Implementation Plan:');
console.log('=====================================');
console.log('');
console.log('Screens to update:', screensToUpdate.length);
console.log('Typography rules:', Object.keys(typographyRules).length);
console.log('');
console.log('Implementation steps:');
console.log('1. Add FONTS import to each file');
console.log('2. Update title styles to use Alice-Italic');
console.log('3. Update body text to use Poppins-Regular');
console.log('4. Update button text to use Poppins-Medium');
console.log('5. Update input fields to use Poppins-Regular');
console.log('6. Update captions to use Poppins-Regular (14px)');
console.log('7. Update section titles to use Poppins-SemiBold');
console.log('');
console.log('Files already updated:');
console.log('- mobile/screens/SignUpScreen.tsx');
console.log('- mobile/screens/LoginScreen.tsx');
console.log('');
console.log('Remaining files:', screensToUpdate.length - 2); 