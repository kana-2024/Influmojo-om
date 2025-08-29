// Environment configuration for webapp
// Supports both development and production with AWS Parameter Store integration

// Determine environment - use process.env directly to avoid Next.js conflicts
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// API Configuration - Dynamic based on environment
export const ENV = {
  // API Configuration - Use relative URLs for production (ALB routing), absolute for development
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 
                 (isProduction ? '/api' : 'http://localhost:5000'),
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  // App Configuration
  APP_NAME: 'Influ Mojo',
  APP_VERSION: '1.0.0',
  
  // Environment info - accessed directly from process.env
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
};

// API endpoints - dynamic based on environment
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
  CREATE_MISSING_PROFILES: `${ENV.API_BASE_URL}/api/auth/create-missing-profiles`,

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
  GET_ORDER_DETAILS: `${ENV.API_BASE_URL}/api/orders`,
  CHECKOUT_ORDERS: `${ENV.API_BASE_URL}/api/orders/checkout`,
  GET_BRAND_ORDERS: `${ENV.API_BASE_URL}/api/orders`,
  GET_CREATOR_ORDERS: `${ENV.API_BASE_URL}/api/orders`,
  UPDATE_ORDER_STATUS: `${ENV.API_BASE_URL}/api/orders/status`,
  SUBMIT_DELIVERABLES: `${ENV.API_BASE_URL}/api/orders`,

  // Creator endpoints
  GET_CREATORS: `${ENV.API_BASE_URL}/api/profile/creators`,
  GET_CREATOR_PROFILE_BY_ID: `${ENV.API_BASE_URL}/api/profile/creators`,

  // Cart endpoints
  ADD_TO_CART: `${ENV.API_BASE_URL}/api/cart/add`,
  GET_CART: `${ENV.API_BASE_URL}/api/cart`,
  REMOVE_FROM_CART: `${ENV.API_BASE_URL}/api/cart/remove`,
  UPDATE_CART_ITEM: `${ENV.API_BASE_URL}/api/cart/update`,

  // CRM and Ticket endpoints
  GET_TICKET_MESSAGES: `${ENV.API_BASE_URL}/api/crm/tickets`,
  SEND_TICKET_MESSAGE: `${ENV.API_BASE_URL}/api/crm/tickets`,
  GET_TICKET_BY_ORDER: `${ENV.API_BASE_URL}/api/crm/tickets/order`,
  UPDATE_TICKET_STATUS: `${ENV.API_BASE_URL}/api/crm/tickets`,
  UPDATE_AGENT_STATUS: `${ENV.API_BASE_URL}/api/crm/agent/status`,
  GET_AGENT_STATUS: `${ENV.API_BASE_URL}/api/crm/tickets`,
};

// Debug environment variables (only in development)
if (typeof window !== 'undefined' && isDevelopment) {
  console.log('=== Environment Variables Debug ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('ENV.API_BASE_URL:', ENV.API_BASE_URL);
  console.log('ENV.IS_PRODUCTION:', ENV.IS_PRODUCTION);
  console.log('ENV.IS_DEVELOPMENT:', ENV.IS_DEVELOPMENT);
  console.log('API_ENDPOINTS.GOOGLE_AUTH:', API_ENDPOINTS.GOOGLE_AUTH);
  console.log('API_ENDPOINTS.SEND_OTP:', API_ENDPOINTS.SEND_OTP);
  
  // Validate that we're using the correct URL for the environment
  if (isProduction && !ENV.API_BASE_URL.startsWith('/api')) {
    console.error('❌ WARNING: Production mode but API_BASE_URL is not using relative path!');
    console.error('Current URL:', ENV.API_BASE_URL);
    console.error('Expected URL: /api (relative path for ALB routing)');
  } else if (isDevelopment && !ENV.API_BASE_URL.includes('localhost')) {
    console.error('❌ WARNING: Development mode but API_BASE_URL is not using localhost!');
    console.error('Current URL:', ENV.API_BASE_URL);
    console.error('Expected URL: http://localhost:5000');
  } else {
    console.log('✅ API_BASE_URL is correctly configured for', isProduction ? 'production (relative path)' : 'development');
  }
} 