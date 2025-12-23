import { apiClient, apiEndpoints } from '@/lib/http';
import { Chapter, Topic } from '@/lib/types';

export const chaptersApi = {
  getAll: async (): Promise<Chapter[]> => {
    return apiClient.get<Chapter[]>(apiEndpoints.chapters);
  },
  getById: async (id: number): Promise<Chapter> => {
    return apiClient.get<Chapter>(apiEndpoints.chapterById(id));
  },
  getTopics: async (id: number): Promise<any[]> => {
    return apiClient.get<any[]>(apiEndpoints.chapterTopics(id));
  },
};

export const topicsApi = {
  getAll: async (): Promise<Topic[]> => {
    return apiClient.get<Topic[]>(apiEndpoints.topics);
  },
  getById: async (id: number): Promise<Topic> => {
    return apiClient.get<Topic>(apiEndpoints.topicById(id));
  },
  getScenarios: async (topicId: number): Promise<any[]> => {
    return apiClient.get<any[]>(apiEndpoints.topicScenarios(topicId));
  },
};
