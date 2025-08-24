// Google Authentication Service for Web App
import { ENV } from '@/config/env';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: unknown) => unknown;
          initCodeClient: (config: unknown) => unknown;
          hasGrantedAllScopes: (tokenResponse: unknown, ...scopes: string[]) => boolean;
          hasGrantedAnyScope: (tokenResponse: unknown, ...scopes: string[]) => boolean;
        };
        id: {
          initialize: (config: unknown) => void;
          renderButton: (element: HTMLElement, config: unknown) => void;
          prompt: (momentListener?: (promptMomentNotification: unknown) => void) => void;
          disableAutoSelect: () => void;
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
  idToken?: string;
  error?: string;
}

class GoogleAuthService {
  private isInitialized = false;

  constructor() {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Check if Google Client ID is configured
    if (!ENV.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID === '') {
      console.error('❌ Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
      console.error('Current ENV.GOOGLE_CLIENT_ID:', ENV.GOOGLE_CLIENT_ID);
      console.error('Please check your .env.local file and restart the development server.');
      return;
    }

    console.log('✅ Google Client ID configured:', ENV.GOOGLE_CLIENT_ID);
    console.log('🌐 Current origin:', window.location.origin);

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
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      resolve({
        success: false,
        error: 'Google Identity Services not available'
      });
      return;
    }

    try {
      // Initialize Google Identity Services with proper ID token flow
      window.google.accounts.id.initialize({
        client_id: ENV.GOOGLE_CLIENT_ID,
        callback: (response: { credential?: string; error?: string }) => {
          this.handleCredentialResponse(response, resolve);
        },
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false, // Disable FedCM to avoid CORS issues
        context: 'signin' // Specify context to avoid FedCM issues
      });

      // Use renderButton approach for better reliability
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-1000px';
      tempContainer.style.left = '-1000px';
      tempContainer.style.visibility = 'hidden';
      document.body.appendChild(tempContainer);

      window.google.accounts.id.renderButton(tempContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        width: 250,
        logo_alignment: 'left'
      });

      // Trigger the button click after a short delay
      setTimeout(() => {
        const button = tempContainer.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          button.click();
        } else {
          // Fallback to prompt method without FedCM
          window.google?.accounts.id.prompt((notification: unknown) => {
            const notif = notification as { isDisplayMoment: () => boolean; isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getMomentType: () => string };
            if (notif.isNotDisplayed() || notif.isSkippedMoment()) {
              resolve({
                success: false,
                error: 'Google sign-in was not displayed or was skipped'
              });
            }
          });
        }

        // Clean up the temporary container after a delay
        setTimeout(() => {
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        }, 5000);
      }, 100);

    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Check for specific origin-related errors
      if (error instanceof Error && error.message.includes('origin')) {
        resolve({
          success: false,
          error: 'Google sign-in failed: Origin not allowed. Please check your Google OAuth configuration.'
        });
      } else {
        resolve({
          success: false,
          error: 'Google sign-in failed'
        });
      }
    }
  }

  private handleCredentialResponse(response: { credential?: string; error?: string }, resolve: (result: AuthResult) => void) {
    if (response.error) {
      resolve({
        success: false,
        error: response.error
      });
      return;
    }

    if (!response.credential) {
      resolve({
        success: false,
        error: 'No credential received from Google'
      });
      return;
    }

    try {
      // Parse the real Google ID token to get user info
      const idToken = response.credential;
      const payload = this.parseJwt(idToken);
      
      const user: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      resolve({
        success: true,
        user: user,
        idToken: idToken // Use the real Google ID token
      });
    } catch (error) {
      console.error('Error parsing credential response:', error);
      resolve({
        success: false,
        error: 'Failed to process Google sign-in response'
      });
    }
  }

  private parseJwt(token: string): {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  } {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      throw new Error('Invalid token format');
    }
  }

  signOut(): void {
    // Google Identity Services handles sign-out automatically
  }
}

// Create singleton instance
export const googleAuthService = new GoogleAuthService(); 