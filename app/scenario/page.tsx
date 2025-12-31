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
import ProgressBar from "@/components/ui/progressBar";
import Image from "next/image";

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
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [scenarioProgress, setScenarioProgress] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const scenarioId = searchParams.get("scenarioId");
    const sessionData = sessionUtils.getCurrentSession();

    if (sessionData && sessionData.scenarios) {
      const nonIntroScenarios = sessionData.scenarios.filter((s) => !s.isIntroduction);
      setTotalScenarios(nonIntroScenarios.length);
      let scenarioToLoad: Scenario | undefined;

      if (scenarioId) {
        scenarioToLoad = nonIntroScenarios.find(
          (s) => s.id === parseInt(scenarioId, 10)
        );
      } else {
        scenarioToLoad = nonIntroScenarios[0];
      }

      if (scenarioToLoad) {
        setCurrentScenario(scenarioToLoad);
        setFeedbackScore(null);
        setHasSubmittedSuccessfully(false);
        setRecordedAudio(null);
        setIsPlaying(false);
        setArabicCompleted(false);
        setChineseCompleted(false);
        setIsLoadingScenario(false);
        setAudioProgress(0);

        // compute scenario-based progress: number of completed scenarios (those before current)
        const currentIndex = nonIntroScenarios.findIndex((s) => s.id === scenarioToLoad!.id);
        const progressValue = nonIntroScenarios.length > 0 ? Math.round((currentIndex / nonIntroScenarios.length) * 100) : 0;
        setScenarioProgress(progressValue);

        setLastAttemptScores(null);
        setLastTranscription("");
        setIsFeedbackOpen(false);
        setShowFeedbackWidget(false);
        setFeedback("");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setAudioProgress(100);
    };
    const handleAudioPause = () => {
      setIsPlaying(false);
      if (audio.currentTime === 0) setAudioProgress(0);
    };
    const handleAudioPlay = () => setIsPlaying(true);

    const handleTimeUpdate = () => {
      if (audio.duration && audio.currentTime >= 0) {
        setAudioProgress(Math.round((audio.currentTime / audio.duration) * 100));
      }
    };

    audio.addEventListener("ended", handleAudioEnd);
    audio.addEventListener("pause", handleAudioPause);
    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleAudioEnd);
      audio.removeEventListener("pause", handleAudioPause);
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [recordedAudio]);

  const handleRecordingCompleted = (type: "arabic" | "chinese") => {
    console.log(`Recording completed for: ${type}`);
    if (type === "arabic") {
      setArabicCompleted(true);
      console.log("Arabic completed set to true");
    } else if (type === "chinese") {
      setChineseCompleted(true);
      console.log("Chinese completed set to true");
    }
  };

  const handleRecordClick = async () => {
    console.log("Record button clicked", { isRecording, arabicCompleted, chineseCompleted });
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

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
          const webmBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          const wavBlob = await convertToWav(webmBlob);
          console.log("Recorded audio blob (WAV format):", wavBlob);
          setRecordedAudio(wavBlob);

          setHasSubmittedSuccessfully(false);
          setFeedbackScore(null);
          setLastAttemptScores(null);
          setLastTranscription("");
          setShowFeedbackWidget(false);
          setFeedback("");
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  const handlePlayClick = () => {
    if (!recordedAudio || !audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
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
    if (hasSubmittedSuccessfully) {
      const sessionData = sessionUtils.getCurrentSession();
      if (sessionData && sessionData.scenarios) {
        const currentScenarioId = currentScenario?.id;
        const allScenarios = sessionData.scenarios;
        const currentIndex = allScenarios.findIndex(
          (s) => s.id === currentScenarioId
        );

        let nextScenario = null;
        for (let i = currentIndex + 1; i < allScenarios.length; i++) {
          if (!allScenarios[i].isIntroduction) {
            nextScenario = allScenarios[i];
            break;
          }
        }

        if (nextScenario) {
          setIsLoadingScenario(true);
          router.push(`/scenario?scenarioId=${nextScenario.id}`);
        } else {
          console.log("All scenarios completed!");
        }
      }
      return;
    }

    if (!recordedAudio && !currentScenario?.isIntroduction) {
      return;
    }

    if (currentScenario?.isIntroduction) {
      setHasSubmittedSuccessfully(true);
      // Directly proceed to next scenario logic (recursive call or set state to trigger effect)
      // Since setHasSubmittedSuccessfully(true) will trigger the first block of this function on next click,
      // we can just return here and let the user click again? No, better UX is to just proceed.
      // Actually, let's just create a dummy "success" state for intro so it falls through to the next block?
      // Or better, just copy the logic to move to next scenario here.
      const sessionData = sessionUtils.getCurrentSession();
      if (sessionData && sessionData.scenarios) {
        const currentScenarioId = currentScenario?.id;
        const allScenarios = sessionData.scenarios;
        const currentIndex = allScenarios.findIndex(
          (s) => s.id === currentScenarioId
        );

        let nextScenario = null;
        for (let i = currentIndex + 1; i < allScenarios.length; i++) {
          if (!allScenarios[i].isIntroduction) {
            nextScenario = allScenarios[i];
            break;
          }
        }

        if (nextScenario) {
          setIsLoadingScenario(true);
          router.push(`/scenario?scenarioId=${nextScenario.id}`);
        } else {
          console.log("All scenarios completed!");
        }
      }
      return;
    }

    if (!recordedAudio) return;

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

        if (response && response.scores && response.scores.total) {
          setFeedbackScore(response.scores.total);
          setHasSubmittedSuccessfully(true);

          setLastAttemptScores(response.scores);
          setLastTranscription(response.transcription || "");

          if (response.showTextFeedback && response.feedback?.textual) {
            setShowFeedbackWidget(true);
            setFeedback(response.feedback.textual);
          } else {
            setShowFeedbackWidget(false);
          }

          // Update session-based progress to include this completed scenario
          const sessionDataAfter = sessionUtils.getCurrentSession();
          const nonIntroAfter = sessionDataAfter?.scenarios?.filter((s: Scenario) => !s.isIntroduction) || [];
          const currentIndexAfter = nonIntroAfter.findIndex((s: Scenario) => s.id === currentScenario?.id);
          const progressAfter = nonIntroAfter.length > 0 ? Math.round(((currentIndexAfter + 1) / nonIntroAfter.length) * 100) : 0;
          setScenarioProgress(progressAfter);

          if (response.isLastScenario && response.overallFeedback) {
            sessionStorage.setItem(
              "sessionFeedback",
              JSON.stringify(response.overallFeedback)
            );
            router.push("/feedback");
            return;
          }
        }

        setRecordedAudio(null);
      }
    } catch (error: any) {
      console.error("Error submitting attempt:", error);

      if (error?.response?.status === 400 && error?.response?.data?.message) {
        toast({
          title: "خطأ في التعرف على النطق",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
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

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const sampleRate = 16000;
          const length = Math.floor(audioBuffer.duration * sampleRate);
          const monoBuffer = audioContext.createBuffer(1, length, sampleRate);
          const monoData = monoBuffer.getChannelData(0);

          const sourceData = audioBuffer.getChannelData(0);
          const ratio = audioBuffer.sampleRate / sampleRate;

          for (let i = 0; i < length; i++) {
            const sourceIndex = Math.floor(i * ratio);
            monoData[i] = sourceData[sourceIndex] || 0;
          }

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

  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

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
    <div className="h-screen flex flex-col md:pb-0 pb-8 w-full md:px-8 px-8" dir="rtl">
      <audio ref={audioPlayerRef} className="hidden" />
      <ProgressBar
        unit={sessionUtils.getCurrentTopic()?.chapter?.name || ""}
        lesson={sessionUtils.getCurrentTopic()?.name || ""}
        progress={scenarioProgress}
        title="يعود"
        onClick={() => {
          router.push('/units')
        }}
      />
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="flex flex-col items-center justify-center space-y-6">
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
              {currentScenario && (
                <AudioSheikh
                  scenarioImageUrl={currentScenario.scenarioImageUrl}
                  arabicAudioUrl={currentScenario.arabicAudioUrl}
                  chineseAudioUrl={currentScenario.chineseAudioUrl}
                  targetPhraseChinese={currentScenario.targetPhraseChinese}
                  targetPhrasePinyin={currentScenario.targetPhrasePinyin}
                  onRecordingCompleted={handleRecordingCompleted}
                  onProgressUpdate={(p) => setAudioProgress(p)}
                  arabicCompleted={arabicCompleted}
                  chineseCompleted={chineseCompleted}
                  showChineseRecording={!currentScenario.isIntroduction}
                  showDiv={true}
                  imageWidth={360}
                  imageHeight={360}
                />
              )}
            </>
          )}

          {!isLoadingScenario && (
            <>
              {!currentScenario?.isIntroduction && (
                <div className="w-full flex justify-center items-center py-8">
                  <div className="flex items-center justify-center gap-4">
                    {recordedAudio ? (
                      <>
                        {/* Playback Controls */}
                        <button
                          onClick={handleDiscardClick}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                          title="حذف التسجيل"
                        >
                          <X className="h-6 w-6 text-red-600 stroke-[2.5px]" />
                        </button>

                        <button
                          onClick={handlePlayClick}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 border-b-4 border-orange-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 active:border-b-0 active:translate-y-[2px] shadow-lg"
                          title={isPlaying ? "إيقاف" : "تشغيل"}
                        >
                          {isPlaying ? (
                            <Pause className="h-7 w-7 text-white fill-white" />
                          ) : (
                            <Play className="h-7 w-7 text-white fill-white ml-1" />
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Recording Button */}
                        <button
                          onClick={handleRecordClick}
                          disabled={!arabicCompleted}
                          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${!arabicCompleted
                            ? "opacity-40 cursor-not-allowed bg-gray-300"
                            : isRecording
                              ? "bg-gradient-to-br from-red-500 to-red-600 border-b-4 border-red-700 hover:scale-110 active:scale-95"
                              : "bg-gradient-to-br from-orange-400 to-orange-500 border-b-4 border-orange-600 hover:scale-110 active:scale-95 active:border-b-0 active:translate-y-[2px]"
                            }`}
                          title={
                            !arabicCompleted
                              ? "الرجاء الاستماع للصوت أولاً"
                              : isRecording
                                ? "انقر لإيقاف التسجيل"
                                : "انقر للتسجيل"
                          }
                        >
                          {isRecording ? (
                            <>
                              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                              <div className="relative w-5 h-5 rounded-sm bg-white"></div>
                            </>
                          ) : (
                            <Mic className="h-7 w-7 text-white" />
                          )}
                        </button>

                        {/* Waveform - Only show during recording */}
                        {isRecording && (
                          <div className="flex items-center gap-1 px-4">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-orange-500 rounded-full animate-pulse"
                                style={{
                                  height: `${Math.random() * 32 + 8}px`,
                                  animationDelay: `${i * 0.05}s`,
                                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {showFeedbackWidget && (
          <div className="w-full max-w-4xl mx-auto px-4 mb-6">
            <div className="flex items-center gap-4 py-4 px-6 bg-gradient-to-r from-[#FFF9E6] to-[#FFF5CE] rounded-2xl shadow-sm border-l-4 border-[#FFCB08]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFCB08] to-[#E5B607] flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-[#8B6914] mb-1">تعليق</p>
                <p className="text-base text-gray-800 leading-relaxed">{feedback}</p>
              </div>
            </div>
          </div>
        )}
        <div
          className="px-4 pb-20 md:pb-24"
        >
          <div className="flex flex-wrap justify-center gap-3 w-full items-center">
            {/* Yellow User Guide Button */}
            <Button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex-1 min-w-[140px] md:flex-none md:w-48 bg-[#FFCB08] h-14 hover:bg-[#FFCB08] text-[#1F1F1F] py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold border-b-[4px] border-b-[#DEA407] shadow-sm hover:scale-[1.02] active:translate-y-[2px] active:border-b-0 transition-all"
            >
              <BookOpen className="h-5 w-5 stroke-[2.5px]" />
              <span className="truncate">دليل المستخدم</span>
            </Button>

            {/* Grey Feedback Button */}
            <Button
              onClick={() => setIsFeedbackOpen(true)}
              disabled={!lastAttemptScores}
              className="flex-1 min-w-[140px] md:flex-none md:w-48 bg-[#E5E5E5] h-14 hover:bg-[#E5E5E5] text-[#1F1F1F] py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold border-b-[4px] border-b-[#C4C4C4] disabled:opacity-50 disabled:border-none shadow-sm hover:scale-[1.02] active:translate-y-[2px] active:border-b-0 transition-all"
            >
              <div className='relative'>
                {lastAttemptScores && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                <MessageSquare className="h-5 w-5 stroke-[2.5px]" />
              </div>
              <span className="truncate">تغذية راجعة</span>
            </Button>


            {/* Green Continue Button */}
            <Button
              onClick={handleContinueClick}
              disabled={
                (!currentScenario?.isIntroduction && !recordedAudio && !hasSubmittedSuccessfully) ||
                isSubmitting ||
                (!currentScenario?.isIntroduction && !arabicCompleted)
              }
              className="w-full md:w-48 bg-[#35AB4E] h-14 hover:bg-[#35AB4E] text-white py-4 flex items-center justify-center gap-3 text-lg font-bold rounded-2xl border-b-[4px] border-b-[#298E3E] disabled:opacity-50 disabled:cursor-not-allowed disabled:border-none shadow-sm hover:scale-[1.02] active:translate-y-[2px] active:border-b-0 transition-all"
            >
              <span className="truncate">
                {isSubmitting
                  ? "جاري الإرسال..."
                  : hasSubmittedSuccessfully
                    ? "استمر"
                    : "إرسال"}
              </span>
              {!isSubmitting && (
                <ChevronLeft className="h-6 w-6" />
              )}
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            </Button>
          </div>
        </div>
      </div>



      <FeedbackPopup
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        scores={lastAttemptScores}
        transcription={lastTranscription}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://jfxedbnofpaezykdssmk.supabase.co/storage/v1/object/public/nihaonow-bucket/User-Guide/UserGuide-Video.mp4"
        title="دليل المستخدم"
      />
    </div >
  );
}
