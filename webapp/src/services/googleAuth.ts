// Google Authentication Service for Web App
import { ENV } from '@/config/env';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
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
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  error?: string;
}

class GoogleAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Check if Google Client ID is configured
    if (!ENV.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID === '') {
      console.error('Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
      console.error('Current ENV.GOOGLE_CLIENT_ID:', ENV.GOOGLE_CLIENT_ID);
      return;
    }

    console.log('✅ Google Client ID configured:', ENV.GOOGLE_CLIENT_ID);

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.isInitialized = true;
      console.log('✅ Google Identity Services loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google Identity Services');
    };
    document.head.appendChild(script);
  }

  async signIn(): Promise<AuthResult> {
    // Check if Google Client ID is configured
    if (!ENV.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID === '') {
      return {
        success: false,
        error: 'Google Client ID is not configured. Please contact support.'
      };
    }

    return new Promise((resolve) => {
      if (!window.google || !this.isInitialized) {
        // Wait for Google to load
        const checkGoogle = setInterval(() => {
          if (window.google && this.isInitialized) {
            clearInterval(checkGoogle);
            this.performSignIn(resolve);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkGoogle);
          resolve({
            success: false,
            error: 'Google Identity Services failed to load. Please refresh the page and try again.'
          });
        }, 10000);
        
        return;
      }

      this.performSignIn(resolve);
    });
  }

  private performSignIn(resolve: (result: AuthResult) => void) {
    if (!window.google) {
      resolve({
        success: false,
        error: 'Google Identity Services not available'
      });
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: ENV.GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (response: any) => {
          if (response.error) {
            resolve({
              success: false,
              error: response.error
            });
            return;
          }

          try {
            // Get user info using the access token
            const userInfo = await this.getUserInfo(response.access_token);
            
            resolve({
              success: true,
              user: userInfo,
              accessToken: response.access_token,
              idToken: response.id_token,
              refreshToken: response.refresh_token || null
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to get user information'
            });
          }
        }
      });

      client.requestAccessToken();
    } catch (error) {
      resolve({
        success: false,
        error: 'Google sign-in failed'
      });
    }
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await response.json();
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      given_name: userData.given_name,
      family_name: userData.family_name
    };
  }

  async signOut(): Promise<void> {
    if (window.google && window.google.accounts) {
      // Google Identity Services handles sign out automatically
      this.accessToken = null;
      this.refreshToken = null;
    }
  }
}

// Create singleton instance
export const googleAuthService = new GoogleAuthService(); 