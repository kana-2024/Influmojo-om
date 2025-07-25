import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Temporary local types to avoid workspace import issues
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isVerified?: boolean;
  user_type?: string;
  auth_provider?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthState {
  signupForm: SignupForm;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: User | null;
  userType: 'creator' | 'brand' | null;
}

const initialState: AuthState = {
  signupForm: {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  },
  isLoading: false,
  error: null,
  isAuthenticated: false,
  user: null,
  userType: null,
};





const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateSignupField: (state, action: PayloadAction<{ field: keyof SignupForm; value: string }>) => {
      const { field, value } = action.payload;
      state.signupForm[field] = value;
    },
    clearSignupForm: (state) => {
      state.signupForm = initialState.signupForm;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUserType: (state, action: PayloadAction<'creator' | 'brand' | null>) => {
      state.userType = action.payload;
    },
    signupSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.signupForm = initialState.signupForm;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = true;
      state.user = action.payload;
      // Sync userType from user object if available
      state.userType = action.payload.user_type as 'creator' | 'brand' || null;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userType = null;
      state.error = null;
    },
  },
  
});

export const {
  updateSignupField,
  clearSignupForm,
  setLoading,
  setError,
  setUserType,
  signupSuccess,
  loginSuccess,
  signupFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer; 