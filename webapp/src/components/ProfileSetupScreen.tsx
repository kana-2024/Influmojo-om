'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI, profileAPI, isAuthenticated, getCurrentUser, checkBackendHealth } from '@/services/apiService';
import { googleAuthService } from '@/services/googleAuth';
import OtpVerificationModal from './OtpVerificationModal';

export default function ProfileSetupScreen() {
   const router = useRouter();
   const [gender, setGender] = useState('Male');
   const [email, setEmail] = useState('');
   const [phone, setPhone] = useState('');
   const [dob, setDob] = useState('');
   const [city, setCity] = useState('');
     const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
   
   // Computed disabled state to avoid React state synchronization issues
   const isButtonDisabled = loading || !city.trim() || !dob || (isGoogleUser ? (!phone.trim() || !isPhoneVerified) : (!email.trim() || sessionStorage.getItem('emailVerified') !== 'true'));
  
  // OTP related state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  // Google email verification state
  const [googleVerifying, setGoogleVerifying] = useState(false);

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ];

  useEffect(() => {
    // Check if user is Google user or mobile user
    const checkGoogleUser = () => {
      const fromGoogle = sessionStorage.getItem('fromGoogle');
      const authProvider = sessionStorage.getItem('authProvider');
      const userEmail = sessionStorage.getItem('userEmail');
      const existingEmail = sessionStorage.getItem('existingEmail');
      
      console.log('🔍 ProfileSetupScreen - SessionStorage check:', {
        fromGoogle,
        authProvider,
        userEmail,
        existingEmail,
        userData: sessionStorage.getItem('userData')
      });
      
      // User is Google user if they have fromGoogle flag OR authProvider is 'google'
      if (fromGoogle || authProvider === 'google') {
        console.log('✅ ProfileSetupScreen - User is Google user');
        setIsGoogleUser(true);
        // Pre-fill email if available
        if (userEmail) {
          setEmail(userEmail);
          // For Google users, email is automatically verified
          sessionStorage.setItem('emailVerified', 'true');
          sessionStorage.setItem('verifiedEmail', userEmail);
          console.log('✅ ProfileSetupScreen - Google user email automatically verified:', userEmail);
        }
      } else if (authProvider === 'mobile') {
        console.log('📱 ProfileSetupScreen - User is mobile user');
        // User is mobile user - clear any Google-related data
        setIsGoogleUser(false);
        
        // Check if user already has an email associated with their account
        if (existingEmail) {
          console.log('📧 ProfileSetupScreen - User already has email associated:', existingEmail);
          setEmail(existingEmail);
          // Email is already verified since it's associated with their account
          sessionStorage.setItem('emailVerified', 'true');
          sessionStorage.setItem('verifiedEmail', existingEmail);
          console.log('✅ ProfileSetupScreen - Existing email automatically verified:', existingEmail);
        }
        
        // Pre-fill phone if available (this would come from OTP verification)
        const userData = sessionStorage.getItem('userData');
        const verifiedPhone = sessionStorage.getItem('verifiedPhone');
        
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            if (parsedData.phone) {
              setPhone(parsedData.phone.replace('+91', ''));
              setIsPhoneVerified(true);
              console.log('✅ ProfileSetupScreen - Phone set from userData:', parsedData.phone);
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
        
        // Fallback to verifiedPhone if userData doesn't have phone
        if (!phone && verifiedPhone) {
          setPhone(verifiedPhone.replace('+91', ''));
          setIsPhoneVerified(true);
          console.log('✅ ProfileSetupScreen - Phone set from verifiedPhone fallback:', verifiedPhone);
        }
        
        // Debug: Log final phone state
        console.log('📱 ProfileSetupScreen - Final phone state:', {
          phone,
          isPhoneVerified,
          userData: sessionStorage.getItem('userData'),
          verifiedPhone: sessionStorage.getItem('verifiedPhone')
        });
      } else {
        console.log('❓ ProfileSetupScreen - Unknown user type, defaulting to mobile');
        setIsGoogleUser(false);
      }
    };
    
    // Check user type and redirect if necessary
    const checkUserType = () => {
      const storedUserType = sessionStorage.getItem('selectedUserType');
      const currentUser = getCurrentUser();
      
      // Only redirect if:
      // 1. User explicitly selected brand during signup AND
      // 2. Current user from backend is also brand type
      if (storedUserType === 'brand' && currentUser?.user_type === 'brand') {
        console.log('Creator ProfileSetupScreen: User is confirmed brand, redirecting to brand profile setup');
        router.push('/brand-profile-setup');
        return;
      } else if (storedUserType === 'brand' && currentUser?.user_type !== 'brand') {
        // User selected brand but backend shows creator - clear the selection and stay
        console.log('Creator ProfileSetupScreen: User selected brand but backend shows creator, staying on creator flow');
        sessionStorage.removeItem('selectedUserType');
      } else {
        console.log('Creator ProfileSetupScreen: User is creator, staying on creator profile setup');
      }
    };
    
    checkUserType();
    checkGoogleUser();
    
    // Check if email was already verified in this session
    const emailVerified = sessionStorage.getItem('emailVerified');
    if (emailVerified === 'true') {
      console.log('✅ ProfileSetupScreen - Email already verified in this session');
    }
  }, [router, isPhoneVerified, phone]);
  
     // Monitor email changes and clear verification if email is cleared
   useEffect(() => {
     if (!email.trim() && sessionStorage.getItem('emailVerified') === 'true') {
       console.log('🗑️ ProfileSetupScreen - Email cleared, removing verification status');
       sessionStorage.removeItem('emailVerified');
       sessionStorage.removeItem('verifiedEmail');
     }
   }, [email]);

     // Monitor loading state changes for debugging
  useEffect(() => {
    console.log('🔄 Loading state changed to:', loading);
  }, [loading]);

  // Function to show user-friendly error messages
  const showUserFriendlyError = (error: Error) => {
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error.message.includes('Authentication')) {
      message = 'Your session has expired. Please sign in again.';
    } else if (error.message.includes('timeout')) {
      message = 'The server is taking too long to respond. This might be a temporary issue. Please try again.';
    } else if (error.message.includes('Network error')) {
      message = 'Unable to connect to the server. This might be a temporary network issue. Please try again.';
    } else if (error.message.includes('Validation failed')) {
      message = 'Please check your input and try again.';
    }
    
    alert(message);
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 ProfileSetupScreen - Checking authentication...');
      
      if (!isAuthenticated()) {
        console.error('❌ ProfileSetupScreen - User not authenticated');
        console.error('❌ User must be authenticated before accessing profile setup');
        alert('Authentication required. Please sign in first.');
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      // Get current user info
      const currentUser = getCurrentUser();
      if (currentUser) {
        console.log('✅ ProfileSetupScreen - User authenticated:', currentUser);
        console.log('🔍 User type:', currentUser.user_type);
        console.log('🔍 User ID:', currentUser.id);
        console.log('🔍 User email:', currentUser.email);
      } else {
        console.error('❌ ProfileSetupScreen - Could not get user info from token');
        alert('Authentication error. Please sign in again.');
        window.location.href = '/login';
        return;
      }
      
      console.log('✅ ProfileSetupScreen - Authentication validated successfully');
      
      // Check backend health
      const backendHealthy = await checkBackendHealth();
      if (!backendHealthy) {
        console.warn('⚠️ Backend health check failed - API calls may not work');
        alert('Warning: The backend server appears to be unavailable. Profile creation may not work properly.');
      } else {
        console.log('✅ Backend health check passed');
      }
      
      // Check if user has already completed onboarding
      // Only check this if user is not in the signup flow (i.e., they came from login, not signup)
      try {
        const isSignupFlow = sessionStorage.getItem('isSignupFlow') === 'true' || 
                            window.location.pathname.includes('signup');
        
        if (!isSignupFlow && currentUser?.user_type === 'creator') {
          const creatorProfile = await profileAPI.getCreatorProfile();
          if (creatorProfile.success && creatorProfile.data) {
            // Check if the profile is actually complete (has required fields)
            const profile = creatorProfile.data;
            const hasBasicInfo = profile.gender && profile.location_city;
            const hasPreferences = profile.content_categories && 
                                 profile.content_categories.length > 0 && 
                                 profile.bio && 
                                 profile.languages && 
                                 profile.languages.length > 0;
            
            if (hasBasicInfo && hasPreferences) {
              console.log('✅ User has already completed onboarding with all required fields, redirecting to dashboard');
              window.location.href = '/dashboard/creator';
              return;
            } else {
              console.log('⚠️ User has initial profile but onboarding is incomplete, continuing with setup');
              console.log('🔍 Profile status:', { hasBasicInfo, hasPreferences });
            }
          }
        } else if (isSignupFlow) {
          console.log('✅ User is in signup flow, allowing them to complete the signup process');
        }
      } catch (profileError) {
        console.log('⚠️ Could not check existing profile, user may need to complete onboarding');
      }
      
      setAuthChecking(false);
    };
    
    checkAuth();
  }, []);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setOtpError('Please enter your phone number');
      return;
    }

    if (phone.length !== 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      console.log('🔄 Sending OTP request for:', `+91${phone}`);
      
      // Check if user already exists
      const checkResult = await authAPI.checkUserExists(`+91${phone}`);
      
      if (checkResult.exists) {
        setOtpError('An account with this phone number already exists. Please log in instead.');
        setOtpLoading(false);
        return;
      }
      
      // User doesn't exist, proceed with OTP
      const result = await authAPI.sendOTP(`+91${phone}`);
      console.log('✅ OTP sent successfully');
      
      // Show OTP in development mode like mobile
      if (process.env.NODE_ENV === 'development' && result.otp) {
        alert(`OTP: ${result.otp}\n\nThis is shown only in development mode.`);
      }
      
      setOtpLoading(false);
      setShowOtpModal(true);
    } catch (err: unknown) {
      console.error('❌ OTP request failed:', err);
      // Create a proper error interface
      interface ApiError {
        message?: string;
        error?: string;
        timeRemaining?: number;
        retryAfter?: number;
      }
      const apiError = err as ApiError;
      const errorMessage = apiError?.message || '';
      const errorError = apiError?.error;
      if (errorMessage.includes('429') || errorError === 'Rate limit exceeded') {
        const timeRemaining = apiError?.timeRemaining || apiError?.retryAfter || 60;
        setOtpError(`Please wait ${timeRemaining} seconds before requesting another code.`);
      } else if (errorMessage.includes('409')) {
        setOtpError('An account with this phone number already exists. Please log in instead.');
      } else {
        setOtpError('Network error. Please check your connection and try again.');
      }
      setOtpLoading(false);
    }
  };

  const handleOtpSuccess = (user: unknown) => {
    setShowOtpModal(false);
    setIsPhoneVerified(true);
    // Store user data if needed
    if (user && typeof user === 'object' && user !== null) {
      const userObj = user as { phone?: string };
      sessionStorage.setItem('userData', JSON.stringify(user));
      // Also store phone number for mobile users
      if (userObj.phone) {
        setPhone(userObj.phone.replace('+91', ''));
      }
    }
  };

  const handleNextStep = async () => {
    if (loading) return;
    
    // Debug logging
    console.log('handleNextStep called with state:', {
      phone: phone.trim(),
      city: city.trim(),
      isPhoneVerified,
      gender,
      email: email.trim(),
      dob
    });
    
    // Validation - different for Google vs phone users
    if (isGoogleUser) {
      // Google user validation
      console.log('Validation check for Google user - phone:', phone.trim(), 'city:', city.trim(), 'isPhoneVerified:', isPhoneVerified);
      
      if (!phone.trim()) {
        console.log('Validation failed: phone is empty');
        alert('Please enter your phone number');
        return;
      }
      
      if (!isPhoneVerified) {
        console.log('Validation failed: phone not verified');
        alert('Please verify your phone number first');
        return;
      }
    } else {
      // Phone user validation
      console.log('Validation check for Phone user - email:', email.trim(), 'city:', city.trim());
      
      if (!email.trim()) {
        console.log('Validation failed: email is empty');
        alert('Please enter your email address');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        console.log('Validation failed: invalid email format');
        alert('Please enter a valid email address');
        return;
      }
      
      // Check if email is verified for phone users
      const emailVerified = sessionStorage.getItem('emailVerified');
      if (emailVerified !== 'true' || !email.trim()) {
        console.log('Validation failed: email not verified or empty');
        alert('Please enter and verify your email address with Google before continuing');
        return;
      }
    }
    
    if (!city.trim()) {
      console.log('Validation failed: city is empty');
      alert('Please select your city');
      return;
    }
    
    if (!dob) {
      console.log('Validation failed: date of birth is empty');
      alert('Please select your date of birth');
      return;
    }
    
         console.log('Validation passed successfully');
     
     console.log('🔍 Setting loading to true at line 274');
     setLoading(true);
     console.log('🔍 Loading state after setLoading(true):', loading);
    
    try {
      // Prepare basic profile data - following mobile app approach but including required backend fields
             const profileData: {
         gender: string;
         dob: string;
         city: string;
         state?: string;
         pincode?: string;
         email?: string;
         phone?: string;
       } = {
         gender,
         dob: dob,
         city: city.trim()
         // Commenting out state and pincode temporarily to test
         // state: 'Maharashtra', // Default state - required by backend
         // pincode: '400001' // Default pincode - required by backend
       };

      // Only add email/phone if they have values and are different from existing (like mobile app)
      if (isGoogleUser) {
        if (phone.trim()) {
          profileData.phone = `+91${phone.trim()}`;
        }
        // Don't send email for Google users as it's already set during signup
      } else {
        if (email.trim()) {
          profileData.email = email.trim();
        }
        // Don't send phone for phone users as it's already set during signup
      }
      
      console.log('Preparing basic profile data (mobile app approach):', profileData);
      
      // Save basic profile data to the database - following mobile app approach
      console.log('Saving basic profile data to database...');
      
      // Save basic profile data to the database using the API
      console.log('🔍 Calling profileAPI.updateBasicInfo with data:', profileData);
      
      try {
        // Check authentication before making API call
        if (!isAuthenticated()) {
          throw new Error('Authentication required. Please sign in again.');
        }
        
        const currentUser = getCurrentUser();
        console.log('🔍 Making API call for user:', currentUser);
        
        // Validate user type
        if (currentUser?.user_type !== 'creator') {
          console.error('❌ User type mismatch. Expected: creator, Got:', currentUser?.user_type);
          alert('This page is for creators only. Please use the appropriate signup flow.');
          window.location.href = '/signup-creator';
          return;
        }
        
        // Add timeout to prevent hanging API calls
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API call timeout after 10 seconds')), 10000)
        );
        
        // Try API call with retry mechanism
        let basicInfoResponse;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            basicInfoResponse = await Promise.race([
              profileAPI.updateBasicInfo(profileData),
              timeoutPromise
            ]);
            console.log('✅ Basic profile saved to database:', basicInfoResponse);
            break; // Success, exit retry loop
          } catch (retryError) {
            retryCount++;
            console.warn(`⚠️ API call attempt ${retryCount} failed:`, retryError);
            
            if (retryCount > maxRetries) {
              throw retryError; // Give up after max retries
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        // Store in sessionStorage for the preferences step
        sessionStorage.setItem('basicProfileData', JSON.stringify(profileData));
        console.log('📝 Basic profile data stored in sessionStorage');
        
        // Store userType in localStorage for profile completion page
        localStorage.setItem('userType', 'creator');
        
        // Clear signup flow flag as user is moving to next step
        sessionStorage.removeItem('isSignupFlow');
        console.log('✅ Moving to preferences step - isSignupFlow flag cleared');
        
        // Navigate to preferences step using Next.js router
        console.log('🚀 Navigating to /creator-preferences...');
        console.log('🔍 Setting loading to false before navigation');
        setLoading(false); // Reset loading before navigation
        try {
          await router.push('/creator-preferences');
          console.log('✅ Navigation successful');
        } catch (navError) {
          console.error('❌ Navigation failed:', navError);
          // Fallback: try window.location
          console.log('🔄 Trying fallback navigation with window.location...');
          window.location.href = '/creator-preferences';
        }
             } catch (apiError) {
         console.error('❌ API call failed:', apiError);
         
         // Check if it's an authentication error
         if (apiError instanceof Error) {
           if (apiError.message.includes('401') || apiError.message.includes('403') || apiError.message.includes('Unauthorized')) {
             console.error('❌ Authentication error - redirecting to login');
             localStorage.removeItem('token');
             window.location.href = '/login';
             return;
           }
           
           if (apiError.message.includes('timeout') || apiError.message.includes('Network error')) {
             console.error('❌ Network/Timeout error:', apiError.message);
             showUserFriendlyError(apiError);
             setLoading(false);
             return;
           }
         }
         
         // For other errors, fallback to sessionStorage
         console.log('📝 Falling back to sessionStorage due to API error');
         sessionStorage.setItem('basicProfileData', JSON.stringify(profileData));
         console.log('📝 Basic profile data stored in sessionStorage (fallback)');
         
         // Store userType in localStorage for profile completion page
         localStorage.setItem('userType', 'creator');
         
         // Clear signup flow flag as user is moving to next step
         sessionStorage.removeItem('isSignupFlow');
         console.log('✅ Moving to preferences step - isSignupFlow flag cleared (fallback)');
         
         // Navigate to preferences step
         console.log('🚀 Navigating to /creator-preferences (fallback)...');
         setLoading(false);
         try {
           await router.push('/creator-preferences');
           console.log('✅ Navigation successful (fallback)');
         } catch (navError) {
           console.error('❌ Navigation failed (fallback):', navError);
           window.location.href = '/creator-preferences';
         }
       }
    } catch (error) {
      console.error('Unexpected error in handleNextStep:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    console.log('City selected:', selectedCity);
    setCity(selectedCity);
    setShowCityModal(false);
  };

  const handleGoogleEmailVerification = async () => {
    if (!email.trim()) {
      alert('Please enter your email address first');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setGoogleVerifying(true);
    
    try {
      console.log('🔍 Starting Google email verification...');
      
      // Use the actual Google OAuth service like mobile app
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user && result.user.email) {
        console.log('✅ Google email verification successful:', result.user.email);
        
        // Update the email field with the verified Google email
        setEmail(result.user.email);
        
        // Show success message like mobile app
        alert('Google account verified! Your email has been updated.');
        
        // Store the verification status
        sessionStorage.setItem('emailVerified', 'true');
        sessionStorage.setItem('verifiedEmail', result.user.email);
      } else {
        console.error('❌ Google email verification failed:', result.error);
        alert(result.error || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google email verification error:', error);
      alert('Failed to verify email with Google. Please try again.');
    } finally {
      setGoogleVerifying(false);
    }
  };

  // Define Feature component inside the main component
  const Feature = ({ title, description }: { title: string; description: string }) => (
    <div className="flex items-start space-x-2">
      {/* Orange checkmark icon inside circle */}
      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="8" height="8" className="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
        </svg>
      </div>
      <div>
        {/* Feature title - using Poppins SemiBold like mobile */}
        <h3 className="text-sm sm:text-base lg:text-lg font-poppins-semibold text-textDark mb-1">{title}</h3>
        {/* Feature description - using Poppins Regular like mobile */}
        <p className="text-xs sm:text-sm lg:text-base font-poppins-regular text-textLight leading-relaxed">{description}</p>
      </div>
    </div>
  );

  // Show loading screen while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen bg-white font-poppins-regular flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-poppins-semibold text-textDark mb-2">Checking Authentication...</h2>
          <p className="text-sm text-textGray">Please wait while we verify your login status</p>
        </div>
      </div>
    );
  }

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
          <Link href="/login" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Login
          </Link>
          {/* User Profile Icon - Man in suit */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-poppins-bold">👔</span>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 w-full bg-white">
        {/* Left Side - Features */}
        <div className="w-full lg:w-1/2 bg-[#FFF4ED] px-3 sm:px-6 lg:pl-12 lg:pr-3 xl:pl-16 xl:pr-6 py-12 sm:py-16 lg:py-24 flex flex-col justify-start items-center lg:items-center">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg w-full space-y-4 sm:space-y-6">
            <Feature
              title="Get Started in Minutes"
              description="Quick profile setup for brands and influencers—no complex steps."
            />
            <Feature
              title="Trusted Campaigns & Creators"
              description="Join verified campaigns or find influencers that match your brand."
            />
            <Feature
              title="Online & Offline Collaborations"
              description="Brands can book packages or hire creators for in-person promos."
            />
          </div>
          <div className="flex items-center mt-6 sm:mt-8 max-w-sm lg:max-w-md xl:max-w-lg w-full">
            {/* Four overlapping circular profile images */}
            <div className="flex -space-x-[12px]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-yellow-300 flex-shrink-0">
                <Image 
                  src="/images/profile1.svg" 
                  alt="Profile 1" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                      target.parentElement.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                    }
                  }}
                />
              </div>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-yellow-300 flex-shrink-0">
                <Image 
                  src="/images/profile2.svg" 
                  alt="Profile 2" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                      target.parentElement.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                    }
                  }}
                />
              </div>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-blue-300 flex-shrink-0">
                <Image 
                  src="/images/profile3.svg" 
                  alt="Profile 3" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-blue-300 flex items-center justify-center flex-shrink-0';
                      target.parentElement.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                    }
                  }}
                />
              </div>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex-shrink-0">
                <Image 
                  src="/images/profile4.svg" 
                  alt="Profile 4" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center flex-shrink-0';
                      target.parentElement.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Vertical separator line */}
            <div className="w-px h-6 sm:h-8 bg-textDark mx-2 sm:mx-3" />
            
            {/* Text content */}
            <div className="flex flex-col max-w-xs">
              <p className="text-[13px] font-poppins text-textDark leading-relaxed">
                Join 12,000+ influencers and 500+ brands already
              </p>
              <p className="text-[13px] font-poppins text-textDark leading-relaxed">
                building meaningful partnerships.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Profile Setup Form */}
        <div className="w-full lg:w-1/2 px-3 sm:px-6 lg:pl-3 lg:pr-12 xl:pl-6 xl:pr-16 py-12 sm:py-16 lg:py-24 flex flex-col justify-center items-center lg:items-center">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg w-full space-y-4 sm:space-y-6">
            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins-semibold text-textDark mb-2 sm:mb-3 text-left w-full tracking-wide lg:tracking-wider">
                You&apos;re almost there!
              </h2>
              <p className="text-xs sm:text-sm text-textGray font-poppins-regular">
                Just a few more details to complete your creator profile. This helps us personalize your experience and keep your account secure.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
            </div>
            <p className="text-xs text-textGray font-poppins-regular text-center">50%</p>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Gender</label>
              <div className="flex gap-3">
                {['Male', 'Female', 'Other'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={gender === option}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-4 h-4 text-secondary border-gray-300 focus:ring-secondary focus:ring-2"
                    />
                    <span className="text-sm font-poppins-regular text-textDark">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email Field - Dynamic based on signup method */}
            {isGoogleUser ? (
              // Email for Google users (already verified)
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Email ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="flex-1 py-2.5 px-3 border border-green-500 rounded-lg text-xs sm:text-sm font-poppins-regular text-textGray bg-white"
                  />
                  <div className="w-5 h-5 text-green-600">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="w-4 h-4 text-green-600 text-lg">✅</span>
                  <span className="text-xs text-green-700 font-poppins-regular">Your email is verified via Google</span>
                </div>
              </div>
            ) : (
              // Email for Phone users (verify via Google or use existing email)
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Email ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={`flex-1 py-2.5 px-3 border rounded-lg text-xs sm:text-sm font-poppins-regular bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                      sessionStorage.getItem('emailVerified') === 'true' && email.trim() !== ''
                        ? 'border-green-500 text-textGray' 
                        : 'border-gray-300 text-textDark'
                    }`}
                    disabled={sessionStorage.getItem('emailVerified') === 'true' && email.trim() !== ''}
                  />
                  {sessionStorage.getItem('emailVerified') === 'true' && email.trim() !== '' ? (
                    <div className="w-5 h-5 text-green-600">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <button
                      onClick={handleGoogleEmailVerification}
                      disabled={googleVerifying}
                      className="px-4 py-2.5 bg-[#20536d] text-white text-xs font-poppins-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {googleVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Verifying...
                        </>
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  )}
                </div>
                {sessionStorage.getItem('emailVerified') === 'true' && email.trim() !== '' ? (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-700 font-poppins-regular">
                      {sessionStorage.getItem('existingEmail') ? 'Your existing email is verified' : 'Your email is verified via Google'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="w-4 h-4 text-blue-600 text-lg">ℹ️</span>
                    <span className="text-xs text-blue-700 font-poppins-regular">
                      {sessionStorage.getItem('existingEmail') 
                        ? 'Please verify your existing email address with Google' 
                        : 'Please verify your email address with Google'
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Phone Number Field - Dynamic based on signup method */}
            {isGoogleUser ? (
              // Phone for Google users (needs verification)
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Phone Number</label>
                <div className="flex items-center gap-2">
                  <div className="flex border border-gray-300 rounded-lg items-center px-3 bg-white flex-1">
                    <span className="text-xs sm:text-sm font-poppins-medium text-textDark pr-2">+91</span>
                    <div className="w-px h-5 bg-gray-300 mr-2" />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isPhoneVerified}
                      className="flex-1 py-2.5 bg-transparent border-none outline-none text-xs sm:text-sm font-poppins-regular text-textDark"
                      maxLength={10}
                    />
                  </div>
                  {isPhoneVerified ? (
                    <div className="w-5 h-5 text-green-600">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      disabled={otpLoading || !phone.trim() || phone.length !== 10}
                      className="px-4 py-2.5 bg-[#20536d] text-white text-xs font-poppins-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  )}
                </div>
                {/* Phone verification status messages for Google users */}
                {!isPhoneVerified && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="w-4 h-4 text-blue-600 text-lg">ℹ️</span>
                    <span className="text-xs text-blue-700 font-poppins-regular">Please verify your phone number to continue</span>
                  </div>
                )}
                
                {/* Phone verification success message for Google users */}
                {isPhoneVerified && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-700 font-poppins-regular">Your phone number is verified</span>
                  </div>
                )}
                
                {/* OTP Error Display */}
                {otpError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <span className="w-4 h-4 text-red-600 text-lg">⚠️</span>
                    <span className="text-xs text-red-700 font-poppins-regular">{otpError}</span>
                  </div>
                )}
              </div>
            ) : (
              // Phone for Phone users (already verified)
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Phone Number</label>
                <div className="flex items-center gap-2">
                  <div className="flex border border-green-500 rounded-lg items-center px-3 bg-white flex-1">
                    <span className="text-xs sm:text-sm font-poppins-medium text-textDark pr-2">+91</span>
                    <div className="w-px h-5 bg-green-500 mr-2" />
                    <input
                      type="tel"
                      value={phone}
                      disabled
                      className="flex-1 py-2.5 bg-transparent border-none outline-none text-xs sm:text-sm font-poppins-regular text-textGray"
                    />
                  </div>
                  <div className="w-5 h-5 text-green-600">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-700 font-poppins-regular">Your phone number is verified</span>
                </div>
              </div>
            )}

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-xs sm:text-sm font-poppins-regular text-textDark bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">City</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    console.log('City modal toggle clicked, current state:', showCityModal);
                    console.log('Current city value:', city);
                    setShowCityModal(!showCityModal);
                  }}
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-xs sm:text-sm font-poppins-regular text-left bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent flex items-center justify-between"
                >
                  <span className={city ? 'text-textDark' : 'text-gray-500'}>
                    {city || 'Select your city'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* City Dropdown */}
                {showCityModal && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {cities.map((cityName) => (
                      <button
                        key={cityName}
                        onClick={() => handleCitySelect(cityName)}
                        className="w-full px-3 py-2 text-left text-sm font-poppins-regular text-textDark hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info - Remove in production */}
            {false && process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono">
                <div>Debug Info:</div>
                <div>Loading: {loading.toString()}</div>
                <div>City: &quot;{city.trim()}&quot;</div>
                <div>IsGoogleUser: {isGoogleUser.toString()}</div>
                <div>Phone: &quot;{phone.trim()}&quot;</div>
                <div>IsPhoneVerified: {isPhoneVerified.toString()}</div>
                <div>Email: &quot;{email.trim()}&quot;</div>
                <div>EmailVerified: {sessionStorage.getItem('emailVerified')}</div>
                <div>Date of Birth: &quot;{dob}&quot;</div>
                <div>Button Disabled: {isButtonDisabled.toString()}</div>
              </div>
            )}

            {/* Next Step Button */}
            <button
              onClick={() => {
                console.log('🎯 Next Step button clicked!');
                console.log('Button state:', {
                  loading,
                  city: city.trim(),
                  isGoogleUser,
                  phone: phone.trim(),
                  isPhoneVerified,
                  email: email.trim(),
                  emailVerified: sessionStorage.getItem('emailVerified')
                });
                handleNextStep();
              }}
                             disabled={isButtonDisabled}
              className="w-full py-2.5 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{ background: 'linear-gradient(180deg, #FE8F00, #FC5213)' }}
                             title={`Button state: loading=${loading}, city=${city.trim()}, dob=${dob}, ${isGoogleUser ? `phone=${phone.trim()}, verified=${isPhoneVerified}` : `email=${email.trim()}, verified=${sessionStorage.getItem('emailVerified')}`}, disabled=${isButtonDisabled}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  Next Step
                  <Image src="/icons/arrow.svg" alt="arrow" width={14} height={14} />
                </>
              )}
            </button>
            
            {/* Fallback Button - Skip API Call */}
            {false && process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  console.log('🔄 Fallback: Skipping API call, proceeding with sessionStorage...');
                  // Store data locally and proceed
                  const profileData = {
                    gender,
                    dob: dob,
                    city: city.trim(),
                    phone: isGoogleUser ? `+91${phone.trim()}` : undefined,
                    email: !isGoogleUser ? email.trim() : undefined
                  };
                  
                  sessionStorage.setItem('basicProfileData', JSON.stringify(profileData));
                  localStorage.setItem('userType', 'creator');
                  
                  // Navigate directly
                  window.location.href = '/creator-preferences';
                }}
                className="w-full py-2.5 text-[#20536d] text-sm font-poppins-semibold rounded-lg border-2 border-[#20536d] bg-white hover:bg-[#20536d] hover:text-white transition-colors mt-3"
              >
                🚨 Skip API Call (Development Only)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* City Modal Overlay */}
      {showCityModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowCityModal(false)}
        />
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          phone={`+91${phone}`}
          fullName=""
          userType="creator"
        />
      )}
    </div>
  );
}