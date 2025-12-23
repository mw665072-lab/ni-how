"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import VideoModal from "@/components/VideoModal";
import LanguageLearningInterface from "@/components/AudioSheikh";
import { sessionUtils } from "@/lib/sessionUtils";
import { Scenario } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import LogoutButton from "@/components/LogoutButton";

export default function SheikhPage() {
  useAuthProtection();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [introductionScenario, setIntroductionScenario] =
    useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arabicCompleted, setArabicCompleted] = useState(false);
  const [chineseCompleted, setChineseCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get session data and find the introduction scenario
    const scenarios = sessionUtils.getScenarios();
    const introScenario = scenarios.find((scenario) => scenario.isIntroduction);
    console.log("Introduction scenario:", introScenario);
    console.log("All scenarios:", scenarios);

    if (introScenario) {
      setIntroductionScenario(introScenario);
    }
    setLoading(false);
  }, []);

  const handleUserGuideClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleRecordingCompleted = (type: "arabic" | "chinese") => {
    if (type === "arabic") {
      setArabicCompleted(true);
    } else if (type === "chinese") {
      setChineseCompleted(true);
    }
  };

  const handleNextClick = async () => {
    setIsNavigating(true);
    // Simulate a brief loading period
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find the first non-introduction scenario
    const scenarios = sessionUtils.getScenarios();
    const nextScenario = scenarios.find((scenario) => !scenario.isIntroduction);

    if (nextScenario) {
      router.push(`/scenario?scenarioId=${nextScenario.id}`);
    } else {
      // Handle case where no next scenario is found
      router.push("/scenario");
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };
  return (
    <div dir="rtl" className="min-h-screen to-white">
      <div className="relative">
        <Header />
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Lesson Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black">
            الوحدة الأولى: الدرس الأول
          </h1>
        </div>

        {/* Language Learning Interface */}
        <div className="mb-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : introductionScenario ? (
            <LanguageLearningInterface
              scenarioImageUrl={introductionScenario.scenarioImageUrl}
              arabicAudioUrl={introductionScenario.arabicAudioUrl}
              chineseAudioUrl={introductionScenario.chineseAudioUrl}
              targetPhraseChinese={introductionScenario.targetPhraseChinese}
              targetPhrasePinyin={introductionScenario.targetPhrasePinyin}
              onRecordingCompleted={handleRecordingCompleted}
              arabicCompleted={arabicCompleted}
              chineseCompleted={chineseCompleted}
              showChineseRecording={false}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">
                No introduction scenario found
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 space-x-reverse mb-8 mx-10">
          {/* User Guide Button */}
          <Button
            variant="outline"
            onClick={handleUserGuideClick}
            className="flex-1 bg-yellow-400 border-yellow-400 text-gray-800 hover:bg-yellow-500 rounded-full py-3"
          >
            <BookOpen className="h-5 w-5 ml-2" />
            دليل المستخدم
          </Button>

          {/* Continue Button */}
          <Button
            onClick={handleNextClick}
            disabled={isNavigating || !arabicCompleted}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-3 disabled:opacity-50"
          >
            {isNavigating ? "جاري التحميل..." : "ابدأ"}
            {isNavigating ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <ChevronLeft className="h-5 w-5 mr-2" />
            )}
          </Button>
        </div>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        videoUrl="https://jfxedbnofpaezykdssmk.supabase.co/storage/v1/object/public/nihaonow-bucket/User-Guide/UserGuide-Video.mp4"
        title="دليل المستخدم"
      />
    </div>
  );
}
