'use client';

import { useEffect } from 'react';
import BrandProfileSetupScreen from '@/components/BrandProfileSetupScreen';

export default function SignupBrandPage() {
  useEffect(() => {
    // Set flag to indicate user is in signup flow
    sessionStorage.setItem('isSignupFlow', 'true');
    console.log('✅ Brand signup flow started - isSignupFlow flag set');
  }, []);

  return <BrandProfileSetupScreen />;
}
