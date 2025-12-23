import { apiClient } from '@/lib/http';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/lib/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/signup', data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  forgetPassword: async (data: { email: string }): Promise<{ success?: boolean; message?: string }> => {
    return apiClient.post<{ success?: boolean; message?: string }>('/auth/forget-password', data);
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<{ message?: string }> => {
    return apiClient.post<{ message?: string }>('/auth/reset-password', data);
  },
};
