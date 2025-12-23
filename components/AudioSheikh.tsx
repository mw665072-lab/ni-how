"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Volume2, Pause } from "lucide-react";
import Image from "next/image";

interface LanguageLearningInterfaceProps {
  scenarioImageUrl?: string;
  arabicAudioUrl?: string;
  chineseAudioUrl?: string;
  targetPhraseChinese?: string;
  targetPhrasePinyin?: string;
  onRecordingCompleted?: (type: "arabic" | "chinese") => void;
  arabicCompleted?: boolean;
  chineseCompleted?: boolean;
  showChineseRecording?: boolean;
}

export default function LanguageLearningInterface({
  scenarioImageUrl = "/images/shiekh2.png",
  arabicAudioUrl,
  chineseAudioUrl,
  targetPhraseChinese = "谢谢",
  targetPhrasePinyin = "xiè xiè",
  onRecordingCompleted,
  arabicCompleted = false,
  chineseCompleted = false,
  showChineseRecording = true,
}: LanguageLearningInterfaceProps) {
  const [isContextPlaying, setIsContextPlaying] = useState(false);
  const [isPronunciationPlaying, setIsPronunciationPlaying] = useState(false);
  const [localArabicCompleted, setLocalArabicCompleted] = useState(false);
  const [localChineseCompleted, setLocalChineseCompleted] = useState(false);
  const arabicAudioRef = useRef<HTMLAudioElement>(null);
  const chineseAudioRef = useRef<HTMLAudioElement>(null);

  console.log("arabicAudioUrl", arabicAudioUrl);

  const handleContextPlay = () => {
    if (arabicAudioRef.current) {
      if (isContextPlaying) {
        arabicAudioRef.current.pause();
        arabicAudioRef.current.currentTime = 0;
      } else {
        arabicAudioRef.current.play();
      }
      setIsContextPlaying(!isContextPlaying);
    }
  };

  const handlePronunciationPlay = () => {
    if (chineseAudioRef.current) {
      if (isPronunciationPlaying) {
        chineseAudioRef.current.pause();
        chineseAudioRef.current.currentTime = 0;
      } else {
        chineseAudioRef.current.play();
      }
      setIsPronunciationPlaying(!isPronunciationPlaying);
    }
  };

  // Handle audio end events
  useEffect(() => {
    const arabicAudio = arabicAudioRef.current;
    const chineseAudio = chineseAudioRef.current;

    const handleArabicEnd = () => {
      setIsContextPlaying(false);
      if (!localArabicCompleted) {
        setLocalArabicCompleted(true);
        onRecordingCompleted?.("arabic");
      }
    };

    const handleChineseEnd = () => {
      setIsPronunciationPlaying(false);
      if (!localChineseCompleted) {
        setLocalChineseCompleted(true);
        onRecordingCompleted?.("chinese");
      }
    };

    if (arabicAudio) {
      arabicAudio.addEventListener("ended", handleArabicEnd);
    }
    if (chineseAudio) {
      chineseAudio.addEventListener("ended", handleChineseEnd);
    }

    return () => {
      if (arabicAudio) {
        arabicAudio.removeEventListener("ended", handleArabicEnd);
      }
      if (chineseAudio) {
        chineseAudio.removeEventListener("ended", handleChineseEnd);
      }
    };
  }, [
    arabicAudioUrl,
    chineseAudioUrl,
    localArabicCompleted,
    localChineseCompleted,
    onRecordingCompleted,
  ]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Hidden audio elements */}
      {arabicAudioUrl && (
        <audio ref={arabicAudioRef} src={arabicAudioUrl} preload="metadata" />
      )}
      {showChineseRecording && chineseAudioUrl && (
        <audio ref={chineseAudioRef} src={chineseAudioUrl} preload="metadata" />
      )}

      {/* Context Sentence Player */}
      <div
        className={`bg-amber-100 border border-amber-200 rounded-3xl px-6 py-2 w-full max-w-[60%] transition-all duration-1000 ${
          !arabicCompleted
            ? "shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
            : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-800 font-medium text-lg">جملة السياق</span>
          <button
            onClick={handleContextPlay}
            className={`rounded-full p-2 transition-all duration-300 ${
              !arabicCompleted
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
            disabled={!arabicAudioUrl}
          >
            {isContextPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Character and Speech Bubble */}
      <div className="flex justify-center relative">
        <div className="relative">
          {/* Character Image */}
          <Image
            src={scenarioImageUrl}
            alt="Language Learning Character"
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Pronunciation Player */}
      {showChineseRecording && (
        <div
          className={`bg-pink-100 border border-pink-200 rounded-3xl px-6 py-2 w-full max-w-md transition-all duration-1000 ${
            arabicCompleted && !chineseCompleted
              ? "shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-pulse"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-red-600 font-bold text-lg">
                {targetPhraseChinese}
              </span>
              {targetPhrasePinyin && (
                <span className="text-red-500 text-sm">
                  {targetPhrasePinyin}
                </span>
              )}
            </div>

            {/* Audio Waveform */}
            <div className="flex items-end space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm ${
                    isPronunciationPlaying ? "bg-red-600" : "bg-red-400"
                  }`}
                  style={{
                    width: "3px",
                    height: `${Math.random() * 20 + 8}px`,
                  }}
                />
              ))}
            </div>
            <button
              onClick={handlePronunciationPlay}
              className={`rounded-full p-2 transition-all duration-300 ${
                arabicCompleted && !chineseCompleted
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              disabled={!chineseAudioUrl}
            >
              {isPronunciationPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
