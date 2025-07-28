import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

// Add debug logging at module level (only in development)
if (__DEV__) {
  console.log('=== Google Auth Service Module Loading ===');
  console.log('Google Auth service file is being loaded');
  console.log('Platform:', Platform.OS);
  console.log('Is development:', __DEV__);
}

// Platform-specific Google OAuth configuration
let GOOGLE_CLIENT_ID = '';

if (Platform.OS === 'android') {
  // Android OAuth client ID (you need to create this in Google Cloud Console)
  GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID_ANDROID || ENV.GOOGLE_CLIENT_ID;
} else if (Platform.OS === 'ios') {
  // iOS OAuth client ID (you need to create this in Google Cloud Console)
  GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID_IOS || ENV.GOOGLE_CLIENT_ID;
} else {
  // Web fallback
  GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID;
}

if (__DEV__) {
  console.log('=== Google Auth Service Initialization ===');
  console.log('Platform:', Platform.OS);
  console.log('GOOGLE_CLIENT_ID exists:', !!GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_ID length:', GOOGLE_CLIENT_ID?.length || 0);
  console.log('ENV.GOOGLE_CLIENT_ID:', ENV.GOOGLE_CLIENT_ID);
  console.log('ENV.GOOGLE_CLIENT_ID_ANDROID:', ENV.GOOGLE_CLIENT_ID_ANDROID);
  console.log('ENV.GOOGLE_CLIENT_ID_IOS:', ENV.GOOGLE_CLIENT_ID_IOS);
}

// Validate that credentials are configured
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
  console.error('GOOGLE_CLIENT_ID is not configured for platform:', Platform.OS);
  console.error('Current value:', GOOGLE_CLIENT_ID);
  throw new Error(`GOOGLE_CLIENT_ID is not configured for ${Platform.OS}. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID_${Platform.OS.toUpperCase()} to your .env file.`);
}

if (__DEV__) {
  console.log('Google Client ID validation passed for platform:', Platform.OS);
}

// Configure Google Sign-In
try {
  if (__DEV__) {
    console.log('Configuring Google Sign-In...');
    console.log('webClientId:', ENV.GOOGLE_CLIENT_ID);
    console.log('iosClientId:', ENV.GOOGLE_CLIENT_ID_IOS);
  }
  
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_CLIENT_ID, // Web client ID for server auth
    iosClientId: ENV.GOOGLE_CLIENT_ID_IOS, // iOS-specific client ID
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
  
  if (__DEV__) {
    console.log('Google Sign-In configured successfully');
  }
} catch (error) {
  console.error('Error configuring Google Sign-In:', error);
  throw error;
}

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
  idToken?: string;
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
      if (__DEV__) {
        console.log('=== APK Google Sign-In Debug ===');
        console.log('Starting Google Sign-In...');
        console.log('Google Client ID configured:', !!GOOGLE_CLIENT_ID);
        console.log('Platform:', Platform.OS);
        console.log('Is APK build:', __DEV__ ? 'Development' : 'Production');
      }

      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (__DEV__) {
        console.log('User already signed in:', isSignedIn);
      }
      if (isSignedIn) {
        if (__DEV__) {
          console.log('Signing out existing user...');
        }
        await GoogleSignin.signOut();
      }

      // Sign in
      if (__DEV__) {
        console.log('Calling GoogleSignin.signIn()...');
      }
      const userInfo = await GoogleSignin.signIn();
      if (__DEV__) {
        console.log('Google sign-in successful, user info received');
      }
      
      // Get tokens
      if (__DEV__) {
        console.log('Getting tokens...');
      }
      const tokens = await GoogleSignin.getTokens();
      if (__DEV__) {
        console.log('Tokens received');
      }

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

      if (__DEV__) {
        console.log('Google Sign-In successful:', user.email);
        console.log('Google access token stored:', tokens.accessToken);
      }

      return {
        success: true,
        user,
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
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
      if (__DEV__) {
        console.log('Google Sign-Out successful');
      }
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