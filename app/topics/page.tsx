"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import { useTopics } from "@/hooks/useTopics";
import { useSession } from "@/hooks/useSession";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthProtection } from "@/hooks/useAuthProtection";

interface TopicUI {
  id: number;
  name: string;
  difficulty: string;
  orderIndex: number;
  title: string;
  subtitle: string;
  color: string;
  status: "active" | "locked";
  progress?: number;
}

export default function TopicsPage() {
  useAuthProtection();

  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = searchParams.get("chapterId")
    ? parseInt(searchParams.get("chapterId")!)
    : null;
  const { topics, loading, error, refetch } = useTopics(chapterId);
  const {
    startSession,
    loading: sessionLoading,
    error: sessionError,
  } = useSession();

  const handleTopicClick = async (topic: TopicUI) => {
    if (topic.status === "active") {
      try {
        // Start session with the topic
        await startSession(topic.id);
        // Navigate to introduction page
        router.push("/introduction");
      } catch (err) {
        console.error("Failed to start session:", err);
        // You could show an error message here
      }
    }
  };

  // Colors for cards (user requested)
  const colors = ['#F98D00', '#8DC743', '#CA495A', '#9CEDBC'];

  const isLight = (hex: string) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  // Static locked topics to display after dynamic ones
  const staticTopics = [
    { title: 'الدرس الثاني', subtitle: 'متوسط' },
    { title: 'الدرس الثالث', subtitle: 'متوسط' },
    { title: 'الدرس الرابع', subtitle: 'متقدم' },
    { title: 'الدرس الخامس', subtitle: 'متقدم' },
    { title: 'الدرس السادس', subtitle: 'متقدم' },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Content Section */}
      <div className="px-4 py-6 space-y-4">
        {(loading || sessionLoading) && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span className="mr-2 text-gray-600">
              {loading ? "جاري تحميل الدروس..." : "جاري بدء الجلسة..."}
            </span>
          </div>
        )}

        {(error || sessionError) && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-4">{error || sessionError}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !sessionLoading && topics.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">لا توجد دروس متاحة لهذه الوحدة</p>
          </div>
        )}

        {/* Dynamic Topics from API */}
        {!loading &&
          !error &&
          !sessionLoading &&
          topics.map((topic, idx) => {
            const color = colors[idx % colors.length];
            const light = isLight(color);
            return (
              <Card
                key={topic.id}
                className={`shadow-lg rounded-lg py-2 h-auto border border-[#E5E5E5] ${topic.status === "active"
                  ? "cursor-pointer hover:shadow-xl transition-shadow"
                  : "cursor-not-allowed"
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => handleTopicClick(topic)}
              >
                <CardContent className="p-0">
                  <div className="h-auto md:h-auto md:py-4 px-3 flex items-center justify-between">
                    {/* Content */}
                    <div className="flex-1 text-right">
                      <h3 className={`text-xl font-bold mb-1 ${topic.status === "active" ? (light ? 'text-gray-900' : 'text-white') : (light ? 'text-gray-500' : 'text-white')}`}>
                        {topic.title}
                      </h3>
                      <p className={`${topic.status === "active" ? (light ? 'text-gray-600' : 'text-white') : (light ? 'text-gray-500' : 'text-white')} text-sm`}>
                        {topic.subtitle}
                      </p>
                    </div>
                    {/* Status Icon */}
                    <div className="mr-4">
                      {topic.status === "active" ? (
                        <CheckCircle className={`h-6 w-6 ${light ? 'text-gray-700' : 'text-white'}`} />
                      ) : (
                        <Lock className={`h-6 w-6 ${light ? 'text-gray-400' : 'text-white'}`} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

      </div>
    </div>
  );
}

