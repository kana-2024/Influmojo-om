# Google Authentication Setup for Web App

## Overview

This document explains how to set up Google authentication for the Influmojo web application.

## Prerequisites

1. Google Cloud Console project
2. OAuth 2.0 client ID for web application
3. Environment variables configured

## Setup Steps

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **"Create Credentials"** > **"OAuth client ID"**
5. Choose **"Web application"** as application type
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-domain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://your-domain.com` (for production)
8. Copy the generated Client ID

### 2. Environment Variables

Create or update your `.env.local` file in the `webapp` directory:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### 3. Implementation Details

The web app uses Google Identity Services for authentication:

- **Service**: `webapp/src/services/googleAuth.ts`
- **Component**: `webapp/src/components/GetStartedScreen.tsx`
- **API Integration**: `webapp/src/services/apiService.ts`

### 4. Features Implemented

#### Google Sign Up

- ✅ Google OAuth integration using Google Identity Services
- ✅ Automatic user creation in backend
- ✅ Token management and storage
- ✅ Error handling and user feedback

#### Phone Number Sign Up

- ✅ Phone number validation (10-digit format)
- ✅ OTP sending and verification
- ✅ User existence check
- ✅ Rate limiting handling
- ✅ Modal-based OTP verification

#### Shared Backend Integration

- ✅ Uses same backend APIs as mobile app
- ✅ Consistent user data structure
- ✅ Token-based authentication
- ✅ Error handling and validation

### 5. Usage

#### Google Sign Up

1. User clicks "Sign up with Google" button
2. Google OAuth popup appears
3. User selects Google account
4. Backend creates/updates user account
5. User is redirected to dashboard

#### Phone Number Sign Up

1. User enters full name and phone number
2. System checks if user already exists
3. OTP is sent to phone number
4. User enters OTP in modal
5. Account is created and user is redirected

### 6. Error Handling

The implementation includes comprehensive error handling:

- **Google Auth Errors**: Network issues, configuration problems, user cancellation
- **Phone Auth Errors**: Invalid phone numbers, rate limiting, OTP failures
- **Backend Errors**: API failures, user conflicts, validation errors

### 7. Security Considerations

- Google Client ID is exposed to frontend (required for OAuth)
- Sensitive operations are handled by backend
- Tokens are stored securely in localStorage
- HTTPS required for production

### 8. Testing

To test the implementation:

1. **Development**:

   ```bash
   cd webapp
   npm run dev
   ```

   Visit `http://localhost:3000/get-started`

2. **Production**:
   - Deploy to your hosting platform
   - Ensure HTTPS is enabled
   - Update Google Cloud Console with production URLs

### 9. Troubleshooting

#### Common Issues

1. **"Google Client ID is not configured"**

   - Check `.env.local` file
   - Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
   - Restart development server

2. **"Google Identity Services failed to load"**

   - Check internet connection
   - Verify Google Cloud Console configuration
   - Check browser console for errors

3. **"Backend authentication failed"**
   - Verify API URL configuration
   - Check backend server status
   - Review network requests in browser dev tools

#### Debug Mode

Enable debug logging by checking browser console for detailed error messages and API responses.

## Support

For issues or questions:

1. Check browser console for error messages
2. Verify environment variables are correctly set
3. Ensure Google Cloud Console configuration is correct
4. Test with different browsers and devices
