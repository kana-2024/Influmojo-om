import { API_ENDPOINTS } from '@/config/env';

// JSON validation helper
const isJson = (str: unknown): boolean => {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    return typeof result === 'object' || Array.isArray(result);
  } catch (e) {
    return false;
  }
};

// Safe JSON parse helper
const safeJsonParse = (str: unknown, fallback: unknown = null) => {
  if (!str) return fallback;
  if (typeof str === 'object' && str !== null) return str;
  if (!isJson(str)) return fallback;
  
  try {
    return JSON.parse(str as string);
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

  signup: async (userData: {
    email: string;
    password: string;
    fullName: string;
    userType: string;
    phone?: string;
  }) => {
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
      response.data.languages = safeJsonParse(response.data.languages, []);
      response.data.content_categories = safeJsonParse(response.data.content_categories, []);
      response.data.social_media_accounts = safeJsonParse(response.data.social_media_accounts, []);
      response.data.portfolio_items = safeJsonParse(response.data.portfolio_items, []);
    }
    
    return response;
  },

  // Get brand profile
  getBrandProfile: async () => {
    const response = await apiRequest(`${API_ENDPOINTS.GET_BRAND_PROFILE}?_t=${Date.now()}`, {
      method: 'GET',
    });
    
    // Safely parse JSON fields if they exist
    if (response.success && response.data) {
      response.data.industries = safeJsonParse(response.data.industries, []);
      response.data.languages = safeJsonParse(response.data.languages, []);
      response.data.campaigns = safeJsonParse(response.data.campaigns, []);
      response.data.collaborations = safeJsonParse(response.data.collaborations, []);
      response.data.portfolio_items = safeJsonParse(response.data.portfolio_items, []);
    }
    
    return response;
  },

  // Get all creators for brand home screen
  getCreators: async () => {
    const response = await apiRequest(API_ENDPOINTS.GET_CREATORS, {
      method: 'GET',
    });
    
    // Safely parse JSON fields if they exist
    if (response.success && response.data) {
      Object.keys(response.data).forEach(platform => {
        if (response.data[platform] && Array.isArray(response.data[platform])) {
          response.data[platform].forEach((creator: {
          id: string;
          name: string;
          profile_image?: string;
          rating?: number;
          followers?: string;
          engagement_rate?: number;
          categories?: string[];
          city?: string;
          state?: string;
          age?: number;
          date_of_birth?: string;
          languages?: unknown;
          content_categories?: unknown;
          social_media_accounts?: unknown;
          portfolio_items?: unknown;
          user?: {
            age?: number;
            date_of_birth?: string;
          };
        }) => {
            creator.languages = safeJsonParse(creator.languages, []);
            creator.content_categories = safeJsonParse(creator.content_categories, []);
            creator.social_media_accounts = safeJsonParse(creator.social_media_accounts, []);
            creator.portfolio_items = safeJsonParse(creator.portfolio_items, []);
          });
        }
      });
    }
    
    return response;
  },

  // Get creator profile by ID
  getCreatorProfileById: async (creatorId: string, platform?: string) => {
    const endpoint = platform 
      ? `${API_ENDPOINTS.GET_CREATOR_PROFILE_BY_ID}/${platform}/${creatorId}`
      : `${API_ENDPOINTS.GET_CREATOR_PROFILE_BY_ID}/${creatorId}`;
    
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    
    // Safely parse JSON fields if they exist
    if (response.success && response.data) {
      response.data.languages = safeJsonParse(response.data.languages, []);
      response.data.content_categories = safeJsonParse(response.data.content_categories, []);
      response.data.social_media_accounts = safeJsonParse(response.data.social_media_accounts, []);
      response.data.portfolio_items = safeJsonParse(response.data.portfolio_items, []);
    }
    
    return response;
  },

  // Update profile
  updateProfile: async (profileData: {
    fullName?: string;
    gender?: string;
    state?: string;
    city?: string;
    pincode?: string;
    languages?: string[];
    email?: string;
    phone?: string;
    bio?: string;
    content_categories?: string[];
    coverImage?: string;
    profilePicture?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Cart Management
  addToCart: async (packageId: string, creatorId: string, quantity: number = 1) => {
    return await apiRequest(API_ENDPOINTS.ADD_TO_CART, {
      method: 'POST',
      body: JSON.stringify({
        package_id: packageId,
        creator_id: creatorId,
        quantity: quantity
      }),
    });
  },

  getCart: async () => {
    return await apiRequest(API_ENDPOINTS.GET_CART);
  },

  removeFromCart: async (cartItemId: string) => {
    return await apiRequest(API_ENDPOINTS.REMOVE_FROM_CART, {
      method: 'DELETE',
      body: JSON.stringify({ cart_item_id: cartItemId }),
    });
  },

  updateCartItemQuantity: async (cartItemId: string, quantity: number) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_CART_ITEM, {
      method: 'PUT',
      body: JSON.stringify({
        cart_item_id: cartItemId,
        quantity: quantity
      }),
    });
  },

  // Get packages
  getPackages: async () => {
    return await apiRequest(API_ENDPOINTS.GET_PACKAGES, {
      method: 'GET',
    });
  },

  // Create package
  createPackage: async (data: {
    platform: string;
    contentType: string;
    quantity: number;
    revisions: number;
    duration1: string;
    duration2: string;
    price: number;
    description?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.CREATE_PACKAGE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update package
  updatePackage: async (packageId: string, data: {
    platform?: string;
    content_type?: string; // Changed from contentType to match backend
    quantity?: string;
    revisions?: string;
    duration1?: string;
    duration2?: string;
    price?: string;
    description?: string;
  }) => {
    // Include the package ID in the request body as expected by the backend
    const requestData = {
      id: packageId,
      ...data
    };
    
    return await apiRequest(API_ENDPOINTS.UPDATE_PACKAGE, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  // Delete package
  deletePackage: async (packageId: string) => {
    return await apiRequest(`${API_ENDPOINTS.DELETE_PACKAGE}/${packageId}`, {
      method: 'DELETE',
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

  // Submit KYC
  submitKYC: async (data: {
    documentType: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    aadhaarData?: {
    aadhaarNumber: string;
    aadhaarImage?: string;
  };
    verificationMethod?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.SUBMIT_KYC, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update basic info
  updateBasicInfo: async (data: {
    gender?: string;
    city?: string;
    business_type?: string;
    role?: string;
    website_url?: string;
    phone?: string;
    email?: string;
    about?: string;
    dob?: string;
    state?: string;
    pincode?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_BASIC_INFO, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update preferences
  updatePreferences: async (data: {
    content_categories?: string[];
    languages?: string[];
    categories?: string[];        // Backend expects 'categories' for brands
    industries?: string[];        // Keep for backward compatibility
    about?: string;               // Backend requires 'about' for brands
    target_audience?: string[];
    collaboration_types?: string[];
    budget_range?: string;
    campaign_duration?: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PREFERENCES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get industries
  getIndustries: async () => {
    return await apiRequest(API_ENDPOINTS.GET_INDUSTRIES, {
      method: 'GET',
    });
  },
};

// Orders API calls
export const ordersAPI = {
  // Get all orders
  getOrders: async () => {
    return await apiRequest(API_ENDPOINTS.GET_ORDERS, {
      method: 'GET',
    });
  },

  // Get specific order details
  getOrderDetails: async (orderId: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_ORDER_DETAILS}/${orderId}`, {
      method: 'GET',
    });
  },

  // Checkout orders from cart
  checkoutOrders: async (cartItems: any[]) => {
    return await apiRequest(API_ENDPOINTS.CHECKOUT_ORDERS, {
      method: 'POST',
      body: JSON.stringify({ cartItems }),
    });
  },

  // Submit deliverables for an order (creators only)
  submitDeliverables: async (orderId: string, deliverables: any[]) => {
    return await apiRequest(`${API_ENDPOINTS.GET_ORDERS}/${orderId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify({ deliverables }),
    });
  },

  // Accept order (creators only)
  acceptOrder: async (orderId: string) => {
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      throw new Error('Invalid order ID provided');
    }

    try {
      const response = await apiRequest(`${API_ENDPOINTS.GET_ORDERS}/${orderId}/accept`, {
        method: 'PUT',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to accept order');
      }

      return response;
    } catch (error) {
      console.error('[apiService] Error accepting order:', error);
      throw new Error(error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to accept order. Please try again.');
    }
  },

  // Reject order (creators only)
  rejectOrder: async (orderId: string, rejectionMessage?: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_ORDERS}/${orderId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionMessage }),
    });
  },

  // Get chat information for an order
  getOrderChat: async (orderId: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_ORDERS}/${orderId}/chat`, {
      method: 'GET',
    });
  },

  // Enable chat for an existing order
  enableOrderChat: async (orderId: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_ORDERS}/${orderId}/enable-chat`, {
      method: 'POST',
    });
  },

  // Get brand orders
  getBrandOrders: async () => {
    return await apiRequest(API_ENDPOINTS.GET_BRAND_ORDERS);
  },

  // Get creator orders
  getCreatorOrders: async () => {
    return await apiRequest(API_ENDPOINTS.GET_CREATOR_ORDERS);
  },
};

// Ticket API calls
export const ticketAPI = {
  // Get messages for a specific ticket
  getTicketMessages: async (ticketId: string, loadOlderMessages: boolean = false) => {
    const queryParams = loadOlderMessages ? '?loadOlderMessages=true' : '';
    return await apiRequest(`${API_ENDPOINTS.GET_TICKET_MESSAGES}/${ticketId}/messages${queryParams}`, {
      method: 'GET',
    });
  },

  // Send message to a ticket
  sendTicketMessage: async (ticketId: string, messageData: {
    message_text: string;
    sender_role?: 'brand' | 'creator' | 'agent' | 'system';
    channel_type?: 'brand_agent' | 'creator_agent';
    message_type?: 'text' | 'file' | 'system';
  }) => {
    return await apiRequest(`${API_ENDPOINTS.SEND_TICKET_MESSAGE}/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Get ticket by order ID
  getTicketByOrderId: async (orderId: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_TICKET_BY_ORDER}/${orderId}`, {
      method: 'GET',
    });
  },

  // Update ticket status
  updateTicketStatus: async (ticketId: string, status: string) => {
    return await apiRequest(`${API_ENDPOINTS.UPDATE_TICKET_STATUS}/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Update agent status (online/offline)
  updateAgentStatus: async (status: 'available' | 'busy' | 'offline' | 'away', isOnline?: boolean) => {
    const body: any = { status };
    if (isOnline !== undefined) {
      body.isOnline = isOnline;
    }
    
    return await apiRequest(`${API_ENDPOINTS.UPDATE_AGENT_STATUS}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // Get agent status for a specific ticket
  getAgentStatus: async (ticketId: string) => {
    return await apiRequest(`${API_ENDPOINTS.GET_AGENT_STATUS}/${ticketId}/agent-status`, {
      method: 'GET',
    });
  },
};

// Package API
export const packageAPI = {
  getPackages: async () => {
    return await apiRequest(API_ENDPOINTS.GET_PACKAGES);
  },

  createPackage: async (packageData: {
    platform: string;
    contentType: string;
    quantity: string;
    revisions: string;
    duration1: string;
    duration2: string;
    price: string;
    description: string;
  }) => {
    return await apiRequest(API_ENDPOINTS.CREATE_PACKAGE, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  },

  updatePackage: async (id: string, packageData: {
    platform?: string;
    contentType?: string;
    quantity?: string;
    revisions?: string;
    duration1?: string;
    duration2?: string;
    price?: string;
    description?: string;
  }) => {
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

  createOrder: async (orderData: {
    creatorId: string;
    packageId: string;
    quantity: number;
    totalAmount: number;
    requirements?: string;
  }) => {
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

const apiService = {
  authAPI,
  profileAPI,
  packageAPI,
  orderAPI,
};

export default apiService; 