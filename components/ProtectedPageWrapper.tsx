'use client';

import React, { ReactNode } from 'react';
import { useAuthProtection } from '@/hooks/useAuthProtection';

interface ProtectedPageWrapperProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * Wrapper component for protected pages
 * Handles authentication check and loading state
 * 
 * Usage in a page:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <ProtectedPageWrapper loadingComponent={<LoadingSpinner />}>
 *       <YourPageContent />
 *     </ProtectedPageWrapper>
 *   );
 * }
 * ```
 */
export function ProtectedPageWrapper({
  children,
  loadingComponent,
}: ProtectedPageWrapperProps) {
  const { isAuthenticated } = useAuthProtection();

  // Show loading component while checking authentication
  if (!isAuthenticated) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
