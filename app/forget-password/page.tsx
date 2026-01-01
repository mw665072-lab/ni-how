'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Validation Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgetPassword({ email });
      toast({ title: 'Success', description: res?.message || 'If that email exists, a reset link was sent.' });
      router.push('/login');
    } catch (err: any) {
      console.error('Forget password error:', err);
      toast({ title: 'Error', description: err?.message ?? 'An error occurred while requesting password reset', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [email, router, toast]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white flex flex-col items-center justify-center px-4 py-8 overflow-hidden">

      <img
        src="/images/LoginLogo2.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 z-0 w-[60%] max-w-[220px] h-auto max-h-[225px] opacity-100 transform-none md:top-0"
        style={{ transform: 'rotate(0deg)', opacity: 1 }}
      />
      <img
        src="/images/LoginLogo.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-0 z-0 w-[60%] max-w-[420px] h-auto max-h-[225px] opacity-100 transform-none sm:left-4 sm:bottom-0 lg:left-[5px] lg:bottom-0"
        style={{ transform: 'rotate(0deg)', opacity: 1 }}
      />

      <div className="w-[92%] max-w-[520px] relative z-10 mx-auto">
        <div className="bg-white p-6 sm:p-8 backdrop-blur-sm rounded-lg">
          <div className="mb-6 flex justify-center items-center">
            <h2 className="text-center" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: '24px', lineHeight: '100%', letterSpacing: '0%', textAlign: 'center', color: '#282828' }}>
              Forgot Password
            </h2>
          </div>

          <p className="text-center text-sm text-gray-600 mb-6" dir='ltr'>We will send you instructions on how to reset your password by email.</p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  aria-label="Email"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={false}
                  className="bg-[#ECECEC] border-0 hover:bg-[#ECECEC] focus:bg-[#ECECEC] focus-visible:bg-[#ECECEC] focus:border-0 focus-visible:border-0 focus:ring-0 focus-visible:ring-0 outline-none w-full h-11 sm:h-[44px] px-4 rounded-[12px]"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="transition duration-200 shadow-md w-full sm:max-w-[470.5px] h-11 sm:h-[45px] gap-[10px] rounded-[12px] border-b-[3px] border-b-[#20672F] hover:bg-[#35AB4E] bg-[#35AB4E] text-[#ECECEC] font-nunito font-bold text-[16px]">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Continue
                </>
              ) : (
                'Continue'
              )}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
