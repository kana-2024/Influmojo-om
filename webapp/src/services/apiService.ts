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
    const response = await apiRequest(API_ENDPOINTS.GOOGLE_AUTH, {
      method: 'POST',
      body: JSON.stringify({ idToken, isSignup, userType }),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  // Send OTP
  sendOTP: async (phone: string) => {
    // Note: Removed x-bypass-rate-limit header to avoid CORS issues in webapp
    // Mobile app can still use this header since it doesn't have CORS restrictions
    
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
      setToken(response.token);
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