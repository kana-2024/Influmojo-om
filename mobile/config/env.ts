import Constants from 'expo-constants';
// Environment configuration for frontend
const extra = Constants.expoConfig?.extra || {};

// Force the correct API URL - this ensures we always use the ngrok URL
const FORCE_API_URL = 'https://fair-legal-gar.ngrok-free.app';

export const ENV = {
  // API Configuration - Force the correct URL
  API_BASE_URL: FORCE_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://fair-legal-gar.ngrok-free.app',
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  GOOGLE_CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
  // Google OAuth
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
  
  // App Configuration
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${ENV.API_BASE_URL}/api/auth/login`,
  SIGNUP: `${ENV.API_BASE_URL}/api/auth/signup`,
  GOOGLE_AUTH: `${ENV.API_BASE_URL}/api/auth/google`,
  FACEBOOK_AUTH: `${ENV.API_BASE_URL}/api/auth/facebook`,
  SEND_OTP: `${ENV.API_BASE_URL}/api/auth/send-phone-verification-code`,
  VERIFY_OTP: `${ENV.API_BASE_URL}/api/auth/verify-phone-code`,
  RESEND_OTP: `${ENV.API_BASE_URL}/api/auth/resend-otp`,
  LOGOUT: `${ENV.API_BASE_URL}/api/auth/logout`,
  UPDATE_NAME: `${ENV.API_BASE_URL}/api/auth/update-name`,
  USER_PROFILE: `${ENV.API_BASE_URL}/api/auth/profile`,
  CHECK_USER_EXISTS: `${ENV.API_BASE_URL}/api/auth/check-user-exists`,

  // Profile endpoints
  GET_PROFILE: `${ENV.API_BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${ENV.API_BASE_URL}/api/profile/update`,
  UPLOAD_IMAGE: `${ENV.API_BASE_URL}/api/profile/upload-image`,
  GET_BRAND_PROFILE: `${ENV.API_BASE_URL}/api/profile/brand-profile`,
  GET_CREATOR_PROFILE: `${ENV.API_BASE_URL}/api/profile/creator-profile`,
  GET_INDUSTRIES: `${ENV.API_BASE_URL}/api/profile/industries`,
  UPDATE_BASIC_INFO: `${ENV.API_BASE_URL}/api/profile/update-basic-info`,
  UPDATE_PREFERENCES: `${ENV.API_BASE_URL}/api/profile/update-preferences`,
  UPDATE_COVER_IMAGE: `${ENV.API_BASE_URL}/api/profile/update-cover-image`,

  // Package endpoints
  GET_PACKAGES: `${ENV.API_BASE_URL}/api/profile/packages`,
  CREATE_PACKAGE: `${ENV.API_BASE_URL}/api/profile/create-package`,
  UPDATE_PACKAGE: `${ENV.API_BASE_URL}/api/profile/update-package`,
  DELETE_PACKAGE: `${ENV.API_BASE_URL}/api/profile/delete-package`,
  CREATE_PORTFOLIO: `${ENV.API_BASE_URL}/api/profile/create-portfolio`,
  CREATE_CAMPAIGN: `${ENV.API_BASE_URL}/api/profile/create-campaign`,
  SUBMIT_KYC: `${ENV.API_BASE_URL}/api/profile/submit-kyc`,

  // Order endpoints
  CREATE_ORDER: `${ENV.API_BASE_URL}/api/orders`,
  GET_ORDERS: `${ENV.API_BASE_URL}/api/orders`,
  GET_ORDER_DETAILS: `${ENV.API_BASE_URL}/api/orders/details`,
  CHECKOUT_ORDERS: `${ENV.API_BASE_URL}/api/orders/checkout`,

  // Creator endpoints
  GET_CREATORS: `${ENV.API_BASE_URL}/api/profile/creators`,
  GET_CREATOR_PROFILE_BY_ID: `${ENV.API_BASE_URL}/api/profile/creators`,
};

// Debug environment variables (only in development)
if (__DEV__) {
  console.log('=== Environment Variables Debug ===');
  console.log('FORCE_API_URL:', FORCE_API_URL);
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('EXPO_PUBLIC_GOOGLE_CLIENT_ID exists:', !!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
  console.log('EXPO_PUBLIC_GOOGLE_CLIENT_ID length:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.length || 0);
  console.log('ENV.GOOGLE_CLIENT_ID:', ENV.GOOGLE_CLIENT_ID);
  console.log('ENV.API_BASE_URL:', ENV.API_BASE_URL);
  console.log('API_ENDPOINTS.GOOGLE_AUTH:', API_ENDPOINTS.GOOGLE_AUTH);
  console.log('API_ENDPOINTS.SEND_OTP:', API_ENDPOINTS.SEND_OTP);
  
  // Validate that we're using the correct URL
  if (!ENV.API_BASE_URL.includes('fair-legal-gar.ngrok-free.app')) {
    console.error('❌ WARNING: API_BASE_URL is not using the correct ngrok URL!');
    console.error('Current URL:', ENV.API_BASE_URL);
    console.error('Expected URL: https://fair-legal-gar.ngrok-free.app');
  } else {
    console.log('✅ API_BASE_URL is correctly configured');
  }
} 