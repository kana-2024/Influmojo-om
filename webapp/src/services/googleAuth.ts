// Google Authentication Service for Web App
import { ENV } from '@/config/env';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: any) => any;
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
      // Use initCodeClient to get authorization code
      const client = window.google.accounts.oauth2.initCodeClient({
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
            // Exchange authorization code for tokens
            const tokenResponse = await this.exchangeCodeForTokens(response.code);
            
            if (!tokenResponse.success) {
              resolve({
                success: false,
                error: tokenResponse.error || 'Failed to exchange code for tokens'
              });
              return;
            }

            // Get user info using the access token
            const userInfo = await this.getUserInfo(tokenResponse.accessToken);
            
            resolve({
              success: true,
              user: userInfo,
              accessToken: tokenResponse.accessToken,
              idToken: tokenResponse.idToken,
              refreshToken: tokenResponse.refreshToken
            });
          } catch (error) {
            console.error('Sign-in error:', error);
            resolve({
              success: false,
              error: 'Failed to complete sign-in process'
            });
          }
        }
      });

      client.requestCode();
    } catch (error) {
      console.error('Google sign-in error:', error);
      resolve({
        success: false,
        error: 'Google sign-in failed'
      });
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<{
    success: boolean;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          client_id: ENV.GOOGLE_CLIENT_ID,
          client_secret: ENV.GOOGLE_CLIENT_SECRET,
          redirect_uri: window.location.origin,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token exchange error:', errorData);
        return {
          success: false,
          error: 'Failed to exchange authorization code for tokens'
        };
      }

      const tokenData = await response.json();
      
      return {
        success: true,
        accessToken: tokenData.access_token,
        idToken: tokenData.id_token,
        refreshToken: tokenData.refresh_token
      };
    } catch (error) {
      console.error('Token exchange error:', error);
      return {
        success: false,
        error: 'Network error during token exchange'
      };
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