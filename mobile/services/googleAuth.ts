import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

// Add debug logging at module level
console.log('=== Google Auth Service Module Loading ===');
console.log('Google Auth service file is being loaded');
console.log('Platform:', Platform.OS);
console.log('Is development:', __DEV__);

// Google OAuth configuration
const GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID;

console.log('=== Google Auth Service Initialization ===');
console.log('ENV.GOOGLE_CLIENT_ID exists:', !!ENV.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_ID length:', GOOGLE_CLIENT_ID?.length || 0);

// Validate that credentials are configured
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
  console.error('GOOGLE_CLIENT_ID is not configured!');
  console.error('Current value:', GOOGLE_CLIENT_ID);
  throw new Error('GOOGLE_CLIENT_ID is not configured. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your .env file.');
}

console.log('Google Client ID validation passed');

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID, // Use your existing web client ID
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  // Note: For React Native, we use webClientId, not androidClientId
});

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  accessToken?: string;
  refreshToken?: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async signIn(): Promise<AuthResult> {
    try {
      console.log('=== APK Google Sign-In Debug ===');
      console.log('Starting Google Sign-In...');
      console.log('Google Client ID configured:', !!GOOGLE_CLIENT_ID);
      console.log('Platform:', Platform.OS);
      console.log('Is APK build:', __DEV__ ? 'Development' : 'Production');

      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      console.log('User already signed in:', isSignedIn);
      if (isSignedIn) {
        console.log('Signing out existing user...');
        await GoogleSignin.signOut();
      }

      // Sign in
      console.log('Calling GoogleSignin.signIn()...');
      const userInfo = await GoogleSignin.signIn();
      console.log('Google sign-in successful, user info received');
      
      // Get tokens
      console.log('Getting tokens...');
      const tokens = await GoogleSignin.getTokens();
      console.log('Tokens received');

      this.accessToken = tokens.accessToken;
      // Note: refreshToken might not be available in all cases
      this.refreshToken = null;

      // Format user data
      const user: GoogleUser = {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        picture: userInfo.user.photo,
        given_name: userInfo.user.givenName,
        family_name: userInfo.user.familyName,
      };

      console.log('Google Sign-In successful:', user.email);

      return {
        success: true,
        user,
        accessToken: tokens.accessToken,
        refreshToken: null, // refreshToken not available in this implementation
      };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      let errorMessage = 'Google sign-in failed.';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in was cancelled. You can try again.';
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        errorMessage = 'Sign-in is required. Please try again.';
      } else if (error.code === 'INVALID_ACCOUNT') {
        errorMessage = 'Invalid account. Please use a different Google account.';
      } else if (error.code === 'SIGN_IN_NOT_AVAILABLE') {
        errorMessage = 'Google Sign-In is not available. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'DEVELOPER_ERROR') {
        errorMessage = 'Configuration error. Please contact support.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available. Please update your device.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      this.accessToken = null;
      this.refreshToken = null;
      console.log('Google Sign-Out successful');
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  }

  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (!isSignedIn) {
        return null;
      }

      const userInfo = await GoogleSignin.getCurrentUser();
      if (!userInfo) {
        return null;
      }

      return {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        picture: userInfo.user.photo,
        given_name: userInfo.user.givenName,
        family_name: userInfo.user.familyName,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      return tokens.accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }
}

export default GoogleAuthService.getInstance(); 