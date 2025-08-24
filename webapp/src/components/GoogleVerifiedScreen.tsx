'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/apiService';

export default function GoogleVerifiedScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    setLoading(true);
    try {
      // Get the selected user type from sessionStorage (set during Google signup)
      const selectedUserType = sessionStorage.getItem('selectedUserType');
      console.log('Selected user type from sessionStorage:', selectedUserType);
      
      // Navigate directly to the appropriate profile setup screen based on selected user type
      if (selectedUserType === 'brand') {
        console.log('Navigating to brand profile setup');
        router.push('/brand-profile-setup');
      } else {
        // Default to creator profile setup
        console.log('Navigating to creator profile setup');
        router.push('/profile-setup');
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      // Fallback: try to get user type from backend
      try {
        const profile = await authAPI.getUserProfile();
        const userType = profile.user?.userType || profile.user?.user_type || 'creator';
        console.log('User type from backend:', userType);
        
        if (userType === 'brand') {
          // Store userType in localStorage for profile completion page
          localStorage.setItem('userType', 'brand');
          router.push('/brand-profile-setup');
        } else {
          // Store userType in localStorage for profile completion page
          localStorage.setItem('userType', 'creator');
          router.push('/profile-setup');
        }
      } catch (backendError) {
        console.error('Backend fallback also failed:', backendError);
        // Final fallback: default to creator
        sessionStorage.setItem('selectedUserType', 'creator');
        localStorage.setItem('userType', 'creator');
        router.push('/profile-setup');
      }
    } finally {
      setLoading(false);
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
          <Link href="/signup-brand" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Illustration */}
         

          {/* Checkmark */}
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-poppins-bold text-textDark">
              Your Google account has been verified.
            </h1>
            <p className="text-base text-textGray font-poppins-regular leading-relaxed">
              We have successfully verified your Google account. You can now give a few personal details to access your dashboard.
            </p>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full py-3 px-8 bg-gradient-to-r from-[#FE8F00] to-[#FC5213] text-white font-poppins-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
