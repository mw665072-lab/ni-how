"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/context/AppContext";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, User, X, LogOut, LayoutDashboard, BookCheck, TrophyIcon, Medal } from "lucide-react";

export default function Header() {
  const { resetOnboarding, logout, state, sidebarOpen, setSidebarOpen, dir } = useAppContext();
  const displayName = state?.user || state?.authUser?.username || 'جون دو';
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // small delay to allow AppContext to initialize from storage
    const timer = setTimeout(() => {
      if (!state.isAuthenticated) {
        const publicPaths = ['/welcome', '/login', '/register'];
        if (!publicPaths.includes(pathname)) {
          router.push('/welcome');
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, pathname, router]);

  const handleLogout = () => {
    try {
      logout();
    } catch (err) {
      console.warn("Logout failed (context logout):", err);
    }

    try {
      const keysToRemove = Object.keys(sessionStorage).filter((key) =>
        key.startsWith("session") || key.includes("scenario") || key.includes("attempt") || key === "currentSession" || key === "sessionFeedback"
      );
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    } catch (err) { }

    try {
      resetOnboarding();
    } catch (err) { }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "صباح الخير" : "مساء الخير";
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/student/dashboard', label: 'لوحة القيادة', Icon: LayoutDashboard },
    { href: '/units', label: 'الوحدات', Icon: BookCheck },
    // { href: '/achievements', label: 'الإنجازات', Icon: TrophyIcon },
    { href: '/leaderboard', label: 'المتصدرين', Icon: Medal },
    { href: '/account', label: 'حساب المستخدم', Icon: User },
  ];

  return (
    <div className="px-4 py-4 md:px-6" dir={dir}>

      <div className="md:hidden">
        <div
          className="flex items-center justify-between h-[84px] px-[16px] py-[14px] rounded-[13px] bg-[#35AB4E]"
          style={{ boxShadow: "0px 4px 0px 0px #20672F" }}
          dir={dir}
        >

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-auto h-12 gap-3 flex items-center justify-center cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border-2 border-[#20672F] overflow-hidden">
                  <User className="h-6 w-6 text-[#35AB4E]" />
                </div>
                <div className="text-white font-bold text-lg">
                  {displayName}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>تسجيل الخروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="p-0 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center shadow-none border border-white/10"
            onClick={() => {
              const open = !mobileMenuOpen;
              if (open) setSidebarOpen?.(false);
              setMobileMenuOpen(open);
            }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>

        {/* Mobile dropdown panel */}
        <div
          className={`fixed inset-0 z-30 md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={`absolute left-4 right-4 top-[100px] z-40 bg-white rounded-[12px] shadow-lg transform transition-all ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
            role="dialog"
            aria-modal="true"
          >
            <nav className="p-4">
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} px-4 py-3 gap-3 rounded-[10px] hover:bg-gray-100 text-gray-800`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex-1 text-sm font-medium truncate text-right">{item.label}</span>
                      <span className="w-6 flex items-center justify-center">
                        <item.Icon size={18} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] bg-[#FBD4D3] text-[#8D1716] font-semibold"
              >
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer">
                <User className="h-6 w-6 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleLogout}>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-left">
            <div className="font-bold text-lg">
              مرحبًا{" "}
              <span className="text-green-500">{displayName}</span>
            </div>
            <div className="text-gray-700 font-medium">{getGreeting()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
