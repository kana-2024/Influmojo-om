import { API_ENDPOINTS } from '../config/env';
import { getToken as getStoredToken, setToken as setStoredToken, clearToken as clearStoredToken } from './storage';

// JSON validation helper
const isJson = (str: any): boolean => {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    return typeof result === 'object' || Array.isArray(result);
  } catch (e) {
    return false;
  }
};

// Safe JSON parse helper
const safeJsonParse = (str: any, fallback: any = null) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  if (!isJson(str)) return fallback;
  
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('Failed to parse JSON:', str);
    return fallback;
  }
};

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
    
    // First, try to get the response as text
    const responseText = await response.text();
    
    // Check if it's valid JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[apiService] JSON parse error for JSON content-type:', {
          url: endpoint,
          status: response.status,
          responseText: responseText.substring(0, 200), // Log first 200 chars
          parseError
        });
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
    } else {
      // Non-JSON response
      console.error('[apiService] Non-JSON response:', {
        url: endpoint,
        status: response.status,
        contentType,
        responseText: responseText.substring(0, 200), // Log first 200 chars
      });
      
      // If it's an error response, create a proper error object
      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
      }
      
      // If it's not an error but not JSON, try to parse it anyway
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Unexpected response format: ${responseText.substring(0, 100)}`);
      }
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${responseText.substring(0, 100)}`);
    }

    return data;
  } catch (error) {
    console.error('[apiService] Request failed:', {
      url: endpoint,
      error: error.message,
      config: { method: config.method, hasAuth: !!token }
    });
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
    const headers = {
      'Content-Type': 'application/json',
      // Add bypass header in development
      ...(process.env.NODE_ENV !== 'production' && { 'x-bypass-rate-limit': 'true' })
    };
    
    return await apiRequest(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      headers,
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
  // Get available industries
  getIndustries: async () => {
    return await apiRequest(API_ENDPOINTS.GET_INDUSTRIES, {
      method: 'GET',
    });
  },

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

  // Update package
  updatePackage: async (data: any) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PACKAGE, {
      method: 'PUT',
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
    const response = await apiRequest(API_ENDPOINTS.GET_CREATOR_PROFILE, {
      method: 'GET',
    });
    
    // Safely parse JSON fields if they exist
    if (response.success && response.data) {
      response.data.interests = safeJsonParse(response.data.interests, []);
      response.data.content_categories = safeJsonParse(response.data.content_categories, []);
      response.data.social_media_accounts = safeJsonParse(response.data.social_media_accounts, []);
      response.data.portfolio_items = safeJsonParse(response.data.portfolio_items, []);
    }
    
    return response;
  },

  // Get brand profile
  getBrandProfile: async () => {
    const response = await apiRequest(API_ENDPOINTS.GET_BRAND_PROFILE, {
      method: 'GET',
    });
    
    // Safely parse JSON fields if they exist
    if (response.success && response.data) {
      response.data.industries = safeJsonParse(response.data.industries, []);
      response.data.languages = safeJsonParse(response.data.languages, []);
      response.data.campaigns = safeJsonParse(response.data.campaigns, []);
      response.data.collaborations = safeJsonParse(response.data.collaborations, []);
    }
    
    return response;
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