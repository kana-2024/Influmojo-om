// Environment configuration for frontend
export const ENV = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
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
  USER_PROFILE: `${ENV.API_BASE_URL}/api/auth/profile`,
  
  // Health check
  HEALTH: `${ENV.API_BASE_URL}/api/health`,
}; 