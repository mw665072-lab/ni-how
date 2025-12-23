'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

interface UseAuthProtectionOptions {
  redirectTo?: string;
  allowedRoles?: string[];
}

/**
 * Hook to protect routes that require authentication
 * Usage: useAuthProtection() at the top of your protected page component
 * 
 * @param options - Configuration options
 * @param options.redirectTo - Where to redirect if not authenticated (default: '/login')
 * @param options.allowedRoles - Array of allowed roles (future enhancement)
 * 
 * @returns An object with:
 * - isAuthenticated: boolean - Whether user is authenticated
 * - isLoading: boolean - Whether auth check is in progress
 * - user: User object or null
 */
export function useAuthProtection(options: UseAuthProtectionOptions = {}) {
  const router = useRouter();
  const { state } = useAppContext();
  const { redirectTo = '/login' } = options;

  useEffect(() => {
    // Only check after state is initialized
    // Delay to allow AppContext to load from storage
    const checkAuth = () => {
      if (!state.isAuthenticated) {
        router.push(redirectTo);
      }
    };

    // Small delay to ensure AppContext has loaded
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, router, redirectTo]);

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: !state.isAuthenticated,
    user: state.authUser,
  };
}

/**
 * Hook to get current auth state (doesn't redirect)
 * Usage: const { isAuthenticated, user } = useAuth();
 */
export function useAuth() {
  const { state } = useAppContext();

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.authUser,
    email: state.authUser?.email,
    username: state.authUser?.username,
  };
}

/**
 * Hook to handle logout
 * Usage: const { logout } = useLogout();
 */
export function useLogout() {
  const router = useRouter();
  const { logout: contextLogout } = useAppContext();

  const logout = () => {
    contextLogout();
    router.push('/login');
  };

  return { logout };
}
