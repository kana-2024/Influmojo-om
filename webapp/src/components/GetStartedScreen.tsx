'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/apiService';
import { COLORS } from '@/config/colors';
import { googleAuthService } from '@/services/googleAuth';
import OtpVerificationModal from './OtpVerificationModal';

export default function GetStartedScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'creator' | 'brand' | null>(null);

  // Store selectedUserType in sessionStorage whenever it changes
  useEffect(() => {
    if (selectedUserType) {
      sessionStorage.setItem('selectedUserType', selectedUserType);
    }
  }, [selectedUserType]);

  // Load selectedUserType from sessionStorage on component mount
  useEffect(() => {
    const storedUserType = sessionStorage.getItem('selectedUserType') as 'creator' | 'brand' | null;
    if (storedUserType) {
      setSelectedUserType(storedUserType);
    }
  }, []);

  const handleGoogleSignUp = async () => {
    if (!selectedUserType) {
      setError('Please select whether you are signing up as a Creator or Brand');
      return;
    }

    setWarning('');
    setGoogleLoading(true);
    setError('');

    try {
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user && result.idToken) {
        console.log('✅ Google OAuth successful:', result.user);
        console.log('🔑 Google ID token received:', result.idToken ? 'Yes' : 'No');
        
        try {
          console.log('🔄 Calling backend Google auth API...');
          // Call backend API with Google ID token for signup
          const apiResult = await authAPI.googleAuth(result.idToken, true, selectedUserType || 'creator');
          
          console.log('📡 Backend Google auth response:', apiResult);
          
          if (apiResult.success) {
            console.log('✅ Backend Google auth successful');
            console.log('👤 User exists:', apiResult.userExists);
            console.log('🆕 Is new user:', apiResult.isNewUser);
            
            // New user created successfully, ensure profiles are created
            try {
              console.log('🔄 Creating missing profiles...');
              await authAPI.createMissingProfiles();
              console.log('✅ Profiles created successfully');
            } catch (profileErr) {
              console.error('❌ Profile creation failed:', profileErr);
              console.warn('⚠️ Profile creation warning - user may not have complete profile setup');
              // Don't block the flow if profile creation fails
            }
            
            // Store Google user information in sessionStorage like mobile app
            sessionStorage.setItem('fromGoogle', 'true');
            sessionStorage.setItem('userEmail', result.user.email);
            sessionStorage.setItem('authProvider', 'google');
            sessionStorage.setItem('selectedUserType', selectedUserType || 'creator');
            sessionStorage.setItem('googleToken', result.idToken);
            
            console.log('💾 Google user data stored in sessionStorage');
            
            // Proceed to Google verification screen
            router.push('/google-verified');
          } else {
            console.error('❌ Backend Google auth failed:', apiResult.error);
            setWarning(apiResult.error || 'Backend authentication failed. Please try again.');
          }
        } catch (apiError: unknown) {
          console.error('❌ Backend API error:', apiError);
          
          // Handle specific error cases
          if (typeof apiError === 'object' && apiError && 'message' in apiError && typeof apiError.message === 'string' && apiError.message.includes('409')) {
            // User already exists - redirect to login
            console.log('⚠️ User already exists, redirecting to login');
            setWarning('An account with this Google account already exists. Redirecting to login...');
            setTimeout(() => {
              router.push('/login');
            }, 2000);
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

  const handleCreateAccount = async () => {
    if (loading) return;

    setLoading(true);
    setWarning('');
    setError('');

    // Validate inputs
    if (!selectedUserType) {
      setError('Please select whether you are signing up as a Creator or Brand');
      setLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your mobile number');
      setLoading(false);
      return;
    }

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    // Clear any Google-related sessionStorage data since user is choosing mobile signup
    sessionStorage.removeItem('fromGoogle');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('googleToken');
    sessionStorage.removeItem('authProvider');
    
    // Clear any old phone data from previous sessions
    sessionStorage.removeItem('verifiedPhone');
    sessionStorage.removeItem('userData');
    
    // Set mobile signup indicator
    sessionStorage.setItem('authProvider', 'mobile');
    sessionStorage.setItem('selectedUserType', selectedUserType);
    
    console.log('📱 GetStartedScreen - Mobile signup chosen, cleared Google data and old phone data, set authProvider=mobile');

    try {
      // Check if user already exists
      const checkResult = await authAPI.checkUserExists(`+91${phone}`);
      
      if (checkResult.exists) {
        setWarning('An account with this phone number already exists. Please log in instead.');
        setLoading(false);
        return;
      }
      
      // User doesn't exist, proceed with OTP
      await authAPI.sendOTP(`+91${phone}`);
      
      setLoading(false);
      setShowOtpModal(true);
    } catch (err: unknown) {
      console.error('OTP request failed:', err);
      if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string' && err.message.includes('429')) {
        const timeRemaining = (err as { timeRemaining?: number; retryAfter?: number }).timeRemaining || (err as { timeRemaining?: number; retryAfter?: number }).retryAfter || 60;
        setWarning(`Please wait ${timeRemaining} seconds before requesting another code.`);
      } else if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string' && err.message.includes('409')) {
        setWarning('An account with this phone number already exists. Please log in instead.');
      } else {
        setWarning('Network error. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  const handleOtpSuccess = (user: unknown) => {
    setShowOtpModal(false);
    
    // Store user data in sessionStorage for the next screen
    if (user && typeof user === 'object' && user !== null && 'phone' in user) {
      const userObj = user as { phone?: string };
      console.log('💾 GetStartedScreen - Storing user data in sessionStorage:', user);
      console.log('📱 GetStartedScreen - User phone number:', userObj.phone);
      console.log('📱 GetStartedScreen - Current phone state:', phone);
      
      sessionStorage.setItem('userData', JSON.stringify(user));
      
      // Also store the phone number separately for easy access
      if (userObj.phone) {
        sessionStorage.setItem('verifiedPhone', userObj.phone);
        console.log('📱 GetStartedScreen - Stored verified phone:', userObj.phone);
      } else {
        console.log('⚠️ GetStartedScreen - No phone number in user object, using current phone state');
        // Fallback: store the phone number that was used for OTP
        sessionStorage.setItem('verifiedPhone', `+91${phone}`);
      }
    }
    
    // Navigate directly to the appropriate profile setup screen based on selected user type
    const userType = selectedUserType || 'creator';
    if (userType === 'brand') {
      router.push('/brand-profile-setup');
    } else {
      router.push('/profile-setup');
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins-regular flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-1">
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
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
          <Link href="/how-it-works" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            How it works
          </Link>
          <Link href="/pricing" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Pricing
          </Link>
          {/* Only show signup options if user hasn't completed signup yet */}
          <button 
            onClick={() => setSelectedUserType('creator')}
            className={`font-poppins-medium transition-colors text-xs lg:text-sm ${
              selectedUserType === 'creator' 
                ? 'text-secondary' 
                : 'text-textDark hover:text-secondary'
            }`}
          >
            Sign up as Creator
          </button>
          <button 
            onClick={() => setSelectedUserType('brand')}
            className={`font-poppins-medium transition-colors text-xs lg:text-sm ${
              selectedUserType === 'brand' 
                ? 'text-secondary' 
                : 'text-textDark hover:text-secondary'
            }`}
          >
            Sign up as Brand
          </button>
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

      {/* User Type Selection Message */}
      {selectedUserType && (
        <div className="bg-blue-50 border-l-4 border-secondary p-4 mx-4 mt-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-secondary font-poppins-medium">
                You&apos;re signing up as a <span className="font-poppins-semibold">{selectedUserType === 'brand' ? 'Brand' : 'Creator'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

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
            {/* Four overlapping circular profile images - matching screenshot */}
            <div className="flex -space-x-[12px]">
              {/* First profile - Yellow background, dark curly hair */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-yellow-300 flex-shrink-0">
                <Image 
                  src="/images/profile1.svg" 
                  alt="Profile 1" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                  }}
                />
              </div>
              
              {/* Second profile - Yellow background, dark straight hair */}
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
              
              {/* Third profile - Light blue background, dark wavy hair */}
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
              
              {/* Fourth profile - Light gray/beige background, smiling man with beard */}
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
            
            {/* Text content - split into two lines as shown in screenshot */}
            <div className="flex flex-col max-w-xm">
              <p className="text-[13px] font-poppins text-textDark leading-relaxed">
                Join 12,000+ influencers and 500+ brands already
              </p>
              <p className="text-[13px] font-poppins text-textDark leading-relaxed">
                building meaningful partnerships.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 px-3 sm:px-6 lg:pl-3 lg:pr-12 xl:pl-6 xl:pr-16 py-12 sm:py-16 lg:py-24 flex flex-col justify-center items-center lg:items-center">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg w-full space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins-semibold text-textDark mb-3 sm:mb-4 text-left w-full tracking-wide lg:tracking-wider" style={{ 
              wordSpacing: 'clamp(0.1em, 2vw, 0.2em)',
              letterSpacing: '0.05em'
            }}>Let&apos;s Get You Started with InfluMojo</h2>

            {/* Error and Warning Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {warning && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">{warning}</p>
              </div>
            )}

            {/* Social Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4 w-full">
              <div className="flex-1 w-full min-w-0">
                <GoogleButton onClick={handleGoogleSignUp} loading={googleLoading} disabled={!selectedUserType} />
              </div>
              <div className="flex-1 w-full min-w-0">
                <FacebookButton disabled={!selectedUserType} />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 my-3 sm:my-4 w-full">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-xs font-poppins-bold text-textGray px-3 flex-shrink-0">or</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            {/* Form */}
            <div className="space-y-3 w-full">
              <InputField
                label="Full Name*"
                placeholder={selectedUserType === 'brand' ? "e.g. Company Name" : "e.g. John Doe"}
                value={fullName}
                onChange={setFullName}
              />
              <PhoneField
                label="Phone Number*"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={setPhone}
              />
            </div>

            {/* Checkbox + Button */}
            <div className="space-y-3 mt-4 w-full">
              <div className="flex items-start gap-1 text-xs text-textGray w-full">
                <input type="checkbox" className="mt-0.5 w-3 h-3 text-secondary border-gray-300 rounded focus:ring-secondary flex-shrink-0" />
                <span className="flex-1 min-w-0 font-poppins-regular">
                  By creating an account, you agree to Influmojo&apos;s{' '}
                  <Link href="#" className="text-blue-600 underline font-poppins-medium">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-blue-600 underline font-poppins-medium">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </div>
              <button
                onClick={handleCreateAccount}
                disabled={loading || !selectedUserType}
                className="w-full py-2.5 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: COLORS.gradientOrange }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <Image src="/icons/arrow.svg" alt="arrow" width={14} height={14} />
                  </>
                )}
              </button>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-textGray mt-4 w-full font-poppins-regular">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 underline font-poppins-medium">
                Login here
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
        fullName={fullName.trim()}
        userType={selectedUserType || 'creator'}
      />
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

function GoogleButton({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled?: boolean }) {
  return (
    <div id="google-signin-container">
      <button 
        onClick={onClick}
        disabled={loading || disabled}
        className="flex items-center justify-center border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 hover:bg-gray-50 transition-colors bg-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-xs sm:text-sm font-poppins-medium text-textDark">Signing up...</span>
        </>
      ) : (
        <>
          {/* Google Logo - Multi-colored */}
          <div className="mr-2 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fillRule="evenodd">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </g>
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-poppins-medium text-textDark whitespace-nowrap">Sign up with Google</span>
        </>
      )}
    </button>
    </div>
  );
}

function FacebookButton({ disabled }: { disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      className="flex items-center justify-center border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 hover:bg-gray-50 transition-colors bg-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Facebook Logo - Blue square with white 'f' */}
      <div className="mr-2 flex-shrink-0">
        <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-poppins-bold text-xs">f</span>
        </div>
      </div>
      <span className="text-xs sm:text-sm font-poppins-medium text-textDark whitespace-nowrap">Sign up with Facebook</span>
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark mb-1.5">{label}</label>
      <input
        className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-xs sm:text-sm font-poppins-regular text-textDark bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PhoneField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">{label}</label>
      <div className="flex border border-gray-300 rounded-lg items-center px-3 bg-white">
        <span className="text-xs sm:text-sm font-poppins-medium text-textDark pr-2">+91</span>
        <div className="w-px h-5 bg-gray-300 mr-2" />
        <input
          className="flex-1 py-2.5 bg-transparent border-none outline-none text-xs sm:text-sm font-poppins-regular text-textDark"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex items-center text-xs text-textGray mt-1">
        <div className="w-3 h-3 bg-gray-300 rounded-full flex items-center justify-center mr-1">
          <span className="text-gray-500 text-[8px] font-poppins-bold" style={{ lineHeight: '1', transform: 'translateY(-1px)' }}>i</span>
        </div>
        <span className="font-poppins-regular">We will send you OTP on this mobile number to verify!</span>
      </div>
    </div>
  );
}
