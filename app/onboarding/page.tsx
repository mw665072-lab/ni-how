'use client';

import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function OnboardingPage() {
  useAuthProtection();

  const { state, completeOnboarding } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (state.hasCompletedOnboarding) {
      router.push('/units');
    }
  }, [state.hasCompletedOnboarding, router]);

  if (state.hasCompletedOnboarding) {
    return null;
  }

  return <OnboardingScreen onComplete={completeOnboarding} />;
}

