"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Volume2, Pause } from "lucide-react";
import Image from "next/image";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface LanguageLearningInterfaceProps {
  scenarioImageUrl?: string;
  arabicAudioUrl?: string;
  chineseAudioUrl?: string;
  targetPhraseChinese?: string;
  targetPhrasePinyin?: string;
  showDiv?: boolean;
  onRecordingCompleted?: (type: "arabic" | "chinese") => void;
  /**
   * Called with a number 0-100 representing percent played of the currently-playing audio
   */
  onProgressUpdate?: (progress: number) => void;
  arabicCompleted?: boolean;
  chineseCompleted?: boolean;
  showChineseRecording?: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

export default function LanguageLearningInterface({
  scenarioImageUrl = "/images/shiekh2.png",
  arabicAudioUrl,
  chineseAudioUrl,
  targetPhraseChinese = "谢谢",
  targetPhrasePinyin = "xiè xiè",
  onRecordingCompleted,
  onProgressUpdate,
  arabicCompleted = false,
  chineseCompleted = false,
  showChineseRecording = true,
  showDiv = true,
  imageWidth = 360,
  imageHeight = 360,
}: LanguageLearningInterfaceProps) {
  const [isContextPlaying, setIsContextPlaying] = useState(false);
  const [isPronunciationPlaying, setIsPronunciationPlaying] = useState(false);
  const [localArabicCompleted, setLocalArabicCompleted] = useState(false);
  const [localChineseCompleted, setLocalChineseCompleted] = useState(false);
  const arabicAudioRef = useRef<HTMLAudioElement>(null);
  const chineseAudioRef = useRef<HTMLAudioElement>(null);

  console.log("arabicAudioUrl", targetPhraseChinese, targetPhrasePinyin);

  // pauseAllOtherAudios is defined below where we also reset progress so the top bar stays in sync

  const handleContextPlay = () => {
    if (arabicAudioRef.current) {
      if (isContextPlaying) {
        arabicAudioRef.current.pause();
        arabicAudioRef.current.currentTime = 0;
        setIsContextPlaying(false);
      } else {
        pauseAllOtherAudios(arabicAudioRef.current);
        setIsPronunciationPlaying(false);
        if (chineseAudioRef.current) {
          chineseAudioRef.current.pause();
          chineseAudioRef.current.currentTime = 0;
        }
        arabicAudioRef.current.play();
        setIsContextPlaying(true);
      }
    }
  };

  const handlePronunciationPlay = () => {
    console.log("handlePronunciationPlay called", chineseAudioRef.current);
    if (chineseAudioRef.current) {
      if (isPronunciationPlaying) {
        chineseAudioRef.current.pause();
        chineseAudioRef.current.currentTime = 0;
        setIsPronunciationPlaying(false);
      } else {
        console.log("fixing")
        pauseAllOtherAudios(chineseAudioRef.current);
        setIsContextPlaying(false);
        if (arabicAudioRef.current) {
          arabicAudioRef.current.pause();
          arabicAudioRef.current.currentTime = 0;
        }
        chineseAudioRef.current.play();
        console.log("Playing Chinese audio", chineseAudioRef.current);
        setIsPronunciationPlaying(true);
      }
    }
  };

  useEffect(() => {
    const arabicAudio = arabicAudioRef.current;
    const chineseAudio = chineseAudioRef.current;

    const handleArabicEnd = () => {
      setIsContextPlaying(false);
      onProgressUpdate?.(100);
      if (!localArabicCompleted) {
        setLocalArabicCompleted(true);
        onRecordingCompleted?.("arabic");
      }
    };

    const handleChineseEnd = () => {
      setIsPronunciationPlaying(false);
      onProgressUpdate?.(100);
      if (!localChineseCompleted) {
        setLocalChineseCompleted(true);
        onRecordingCompleted?.("chinese");
      }
    };

    const handleArabicTime = () => {
      if (arabicAudio && arabicAudio.duration) {
        const progress = Math.min(100, Math.round((arabicAudio.currentTime / arabicAudio.duration) * 100));
        onProgressUpdate?.(progress);
      }
    };

    const handleChineseTime = () => {
      if (chineseAudio && chineseAudio.duration) {
        const progress = Math.min(100, Math.round((chineseAudio.currentTime / chineseAudio.duration) * 100));
        onProgressUpdate?.(progress);
      }
    };

    if (arabicAudio) {
      arabicAudio.addEventListener("ended", handleArabicEnd);
      arabicAudio.addEventListener("timeupdate", handleArabicTime);
    }
    if (chineseAudio) {
      chineseAudio.addEventListener("ended", handleChineseEnd);
      chineseAudio.addEventListener("timeupdate", handleChineseTime);
    }

    return () => {
      if (arabicAudio) {
        arabicAudio.removeEventListener("ended", handleArabicEnd);
        arabicAudio.removeEventListener("timeupdate", handleArabicTime);
      }
      if (chineseAudio) {
        chineseAudio.removeEventListener("ended", handleChineseEnd);
        chineseAudio.removeEventListener("timeupdate", handleChineseTime);
      }
    };
  }, [
    arabicAudioUrl,
    chineseAudioUrl,
    localArabicCompleted,
    localChineseCompleted,
    onRecordingCompleted,
    onProgressUpdate,
  ]);

  // When pausing other audios, reset progress to 0 so the top bar doesn't remain at a stale value
  const pauseAllOtherAudios = (exclude?: HTMLAudioElement | null) => {
    if (typeof document === "undefined") return;
    document.querySelectorAll("audio").forEach((audio) => {
      if (audio !== exclude) {
        try {
          (audio as HTMLAudioElement).pause();
          (audio as HTMLAudioElement).currentTime = 0;
        } catch (e) {
        }
      }
    });

    onProgressUpdate?.(0);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {arabicAudioUrl && (
        <audio ref={arabicAudioRef} src={arabicAudioUrl} preload="metadata" />
      )}
      {chineseAudioUrl && (
        <audio ref={chineseAudioRef} src={chineseAudioUrl} preload="metadata" />
      )}

      <button
        onClick={handleContextPlay}
        className={`bg-[#FFCB08] hover:bg-[#FFCB08] border-b-[4px] border-b-[#E5B607] active:border-b-0 active:translate-y-[2px] transition-all duration-150 rounded-full pl-2 pr-8 py-2 flex items-center justify-between gap-4 shadow-sm w-48 h-14 ${!arabicCompleted ? "animate-pulse" : ""
          }`}
        disabled={!arabicAudioUrl}
      >
        <span className="text-[#1F1F1F] font-bold text-lg">جملة السياق</span>
        <div className="bg-white rounded-full p-1.5 w-9 h-9 flex items-center justify-center border-2 border-white">
          {isContextPlaying ? (
            <Pause className="h-4 w-4 text-[#F97316] fill-current" />
          ) : (
            <Play className="h-4 w-4 text-[#F97316] fill-current ml-0.5" />
          )}
        </div>
      </button>

      <div className="py-2 flex justify-center gap-8 items-center relative flex-col">
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">


          {/* Right Card: Target Phrase Info */}
          {showDiv && (
            <>
              <Card
                className="hidden md:flex flex-shrink-0 flex-col items-center justify-center p-6 bg-[#DCFCE7]"
                style={{
                  height: imageHeight,
                  width: imageWidth,
                  minHeight: imageHeight,
                  borderRadius: '32px',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                <div className="flex flex-col items-center gap-4" dir="ltr">
                  <h2 className="text-4xl font-bold text-[#22C55E] tracking-wide mb-1">{targetPhraseChinese}</h2>
                  <div className="flex items-center gap-3 dir-rtl">
                    <Volume2 className="w-6 h-6 text-gray-500" />
                    <span className="text-2xl text-gray-700 font-medium font-sans">{targetPhrasePinyin}</span>
                    <Button
                      onClick={handlePronunciationPlay}
                      size="icon"
                      className="rounded-full bg-[#22C55E] hover:bg-green-600 w-12 h-12 ml-2 shadow-lg hover:scale-110 transition-transform"
                    >
                      {isPronunciationPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
          <Card
            className="flex-shrink-0"
            style={{
              height: imageHeight,
              width: imageWidth,
              minHeight: imageHeight,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              borderRadius: '16px',
              border: 'none',
              padding: '0',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              overflow: 'hidden'
            }}
          >
            <Image
              src={scenarioImageUrl}
              alt="Scenario Context"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-2xl"
            />
          </Card>
        </div>


        <div className={`flex ${!showDiv ? "" : "md:hidden"}  flex-col items-center gap-2 mt-8`}>
          {/* <h1 className="text-4xl font-bold text-[#22C55E]">
            {targetPhrasePinyin}
          </h1> */}

          <div className="flex items-center gap-2 dir-rtl">
            <Button
              onClick={handlePronunciationPlay}
              size="icon"
              className="rounded-full bg-[#22C55E] hover:bg-green-600 w-10 h-10 ml-2"
            >
              {isPronunciationPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5"
                  onClick={() => {
                    handlePronunciationPlay();
                  }}
                />
              )}
            </Button>
            <span className="text-2xl text-gray-700 font-medium">{targetPhraseChinese}</span>

            <Volume2 className="w-5 h-5 text-gray-400" />

          </div>
        </div>

      </div>


    </div>
  );
}