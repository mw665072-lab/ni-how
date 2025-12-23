'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { authApi } from '@/lib/api';
import { setAuthToken } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

type FormData = {
  email: string;
  username: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = name === 'email' ? value.trimStart() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof FormData);
  };

  const validateField = (field: keyof FormData) => {
    const value = (formData[field] ?? '').toString();
    let error = '';
    if (!value.trim()) {
      error = 'This field is required';
    } else {
      if (field === 'username' && value.length < 3) {
        error = 'Username must be at least 3 characters long';
      }
      if (field === 'password' && value.length < 6) {
        error = 'Password must be at least 6 characters long';
      }
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Please enter a valid email address';
      }
    }
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
    return !error;
  };

  const validateForm = (): boolean => {
    const fields: (keyof FormData)[] = ['email', 'username', 'password'];
    const fieldResults = fields.map(f => validateField(f));
    const ok = fieldResults.every(Boolean);
    if (!ok) {
      toast({ title: 'Validation Error', description: 'Please fix the highlighted fields', variant: 'destructive' });
    }
    return ok;
  };

  const normalizeResponse = (res: any) => {
    if (!res) return { token: null, user: null, message: 'Empty response from server' };
    const token = res.access_token ?? res.token ?? res.data?.access_token ?? null;
    const user = res.user ?? res.data?.user ?? res.data ?? null;
    const message = res.message ?? res.error ?? res.data?.message ?? null;
    return { token, user, message };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      const { token, user, message } = normalizeResponse(response);

      if (!token || !user) {
        toast({ title: 'Registration Error', description: message || 'Registration failed', variant: 'destructive' });
        return;
      }

      try {
        setAuthToken(token);
      } catch (err) {
        console.error('Failed to persist auth token', err);
        toast({ title: 'Authentication Error', description: 'Unable to save session token', variant: 'destructive' });
        return;
      }

      login({
        id: user.id?.toString?.() ?? '',
        email: user.email ?? '',
        username: user.username ?? user.name ?? '',
      });

      toast({ title: 'Success', description: 'Welcome to Ni Hao Now!' });
      router.push('/introduction');
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-12 text-center">
        <div className="flex gap-1 text-4xl font-bold mb-4 justify-center items-center">
          <span className="text-red-500">你</span>
          <span className="text-yellow-500">好</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600 text-sm">Join thousands of Arabic learners today</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-900 block">
                Email Address
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                <span className="sr-only"> required</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={isLoading}
                  required
                  aria-required
                  className="pl-10 py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              {errors.email ? (
                <p id="email-error" className="text-xs text-red-600 mt-2">{errors.email}</p>
              ) : (
                <></>
                // <p className="text-xs text-transparent mt-2">&nbsp;</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-gray-900 block">
                Username
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                <span className="sr-only"> required</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  disabled={isLoading}
                  required
                  aria-required
                  className="pl-10 py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              {errors.username ? (
                <p id="username-error" className="text-xs text-red-600 mt-2">{errors.username}</p>
              ) : (
                <></>
                // <p className="text-xs text-transparent mt-2">&nbsp;</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-900 block">
                Password
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                <span className="sr-only"> required</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={isLoading}
                  required
                  aria-required
                  className="pl-10 py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              {errors.password ? (
                <p id="password-error" className="text-xs text-red-600 mt-2">{errors.password}</p>
              ) : (
                <></>
                // <p className="text-xs text-gray-500 mt-2">At least 6 characters</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-600">already registered?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">Sign in</Link>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">By creating an account, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}
