'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI, profileAPI } from '@/services/apiService';
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
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  
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
      
      console.log('🔍 ProfileSetupScreen - SessionStorage check:', {
        fromGoogle,
        authProvider,
        userEmail,
        userData: sessionStorage.getItem('userData')
      });
      
      // User is Google user if they have fromGoogle flag OR authProvider is 'google'
      if (fromGoogle || authProvider === 'google') {
        console.log('✅ ProfileSetupScreen - User is Google user');
        setIsGoogleUser(true);
        // Pre-fill email if available
        if (userEmail) {
          setEmail(userEmail);
        }
      } else if (authProvider === 'mobile') {
        console.log('📱 ProfileSetupScreen - User is mobile user');
        // User is mobile user - clear any Google-related data
        setIsGoogleUser(false);
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
      if (storedUserType === 'brand') {
        console.log('Creator ProfileSetupScreen: User is brand, redirecting to brand profile setup');
        router.push('/brand-profile-setup');
        return;
      }
    };
    
    checkUserType();
    checkGoogleUser();
    
    // Check if email was already verified in this session
    const emailVerified = sessionStorage.getItem('emailVerified');
    if (emailVerified === 'true') {
      console.log('✅ ProfileSetupScreen - Email already verified in this session');
    }
  }, [router]);
  
  // Monitor email changes and clear verification if email is cleared
  useEffect(() => {
    if (!email.trim() && sessionStorage.getItem('emailVerified') === 'true') {
      console.log('🗑️ ProfileSetupScreen - Email cleared, removing verification status');
      sessionStorage.removeItem('emailVerified');
      sessionStorage.removeItem('verifiedEmail');
    }
  }, [email]);

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
    
    console.log('Validation passed successfully');
    
    setLoading(true);
    
    try {
      // Prepare basic profile data - different for Google vs phone users
      const profileData: {
        gender: string;
        dob: string;
        state: string;
        city: string;
        pincode: string;
        email?: string;
        phone?: string;
      } = {
        gender,
        dob: dob,
        state: 'Maharashtra', // Default state - can be made configurable later
        city: city.trim(),
        pincode: '400001' // Default pincode - can be made configurable later
      };

      // Add email/phone based on user type
      if (isGoogleUser) {
        // Google user: email is already verified, phone needs verification
        profileData.email = email.trim();
        profileData.phone = `+91${phone.trim()}`;
      } else {
        // Phone user: phone is already verified, email needs verification
        profileData.phone = `+91${phone.trim()}`;
        profileData.email = email.trim();
      }

      // Add email/phone based on user type
      if (isGoogleUser) {
        // Google user: email is already verified, phone needs verification
        profileData.email = email.trim();
        profileData.phone = `+91${phone.trim()}`;
      } else {
        // Phone user: phone is already verified, email needs verification
        profileData.phone = `+91${phone.trim()}`;
        profileData.email = email.trim();
      }
      
      console.log('Preparing basic profile data:', profileData);
      
      // Save basic profile data to the database
      console.log('Saving basic profile data to database:', profileData);
      
      try {
        // First, ensure the creator profile exists by calling createMissingProfiles
        console.log('🔄 Creating missing creator profile first...');
        const createProfileResponse = await authAPI.createMissingProfiles();
        console.log('✅ Profile creation response:', createProfileResponse);
        
        const basicInfoResponse = await profileAPI.updateBasicInfo(profileData);
        console.log('Basic profile saved to database:', basicInfoResponse);
        
        if (basicInfoResponse.success) {
          // Also store in sessionStorage for the preferences step
          sessionStorage.setItem('basicProfileData', JSON.stringify(profileData));
          console.log('Basic profile data also stored in sessionStorage');
          
          // Store userType in localStorage for profile completion page
          localStorage.setItem('userType', 'creator');
          
          // Navigate to preferences step using Next.js router
          router.push('/creator-preferences');
        } else {
          throw new Error(basicInfoResponse.message || 'Failed to save basic profile');
        }
      } catch (saveError) {
        console.error('Failed to save basic profile to database:', saveError);
        
        // Even if saving fails, store in sessionStorage and continue
        // The preferences step can try to save it again
        sessionStorage.setItem('basicProfileData', JSON.stringify(profileData));
        console.log('Basic profile data stored in sessionStorage despite save failure');
        
        // Store userType in localStorage for profile completion page
        localStorage.setItem('userType', 'creator');
        
        // Navigate to preferences step using Next.js router
        router.push('/creator-preferences');
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

  return (
    <div className="min-h-screen bg-white font-poppins-regular flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <img 
            src="/images/logo1.svg" 
            alt="im logo" 
            className="h-7 w-auto"
            onError={(e) => {
              console.error('Failed to load logo1.svg');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <img 
            src="/images/logo2.svg" 
            alt="influ mojo text" 
            className="h-7 w-auto"
            onError={(e) => {
              console.error('Failed to load logo2.svg');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

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
        <div className="w-full lg:w-1/2 bg-[#FFF4ED] px-3 sm:px-6 lg:pl-12 lg:pr-3 xl:pl-16 xl:pr-6 py-12 sm:py-16 lg:py-24 flex flex-col justify-center items-center lg:items-center">
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
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
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
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
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
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-blue-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
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
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
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
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-700 font-poppins-regular">Your email is verified via Google</span>
                </div>
              </div>
            ) : (
              // Email for Phone users (verify via Google)
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
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-700 font-poppins-regular">Your email is verified via Google</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-blue-700 font-poppins-regular">Please verify your email address with Google</span>
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
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
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
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
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

            {/* Next Step Button */}
            <button
              onClick={handleNextStep}
              disabled={loading || !city.trim() || (isGoogleUser ? (!phone.trim() || !isPhoneVerified) : (!email.trim() || sessionStorage.getItem('emailVerified') !== 'true'))}
              className="w-full py-2.5 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{ background: 'linear-gradient(180deg, #FE8F00, #FC5213)' }}
              title={`Button state: loading=${loading}, city=${city.trim()}, ${isGoogleUser ? `phone=${phone.trim()}, verified=${isPhoneVerified}` : `email=${email.trim()}, verified=${sessionStorage.getItem('emailVerified')}`}`}
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