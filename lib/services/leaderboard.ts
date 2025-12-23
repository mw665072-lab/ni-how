import { apiClient, apiEndpoints } from '@/lib/http';
import type {
  LeaderboardEntry,
  LevelInfo,
  StudentLevelInfo,
  UnifiedLeaderboardResponse,
} from '@/lib/types';

/**
 * Leaderboard service
 *
 * - Follows existing apiClient conventions used across the project
 * - Methods are small wrappers returning typed data
 * - Caller (UI) should handle pagination, caching, and error handling as needed
 */
export const leaderboardApi = {
  getByXp: async (limit = 100, offset = 0): Promise<LeaderboardEntry[]> => {
    const url = apiEndpoints.leaderboard.xp(limit, offset);
    return apiClient.get<LeaderboardEntry[]>(url);
  },

  getByLevel: async (limit = 100, offset = 0): Promise<LeaderboardEntry[]> => {
    const url = apiEndpoints.leaderboard.level(limit, offset);
    return apiClient.get<LeaderboardEntry[]>(url);
  },

  getByStreak: async (limit = 100, offset = 0): Promise<LeaderboardEntry[]> => {
    const url = apiEndpoints.leaderboard.streak(limit, offset);
    return apiClient.get<LeaderboardEntry[]>(url);
  },

  getByLongestStreak: async (limit = 100, offset = 0): Promise<LeaderboardEntry[]> => {
    const url = apiEndpoints.leaderboard.longestStreak(limit, offset);
    return apiClient.get<LeaderboardEntry[]>(url);
  },

  /**
   * Unified leaderboard endpoint
   * Returns a structure with leaderboard entries, optional userRank, and pagination
   */
  getLeaderboard: async (
    limit = 100,
    offset = 0,
    userId?: number | string,
    config: any = {}
  ): Promise<UnifiedLeaderboardResponse> => {
    const url = apiEndpoints.leaderboard.list(limit, offset, userId);
    return apiClient.get<UnifiedLeaderboardResponse>(url, undefined, config);
  },

  getLevels: async (): Promise<LevelInfo[]> => {
    const url = apiEndpoints.leaderboard.levels;
    return apiClient.get<LevelInfo[]>(url);
  },

  getLevel: async (level: number): Promise<LevelInfo | null> => {
    const url = apiEndpoints.leaderboard.levelByNumber(level);
    return apiClient.get<LevelInfo | null>(url);
  },

  getStudentLevel: async (config: any = {}): Promise<StudentLevelInfo | null> => {
    const url = apiEndpoints.leaderboard.studentLevel;
    return apiClient.get<StudentLevelInfo | null>(url, undefined, config);
  },

  getStudentLevelById: async (userId: number | string): Promise<StudentLevelInfo | null> => {
    const url = apiEndpoints.leaderboard.studentLevelById(userId);
    return apiClient.get<StudentLevelInfo | null>(url);
  },
};

export default leaderboardApi;
