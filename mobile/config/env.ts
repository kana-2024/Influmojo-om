import Constants from 'expo-constants';
// Environment configuration for frontend
const extra = Constants.expoConfig?.extra || {};
export const ENV = {
  // API Configuration
  
  API_BASE_URL: extra.apiBaseUrl || 'http://192.168.1.1:3002',
  GOOGLE_CLIENT_ID: extra.googleClientId || '',
  // Google OAuth
 
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
  
  // App Configuration
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  GOOGLE_AUTH: `${ENV.API_BASE_URL}/api/auth/google-mobile`,
  SEND_OTP: `${ENV.API_BASE_URL}/api/auth/send-phone-verification-code`,
  VERIFY_OTP: `${ENV.API_BASE_URL}/api/auth/verify-phone-code`,
  UPDATE_NAME: `${ENV.API_BASE_URL}/api/auth/update-name`,
  USER_PROFILE: `${ENV.API_BASE_URL}/api/auth/profile`,
  
  // Profile endpoints
  UPDATE_BASIC_INFO: `${ENV.API_BASE_URL}/api/profile/update-basic-info`,
  UPDATE_PREFERENCES: `${ENV.API_BASE_URL}/api/profile/update-preferences`,
  CREATE_PACKAGE: `${ENV.API_BASE_URL}/api/profile/create-package`,
  CREATE_PORTFOLIO: `${ENV.API_BASE_URL}/api/profile/create-portfolio`,
  SUBMIT_KYC: `${ENV.API_BASE_URL}/api/profile/submit-kyc`,
  GET_PROFILE: `${ENV.API_BASE_URL}/api/profile/profile`,
  
  // Health check
  HEALTH: `${ENV.API_BASE_URL}/api/health`,
};

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('EXPO_PUBLIC_GOOGLE_CLIENT_ID exists:', !!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
console.log('EXPO_PUBLIC_GOOGLE_CLIENT_ID length:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.length || 0);
console.log('ENV.GOOGLE_CLIENT_ID:', ENV.GOOGLE_CLIENT_ID);
console.log('ENV.API_BASE_URL:', ENV.API_BASE_URL);
console.log('API_ENDPOINTS.SEND_OTP:', API_ENDPOINTS.SEND_OTP); 