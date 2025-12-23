// Re-export new modularized services and types for backwards compatibility
export * from './types';
export { apiClient, apiEndpoints, API_BASE_URL } from './http';
export { authApi } from './services/auth';
export { chaptersApi, topicsApi } from './services/content';
export { sessionsApi } from './services/sessions';
export { dashboardApi } from './services/dashboard';
export { leaderboardApi } from './services/leaderboard';
