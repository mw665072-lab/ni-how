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
    if (type === "arabic") {
      setArabicCompleted(true);
    } else if (type === "chinese") {
      setChineseCompleted(true);
    }
  };

  const handleRecordClick = async () => {
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

    if (!recordedAudio) {
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
                />
              )}
            </>
          )}

          {!isLoadingScenario && (
            <>
              <div className="w-full mx-4">
                <div className="mx-4 mb-4">
                  {recordedAudio ? (
                    <div className="p-4">
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
                          className="p-4 text-white rounded-full transition-colors shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Image src="/images/play.png" alt="Play Icon" width={24} height={24} />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (

                    <div
                      className={` p-4 transition-all duration-300 ${isRecording ? "" : ""}`}
                    >
                      <div className="flex items-center justify-center relative w-full">
                        {/* Waveform Visualization (simplified placeholder or using a library if available, sticking to pure CSS for now) */}
                        <div className="flex items-center justify-center gap-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full -z-10">
                          {isRecording && (
                            <>
                              {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-1 bg-orange-300 rounded-full animate-pulse" style={{ height: Math.random() * 20 + 10 + 'px', animationDelay: Math.random() + 's' }}></div>
                              ))}
                            </>
                          )}
                        </div>

                        <button
                          onClick={handleRecordClick}
                          disabled={!arabicCompleted || !chineseCompleted}
                          className={`rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 
                                ${isRecording
                              ? "bg-white border-4 border-orange-500 shadow-lg text-orange-500"
                              : (!arabicCompleted ? "bg-[#FFF5CE] text-orange-400 border-2 border-orange-200" : "bg-white border-2 border-orange-500 text-orange-500 shadow-md hover:shadow-lg")
                            }
                            `}
                        >
                          {isRecording ? (
                            <div className="w-6 h-6 bg-orange-500 rounded-sm" />
                          ) : (
                            <Mic className={`h-8 w-8 ${!arabicCompleted ? "opacity-50" : ""}`} />
                          )}
                        </button>
                      </div>

                      {isRecording && (
                        <div className="text-center mt-4 text-sm text-gray-500">
                          جاري التسجيل...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {showFeedbackWidget && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 h-auto sm:h-[61px] py-2 px-4 bg-[#FFF5CE] rounded-tl-[16px] rounded-br-[16px] rounded-bl-[16px]">
            <div className="text-sm font-medium text-gray-700 text-right truncate">تَعلِیق</div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-sm text-gray-700 truncate max-w-[160px] text-right" title={feedback}>{feedback}</div>
              <div className="w-[39px] h-[39px] rounded-full bg-[#CCA206] flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
        )}
        <div
          className="p-2"
          dir="rtl"
        >
          <div className="flex flex-col gap-3 px-1 w-full">
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleContinueClick}
                disabled={
                  (!recordedAudio && !hasSubmittedSuccessfully) ||
                  isSubmitting ||
                  !arabicCompleted ||
                  !chineseCompleted
                }
                className="flex-[2] bg-[#22C55E] h-[50px] hover:bg-[#16A34A] text-white py-4 flex items-center justify-center gap-2.5 text-sm font-bold rounded-xl border-b-[4px] border-b-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed disabled:border-none"
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
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => setIsFeedbackOpen(true)}
                disabled={!lastAttemptScores}
                className="flex-1 bg-[#E5E5E5] h-[50px] hover:bg-[#d4d4d4] text-gray-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border-b-[4px] border-b-[#cecece] disabled:opacity-50 disabled:border-none"
              >
                <div className='relative'>
                  {lastAttemptScores && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="truncate">تغذية راجعة</span>
              </Button>
            </div>

            <Button
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full h-[50px] bg-[#FFCB08] hover:bg-[#E5B607] text-gray-900 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border-b-[4px] border-b-[#E5B607]"
            >
              <BookOpen className="h-4 w-4" />
              <span className="truncate">دليل المستخدم</span>
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
    </div>
  );
}
