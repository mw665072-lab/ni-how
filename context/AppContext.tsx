'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/authUtils';

export interface User {
  id?: string;
  email: string;
  username?: string;
}

interface AppState {
  theme: 'light' | 'dark';
  user: string | null;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  authUser: User | null;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (v: boolean) => void;
  completeOnboarding: (userName: string) => void;
  resetOnboarding: () => void;
  login: (user: User) => void;
  logout: () => void;
  dir: "ltr" | "rtl";
  setDir: (d: "ltr" | "rtl") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    theme: 'light',
    user: null,
    hasCompletedOnboarding: false,
    isAuthenticated: false,
    authUser: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [dir, setDirState] = useState<"ltr" | "rtl">(() => {
    try {
      // Default to RTL. On the server we can't access localStorage or document.
      if (typeof window === 'undefined') return 'rtl';

      // Use stored preference if available
      const stored = localStorage.getItem('dir') as "ltr" | "rtl" | null;
      if (stored === 'ltr' || stored === 'rtl') return stored;

      // Fall back to document direction if present
      const docDir = document.documentElement?.dir as "ltr" | "rtl" | undefined;
      if (docDir === 'ltr' || docDir === 'rtl') return docDir;

      // Final default
      return 'rtl';
    } catch (err) {
      return 'rtl';
    }
  });

  const setDir = (d: "ltr" | "rtl") => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dir', d)
        document.documentElement.dir = d

        try {
          const bc = 'BroadcastChannel' in window ? new BroadcastChannel('nihao-dir') : null
          bc?.postMessage({ type: 'dir-change', dir: d })
          bc?.close()
        } catch (err) {
        }

        localStorage.setItem('dir_event', JSON.stringify({ type: 'dir-change', dir: d, ts: Date.now() }))
      }
    } catch (err) {
    }

    setDirState(d)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserName = localStorage.getItem('userName');
      const hasCompleted = savedUserName !== null;
      const authToken = getAuthToken();
      const authUserStr = localStorage.getItem('authUser');

      setState(prev => ({
        ...prev,
        user: savedUserName,
        hasCompletedOnboarding: hasCompleted,
        isAuthenticated: !!authToken,
        authUser: authUserStr ? JSON.parse(authUserStr) : null,
      }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.dir = dir

    let bc: BroadcastChannel | null = null
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('nihao-dir')
        bc.onmessage = (ev: MessageEvent) => {
          const payload = ev.data
          if (payload?.type === 'dir-change' && (payload.dir === 'ltr' || payload.dir === 'rtl')) {
            setDirState(payload.dir)
            document.documentElement.dir = payload.dir
          }
        }
      }
    } catch (err) {
      bc = null
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'dir_event' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue as string)
          if (payload?.type === 'dir-change' && (payload.dir === 'ltr' || payload.dir === 'rtl')) {
            setDirState(payload.dir)
            document.documentElement.dir = payload.dir
          }
        } catch (err) {
        }
      }
    }

    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('storage', onStorage)
      try { bc?.close() } catch (err) { }
    }
  }, [dir])

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('nihao-auth');
        bc.onmessage = (ev: MessageEvent) => {
          const msg = ev.data;
          if (msg === 'logout') {
            setState(prev => ({ ...prev, isAuthenticated: false, authUser: null }));
          } else if (msg === 'login') {
            const authUserStr = localStorage.getItem('authUser');
            setState(prev => ({ ...prev, isAuthenticated: !!getAuthToken(), authUser: authUserStr ? JSON.parse(authUserStr) : null }));
          }
        };
      }
    } catch (err) {
      bc = null;
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'authEvent' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue as string);
          if (payload?.type === 'logout') {
            setState(prev => ({ ...prev, isAuthenticated: false, authUser: null }));
          } else if (payload?.type === 'login') {
            const authUserStr = localStorage.getItem('authUser');
            setState(prev => ({ ...prev, isAuthenticated: !!getAuthToken(), authUser: authUserStr ? JSON.parse(authUserStr) : null }));
          }
        } catch (err) {
        }
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      try {
        bc?.close();
      } catch (err) {
      }
    };
  }, []);

  const completeOnboarding = (userName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', userName);
      setState(prev => ({
        ...prev,
        user: userName,
        hasCompletedOnboarding: true,
      }));
    }
  };

  const resetOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userName');
      setState(prev => ({
        ...prev,
        user: null,
        hasCompletedOnboarding: false,
      }));
    }
  };

  const login = (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(user));

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        authUser: user,
      }));

      try {
        const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('nihao-auth') : null;
        bc?.postMessage('login');
        bc?.close();
      } catch (err) {
      }
      localStorage.setItem('authEvent', JSON.stringify({ type: 'login', ts: Date.now() }));
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
      try {
        clearAuthToken();
      } catch (err) {
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        authUser: null,
      }));

      try {
        const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('nihao-auth') : null;
        bc?.postMessage('logout');
        bc?.close();
      } catch (err) {
      }
      localStorage.setItem('authEvent', JSON.stringify({ type: 'logout', ts: Date.now() }));
    }
  };

  return (
    <AppContext.Provider value={{ state, setState, sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen, completeOnboarding, resetOnboarding, login, logout, dir, setDir }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}


