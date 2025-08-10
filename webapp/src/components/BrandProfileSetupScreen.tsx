'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authAPI } from '@/services/apiService';
import OtpVerificationModal from './OtpVerificationModal';

export default function BrandProfileSetupScreen() {
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

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ];

  useEffect(() => {
    // Check if user is Google user (this would come from auth context or localStorage)
    const checkGoogleUser = () => {
      // For now, assume Google user if coming from Google verification
      const fromGoogle = sessionStorage.getItem('fromGoogle');
      if (fromGoogle) {
        setIsGoogleUser(true);
        // Pre-fill email if available
        const userEmail = sessionStorage.getItem('userEmail');
        if (userEmail) {
          setEmail(userEmail);
        }
      }
    };
    
    checkGoogleUser();
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
        alert(`OTP: ${result.OTP || result.otp}\n\nThis is shown only in development mode.`);
      }
      
      setOtpLoading(false);
      setShowOtpModal(true);
    } catch (err: any) {
      console.error('❌ OTP request failed:', err);
      if (err.message?.includes('429') || err.error === 'Rate limit exceeded') {
        const timeRemaining = err.timeRemaining || err.retryAfter || 60;
        setOtpError(`Please wait ${timeRemaining} seconds before requesting another code.`);
      } else if (err.message?.includes('409')) {
        setOtpError('An account with this phone number already exists. Please log in instead.');
      } else {
        setOtpError('Network error. Please check your connection and try again.');
      }
      setOtpLoading(false);
    }
  };

  const handleOtpSuccess = (user: any) => {
    setShowOtpModal(false);
    setIsPhoneVerified(true);
    // Store user data if needed
    if (user) {
      sessionStorage.setItem('userData', JSON.stringify(user));
    }
  };

  const handleNextStep = async () => {
    if (loading) return;
    
    // Validation
    if (!phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    
    if (!city.trim()) {
      alert('Please select your city');
      return;
    }

    if (!isPhoneVerified) {
      alert('Please verify your phone number first');
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Save basic profile data to backend
      console.log('Saving basic brand profile data:', { gender, email, phone, dob, city });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to brand preferences step
      window.location.href = '/brand-preferences';
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityModal(false);
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
          <Link href="/signup-brand" className="text-secondary font-poppins-medium hover:text-opacity-80 transition-colors text-xs lg:text-sm">
            Sign up as brand
          </Link>
          <Link href="/signup-creator" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
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
                  src="/images/profile3.svg" 
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
                You're almost there!
              </h2>
              <p className="text-xs sm:text-sm text-textGray font-poppins-regular">
                Just a few more details to complete your brand profile. This helps us personalize your experience and keep your account secure.
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

            {/* Email Field (for Google users) */}
            {isGoogleUser && (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Email ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg text-xs sm:text-sm font-poppins-regular text-textGray bg-gray-50"
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
            )}

            {/* Phone Number Field */}
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
              {!isPhoneVerified && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-blue-700 font-poppins-regular">Please verify your phone number to continue</span>
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
                  onClick={() => setShowCityModal(!showCityModal)}
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
              disabled={loading || !phone.trim() || !city.trim() || !isPhoneVerified}
              className="w-full py-2.5 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{ background: 'linear-gradient(180deg, #FE8F00, #FC5213)' }}
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
          userType="brand"
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
