'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { authApi } from '@/lib/api';
import { setAuthToken } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

type ValidationErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = (data: FormData) => {
    const newErrors: ValidationErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const validation = validate(formData);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        toast({ title: 'Validation Error', description: 'Please fix the highlighted fields', variant: 'destructive' });
        return;
      }
      setIsLoading(true);
      try {
        const response = await authApi.login({ identifier: formData.email, password: formData.password });
        const token = response?.access_token ?? response?.token;
        const userData = response?.user;
        if (token && userData) {
          setAuthToken(token);
          login({ id: String(userData.id ?? ''), email: userData.email ?? '', username: userData.username ?? '' });
          toast({ title: 'Success', description: 'Welcome back!' });
          router.push('/units');
        } else {
          toast({ title: 'Error', description: response?.message ?? 'Login failed', variant: 'destructive' });
        }
        setErrors({});
      } catch (err: any) {
        console.error('Login error:', err);
        toast({ title: 'Error', description: err?.message ?? 'An error occurred during login', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, login, router, toast]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-12 text-center">
        <div className="flex gap-1 text-4xl font-bold mb-4 justify-center items-center">
          <span className="text-red-500">你</span>
          <span className="text-yellow-500">好</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600 text-sm">Sign in to your account to continue learning</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-900 block">
                Email Address <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="pl-10 py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-900 block">
                Password <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="pl-10 py-2 h-11 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md mt-8">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

              <div className="mt-2 text-right">
                <Link href="/forget-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </Link>
              </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-600">or continue with</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">By signing in, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}
