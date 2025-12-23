import { useState, useEffect } from 'react';
import { chaptersApi } from '@/lib/api';

interface Topic {
  id: number;
  name: string;
  subtitle: string;
  difficulty: string;
  orderIndex: number;
}

interface TopicUI extends Topic {
  title: string;
  subtitle: string;
  color: string;
  status: "active" | "locked";
  progress?: number;
}

interface UseTopicsReturn {
  topics: TopicUI[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Helper function to assign colors to topics
const getTopicColor = (index: number): string => {
  const colors = ["#F98D00", "#FFCB08", "#8AC53E", "#CA495A", "#71A8E6"];
  return colors[index % colors.length];
};

export const useTopics = (chapterId: number | null): UseTopicsReturn => {
  const [topics, setTopics] = useState<TopicUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    if (!chapterId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const topicsData = await chaptersApi.getTopics(chapterId);
      
      // Transform the data to match our UI expectations
      const transformedTopics = topicsData.map((topic: Topic, index: number) => ({
        ...topic,
        title: topic.name,
        subtitle: topic.subtitle, // Use subtitle from API response
        color: getTopicColor(index),
        status: index === 0 ? "active" as const : "locked" as const,
        progress: index === 0 ? 80 : undefined,
      }));
      
      setTopics(transformedTopics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching topics');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [chapterId]);

  return {
    topics,
    loading,
    error,
    refetch: fetchTopics,
  };
};
