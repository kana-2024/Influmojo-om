// Environment configuration for webapp
export const ENV = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://51.21.152.83:3001',
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
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