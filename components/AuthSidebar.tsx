"use client";

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AuthSidebar() {
  const { state } = useAppContext();
  const { isAuthenticated } = state;
  const pathname = usePathname();
  const [showSidebarReady, setShowSidebarReady] = useState(false);

  // Delay showing sidebar briefly after authentication changes to avoid
  // a race where the sidebar appears before the newly routed children finish loading.
  useEffect(() => {
    let t: number | undefined;
    try {
      if (typeof window === 'undefined') return;
      if (isAuthenticated) {
        // small debounce to let route transition and child data fetch start
        t = window.setTimeout(() => setShowSidebarReady(true), 150);
      } else {
        setShowSidebarReady(false);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error scheduling sidebar show', err);
      setShowSidebarReady(false);
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [isAuthenticated, pathname]);

  // Only apply the body class when authenticated AND we've waited the short debounce window
  useEffect(() => {
    const cls = 'has-sidebar';
    if (typeof document === 'undefined') return;
    try {
      if (isAuthenticated && showSidebarReady) {
        document.body.classList.add(cls);
      } else {
        document.body.classList.remove(cls);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating body class for AuthSidebar', err);
    }

    return () => {
      try {
        document.body.classList.remove(cls);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error cleaning up body class for AuthSidebar', err);
      }
    };
  }, [isAuthenticated, showSidebarReady]);

  // Do not render the sidebar on the public homepage or while we are in the short debounce window
  if (!isAuthenticated) return null;
  if (pathname === '/') return null;
  if (!showSidebarReady) return null;

  return <Sidebar />;
}
