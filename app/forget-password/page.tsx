'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="text-gray-600 text-sm">Enter the email associated with your account</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-900 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10 py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              If an account with that email exists, you will receive instructions to reset your password.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
