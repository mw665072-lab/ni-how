'use client';
import React from 'react'
import { usePathname } from 'next/navigation';
import AuthSidebar from './AuthSidebar'
import ConditionalHeader from './ConditionalHeader'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isScenarioPath = pathname?.includes("/scenario");
    const isPublicAuthPath =
      pathname &&
      (pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/welcome") ||
        pathname.startsWith("/forget-password") ||
        pathname.startsWith("/reset-password"));
    const shouldShowSidebar = !isScenarioPath && !isPublicAuthPath;

    return (
        <div className="flex min-h-screen">
            {shouldShowSidebar && (
                <div className="hidden min-w-2 md:block">
                    <AuthSidebar />
                </div>
            )}
            <main className="flex-1 w-full transition-all bg-white duration-200 md:pt-6 pt-0 md:pt-8" >
                <ConditionalHeader />
                {children}
            </main>
        </div>
    )
}

export default Layout