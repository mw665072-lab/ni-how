"use client";

import React, { useState, useEffect } from 'react';
import { Home, Globe, Award, TrendingUp, ChevronLeft, ChevronRight, BookOpen, UserCheck, LogIn, UserPlus, Key, Clock, MessageSquare, Layers, List, Grid, X } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/units', label: 'Units', Icon: Grid },
  { href: '/leaderboard', label: 'Leaderboard', Icon: TrendingUp },
  { href: '/account', label: 'My Account', Icon: UserCheck },
];

export default function Sidebar(): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname() ?? '';
  const { sidebarOpen, setSidebarOpen } = useAppContext();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    try {
      // keep body classes in sync with sidebar state
      document.body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
      document.body.classList.add(expanded ? 'sidebar-expanded' : 'sidebar-collapsed');
    } catch (err) {
      // Defensive: catch and log DOM exceptions (rare in some environments)
      // eslint-disable-next-line no-console
      console.error('Error updating sidebar body classes', err);
    }

    return () => {
      try {
        document.body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error cleaning up sidebar body classes', err);
      }
    };
  }, [expanded]);

  // Close mobile sidebar when switching to desktop to avoid overlay stuck open
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Close mobile sidebar when switching to desktop to avoid overlay stuck open
    const onResize = () => {
      try {
        if (window.innerWidth >= 768 && sidebarOpen) {
          setSidebarOpen?.(false);
        }

        // When switching to small screens, ensure expanded state is off
        if (window.innerWidth < 768 && expanded) {
          setExpanded(false);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error handling resize in Sidebar', err);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sidebarOpen, setSidebarOpen, expanded]);

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-200 md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen?.(false)}
        aria-hidden={!sidebarOpen}
        role="button"
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside
        role="navigation"
        className={`fixed left-0 top-0 h-screen z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${expanded ? 'md:w-64' : 'md:w-[6rem]'} bg-white  overflow-visible`}
        aria-label="Primary"
      >
        <div className="flex flex-col h-full p-3">
        <div className="flex items-center justify-between gap-3 p-2 rounded-md">
          <a href="/" className="flex items-center gap-3 p-1 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400">
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-teal-400 shrink-0">
              <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#06b6a4" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#g1)" />
                <text x="50" y="56" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="28" fill="#fff">N</text>
              </svg>
            </div>

            <div className={`min-w-0 ${expanded ? 'block' : 'hidden'}`}>
              <div className="text-base font-semibold text-slate-900 truncate">NEWHEO</div>
              <div className="text-xs text-slate-500 truncate">你好 · ني هاو</div>
            </div>
          </a>

          <div className="flex items-center gap-2">
            {/* Collapse/Expand for desktop */}
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={expanded}
              className="p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300 hidden md:inline-flex"
            >
              {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300 md:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 mt-6" aria-label="Main Navigation">
          <ul className="space-y-1">
            {navItems.map((it) => (
              <li key={it.label}>
                <Link
                  href={it.href}
                  className={`flex items-center gap-3 p-2 rounded-md text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-sky-300 ${pathname === it.href ? 'bg-slate-100' : ''}`}
                  aria-label={it.label}
                  onClick={() => {
                    // close mobile sidebar after navigating
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-100 text-sky-500 shrink-0">
                    <it.Icon size={18} />
                  </div>

                  <span className={`text-sm text-slate-800 ${expanded ? 'inline-block' : 'hidden'}`}>{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto py-3">
          <div className={`text-xs text-slate-400 ${expanded ? 'block' : 'hidden'}`}>© {new Date().getFullYear()} NEWHEO</div>
        </div>
      </div>
    </aside>
    </>
  );
}
