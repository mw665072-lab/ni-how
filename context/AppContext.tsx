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
  completeOnboarding: (userName: string) => void;
  resetOnboarding: () => void;
  login: (user: User) => void;
  logout: () => void;
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

  // Load user data from localStorage and cookies on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserName = localStorage.getItem('userName');
      const hasCompleted = savedUserName !== null;
      
      // Check for auth cookie (uses cookies-next via lib/authUtils)
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

  // Setup BroadcastChannel + storage event listener for realtime cross-tab auth updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
          // ignore malformed payload
        }
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      try {
        bc?.close();
      } catch (err) {
        // ignore
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
      // ensure auth cookie exists for other checks; set a simple token placeholder if needed
      // token should be set by the login response handler via `setAuthToken(token)`;
      // do not overwrite it here with a placeholder value.

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        authUser: user,
      }));

      // Broadcast login to other tabs
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('nihao-auth') : null;
        bc?.postMessage('login');
        bc?.close();
      } catch (err) {
        // ignore
      }
      // also trigger storage event fallback
      localStorage.setItem('authEvent', JSON.stringify({ type: 'login', ts: Date.now() }));
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
      // clear cookie using auth util
      try {
        clearAuthToken();
      } catch (err) {
        // ignore
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        authUser: null,
      }));

      // Broadcast logout to other tabs
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('nihao-auth') : null;
        bc?.postMessage('logout');
        bc?.close();
      } catch (err) {
        // ignore
      }
      // storage event fallback
      localStorage.setItem('authEvent', JSON.stringify({ type: 'logout', ts: Date.now() }));
    }
  };

  return (
    <AppContext.Provider value={{ state, setState, sidebarOpen, setSidebarOpen, completeOnboarding, resetOnboarding, login, logout }}>
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


