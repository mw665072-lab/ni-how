// Centralized shared types used across services

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Chapter {
  id: number;
  name: string;
  difficulty: string;
  orderIndex: number;
}

export interface ChapterUI extends Chapter {
  title: string;
  subtitle: string;
  color: string;
  status: 'active' | 'locked';
  progress?: number;
}

export interface Topic {
  id: number;
  name: string;
  subtitle: string;
  difficulty: string;
  orderIndex: number;
}

export interface TopicUI extends Topic {
  title: string;
  subtitle: string;
  color: string;
  status: 'active' | 'locked';
  progress?: number;
}

// Session interfaces
export interface SessionStartRequest {
  username?: string;
  topicId?: number;
}

export interface Scenario {
  id: number;
  scenarioNumber: number;
  isIntroduction: boolean;
  arabicAudioUrl: string;
  targetPhraseChinese: string;
  targetPhrasePinyin: string;
  chineseAudioUrl: string;
  scenarioImageUrl: string;
  orderIndex: number;
}

export interface SessionTopic {
  id: number;
  chapterId: number;
  name: string;
  subtitle: string;
  difficulty: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  chapter: Chapter;
}

export interface SessionStartResponse {
  sessionId: string;
  topic: SessionTopic;
  scenarios: Scenario[];
  totalScenarios: number;
}

// Auth related types
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  access_token?: string;
  token?: string;
  user?: {
    id: string | number;
    email: string;
    username?: string;
    role?: string;
    createdAt?: string;
  };
}

// Dashboard / analytics related types
export interface DailyMetricPoint {
  hour: number;
  time: string; // '00:00'
  pronunciationScore: number | null;
  accuracyScore: number | null;
  fluencyScore: number | null;
  completenessScore: number | null;
  attemptCount: number;
}

export interface DailyMetricsResponse {
  date: string; // YYYY-MM-DD
  graphData: DailyMetricPoint[];
  averages: {
    pronunciationScore: number | null;
    accuracyScore: number | null;
    fluencyScore: number | null;
    completenessScore: number | null;
    attemptCount: number;
  };
}

export interface PeriodMetricPoint {
  date: string; // YYYY-MM-DD
  day: number; // day index for month
  pronunciationScore: number | null;
  accuracyScore: number | null;
  fluencyScore: number | null;
  completenessScore: number | null;
  attemptCount: number;
}

export interface MonthlyMetricsResponse {
  month: string; // YYYY-MM
  monthStart: string;
  monthEnd: string;
  graphData: PeriodMetricPoint[];
  averages: {
    pronunciationScore: number | null;
    accuracyScore: number | null;
    fluencyScore: number | null;
    completenessScore: number | null;
    attemptCount: number;
  };
}

export interface WeeklyMetricsResponse {
  weekStart: string;
  weekEnd: string;
  graphData: PeriodMetricPoint[]; // one per day of week
  averages: MonthlyMetricsResponse['averages'];
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number;
  dayOfWeek: number;
  hasLogin: boolean;
  isToday?: boolean;
}

export interface CalendarResponse {
  year: number;
  month: number; // 1-12
  totalLogins: number;
  calendarData: CalendarDay[];
}

// Overview / summary for the student dashboard
export interface WordOfTheWeek {
  chinese: string;
  pinyin?: string | null;
  english?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
}

export interface TopicModeSummary {
  mode: string; // e.g. 'listening'
  name: string; // display name
  completed: number;
  total?: number;
}

export interface DashboardOverview {
  userName?: string;
  topicsCompleted: number;
  totalTopics: number;
  currentStreak: number;
  longestStreak: number;
  averageScore?: number | null;
  totalSessions?: number;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  xpProgress?: number; // 0 - 100
  wordOfTheWeek?: WordOfTheWeek | null;
  topicModes?: TopicModeSummary[];
}

// Topic Progress types
export interface TopicProgress {
  id: number;
  name: string;
  subtitle: string;
  mode: string;
  difficulty: string;
  chapterId: number;
  chapterName: string;
  totalScenarios: number;
  completedScenarios: number;
  percentage: number;
  averageScore: number | null;
  lastAttemptDate: string | null;
}

export interface TopicProgressResponse {
  topics: TopicProgress[];
}

// Chapter Progress types
export interface ChapterProgress {
  id: number;
  name: string;
  difficulty: string;
  totalTopics: number;
  completedTopics: number;
  percentage: number;
  totalScenarios: number;
  completedScenarios: number;
  topics: TopicProgress[];
}

export interface ChapterProgressResponse {
  chapters: ChapterProgress[];
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
}

// Unified leaderboard types (new)
export interface LeaderboardMetrics {
  topicsCompleted: number;
  totalSessions: number;
  avgAttemptsPerTopic: number;
  avgCompletionTime: number; // in minutes
}

export interface UnifiedLeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  metrics: LeaderboardMetrics;
}

export interface UnifiedLeaderboardResponse {
  leaderboard: UnifiedLeaderboardEntry[];
  userRank?: UnifiedLeaderboardEntry | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForNextLevel: number;
  xpDifference: number;
  isMaxLevel: boolean;
}

export interface StudentLevelInfo {
  userId: number;
  username: string;
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpToNextLevel: number;
  xpProgress: number; // percentage 0-100
  isMaxLevel: boolean;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  totalStudents: number;
  percentile: number;
}
