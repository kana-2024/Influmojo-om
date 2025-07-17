import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { ENV } from '../config/env';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = ENV.GOOGLE_CLIENT_SECRET;

// Validate that credentials are configured
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
  throw new Error('GOOGLE_CLIENT_ID is not configured. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your .env file.');
}

// For Development Build, we use a custom scheme
const redirectUri = Linking.createURL('auth', {
  scheme: 'influ-mojo',
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
      console.log('Starting Google OAuth sign in...');
      console.log('Redirect URI:', redirectUri);

      // Generate PKCE code verifier and challenge
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Build the Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'openid profile email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      // Open the browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), redirectUri);

      if (result.type === 'success' && result.url) {
        console.log('Auth session successful, extracting code...');
        
        // Extract the authorization code from the URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (!code) {
          return {
            success: false,
            error: 'No authorization code received',
          };
        }

        // Exchange the authorization code for tokens
        const tokenResult = await this.exchangeCodeForTokens(code, codeVerifier);

        this.accessToken = tokenResult.accessToken;
        this.refreshToken = tokenResult.refreshToken || null;

        // Fetch user info
        const userInfo = await this.getUserInfo(tokenResult.accessToken);

        return {
          success: true,
          user: userInfo,
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken,
        };
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'User cancelled the authentication',
        };
      } else {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async exchangeCodeForTokens(code: string, codeVerifier: string) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET || '',
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const tokenData = await response.json();
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };
  }

  async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await response.json();
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      given_name: userData.given_name,
      family_name: userData.family_name,
    };
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  private base64URLEncode(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

export default GoogleAuthService.getInstance(); 