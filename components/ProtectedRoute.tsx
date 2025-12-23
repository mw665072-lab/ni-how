import { ReactNode } from 'react';

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * This component can be used to protect routes that require authentication.
 * Use it in your page files with useAppContext hook for client-side protection
 * 
 * Example usage in a page:
 * ```tsx
 * 'use client';
 * import { useEffect } from 'react';
 * import { useRouter } from 'next/navigation';
 * import { useAppContext } from '@/context/AppContext';
 * 
 * export default function ProtectedPage() {
 *   const router = useRouter();
 *   const { state } = useAppContext();
 * 
 *   useEffect(() => {
 *     if (!state.isAuthenticated) {
 *       router.push('/login');
 *     }
 *   }, [state.isAuthenticated, router]);
 * 
 *   if (!state.isAuthenticated) {
 *     return null; // or a loading spinner
 *   }
 * 
 *   return <YourProtectedContent />;
 * }
 * ```
 */

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  // This is just a placeholder component. Use the pattern above in your actual pages.
  return <>{children}</>;
};
