'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { authAPI, profileAPI } from '@/services/apiService';
import { COLORS } from '@/config/colors';
import { googleAuthService } from '@/services/googleAuth';
import OtpVerificationModal from './OtpVerificationModal';



export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Check if user exists
      const formattedPhone = `+91${phone.trim()}`;
      const checkResult = await authAPI.checkUserExists(formattedPhone);
      
      if (checkResult.exists) {
        // User exists, send OTP for login
        const result = await authAPI.sendOTP(formattedPhone);
        if (result.success) {
          setShowOtpModal(true);
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      } else {
        // User doesn't exist, show signup option
        setWarning('No account found with this phone number. Would you like to create a new account?');
      }
    } catch (error: unknown) {
      console.error('Phone login error:', error);
      if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' && error.message.includes('429')) {
        const timeRemaining = (error as { timeRemaining?: number; retryAfter?: number }).timeRemaining || (error as { timeRemaining?: number; retryAfter?: number }).retryAfter || 60;
        setError(`Please wait ${timeRemaining} seconds before requesting another code.`);
      } else {
        setError('Failed to verify phone number. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setWarning('');
    setGoogleLoading(true);
    setError('');

    try {
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user && result.idToken) {
        try {
          // Call backend API with Google ID token for login
          const apiResult = await authAPI.googleAuth(result.idToken, false);
          
          if (apiResult.success) {
            // User logged in successfully, store user data in localStorage (same as mobile app)
            console.log('✅ Google login successful, storing user data:', apiResult);
            
            if (apiResult.token) {
              localStorage.setItem('token', apiResult.token);
              console.log('🔑 Token stored in localStorage');
            }
            
            if (apiResult.user?.name || apiResult.user?.fullName) {
              localStorage.setItem('fullName', apiResult.user.name || apiResult.user.fullName);
              console.log('👤 Full name stored in localStorage:', apiResult.user.name || apiResult.user.fullName);
            }
            
            if (apiResult.user?.email) {
              localStorage.setItem('email', apiResult.user.email);
              console.log('📧 Email stored in localStorage:', apiResult.user.email);
            }
            
            if (apiResult.user?.phone) {
              localStorage.setItem('phone', apiResult.user.phone);
              console.log('📱 Phone stored in localStorage:', apiResult.user.phone);
            }
            
            // Store user type
            const userType = apiResult.user?.userType || apiResult.user?.user_type || 'creator';
            localStorage.setItem('userType', userType);
            sessionStorage.setItem('selectedUserType', userType);
            console.log('🏷️ User type stored:', userType);
            
            // Check if user has completed onboarding by checking their profile
            try {
              if (userType === 'brand') {
                try {
                  const brandProfile = await profileAPI.getBrandProfile();
                  if (brandProfile.success && brandProfile.data) {
                    // If we can successfully get the brand profile, assume onboarding is complete
                    console.log('✅ Brand profile exists, redirecting to brand dashboard');
                    window.location.href = '/dashboard/brand';
                    return;
                  }
                } catch (profileError) {
                  console.log('⚠️ Could not fetch brand profile, user may need to complete onboarding');
                  window.location.href = '/brand-profile-setup';
                  return;
                }
                } else {
                // For creators, try to get their profile first
                try {
                  const creatorProfile = await profileAPI.getCreatorProfile();
                  if (creatorProfile.success && creatorProfile.data) {
                    // If we can successfully get the creator profile, redirect to dashboard
                    console.log('✅ Creator profile exists, redirecting to creator dashboard');
                  window.location.href = '/dashboard/creator';
                    return;
                  }
                } catch (profileError) {
                  console.log('⚠️ Could not fetch creator profile, user may need to complete onboarding');
                  window.location.href = '/profile-setup';
                  return;
                }
              }
            } catch (error) {
              console.error('❌ Error checking profile completion:', error);
              // Fallback to profile setup
              if (userType === 'brand') {
                window.location.href = '/brand-profile-setup';
              } else {
                window.location.href = '/profile-setup';
              }
            }
          } else {
            setWarning(apiResult.error || 'Backend authentication failed. Please try again.');
          }
        } catch (apiError: unknown) {
          console.error('Backend API error:', apiError);
          
          // Handle specific error cases
          if (typeof apiError === 'object' && apiError && 'message' in apiError && typeof apiError.message === 'string' && apiError.message.includes('404')) {
            setWarning('No account found with this Google account. Please sign up first.');
          } else {
            setWarning('Backend authentication failed. Please try again.');
          }
        }
      } else {
        setWarning(result.error || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setWarning(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOtpSuccess = async (user: unknown) => {
    setShowOtpModal(false);
    
    console.log('✅ OTP verification successful, storing user data:', user);
    
    // Store user data in localStorage (same as mobile app)
    if (user && typeof user === 'object' && user !== null && 'token' in user) {
      const userObj = user as { token?: string; name?: string; fullName?: string; email?: string; phone?: string; userType?: string; user_type?: string };
      
      if (userObj.token) {
        localStorage.setItem('token', userObj.token);
        console.log('🔑 Token stored in localStorage');
      }
      
      if (userObj.name || userObj.fullName) {
        const fullName = userObj.name || userObj.fullName || 'User';
        localStorage.setItem('fullName', fullName);
        console.log('👤 Full name stored in localStorage:', fullName);
      }
      
      if (userObj.email) {
        localStorage.setItem('email', userObj.email);
        console.log('📧 Email stored in localStorage:', userObj.email);
      }
      
      if (userObj.phone) {
        localStorage.setItem('phone', userObj.phone);
        console.log('📱 Phone stored in localStorage:', userObj.phone);
      }
      
      // Store user type
      const userType = userObj.userType || userObj.user_type || 'creator';
      localStorage.setItem('userType', userType);
      sessionStorage.setItem('selectedUserType', userType);
      console.log('🏷️ User type stored:', userType);
      
      // Check if user has completed onboarding by checking their profile
      try {
        if (userType === 'brand') {
          try {
            const brandProfile = await profileAPI.getBrandProfile();
            if (brandProfile.success && brandProfile.data) {
              // If we can successfully get the brand profile, assume onboarding is complete
              console.log('✅ Brand profile exists, redirecting to brand dashboard');
              window.location.href = '/dashboard/brand';
              return;
            }
          } catch (profileError) {
            console.log('⚠️ Could not fetch brand profile, user may need to complete onboarding');
            window.location.href = '/brand-profile-setup';
            return;
          }
          } else {
          // For creators, try to get their profile first
          try {
            const creatorProfile = await profileAPI.getCreatorProfile();
            if (creatorProfile.success && creatorProfile.data) {
              // If we can successfully get the creator profile, redirect to dashboard
              console.log('✅ Creator profile exists, redirecting to creator dashboard');
            window.location.href = '/dashboard/creator';
              return;
            }
          } catch (profileError) {
            console.log('⚠️ Could not fetch creator profile, user may need to complete onboarding');
            window.location.href = '/profile-setup';
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error checking profile completion:', error);
        // Fallback to profile setup
        if (userType === 'brand') {
          window.location.href = '/brand-profile-setup';
        } else {
          window.location.href = '/profile-setup';
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins-regular flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <Image 
            src="/images/logo1.svg" 
            alt="im logo" 
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <Image 
            src="/images/logo2.svg" 
            alt="influ mojo text" 
            width={28}
            height={28}
            className="h-7 w-auto"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
          <Link href="/how-it-works" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            How it works
          </Link>
          <Link href="/pricing" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Pricing
          </Link>
          <Link href="/signup-brand" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Sign up as brand
          </Link>
          <Link href="/signup-creator" className="text-secondary font-poppins-medium hover:text-opacity-80 transition-colors text-xs lg:text-sm">
            Sign up as Creator
          </Link>
          <Link href="/get-started" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-poppins-bold text-textDark mb-2">
              Welcome Back
            </h1>
            <p className="text-textGray text-sm">
              Log in to your account to continue
            </p>
          </div>

          {/* Phone Login Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-poppins-semibold text-textDark mb-2">
                Mobile Number*
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-sm font-poppins-medium text-textDark">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9948425492"
                  maxLength={10}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
              <p className="text-xs text-textGray mt-1">
                We&apos;ll send a one-time OTP to this number for verification
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {warning && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-600">{warning}</p>
                {warning.includes('create a new account') && (
                  <Link href="/get-started" className="text-secondary font-poppins-medium hover:underline mt-2 inline-block">
                    Sign up now
                  </Link>
                )}
              </div>
            )}

            <button
              onClick={handlePhoneLogin}
              disabled={loading}
              className="w-full py-3 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: COLORS.gradientOrange }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                'Log In'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="mt-3 text-right">
              <Link href="/forgot-password" className="text-sm text-secondary font-poppins-medium hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-textGray">or login with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 border border-gray-300 text-textDark text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {googleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-textGray">
              Don&apos;t have an account?{' '}
              <Link href="/get-started" className="text-secondary font-poppins-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
        phone={`+91${phone}`}
        fullName=""
        userType="creator"
      />
    </div>
  );
}
