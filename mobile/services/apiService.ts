import { API_ENDPOINTS } from '../config/env';
import { getToken as getStoredToken, setToken as setStoredToken, clearToken as clearStoredToken } from './storage';

// Get stored token
const getToken = async (): Promise<string | null> => {
  return await getStoredToken();
};

// Set stored token
const setToken = async (token: string): Promise<void> => {
  await setStoredToken(token);
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // Google OAuth
  googleAuth: async (idToken: string) => {
    const response = await apiRequest(API_ENDPOINTS.GOOGLE_AUTH, {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    
    if (response.token) {
      await setToken(response.token);
    }
    
    return response;
  },

  // Send OTP
  sendOTP: async (phone: string) => {
    return await apiRequest(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // Verify OTP
  verifyOTP: async (phone: string, code: string, fullName?: string) => {
    const response = await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone, code, fullName }),
    });
    
    if (response.token) {
      await setToken(response.token);
    }
    
    return response;
  },

  // Update user name
  updateName: async (name: string) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_NAME, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  // Get user profile
  getUserProfile: async () => {
    return await apiRequest(API_ENDPOINTS.USER_PROFILE, {
      method: 'GET',
    });
  },
};

// Profile API calls
export const profileAPI = {
  // Update basic info
  updateBasicInfo: async (data: {
    gender: string;
    email: string;
    dob: string;
    state: string;
    city: string;
    pincode: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_BASIC_INFO, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update preferences
  updatePreferences: async (data: {
    categories: string[];
    about: string;
    languages: string[];
  }) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PREFERENCES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Create package
  createPackage: async (data: {
    platform: string;
    contentType: string;
    quantity: string;
    revisions: string;
    duration1: string;
    duration2: string;
    price: string;
    description?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.CREATE_PACKAGE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Create portfolio item
  createPortfolio: async (data: {
    mediaUrl: string;
    mediaType: string;
    fileName: string;
    fileSize: number;
    mimeType?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.CREATE_PORTFOLIO, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Submit KYC
  submitKYC: async (data: {
    documentType: string;
    frontImageUrl: string;
    backImageUrl: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.SUBMIT_KYC, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get full profile
  getProfile: async () => {
    return await apiRequest(API_ENDPOINTS.GET_PROFILE, {
      method: 'GET',
    });
  },
};

// Utility functions
export const apiUtils = {
  getToken,
  setToken,
  clearToken: async () => {
    await clearStoredToken();
  },
}; 