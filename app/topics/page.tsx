"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
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

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header Section */}
      <Header />

      {/* Content Section */}
      <div className="sm:px-96 px-4 py-6 space-y-4">
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
          topics.map((topic) => (
            <Card
              key={topic.id}
              className={`border-0 shadow-lg ${
                topic.status === "active"
                  ? "cursor-pointer hover:shadow-xl transition-shadow"
                  : "cursor-not-allowed"
              }`}
              style={{ backgroundColor: topic.color }}
              onClick={() => handleTopicClick(topic)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Content */}
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      {topic.subtitle}
                    </p>
                  </div>
                  {/* Status Icon */}
                  <div className="mr-4">
                    {topic.status === "active" ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Lock className="h-6 w-6 text-white opacity-70" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Static Locked Topics */}
        {!loading && !error && !sessionLoading && (
          <>
            <Card className="border-0 shadow-lg cursor-not-allowed" style={{ backgroundColor: "#3B82F6" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      الدرس الثاني
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      متوسط
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-white opacity-70" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg cursor-not-allowed" style={{ backgroundColor: "#8B5CF6" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      الدرس الثالث
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      متوسط
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-white opacity-70" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg cursor-not-allowed" style={{ backgroundColor: "#EF4444" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      الدرس الرابع
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      متقدم
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-white opacity-70" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg cursor-not-allowed" style={{ backgroundColor: "#10B981" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      الدرس الخامس
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      متقدم
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-white opacity-70" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg cursor-not-allowed" style={{ backgroundColor: "#F56E8D" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      الدرس السادس
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      متقدم
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-white opacity-70" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
