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

  // Debug: Log the request details
  console.log('[apiService] Making request:', {
    url: endpoint,
    method: config.method || 'GET',
    hasAuthHeader: !!token,
    authHeaderLength: token?.length || 0
  });

  try {
    const response = await fetch(endpoint, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Try to get text for debugging
      const text = await response.text();
      data = { error: text };
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        console.error('[apiService] Non-JSON or error response:', {
          url: endpoint,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: text,
        });
      }
    }

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    // If error is a SyntaxError (JSON parse), wrap it
    if (error instanceof SyntaxError) {
      console.error('[apiService] JSON parse error:', error, { url: endpoint, config });
      throw new Error('Invalid server response. Please try again later.');
    }
    console.error('API request error:', error, { url: endpoint, config });
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // Google OAuth
  googleAuth: async (idToken: string, isSignup: boolean = false, userType: string = 'creator') => {
    const response = await apiRequest(API_ENDPOINTS.GOOGLE_AUTH, {
      method: 'POST',
      body: JSON.stringify({ idToken, isSignup, userType }),
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
  verifyOTP: async (phone: string, code: string, fullName?: string, userType: string = 'creator') => {
    // Debug: Check if token is present
    const token = await getToken();
    console.log('[apiService] verifyOTP - Token present:', !!token, 'Phone:', phone, 'UserType:', userType);
    
    if (!token) {
      console.warn('[apiService] verifyOTP - No JWT token found! This may cause duplicate user creation.');
    }
    
    const response = await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone, code, fullName, userType }),
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

  // Check if user exists
  checkUserExists: async (phone: string) => {
    return await apiRequest(API_ENDPOINTS.CHECK_USER_EXISTS, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },
};

// Profile API calls
export const profileAPI = {
  // Update basic info
  updateBasicInfo: async (data: {
    gender: string;
    email?: string;
    phone?: string;
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
    role?: string;
    dateOfBirth?: Date;
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

  // Create campaign
  createCampaign: async (data: {
    title: string;
    description: string;
    budget: string;
    duration: string;
    requirements: string;
    targetAudience: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.CREATE_CAMPAIGN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Create project
  createProject: async (data: {
    title: string;
    description: string;
    budget: string;
    timeline: string;
    requirements: string;
    deliverables: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.CREATE_PROJECT, {
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

  // Get creator profile
  getCreatorProfile: async () => {
    return await apiRequest(API_ENDPOINTS.GET_CREATOR_PROFILE, {
      method: 'GET',
    });
  },

  // Get brand profile
  getBrandProfile: async () => {
    return await apiRequest(API_ENDPOINTS.GET_BRAND_PROFILE, {
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