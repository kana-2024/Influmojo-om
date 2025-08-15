'use client';

import { useState, useEffect, useRef } from 'react';
import { authAPI } from '@/services/apiService';
import { COLORS } from '@/config/colors';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: unknown) => void;
  phone: string;
  fullName: string;
  userType?: string;
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  phone,
  fullName,
  userType = 'creator'
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to 6 digits
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']); // Reset to 6 empty strings
      setError('');
      setCountdown(60);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) { // Changed from 3 to 5 for 6 digits
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input if value is deleted
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { // Changed from 4 to 6
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.verifyOTP(phone, otpString, fullName, userType);
      
      console.log('📡 OTP verification API response:', result);
      
      if (result.success) {
        console.log('✅ OTP verification successful, user data:', result.user);
        console.log('🔑 Token received:', result.token ? 'Yes' : 'No');
        
        // Ensure profiles are created for new users
        // Add a small delay to ensure token is properly stored in localStorage
        try {
          console.log('🔄 Waiting for token to be stored...');
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('🔄 Creating missing profiles...');
          const profileResult = await authAPI.createMissingProfiles();
          console.log('✅ Profile creation result:', profileResult);
        } catch (profileErr) {
          console.error('❌ Profile creation failed:', profileErr);
          console.warn('⚠️ Profile creation warning - user may not have complete profile setup');
          // Don't block the flow if profile creation fails
        }
        
        onSuccess(result.user || result);
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      // Create a proper error interface
      interface ApiError {
        message?: string;
      }
      const apiError = err as ApiError;
      setError(apiError?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const result = await authAPI.sendOTP(phone);
      if (result.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']); // Reset to 6 empty strings
        setError('');
        
        // Show OTP in development mode like mobile
        if (process.env.NODE_ENV === 'development' && result.otp) {
          alert(`OTP: ${result.otp}\n\nThis is shown only in development mode.`);
        }
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      // Create a proper error interface
      interface ApiError {
        message?: string;
      }
      const apiError = err as ApiError;
      setError(apiError?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-poppins-semibold text-textDark">Verify Phone Number</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-textGray mb-2">
            We&apos;ve sent a verification code to:
          </p>
          <p className="text-base font-poppins-medium text-textDark">
            {phone}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-poppins-semibold text-textDark mb-3">
            Enter 6-digit code
          </label>
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
                              <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-poppins-semibold focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder=""
                />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.join('').length !== 6} // Changed from 4 to 6
          className="w-full py-3 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: COLORS.gradientOrange }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-textGray">
            Didn&apos;t receive the code?{' '}
            {countdown > 0 ? (
              <span className="text-textDark">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-secondary font-poppins-medium hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
} 