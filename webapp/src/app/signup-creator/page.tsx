'use client';

import { useEffect } from 'react';
import ProfileSetupScreen from '@/components/ProfileSetupScreen';

export default function SignupCreatorPage() {
  useEffect(() => {
    // Set flag to indicate user is in signup flow
    sessionStorage.setItem('isSignupFlow', 'true');
    console.log('✅ Creator signup flow started - isSignupFlow flag set');
  }, []);

  return <ProfileSetupScreen />;
}
