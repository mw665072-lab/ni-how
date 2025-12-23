import { SessionStartResponse, Scenario } from './api';

// Session data management utilities
export const sessionUtils = {
  // Store session data in sessionStorage
  setCurrentSession: (sessionData: SessionStartResponse): void => {
    sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
  },

  // Get current session data from sessionStorage
  getCurrentSession: (): SessionStartResponse | null => {
    try {
      const sessionData = sessionStorage.getItem('currentSession');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  },

  // Get scenarios from current session
  getScenarios: (): Scenario[] => {
    const session = sessionUtils.getCurrentSession();
    return session?.scenarios || [];
  },

  // Get session ID
  getSessionId: (): string | null => {
    const session = sessionUtils.getCurrentSession();
    return session?.sessionId || null;
  },

  // Get current topic
  getCurrentTopic: () => {
    const session = sessionUtils.getCurrentSession();
    return session?.topic || null;
  },

  // Clear session data
  clearSession: (): void => {
    sessionStorage.removeItem('currentSession');
  },

  // Get username from localStorage (keep this in localStorage as it's user preference)
  getUsername: (): string => {
    return localStorage.getItem('username') || 'User';
  },

  // Set username in localStorage (keep this in localStorage as it's user preference)
  setUsername: (username: string): void => {
    localStorage.setItem('username', username);
  },
};
