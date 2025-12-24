"use client";

import Header from "@/components/Header";
import AudioSheikh from "@/components/AudioSheikh";
import { Button } from "@/components/ui/button";
import {
  Play,
  Mic,
  ChevronLeft,
  MessageSquare,
  BookOpen,
  Loader2,
  X,
  Pause,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { sessionsApi, Scenario } from "@/lib/api";
import { sessionUtils } from "@/lib/sessionUtils";
import { useSearchParams, useRouter } from "next/navigation";
import FeedbackPopup from "@/components/FeedbackPopup";
import VideoModal from "@/components/VideoModal";
import { useToast } from "@/hooks/use-toast";
import { useAuthProtection } from "@/hooks/useAuthProtection";

export default function ScenarioPage() {
  useAuthProtection();

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] =
    useState(false);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);
  const [arabicCompleted, setArabicCompleted] = useState(false);
  const [chineseCompleted, setChineseCompleted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [lastAttemptScores, setLastAttemptScores] = useState<any>(null);
  const [lastTranscription, setLastTranscription] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const scenarioId = searchParams.get("scenarioId");
    const sessionData = sessionUtils.getCurrentSession();

    if (sessionData && sessionData.scenarios) {
      setTotalScenarios(sessionData.scenarios.length);
      let scenarioToLoad: Scenario | undefined;

      if (scenarioId) {
        scenarioToLoad = sessionData.scenarios.find(
          (s) => s.id === parseInt(scenarioId, 10)
        );
      } else {
        // Fallback to the first non-introduction scenario if no ID is provided
        scenarioToLoad = sessionData.scenarios.find((s) => !s.isIntroduction);
      }

      if (scenarioToLoad) {
        setCurrentScenario(scenarioToLoad);
        // Reset state for new scenario
        setFeedbackScore(null);
        setHasSubmittedSuccessfully(false);
        setRecordedAudio(null);
        setIsPlaying(false);
        setArabicCompleted(false);
        setChineseCompleted(false);
        setIsLoadingScenario(false); // Hide loading when scenario is loaded

        // Reset feedback popup data for new scenario
        setLastAttemptScores(null);
        setLastTranscription("");
        setIsFeedbackOpen(false);
      }
    }
  }, [searchParams]);

  // Effect to handle audio playback ending
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    const handleAudioEnd = () => setIsPlaying(false);
    audio.addEventListener("ended", handleAudioEnd);

    return () => {
      audio.removeEventListener("ended", handleAudioEnd);
    };
  }, []);

  const handleRecordingCompleted = (type: "arabic" | "chinese") => {
    if (type === "arabic") {
      setArabicCompleted(true);
    } else if (type === "chinese") {
      setChineseCompleted(true);
    }
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        // Use a supported format (WebM is widely supported)
        const mimeType = "audio/webm;codecs=opus";
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Convert WebM to WAV format
          const webmBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          // Convert to WAV format
          const wavBlob = await convertToWav(webmBlob);
          console.log("Recorded audio blob (WAV format):", wavBlob);
          setRecordedAudio(wavBlob);

          // Reset submission state when new recording is made
          setHasSubmittedSuccessfully(false);
          setFeedbackScore(null);
          setLastAttemptScores(null);
          setLastTranscription("");
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        // Handle error (e.g., show a message to the user)
      }
    }
  };

  const handlePlayClick = () => {
    if (!recordedAudio || !audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      // Always create a new URL for the current audio blob
      if (audioPlayerRef.current.src) {
        URL.revokeObjectURL(audioPlayerRef.current.src);
      }
      const audioUrl = URL.createObjectURL(recordedAudio);
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDiscardClick = () => {
    // Clean up audio element
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      if (audioPlayerRef.current.src) {
        URL.revokeObjectURL(audioPlayerRef.current.src);
        audioPlayerRef.current.src = "";
      }
    }
    setRecordedAudio(null);
    setIsPlaying(false);
  };

  const handleContinueClick = async () => {
    // If already submitted successfully, navigate to next scenario
    if (hasSubmittedSuccessfully) {
      const sessionData = sessionUtils.getCurrentSession();
      if (sessionData && sessionData.scenarios) {
        // Find the next non-introduction scenario
        const currentScenarioId = currentScenario?.id;
        const allScenarios = sessionData.scenarios;
        const currentIndex = allScenarios.findIndex(
          (s) => s.id === currentScenarioId
        );

        // Find the next scenario after the current one
        let nextScenario = null;
        for (let i = currentIndex + 1; i < allScenarios.length; i++) {
          if (!allScenarios[i].isIntroduction) {
            nextScenario = allScenarios[i];
            break;
          }
        }

        if (nextScenario) {
          // Show loading state and navigate to the next scenario
          setIsLoadingScenario(true);
          router.push(`/scenario?scenarioId=${nextScenario.id}`);
        } else {
          // No more scenarios, navigate to completion or next lesson
          console.log("All scenarios completed!");
          // TODO: Navigate to completion page or next lesson
        }
      }
      return;
    }

    if (!recordedAudio) {
      // Handle case where no audio is recorded
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionId = sessionUtils.getSessionId();
      console.log("Submitting attempt for session ID:", recordedAudio, sessionId);

      if (sessionId && currentScenario) {
        const response = await sessionsApi.submitAttempt(
          sessionId,
          currentScenario.id,
          recordedAudio
        );

        // Store the feedback score from the response
        if (response && response.scores && response.scores.total) {
          setFeedbackScore(response.scores.total);
          setHasSubmittedSuccessfully(true);

          // Store scores and transcription for feedback popup
          setLastAttemptScores(response.scores);
          setLastTranscription(response.transcription || "");

          // Check if this is the last scenario
          if (response.isLastScenario && response.overallFeedback) {
            // Store the comprehensive feedback in session storage
            sessionStorage.setItem(
              "sessionFeedback",
              JSON.stringify(response.overallFeedback)
            );
            // Navigate to feedback page
            router.push("/feedback");
            return;
          }
        }

        // Clear recorded audio after successful submission
        setRecordedAudio(null);
      }
    } catch (error: any) {
      console.error("Error submitting attempt:", error);

      // Check if it's a 400 error with the specific message
      if (error?.response?.status === 400 && error?.response?.data?.message) {
        toast({
          title: "خطأ في التعرف على النطق",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
        // Generic error message for other errors
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء إرسال التسجيل. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert WebM to WAV format
  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Convert to 16kHz mono
          const sampleRate = 16000;
          const length = Math.floor(audioBuffer.duration * sampleRate);
          const monoBuffer = audioContext.createBuffer(1, length, sampleRate);
          const monoData = monoBuffer.getChannelData(0);

          // Resample and convert to mono
          const sourceData = audioBuffer.getChannelData(0);
          const ratio = audioBuffer.sampleRate / sampleRate;

          for (let i = 0; i < length; i++) {
            const sourceIndex = Math.floor(i * ratio);
            monoData[i] = sourceData[sourceIndex] || 0;
          }

          // Convert to WAV
          const wavBlob = audioBufferToWav(monoBuffer);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

  // Helper function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * 2, true);

    // Convert float32 to int16
    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  };

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <Header />
      <audio ref={audioPlayerRef} className="hidden" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Page Title */}
        <div className="flex items-center justify-center gap-6 mb-8 px-4">
          <span className="text-white text-lg font-medium border rounded-full p-3 bg-[#8AC53E]">
            {currentScenario?.scenarioNumber || 0}/{totalScenarios}
          </span>
          <h1 className="text-2xl font-bold text-black">
            الوحدة الأولى: الدرس الأول
          </h1>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Loading State */}
          {isLoadingScenario ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <Loader2 className="h-12 w-12 animate-spin text-green-500" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  جاري تحميل السيناريو التالي...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Loading next scenario...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Character with Speech Bubble */}
              {currentScenario && (
                <AudioSheikh
                  scenarioImageUrl={currentScenario.scenarioImageUrl}
                  arabicAudioUrl={currentScenario.arabicAudioUrl}
                  chineseAudioUrl={currentScenario.chineseAudioUrl}
                  targetPhraseChinese={currentScenario.targetPhraseChinese}
                  targetPhrasePinyin={currentScenario.targetPhrasePinyin}
                  onRecordingCompleted={handleRecordingCompleted}
                  arabicCompleted={arabicCompleted}
                  chineseCompleted={chineseCompleted}
                />
              )}
            </>
          )}

          {/* Content - Only show when not loading */}
          {!isLoadingScenario && (
            <>
              {/* New Pronunciation Card */}
              <div className="w-full rounded-lg mx-4 bg-[#EDFFF8]">
                <div className="bg-white rounded-2xl px-2 py-4 m-4 text-right shadow-xl">
                  {/* <div className="text-5xl font-bold text-green-600">شكراً</div> */}
                  <div className="text-5xl text-red-500 ">
                    {currentScenario?.targetPhraseChinese || "谢谢"}
                  </div>
                  <div className="text-lg text-gray-600 mt-1">
                    {currentScenario?.targetPhrasePinyin || "Shukran"}
                  </div>
                </div>

                {/* Feedback Section with Notch */}
                <div className="relative mx-4 mb-4">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>

                  <div className="bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between mt-2">
                    <span className="text-gray-700 font-medium">تعليق</span>
                    <div className="flex gap-2">
                      <div
                        className={`w-6 h-4 rounded transition-all duration-300 ${
                          feedbackScore !== null
                            ? feedbackScore >= 90
                              ? "bg-green-500 shadow-lg"
                              : "bg-green-300 opacity-50"
                            : "bg-green-300"
                        }`}
                      ></div>
                      <div
                        className={`w-6 h-4 rounded transition-all duration-300 ${
                          feedbackScore !== null
                            ? feedbackScore >= 80 && feedbackScore < 90
                              ? "bg-yellow-400 shadow-lg"
                              : "bg-yellow-300 opacity-50"
                            : "bg-yellow-300"
                        }`}
                      ></div>
                      <div
                        className={`w-6 h-4 rounded transition-all duration-300 ${
                          feedbackScore !== null
                            ? feedbackScore < 80
                              ? "bg-red-500 shadow-lg"
                              : "bg-red-300 opacity-50"
                            : "bg-red-300"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Recording Section */}
                <div className="mx-4 mb-4">
                  {recordedAudio ? (
                    /* Playback Mode */
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                      <div className="text-center mb-3">
                        <span className="text-blue-700 font-medium text-sm">
                          تم التسجيل بنجاح
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={handleDiscardClick}
                          className="p-3 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                          title="حذف التسجيل"
                        >
                          <X className="h-5 w-5 text-red-600" />
                        </button>
                        <button
                          onClick={handlePlayClick}
                          className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Recording Mode */
                    <div
                      className={`border-2 rounded-2xl p-4 transition-all duration-300 ${
                        isRecording
                          ? "bg-red-50 border-red-300"
                          : "bg-green-50 border-green-200 hover:border-green-300"
                      }`}
                    >
                      <div className="text-center mb-3">
                        <span
                          className={`font-medium text-sm ${
                            isRecording ? "text-red-700" : "text-green-700"
                          }`}
                        >
                          {isRecording ? "جاري التسجيل..." : "اضغط للتسجيل"}
                        </span>
                      </div>

                      {isRecording ? (
                        /* Active Recording State */
                        <div className="flex items-center justify-center">
                          <button
                            onClick={handleRecordClick}
                            className="flex items-center justify-center gap-3 p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                              <Mic className="h-5 w-5" />
                            </div>
                            <span className="font-medium">إيقاف التسجيل</span>
                          </button>
                        </div>
                      ) : (
                        /* Idle Recording State */
                        <button
                          onClick={handleRecordClick}
                          disabled={!arabicCompleted || !chineseCompleted}
                          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl transition-all duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mic className="h-5 w-5" />
                          <span className="font-medium">بدء التسجيل</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Navigation */}
      </div>
      <div
        className="fixed bottom-0 left-32 right-0 bg-gray-100 border-t flex-1 w-[90%] border-gray-200 p-2"
        dir="rtl"
      >
        <div className="flex gap-1 px-1">
          {/* User Guide Button */}
          <Button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex-1 bg-[#FFCB08] hover:bg-green-600 text-black py-2 rounded-xl flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">دليل المستخدم</span>
          </Button>

          {/* Feedback Button */}
          <Button
            onClick={() => setIsFeedbackOpen(true)}
            disabled={!lastAttemptScores}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl flex items-center justify-center gap-1 text-xs sm:text-sm disabled:opacity-50"
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">تغذية راجعة</span>
          </Button>

          {/* Continue Button */}
          <Button
            onClick={handleContinueClick}
            disabled={
              (!recordedAudio && !hasSubmittedSuccessfully) ||
              isSubmitting ||
              !arabicCompleted ||
              !chineseCompleted
            }
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl flex items-center justify-center gap-1 text-xs sm:text-sm disabled:opacity-50"
          >
            <span className="truncate">
              {isSubmitting
                ? "جاري الإرسال..."
                : hasSubmittedSuccessfully
                ? "استمر"
                : "إرسال"}
            </span>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Feedback Popup */}
      <FeedbackPopup
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        scores={lastAttemptScores}
        transcription={lastTranscription}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://jfxedbnofpaezykdssmk.supabase.co/storage/v1/object/public/nihaonow-bucket/User-Guide/UserGuide-Video.mp4"
        title="دليل المستخدم"
      />
    </div>
  );
}
