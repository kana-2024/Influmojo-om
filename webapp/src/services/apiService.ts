import { API_ENDPOINTS, ENV } from '@/config/env';

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
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Set stored token
const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

// Clear stored token
const clearToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
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
    let data;
    const contentType = response.headers.get('content-type');
    
    const responseText = await response.text();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[apiService] JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
    } else {
      throw new Error(`Non-JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[apiService] Request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  signup: async (userData: any) => {
    const response = await apiRequest(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  // Google OAuth
  googleAuth: async (idToken: string, isSignup: boolean = false, userType: string = 'creator') => {
    console.log('🔄 Google auth API called with:', { isSignup, userType });
    console.log('🔑 ID token preview:', idToken.substring(0, 50) + '...');
    
    // Use a simple request format that should work with the backend
    try {
      const requestBody = { idToken, isSignup, userType };
      console.log('📤 Request body:', requestBody);
      console.log('🌐 API endpoint:', API_ENDPOINTS.GOOGLE_AUTH);
      
      const response = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('🔍 Google auth response status:', response.status);
      console.log('🔍 Google auth response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Google auth failed:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Google auth successful:', data);
      
      if (data.token) {
        console.log('🔑 Storing JWT token from Google auth');
        setToken(data.token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('🔍 Token stored successfully:', storedToken ? 'Yes' : 'No');
      } else {
        console.warn('⚠️ No token received in Google auth response');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Google auth request failed:', error);
      throw error;
    }
  },

  // Send OTP
  sendOTP: async (phone: string) => {
    // Note: Cannot use x-bypass-rate-limit header due to CORS restrictions in webapp
    // Mobile app can use this header since it doesn't have CORS restrictions
    
    return await apiRequest(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // Verify OTP
  verifyOTP: async (phone: string, code: string, fullName?: string, userType: string = 'creator') => {
    const response = await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone, code, fullName, userType }),
    });
    
    if (response.token) {
      console.log('🔑 Storing token in localStorage:', response.token.substring(0, 20) + '...');
      setToken(response.token);
      
      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Token stored successfully:', storedToken ? 'Yes' : 'No');
      if (storedToken) {
        console.log('🔍 Stored token preview:', storedToken.substring(0, 20) + '...');
      }
    } else {
      console.warn('⚠️ No token received in OTP verification response');
    }
    
    return response;
  },

  // Check if user exists
  checkUserExists: async (phone: string) => {
    return await apiRequest(API_ENDPOINTS.CHECK_USER_EXISTS, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  logout: async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearToken();
    }
  },

  getProfile: async () => {
    return await apiRequest(API_ENDPOINTS.USER_PROFILE);
  },

  getUserProfile: async () => {
    return await apiRequest(API_ENDPOINTS.USER_PROFILE);
  },

  // Create missing profiles for existing users
  createMissingProfiles: async () => {
    console.log('🔄 createMissingProfiles called');
    
    // Check if token is available
    const token = localStorage.getItem('token');
    console.log('🔍 Token available for createMissingProfiles:', token ? 'Yes' : 'No');
    if (token) {
      console.log('🔍 Token preview:', token.substring(0, 20) + '...');
    }
    
    return await apiRequest(API_ENDPOINTS.CREATE_MISSING_PROFILES, {
      method: 'POST',
    });
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    return await apiRequest(API_ENDPOINTS.GET_PROFILE);
  },

  updateProfile: async (profileData: any) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Get available industries (same as mobile)
  getIndustries: async () => {
    return await apiRequest(API_ENDPOINTS.GET_INDUSTRIES, {
      method: 'GET',
    });
  },

  // Update basic info (same as mobile)
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

  // Update preferences (same as mobile)
  updatePreferences: async (data: {
    categories: string[];
    about: string;
    languages: string[];
    platform?: string[];
    company_name?: string;
    role_in_organization?: string;
    business_type?: string;
    website_url?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PREFERENCES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getBrandProfile: async () => {
    return await apiRequest(API_ENDPOINTS.GET_BRAND_PROFILE);
  },

  getCreatorProfile: async () => {
    return await apiRequest(API_ENDPOINTS.GET_CREATOR_PROFILE);
  },

  getCreators: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`${API_ENDPOINTS.GET_CREATORS}${queryString}`);
  },

  getCreatorById: async (id: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_CREATOR_PROFILE_BY_ID}/${id}`);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getToken();
    const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  },
};

// Package API
export const packageAPI = {
  getPackages: async () => {
    return await apiRequest(API_ENDPOINTS.GET_PACKAGES);
  },

  createPackage: async (packageData: any) => {
    return await apiRequest(API_ENDPOINTS.CREATE_PACKAGE, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  },

  updatePackage: async (id: string, packageData: any) => {
    return await apiRequest(`${API_ENDPOINTS.UPDATE_PACKAGE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  },

  deletePackage: async (id: string) => {
    return await apiRequest(`${API_ENDPOINTS.DELETE_PACKAGE}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Order API
export const orderAPI = {
  getOrders: async () => {
    return await apiRequest(API_ENDPOINTS.GET_ORDERS);
  },

  createOrder: async (orderData: any) => {
    return await apiRequest(API_ENDPOINTS.CREATE_ORDER, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrderDetails: async (id: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_ORDER_DETAILS}/${id}`);
  },

  checkoutOrders: async (orderIds: string[]) => {
    return await apiRequest(API_ENDPOINTS.CHECKOUT_ORDERS, {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    });
  },
};

export default {
  authAPI,
  profileAPI,
  packageAPI,
  orderAPI,
}; 