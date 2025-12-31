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
    <div className="min-h-screen bg-white" dir="rtl">

      {/* Content Section */}
      <div className="px-4 py-6 space-y-4">
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
              className={`shadow-lg py-2 h-auto rounded-lg border border-[#E5E5E5] bg-[#F8F9FA] ${
                chapter.status === "active"
                  ? "cursor-pointer hover:shadow-xl transition-shadow"
                  : "cursor-not-allowed"
              }`}
              onClick={() => handleUnitClick(chapter)}
            >
              <CardContent className="p-0">
                <div className="h-auto md:h-auto md:py-4 px-3 flex items-center justify-between">
                  {/* Content */}
                  <div className="flex-1 text-right">
                    <h3 className={`text-xl font-bold mb-1 ${chapter.status === "active" ? "text-gray-900" : "text-gray-500"}`}>
                      {chapter.title}
                    </h3>
                    <p className={`${chapter.status === "active" ? "text-gray-600" : "text-gray-500"} text-sm`}>
                      {chapter.subtitle}
                    </p>
                  </div>
                  {/* Status Icon */}
                  <div className="mr-4">
                    {chapter.status === "active" ? (
                      <CheckCircle className="h-6 w-6 text-gray-700" />
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Static Locked Units */}
        {!loading && !error && (
          <>
            <Card className="shadow-lg rounded-lg shadow-lg py-2 h-auto border border-[#E5E5E5] bg-[#F8F9FA] cursor-not-allowed">
              <CardContent className="p-0">
                <div className="h-auto md:h-auto md:py-4 px-3 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      الوحدة الثانية
                    </h3>
                    <p className="text-gray-600 text-sm">
                      متوسط
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg shadow-lg py-2 h-auto border border-[#E5E5E5] bg-[#F8F9FA] cursor-not-allowed">
              <CardContent className="p-0">
                <div className="h-9 md:h-auto md:py-4 px-3 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      الوحدة الثالثة
                    </h3>
                    <p className="text-gray-600 text-sm">
                      متوسط
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg shadow-lg py-2 h-auto border border-[#E5E5E5] bg-[#F8F9FA] cursor-not-allowed">
              <CardContent className="p-0">
                <div className="h-9 md:h-auto md:py-4 px-3 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      الوحدة الرابعة
                    </h3>
                    <p className="text-gray-600 text-sm">
                      متقدم
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg border shadow-lg py-2 h-auto border-[#E5E5E5] bg-[#F8F9FA] cursor-not-allowed">
              <CardContent className="p-0">
                <div className="h-9 md:h-auto md:py-4 px-3 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      الوحدة الخامسة
                    </h3>
                    <p className="text-gray-600 text-sm">
                      متقدم
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg shadow-lg py-2 h-auto border border-[#E5E5E5] bg-[#F8F9FA] cursor-not-allowed">
              <CardContent className="p-0">
<div className="h-auto md:h-auto md:py-4 px-3 flex items-center justify-between">                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      الوحدة السادسة
                    </h3>
                    <p className="text-gray-600 text-sm">
                      متقدم
                    </p>
                  </div>
                  <div className="mr-4">
                    <Lock className="h-6 w-6 text-gray-400" />
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
