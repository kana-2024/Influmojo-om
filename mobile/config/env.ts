import Constants from 'expo-constants';

// Load environment variables from local mobile environment file
import 'dotenv/config';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.mobile') });

// Environment configuration for mobile app
// Load from local mobile environment file
const extra = Constants.expoConfig?.extra || {};

export const ENV = {
  // API Configuration - Loaded from local mobile .env.mobile file
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || extra.apiBaseUrl || 'https://api.influmojo.com',
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || extra.googleClientId || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || extra.googleClientIdAndroid || '',
  GOOGLE_CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || extra.googleClientIdIos || '',
  STREAMCHAT_API_KEY: process.env.EXPO_PUBLIC_STREAMCHAT_API_KEY || extra.streamChatApiKey || '',
  
  // App Configuration - Loaded from local mobile environment
  APP_NAME: process.env.MOBILE_APP_NAME || 'Influ Mojo',
  APP_VERSION: process.env.MOBILE_APP_VERSION || '1.0.0',
  APP_BUILD_NUMBER: process.env.MOBILE_BUILD_NUMBER || '1',
  BUNDLE_ID: process.env.MOBILE_BUNDLE_ID || 'com.influmojo.mobile',
  
  // Mobile-specific configuration
  API_TIMEOUT: parseInt(process.env.MOBILE_API_TIMEOUT) || 30000,
  CACHE_DURATION: parseInt(process.env.MOBILE_CACHE_DURATION) || 3600000,
  GOOGLE_REDIRECT_URI: process.env.MOBILE_GOOGLE_REDIRECT_URI || 'com.influmojo.mobile:/oauth2redirect',
  FACEBOOK_REDIRECT_URI: process.env.MOBILE_FACEBOOK_REDIRECT_URI || 'com.influmojo.mobile://authorize',
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
  console.log('=== Mobile Environment Variables Debug ===');
  console.log('Environment file loaded from:', path.join(__dirname, '../.env.mobile'));
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('ENV.API_BASE_URL:', ENV.API_BASE_URL);
  console.log('ENV.APP_NAME:', ENV.APP_NAME);
  console.log('ENV.APP_VERSION:', ENV.APP_VERSION);
  console.log('ENV.BUNDLE_ID:', ENV.BUNDLE_ID);
  console.log('API_ENDPOINTS.LOGIN:', API_ENDPOINTS.LOGIN);
  
  // Validate that we're using the correct API URL
  if (ENV.API_BASE_URL === 'https://api.influmojo.com') {
    console.log('✅ API_BASE_URL is correctly configured for production');
  } else if (ENV.API_BASE_URL === 'http://localhost:3002') {
    console.log('✅ API_BASE_URL is correctly configured for development');
  } else {
    console.log('⚠️  API_BASE_URL is using fallback URL:', ENV.API_BASE_URL);
  }
} 