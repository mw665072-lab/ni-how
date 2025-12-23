import { apiClient, apiEndpoints } from '@/lib/http';
import type {
  DailyMetricsResponse,
  WeeklyMetricsResponse,
  MonthlyMetricsResponse,
  CalendarResponse,
  DashboardOverview,
} from '@/lib/types';

export const dashboardApi = {
  getDaily: async (date?: string, config: any = {}): Promise<DailyMetricsResponse> => {
    const url = apiEndpoints.dashboard.daily(date);
    return apiClient.get<DailyMetricsResponse>(url, undefined, config);
  },

  getWeekly: async (weekStart?: string, config: any = {}): Promise<WeeklyMetricsResponse> => {
    const url = apiEndpoints.dashboard.weekly(weekStart);
    return apiClient.get<WeeklyMetricsResponse>(url, undefined, config);
  },

  getMonthly: async (month?: string, config: any = {}): Promise<MonthlyMetricsResponse> => {
    const url = apiEndpoints.dashboard.monthly(month);
    return apiClient.get<MonthlyMetricsResponse>(url, undefined, config);
  },

  getCalendar: async (year: number, month: number, config: any = {}): Promise<CalendarResponse> => {
    const url = apiEndpoints.calendar(year, month);
    return apiClient.get<CalendarResponse>(url, undefined, config);
  },

  getOverview: async (config: any = {}): Promise<DashboardOverview> => {
    const url = apiEndpoints.dashboard.overview;
    return apiClient.get<DashboardOverview>(url, undefined, config);
  },
};

export default dashboardApi;
