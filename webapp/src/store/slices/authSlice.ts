import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'brand' | 'creator';
  profile?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    userType?: string;
    gender?: string;
    city?: string;
    business_type?: string;
    role?: string;
    website_url?: string;
    about?: string;
    dob?: string;
    state?: string;
    pincode?: string;
    content_categories?: string[];
    languages?: string[];
    industries?: string[];
    target_audience?: string[];
    collaboration_types?: string[];
    budget_range?: string;
    campaign_duration?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  logout,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer; 