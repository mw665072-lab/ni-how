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

  useEffect(() => {
    let t: number | undefined;
    try {
      if (typeof window === 'undefined') return;
      if (isAuthenticated) {
        t = window.setTimeout(() => setShowSidebarReady(true), 150);
      } else {
        setShowSidebarReady(false);
      }
    } catch (err) {
      console.error('Error scheduling sidebar show', err);
      setShowSidebarReady(false);
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [isAuthenticated, pathname]);

  const isScenarioPath = pathname?.includes("/scenario");
  const isPublicAuthPath =
    pathname &&
    (pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/welcome") ||
      pathname.startsWith("/forget-password") ||
      pathname.startsWith("/reset-password"));

  useEffect(() => {
    const cls = "has-sidebar";
    if (typeof document === "undefined") return;
    try {
      if (isAuthenticated && showSidebarReady && !isPublicAuthPath) {
        document.body.classList.add(cls);
      } else {
        document.body.classList.remove(cls);
      }
    } catch (err) {
      console.error("Error updating body class for AuthSidebar", err);
    }

    return () => {
      try {
        document.body.classList.remove(cls);
      } catch (err) {
        console.error("Error cleaning up body class for AuthSidebar", err);
      }
    };
  }, [isAuthenticated, showSidebarReady, isPublicAuthPath]);

  if (!isAuthenticated) return <></>;
  if (isPublicAuthPath) return <></>;
  if (isScenarioPath) return <></>;
  if (!showSidebarReady) return <></>;

  return <Sidebar />;
}
