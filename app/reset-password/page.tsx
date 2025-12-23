"use client";

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams?.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({ title: 'Invalid link', description: 'No token provided in the URL', variant: 'destructive' });
    }
  }, [token, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!newPassword) {
      toast({ title: 'Validation Error', description: 'Please enter a new password', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: 'Validation Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Validation Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({ token, newPassword });
      toast({ title: 'Success', description: res?.message || 'Password has been reset. Please login.' });
      router.push('/login');
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast({ title: 'Error', description: err?.message ?? 'An error occurred while resetting the password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [token, newPassword, confirmPassword, router, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
        <p className="text-gray-600 text-sm">Enter a strong new password for your account</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-semibold text-gray-900 block">New Password</label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                className="py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900 block">Confirm Password</label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <Button type="submit" disabled={isLoading || !token} className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              This link will expire in 1 hour. If it has expired, request a new reset from the login page.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
