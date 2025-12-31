'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { authApi } from '@/lib/api';
import { setAuthToken } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import { useDirection } from '@/hooks/useDirection';
import { Loader2 } from 'lucide-react';

type FormData = {
  username: string;
  password: string;
};

type ValidationErrors = {
  username?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, setState } = useAppContext();
  const { toast } = useToast();
  const dir = useDirection('rtl');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset isLoggingOut when login page mounts
  useEffect(() => {
    setState(prev => ({ ...prev, isLoggingOut: false }));
  }, [setState]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = (data: FormData) => {
    const newErrors: ValidationErrors = {};
    if (!data.username) {
      newErrors.username = 'Username is required';
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
        toast({ title: 'خطأ في التحقق', description: 'الرجاء تصحيح الحقول المظللة', variant: 'destructive' });
        return;
      }
      setIsLoading(true);
      try {
        const response = await authApi.login({ identifier: formData.username, password: formData.password });
        const token = response?.access_token ?? response?.token;
        const userData = response?.user;
        if (token && userData) {
          setAuthToken(token);
          login({ id: String(userData.id ?? ''), email: userData.email ?? '', username: userData.username ?? '' });
          toast({ title: 'تم بنجاح', description: 'مرحبًا بعودتك!' });
          router.push('/units');
        } else {
          toast({ title: 'خطأ', description: response?.message ?? 'فشل تسجيل الدخول', variant: 'destructive' });
        }
        setErrors({});
      } catch (err: any) {
        console.error('Login error:', err);
        toast({ title: 'خطأ', description: err?.message ?? 'حدث خطأ أثناء تسجيل الدخول', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, login, router, toast]
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white flex flex-col items-center justify-center px-4 py-8 overflow-hidden" dir={'ltr'}>

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
              Login
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
                <p id="username-error" className="mt-1 text-xs text-red-600">
                  {errors.username}
                </p>
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
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}
              className="transition duration-200 shadow-md w-full sm:max-w-[470.5px] h-11 sm:h-[45px] gap-[10px] rounded-[12px] border-b-[3px] border-b-[#20672F] hover:bg-[#35AB4E] bg-[#35AB4E] text-[#ECECEC] font-nunito font-bold text-[16px]">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="mt-2 text-center">
              <Link
                href="/forget-password"
                className="font-nunito font-bold text-[14px] leading-[100%] text-[#35AB4E] hover:bg-transparent bg-transparent underline decoration-[#35AB4E] decoration-1"
                style={{ textAlign: 'center' }}
              >
                Forgot password
              </Link>
            </div>


            <Button
              className="font-nunito font-bold w-full sm:max-w-[470.5px] h-11 sm:h-[45px] gap-[10px] rounded-[12px] hover:bg-[#E5E5E5] bg-[#E5E5E5] border-b-[3px] border-b-[rgba(0,0,0,0.08)] text-[#282828] text-[16px] transition duration-200"
            >
              Don't have an account? {''}<Link href="/register" className="font-semibold text-green-600 hover:text-green-700 transition-colors">Sign Up
              </Link>
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
