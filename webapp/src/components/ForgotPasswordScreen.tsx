'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/services/apiService';
import { COLORS } from '@/config/colors';
import OtpVerificationModal from './OtpVerificationModal';

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleSendOtp = async () => {
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
        // User exists, send OTP for password reset
        const result = await authAPI.sendOTP(formattedPhone);
        if (result.success) {
          setIsResetMode(true);
          setShowOtpModal(true);
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      } else {
        // User doesn't exist, show signup option
        setWarning('No account found with this phone number. Would you like to create a new account?');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.message?.includes('429') || error.error === 'Rate limit exceeded') {
        const timeRemaining = error.timeRemaining || error.retryAfter || 60;
        setError(`Please wait ${timeRemaining} seconds before requesting another code.`);
      } else {
        setError('Failed to verify phone number. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = (user: any) => {
    setShowOtpModal(false);
    // Redirect to password reset form or show success message
    setWarning('OTP verified successfully! You can now reset your password.');
    // Here you would typically show a password reset form
    // For now, we'll just show a success message
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
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-poppins-bold text-textDark mb-2">
              Forgot Password?
            </h1>
            <p className="text-textGray text-sm">
              Enter your phone number to receive a verification code
            </p>
          </div>

          {/* Phone Input Form */}
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
                We'll send a one-time OTP to this number for verification
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
              onClick={handleSendOtp}
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
                'Send OTP'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <p className="text-sm text-textGray">
              Remember your password?{' '}
              <Link href="/login" className="text-secondary font-poppins-medium hover:underline">
                Back to login
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
