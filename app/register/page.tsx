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
import { Loader2 } from 'lucide-react';

type FormData = {
  username: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = name === 'email' ? value.trimStart() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validateField = useCallback((field: keyof FormData) => {
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
  }, [formData]);

  const validateForm = useCallback(() => {
    const fields: (keyof FormData)[] = ['username', 'email', 'password'];
    const fieldResults = fields.map(f => validateField(f));
    const ok = fieldResults.every(Boolean);
    if (!ok) {
      toast({ title: 'Validation Error', description: 'Please fix the highlighted fields', variant: 'destructive' });
    }
    return ok;
  }, [validateField, toast]);

  const normalizeResponse = (res: any) => {
    if (!res) return { token: null, user: null, message: 'Empty response from server' };
    const token = res.access_token ?? res.token ?? res.data?.access_token ?? null;
    const user = res.user ?? res.data?.user ?? res.data ?? null;
    const message = res.message ?? res.error ?? res.data?.message ?? null;
    return { token, user, message };
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;
      setIsLoading(true);
      try {
        const response = await authApi.register({
          username: formData.username,
          email: formData.email,
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
        router.push('/student/dashboard');
      } catch (error: any) {
        console.error('Registration error:', error);
        const message = error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, login, router, toast, validateForm]
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white flex flex-col items-center justify-center px-4 py-8 overflow-hidden" dir='ltr'>
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
              Register
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  aria-label="Username"
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  className="bg-[#ECECEC] border-0 hover:bg-[#ECECEC] focus:bg-[#ECECEC] focus-visible:bg-[#ECECEC] focus:border-0 focus-visible:border-0 focus:ring-0 focus-visible:ring-0 outline-none w-full h-11 sm:h-[44px] px-4 rounded-[12px]"
                />
              </div>
              {errors.username && (
                <p id="username-error" className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  aria-label="Email"
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
                  className="bg-[#ECECEC] border-0 hover:bg-[#ECECEC] focus:bg-[#ECECEC] focus-visible:bg-[#ECECEC] focus:border-0 focus-visible:border-0 focus:ring-0 focus-visible:ring-0 outline-none w-full h-11 sm:h-[44px] px-4 rounded-[12px]"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  aria-label="Password"
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
                  className="bg-[#ECECEC] border-0 hover:bg-[#ECECEC] focus:bg-[#ECECEC] focus-visible:bg-[#ECECEC] focus:border-0 focus-visible:border-0 focus:ring-0 focus-visible:ring-0 outline-none w-full h-11 sm:h-[44px] px-4 rounded-[12px]"
                />
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="transition duration-200 shadow-md w-full sm:max-w-[470.5px] h-11 sm:h-[45px] gap-[10px] rounded-[12px] border-b-[3px] border-b-[#20672F] hover:bg-[#35AB4E] bg-[#35AB4E] text-[#ECECEC] font-nunito font-bold text-[16px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing up...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>

            <Button
              className="font-nunito font-bold w-full sm:max-w-[470.5px] h-11 sm:h-[45px] gap-[10px] rounded-[12px] hover:bg-[#E5E5E5] bg-[#E5E5E5] border-b-[3px] border-b-[rgba(0,0,0,0.08)] text-[#282828] text-[16px] transition duration-200"
            >
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                Login
              </Link>
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}

