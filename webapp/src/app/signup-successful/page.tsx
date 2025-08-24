'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SignupSuccessfulPage() {
  const router = useRouter();

  const redirectToDashboard = useCallback(() => {
    const userType = localStorage.getItem('userType');
    if (userType === 'creator') {
      router.push('/dashboard/creator');
    } else if (userType === 'brand') {
      router.push('/dashboard/brand');
    } else {
      // Fallback to creator dashboard if user type is not set
      router.push('/dashboard/creator');
    }
  }, [router]);

  useEffect(() => {
    // Auto-redirect after 3 seconds to the appropriate dashboard
    const timer = setTimeout(() => {
      redirectToDashboard();
    }, 3000);

    return () => clearTimeout(timer);
  }, [redirectToDashboard]);

  const handleContinue = () => {
    redirectToDashboard();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign Up Successful!
        </h1>
        
        <p className="text-gray-600 mb-4">
          Welcome to Influ Mojo! Your account has been created successfully.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          You will be automatically redirected to your dashboard in a few seconds...
        </p>
        
        <button
          onClick={handleContinue}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
