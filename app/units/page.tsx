"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useChapters } from "@/hooks/useChapters";
import { ChapterUI } from "@/lib/api";
import { useAuthProtection } from "@/hooks/useAuthProtection";

export default function UnitsPage() {
  useAuthProtection();

  const router = useRouter();
  const { chapters, loading, error, refetch } = useChapters();

  const handleUnitClick = (chapter: ChapterUI) => {
    if (chapter.status === "active") {
      router.push(`/topics?chapterId=${chapter.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header Section */}
      <Header />

      {/* Content Section */}
      <div className="sm:px-96 px-4 py-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span className="mr-2 text-gray-600">جاري تحميل الوحدات...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {!loading && !error && chapters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">لا توجد وحدات متاحة حالياً</p>
          </div>
        )}

        {/* Dynamic Units from API */}
        {!loading &&
          !error &&
          chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className={`border-0 shadow-lg ${
                chapter.status === "active"
                  ? "cursor-pointer hover:shadow-xl transition-shadow"
                  : "cursor-not-allowed"
              }`}
              style={{ backgroundColor: chapter.color }}
              onClick={() => handleUnitClick(chapter)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Content */}
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      {chapter.subtitle}
                    </p>
                  </div>
                  {/* Status Icon */}
                  <div className="mr-4">
                    {chapter.status === "active" ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Lock className="h-6 w-6 text-white opacity-70" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Static Locked Units */}
        {!loading && !error && (
          <>
            <Card className="border-0 shadow-lg cursor-not-allowed" style={{ backgroundColor: "#3B82F6" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-white mb-1">
                      الوحدة الثانية
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
                      الوحدة الثالثة
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
                      الوحدة الرابعة
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
                      الوحدة الخامسة
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
                      الوحدة السادسة
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
