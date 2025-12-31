"use client";

import React, { useEffect } from 'react';
import { Home, Trophy, Award, Users, User, LogOut, X ,Medal,LayoutDashboard,BookCheck,TrophyIcon, Menu } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const usePathname = () => '/student/dashboard';

const navItems = [
  { href: '/student/dashboard', label: 'لوحة القيادة', Icon: LayoutDashboard },
  { href: '/units', label: 'الوحدات', Icon: BookCheck },
  // { href: '/achievements', label: 'الإنجازات', Icon: TrophyIcon },
  { href: '/leaderboard', label: 'المتصدرين', Icon: Medal },
  { href: '/account', label: 'حساب المستخدم', Icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state, sidebarOpen, setSidebarOpen, dir, mobileMenuOpen, setMobileMenuOpen, logout, resetOnboarding } = useAppContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      try {
        resetOnboarding();
      } catch (err) { }
      setSidebarOpen?.(false);
      setMobileMenuOpen?.(false);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  const displayName = state?.user || state?.authUser?.username || 'جون دو';
  const isRtl = dir === 'rtl';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onResize = () => {
      try {
        if (window.innerWidth >= 768 && sidebarOpen) {
          setSidebarOpen?.(false);
        }
      } catch (err) {
        console.error('Error handling resize in Sidebar', err);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sidebarOpen, setSidebarOpen]);

  const offscreenClass = isRtl
    ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full')
    : (sidebarOpen ? 'translate-x-0' : '-translate-x-full');
  const posClasses = isRtl ? 'right-0 md:right-4' : 'left-0 md:left-4';

  return (
    <>
      
      <div className={`md:hidden border border-[blue] fixed top-4 ${isRtl ? 'right-4' : 'left-4'} z-60 ${mobileMenuOpen ? 'hidden' : ''}`}> 
        <button
          onClick={() => {
            const open = !mobileMenuOpen;
            if (open) setSidebarOpen?.(false);
            setMobileMenuOpen?.(open);
          }}
          className="flex items-center gap-3 bg-[#35AB4E] text-white rounded-[14px] shadow-md"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="w-8 flex items-center justify-center">
            <Menu size={18} />
          </span>
          <span className="text-sm font-semibold truncate">{displayName}</span>
          <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center ml-2">
            <User size={18} className="text-[#35AB4E]" />
          </span>
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-200 md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setSidebarOpen?.(false)}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className={`fixed top-0 h-screen z-50 transform transition-transform duration-300 ease-in-out ${offscreenClass} ${posClasses} md:translate-x-0 w-[200px] md:top-4 md:bottom-4 md:h-auto bg-[#35AB4E] rounded-[20px] shadow-lg overflow-hidden flex flex-col`}
      >
          <div className="flex flex-col items-center pt-6 pb-4 px-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-md">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
          </div>
          <div className="text-white font-bold text-lg truncate">{displayName}</div>
        </div>

        <nav className="flex-1 px-3 pb-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center ${isRtl ? 'flex-row-reverse' : 'flex-row'} px-4 py-2 h-[40px] gap-[10px] rounded-[12px] transition-colors ${isActive
                      ? 'bg-[#2A893E] text-white'
                      : 'text-white/90 hover:bg-white/10'
                      }`}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <span className={`${isRtl ? 'text-sm font-medium text-right truncate flex-1' : 'text-sm font-medium text-left truncate flex-1'}`}>{item.label}</span>
                    <span className="w-[24px] flex items-center justify-center shrink-0">
                      <item.Icon size={18} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={() => handleLogout()}
            aria-label="Logout"
            className={`w-[90%] mx-auto h-[40px] flex items-center ${isRtl ? 'flex-row-reverse' : 'flex-row'} px-[12px] py-[8px] gap-[10px] rounded-[12px] bg-[#FBD4D3] text-[#8D1716] transition-colors`}
          >
            <span className="text-[16px] font-semibold leading-[100%] tracking-[0%] leading-trim-none truncate flex-1">تسجيل الخروج</span>
            <span className="w-[24px] flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-[#8D1716]" />
            </span>
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} p-1 rounded hover:bg-white/10 md:hidden text-white`}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </aside>
    </>
  );
}