import { useState, useEffect } from 'react';
import { chaptersApi, Chapter, ChapterUI } from '@/lib/api';

interface UseChaptersReturn {
  chapters: ChapterUI[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Helper function to assign colors to chapters
const getChapterColor = (index: number): string => {
  const colors = ["#F98D00", "#FFCB08", "#8AC53E", "#CA495A", "#71A8E6"];
  return colors[index % colors.length];
};

export const useChapters = (): UseChaptersReturn => {
  const [chapters, setChapters] = useState<ChapterUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      const chaptersData = await chaptersApi.getAll();
      
      // Transform the data to match our UI expectations
      const transformedChapters = chaptersData.map((chapter, index) => ({
        ...chapter,
        title: chapter.name,
        subtitle: chapter.difficulty,
        color: getChapterColor(index),
        status: index === 0 ? "active" as const : "locked" as const,
        progress: index === 0 ? 80 : undefined,
      }));
      
      setChapters(transformedChapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching chapters');
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return {
    chapters,
    loading,
    error,
    refetch: fetchChapters,
  };
};
