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
import ProgressBar from "@/components/ui/progressBar";

export default function SheikhPage() {
  useAuthProtection();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [introductionScenario, setIntroductionScenario] =
    useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arabicCompleted, setArabicCompleted] = useState(false);
  const [chineseCompleted, setChineseCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [skipIntro, setSkipIntro] = useState(false);

  const router = useRouter();

  useEffect(() => {
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

  // intro shows only Arabic recording — change this if the intro scenario requires Chinese as well
  const showChineseRecording = false;

  const computeAndSetProgress = (audioPct = 0) => {
    const totalSteps = showChineseRecording ? 2 : 1;
    const completedCount = (arabicCompleted ? 1 : 0) + (chineseCompleted ? 1 : 0);
    let activeFraction = 0;

    // Determine which step is active: arabic first, then chinese (if enabled)
    if (!arabicCompleted) {
      activeFraction = audioPct / 100;
    } else if (showChineseRecording && !chineseCompleted) {
      activeFraction = audioPct / 100;
    }

    const value = Math.round(((completedCount + activeFraction) / totalSteps) * 100);
    setProgress(value);
  };

  const handleAudioProgress = (audioPct: number) => {
    computeAndSetProgress(audioPct);
  };

  const handleRecordingCompleted = (type: "arabic" | "chinese") => {
    if (type === "arabic") {
      setArabicCompleted(true);
    } else if (type === "chinese") {
      setChineseCompleted(true);
    }

    // ensure progress reflects the completed step
    computeAndSetProgress(0);
  };

  const handleNextClick = async () => {
    setIsNavigating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // reset progress while navigating
    setProgress(0);

    const scenarios = sessionUtils.getScenarios();
    const nextScenario = scenarios.find((scenario) => !scenario.isIntroduction);

    if (nextScenario) {
      router.push(`/scenario?scenarioId=${nextScenario.id}`);
    } else {
      router.push("/scenario");
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <div className="px-4 py-6">
        <ProgressBar
          unit={sessionUtils.getCurrentTopic()?.chapter?.name || ""}
          lesson={sessionUtils.getCurrentTopic()?.name || ""}
          progress={progress}
          onClick={() => {
            setSkipIntro(true);
            setProgress(100);
            handleNextClick();

          }}
        />

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
              onProgressUpdate={handleAudioProgress}
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

        <div className="flex gap-4 space-x-reverse mb-8 mx-10">
          <Button
            variant="outline"
            onClick={handleUserGuideClick}
            className="flex-1 bg-yellow-400 border-yellow-400 text-gray-800 hover:bg-yellow-500 
            h-10 py-4 flex items-center justify-center gap-2.5 text-sm sm:text-sm opacity-100 rounded-xl border-b-[3px] border-b-[#454545] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="h-5 w-5 ml-2" />
            دليل المستخدم
          </Button>

          <Button
            onClick={handleNextClick}
            disabled={isNavigating || (!arabicCompleted && !skipIntro)}
            className="flex-1 bg-[#636363] hover:bg-[#5a5a5a] text-white 
            h-10 py-4 flex items-center justify-center gap-2.5 text-sm sm:text-sm opacity-100 rounded-xl border-b-[3px] border-b-[#454545] disabled:opacity-50 disabled:cursor-not-allowed"
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
