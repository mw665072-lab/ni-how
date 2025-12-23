import { useState } from 'react';
import { sessionsApi, SessionStartRequest, SessionStartResponse } from '@/lib/api';

interface UseSessionReturn {
  startSession: (topicId: number) => Promise<SessionStartResponse>;
  loading: boolean;
  error: string | null;
}

export const useSession = (): UseSessionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async (topicId: number): Promise<SessionStartResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Get username from localStorage
      // const username = localStorage.getItem('username') || 'User';
      // console.log('Starting session for user:', username, 'with topicId:', topicId);
      
      const payload: SessionStartRequest = {
        // username,
        topicId,
      };

      const sessionData = await sessionsApi.start(payload);
      
      sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
      
      return sessionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      console.error('Error starting session:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    startSession,
    loading,
    error,
  };
};
