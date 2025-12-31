'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter();
  const { state } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Give context time to load from storage
      const timer = setTimeout(() => {
        setIsLoading(false);

        // If user is authenticated, redirect to dashboard or onboarding
        if (state.isAuthenticated) {
          if (!state.hasCompletedOnboarding) {
            // Usually handled by onboarding page or specialized flow, 
            // but redirecting to dashboard which handles onboarding check is safer
            router.push('/student/dashboard');
          } else {
            router.push('/student/dashboard');
          }
        }
        // If NOT authenticated, we stay here (Welcome Page)
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state.isAuthenticated, state.hasCompletedOnboarding, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-[#35AB4E] font-bold">Loading...</div>
    </div>;
  }

  // If authenticated, we are redirecting, so return null or loader
  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">

      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 z-10">

        {/* Left Side (Image) - Hidden on mobile, effectively moved to center */}
        {/* In RTL: Order 2 puts it on the Left (End) */}
        <div className="hidden md:flex w-full md:w-1/2 justify-center md:justify-start lg:justify-center order-2 md:order-2">
          <div className="relative w-[500px] h-[500px] md:w-[650px] md:h-[650px] lg:w-[700px] lg:h-[700px]">
            <Image
              src="/images/welcome.png"
              alt="NiHaoNow Characters"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Side (Content) */}
        {/* In RTL: Order 1 puts it on the Right (Start) */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-right order-1 md:order-1">

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#333] mb-6 md:mb-8 leading-tight">
            تعلم الصينية بطريقة <br />
            <span className="text-[#333]">ممتعة</span>
          </h1>

          {/* Mobile Image (Visible only on mobile) */}
          <div className="md:hidden relative w-[280px] h-[280px] mb-8">
            <Image
              src="/images/welcome.png"
              alt="NiHaoNow Characters"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Buttons */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            <Link href="/register" className="w-full">
              <Button className="w-full bg-[#35AB4E] hover:bg-[#298E3E] text-white font-bold py-6 text-lg rounded-xl shadow-md transition-transform active:scale-[0.98]">
                Get Started
              </Button>
            </Link>

            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-6 text-lg rounded-xl transition-colors">
                I already have an account
              </Button>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 md:mt-12 flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-500 font-medium">
            <Link href="#" className="hover:underline">Terms of Use</Link>
            <span>|</span>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <span className="mr-auto md:mr-0 md:ml-auto">© NiHaoNow 2025 Inc.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
