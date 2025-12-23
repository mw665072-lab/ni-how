'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const router = useRouter();
  const { completeOnboarding, state } = useAppContext();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Give context time to load from storage
      const timer = setTimeout(() => {
        setIsLoading(false);
        
        // If user is authenticated but hasn't completed onboarding
        if (state.isAuthenticated && !state.hasCompletedOnboarding) {
          // Stay on this page for onboarding
          return;
        }
        
        // If user is authenticated and completed onboarding
        if (state.isAuthenticated && state.hasCompletedOnboarding) {
          router.push('/units');
          return;
        }
        
        // If user is not authenticated, redirect to login
        if (!state.isAuthenticated) {
          router.push('/login');
          return;
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state.isAuthenticated, state.hasCompletedOnboarding, router]);

  const handleOnboardingComplete = (userName: string) => {
    completeOnboarding(userName);
    setIsOnboardingComplete(true);
    // Redirect after onboarding
    router.push('/units');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Only show onboarding if user is authenticated
  if (!state.isAuthenticated) {
        router.push('/login');
  }

  return (
    <OnboardingScreen onComplete={handleOnboardingComplete} />
  );
}
