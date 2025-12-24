import { apiClient, apiEndpoints } from '@/lib/http';
import { SessionStartRequest, SessionStartResponse } from '@/lib/types';

export const sessionsApi = {
  start: async (data: SessionStartRequest): Promise<SessionStartResponse> => {
    return apiClient.post<SessionStartResponse>(apiEndpoints.sessions.start, data);
  },
  getById: async (sessionId: string): Promise<any> => {
    return apiClient.get<any>(apiEndpoints.sessions.byId(sessionId));
  },
  getAttempts: async (sessionId: string): Promise<any[]> => {
    return apiClient.get<any[]>(apiEndpoints.sessions.attempts(sessionId));
  },
  submitAttempt: async (sessionId: string, scenarioId: number, audio: Blob): Promise<any> => {
    // multipart form handled directly with axiosInstance for proper Content-Type
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('scenarioId', scenarioId.toString());
    formData.append('audio', audio, 'recording.wav');

    const url = `${apiEndpoints.sessions.attempts(sessionId)}`;
    // apiClient.post expects endpoint and handles base url, but for multipart we need to pass config
    return apiClient.post(url, formData, { headers: { 'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'multipart/form-data',
     } });
  },
};
