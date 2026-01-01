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

  // During the introduction we don't base the progress bar on audio playback.
  // Keep it unchanged while audio plays; only set to 100% when the entire introduction is complete.
  const handleAudioProgress = (_audioPct: number) => {
    // no-op: audio playback should not affect the introduction progress bar
  };

  const handleRecordingCompleted = (type: "arabic" | "chinese") => {
    if (type === "arabic") {
      setArabicCompleted(true);
    } else if (type === "chinese") {
      setChineseCompleted(true);
    }

    // compute completion based on updated values (use 'type' to infer the immediate change)
    const arabicDone = type === "arabic" ? true : arabicCompleted;
    const chineseDone = type === "chinese" ? true : chineseCompleted;
    const introCompleteNow = arabicDone && (!showChineseRecording ? true : chineseDone);

    if (introCompleteNow) {
      setProgress(100);
    }
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

  const introComplete = arabicCompleted && (!showChineseRecording || chineseCompleted);

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
              showDiv={false}
              imageWidth={360}
              imageHeight={360}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">
                No introduction scenario found
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full px-4 max-w-full mx-auto">
          <Button
            variant="outline"
            onClick={handleUserGuideClick}
            className="w-full bg-[#E5E5E5] hover:bg-[#E5E5E5] border-none border-b-[3px] border-b-[#B0B0B0] hover:text-[#282828] text-[#282828]
            h-14 pt-4 pb-4 flex items-center justify-center gap-2.5 text-base sm:text-lg font-bold rounded-xl shadow-sm hover:scale-[1.02] active:translate-y-[2px] active:border-b-0 transition-all"
          >
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">تغذية راجعة</span>
          </Button>

          <Button
            onClick={handleNextClick}
            disabled={isNavigating || (!introComplete && !skipIntro)}
            className="w-full bg-[#636363] hover:bg-[#636363] border-b-[3px] border-b-[#454545] text-white 
            h-14 pt-4 pb-4 flex items-center justify-center gap-2.5 text-base sm:text-lg font-bold rounded-xl shadow-sm hover:scale-[1.02] active:translate-y-[2px] active:border-b-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-none border-none"
          >
            <span className="truncate">{isNavigating ? "جاري التحميل..." : "استمر"}</span>
            {isNavigating ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
            ) : (
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
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
