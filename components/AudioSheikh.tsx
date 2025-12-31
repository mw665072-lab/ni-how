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
  showDiv=true
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
    if (chineseAudioRef.current) {
      if (isPronunciationPlaying) {
        chineseAudioRef.current.pause();
        chineseAudioRef.current.currentTime = 0;
        setIsPronunciationPlaying(false);
      } else {
        pauseAllOtherAudios(chineseAudioRef.current);
        setIsContextPlaying(false);
        if (arabicAudioRef.current) {
          arabicAudioRef.current.pause();
          arabicAudioRef.current.currentTime = 0;
        }
        chineseAudioRef.current.play();
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
      {showChineseRecording && chineseAudioUrl && (
        <audio ref={chineseAudioRef} src={chineseAudioUrl} preload="metadata" />
      )}

      <button
        onClick={handleContextPlay}
        className={`bg-[#FFCB08] hover:bg-[#E5B607] transition-all duration-300 rounded-full px-6 py-2 flex items-center gap-2 shadow-sm ${!arabicCompleted ? "animate-pulse" : ""}`}
        disabled={!arabicAudioUrl}
      >
        <div className="bg-white rounded-full p-1">
          {isContextPlaying ? (
            <Pause className="h-3 w-3 text-[#FFCB08]" />
          ) : (
            <Play className="h-3 w-3 text-[#FFCB08] ml-0.5" />
          )}
        </div>
        <span className="text-gray-900 font-medium text-sm">جملة السياق</span>
      </button>

      <div className="py-2 flex justify-center gap-8 items-center relative flex-col">
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">
         

          {/* Right Card: Target Phrase Info */}
          {showDiv && (
            <>
             <Card
            className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-[#DCFCE7]"
            style={{
              height: 230,
              width: 319,
              minHeight: 230,
              borderRadius: '16px',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <div className="flex flex-col items-center gap-4" dir="ltr">
              <h2 className="text-3xl font-bold text-[#22C55E]">{targetPhrasePinyin}</h2>
              <div className="flex items-center gap-2 dir-rtl">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <span className="text-xl text-gray-700 font-medium">{targetPhraseChinese}</span>
                <Button
                  onClick={handlePronunciationPlay}
                  size="icon"
                  className="rounded-full bg-[#22C55E] hover:bg-green-600 w-10 h-10 ml-2"
                >
                  {isPronunciationPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
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
              height: 230,
              width: 319,
              minHeight: 230,
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

        <div className="flex flex-col items-center gap-2 mt-8">
          <h1 className="text-4xl font-bold text-[#22C55E]">
            {targetPhrasePinyin}
          </h1>

          <div className="flex items-center gap-2 dir-rtl">
            <Button
              onClick={handlePronunciationPlay}
              size="icon"
              className="rounded-full bg-[#22C55E] hover:bg-green-600 w-10 h-10 ml-2"
            >
              {isPronunciationPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </Button>
            <span className="text-2xl text-gray-700 font-medium">{targetPhraseChinese}</span>
            
                        <Volume2 className="w-5 h-5 text-gray-400" />

          </div>
        </div>

      </div>

      {showChineseRecording && (
        <div
          className={`transition-all duration-1000 ${arabicCompleted && !chineseCompleted
            ? "animate-pulse"
            : ""
            }`}
          style={{
            width: "310px",
            maxWidth: "310px",
            height: "33.45365905761719px",
            opacity: 1,
            transform: "rotate(0deg)",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="flex items-center gap-8">

            <button
              onClick={handlePronunciationPlay}
              className=""
              disabled={!chineseAudioUrl}
            >
              {isPronunciationPlaying ? (
                <Image className="h-[38px] w-[38px]" src="/images/audio.svg" alt="Pause Icon" width={12} height={12} />
              ) : (
                <Image className="h-[38px] w-[38px]" src="/images/audio.svg" alt="Pause Icon" width={12} height={12} />
              )}
            </button>
            <div className="flex space-x-1">
              {
                !isPronunciationPlaying ? (<>
                  <Image className="h-[38px] w-[168px]" src="/images/audioWave.png" alt="Playing Icon" width={160} height={12} />
                </>) : (
                  <>
                    <div className="h-[38px] w-[268px]">
                      <svg width="168" height="38" viewBox="0 0 310 34" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Audio waveform animation" className="w-full h-full">
                        <g className="waveGroup">
                          <path d="M35.2373 0.00566484C34.8255 0.0802855 34.4582 0.275626 34.2004 0.557116C33.9426 0.838606 33.811 1.1881 33.8288 1.54373V31.7019C33.7869 31.9177 33.8011 32.1386 33.8704 32.3493C33.9396 32.5599 34.0622 32.7554 34.2297 32.922C34.3972 33.0886 34.6056 33.2225 34.8404 33.3143C35.0751 33.4061 35.3308 33.4537 35.5895 33.4537C35.8482 33.4537 36.1038 33.4061 36.3386 33.3143C36.5734 33.2225 36.7817 33.0886 36.9492 32.922C37.1167 32.7554 37.2393 32.5599 37.3086 32.3493C37.3778 32.1386 37.392 31.9177 37.3502 31.7019V1.54373C37.3561 1.33175 37.3091 1.12108 37.2122 0.925488C37.1153 0.729897 36.9707 0.553779 36.7878 0.408631C36.6049 0.263484 36.3878 0.152572 36.1507 0.0831363C35.9137 0.0137004 35.6619 -0.012698 35.412 0.00566484C35.3538 0.00337555 35.2955 0.00337555 35.2373 0.00566484ZM12.7005 1.59294C12.2887 1.66756 11.9214 1.8629 11.6636 2.14439C11.4058 2.42588 11.2741 2.77537 11.2919 3.13101V30.1147C11.2501 30.3304 11.2643 30.5513 11.3335 30.762C11.4027 30.9727 11.5253 31.1681 11.6928 31.3347C11.8603 31.5014 12.0687 31.6352 12.3035 31.727C12.5383 31.8188 12.7939 31.8664 13.0526 31.8664C13.3113 31.8664 13.5669 31.8188 13.8017 31.727C14.0365 31.6352 14.2449 31.5014 14.4124 31.3347C14.5799 31.1681 14.7025 30.9727 14.7717 30.762C14.8409 30.5513 14.8551 30.3304 14.8133 30.1147V3.13101C14.8193 2.91902 14.7722 2.70835 14.6753 2.51276C14.5784 2.31717 14.4338 2.14105 14.2509 1.99591C14.068 1.85076 13.8509 1.73985 13.6139 1.67041C13.3768 1.60097 13.1251 1.57458 12.8751 1.59294C12.8169 1.59065 12.7587 1.59065 12.7005 1.59294ZM29.6031 6.35476C29.1913 6.42938 28.824 6.62472 28.5662 6.90621C28.3084 7.1877 28.1768 7.53719 28.1946 7.89283V25.3528C28.1518 25.5689 28.1653 25.7902 28.2341 26.0014C28.3028 26.2127 28.4252 26.4087 28.5927 26.5758C28.7602 26.743 28.9687 26.8774 29.2039 26.9695C29.439 27.0616 29.6951 27.1094 29.9543 27.1094C30.2135 27.1094 30.4696 27.0616 30.7047 26.9695C30.9399 26.8774 31.1485 26.743 31.3159 26.5758C31.4834 26.4087 31.6058 26.2127 31.6746 26.0014C31.7433 25.7902 31.7568 25.5689 31.7141 25.3528V7.89283C31.72 7.68113 31.6731 7.47076 31.5764 7.2754C31.4797 7.08005 31.3354 6.9041 31.1529 6.759C30.9704 6.6139 30.7538 6.50292 30.5172 6.43327C30.2806 6.36362 30.0293 6.33687 29.7797 6.35476C29.7202 6.35237 29.6626 6.35237 29.6031 6.35476ZM7.06625 7.94203C6.65444 8.01666 6.28714 8.212 6.02935 8.49349C5.77156 8.77497 5.63991 9.12446 5.65769 9.4801V23.7656C5.61496 23.9816 5.62844 24.203 5.6972 24.4142C5.76595 24.6254 5.88833 24.8214 6.05582 24.9886C6.2233 25.1558 6.43188 25.2901 6.66703 25.3822C6.90218 25.4744 7.15826 25.5221 7.41745 25.5221C7.67664 25.5221 7.93272 25.4744 8.16786 25.3822C8.40302 25.2901 8.61159 25.1558 8.77908 24.9886C8.94656 24.8214 9.06894 24.6254 9.1377 24.4142C9.20645 24.203 9.21993 23.9816 9.1772 23.7656V9.4801C9.18311 9.26841 9.13619 9.05803 9.03951 8.86268C8.94283 8.66732 8.79854 8.49137 8.61606 8.34627C8.43357 8.20118 8.21697 8.09019 7.98036 8.02054C7.74375 7.95089 7.49244 7.92414 7.24279 7.94203C7.18335 7.93965 7.12569 7.93965 7.06625 7.94203ZM18.3347 9.52931C17.9229 9.60393 17.5556 9.79927 17.2978 10.0808C17.04 10.3622 16.9083 10.7117 16.9261 11.0674V22.1783C16.8834 22.3944 16.8969 22.6157 16.9656 22.8269C17.0344 23.0381 17.1568 23.2341 17.3242 23.4013C17.4917 23.5685 17.7003 23.7028 17.9355 23.7949C18.1706 23.8871 18.4267 23.9348 18.6859 23.9348C18.9451 23.9348 19.2011 23.8871 19.4363 23.7949C19.6714 23.7028 19.88 23.5685 20.0475 23.4013C20.215 23.2341 20.3374 23.0381 20.4061 22.8269C20.4749 22.6157 20.4884 22.3944 20.4456 22.1783V11.0674C20.4515 10.8557 20.4046 10.6453 20.3079 10.45C20.2113 10.2546 20.067 10.0786 19.8845 9.93355C19.702 9.78845 19.4854 9.67746 19.2488 9.60782C19.0122 9.53817 18.7609 9.51142 18.5112 9.52931C18.4518 9.52692 18.3941 9.52692 18.3347 9.52931ZM40.8715 9.52931C40.4597 9.60393 40.0924 9.79927 39.8346 10.0808C39.5769 10.3622 39.4452 10.7117 39.463 11.0674V22.1783C39.4212 22.3941 39.4354 22.6149 39.5046 22.8256C39.5738 23.0363 39.6964 23.2317 39.8639 23.3984C40.0314 23.565 40.2398 23.6989 40.4746 23.7907C40.7094 23.8825 40.965 23.93 41.2237 23.93C41.4824 23.93 41.738 23.8825 41.9728 23.7907C42.2076 23.6989 42.416 23.565 42.5835 23.3984C42.7509 23.2317 42.8736 23.0363 42.9428 22.8256C43.012 22.6149 43.0262 22.3941 42.9844 22.1783V11.0674C42.9903 10.8554 42.9433 10.6447 42.8464 10.4491C42.7495 10.2535 42.6049 10.0774 42.422 9.93227C42.2391 9.78713 42.022 9.67622 41.7849 9.60678C41.5479 9.53734 41.2962 9.51095 41.0462 9.52931C40.988 9.52702 40.9297 9.52702 40.8715 9.52931ZM1.43203 12.7039C1.02022 12.7785 0.65292 12.9738 0.395133 13.2553C0.137346 13.5368 0.00569414 13.8863 0.023476 14.2419V19.0037C-0.0183533 19.2195 -0.00416154 19.4404 0.0650675 19.6511C0.134297 19.8617 0.256907 20.0572 0.424399 20.2238C0.591891 20.3905 0.800257 20.5243 1.03505 20.6161C1.26985 20.7079 1.52546 20.7555 1.78417 20.7555C2.04287 20.7555 2.29849 20.7079 2.53328 20.6161C2.76808 20.5243 2.97645 20.3905 3.14394 20.2238C3.31143 20.0572 3.43404 19.8617 3.50327 19.6511C3.5725 19.4404 3.58669 19.2195 3.54486 19.0037V14.2419C3.55082 14.0299 3.50381 13.8193 3.40691 13.6237C3.31 13.4281 3.16537 13.252 2.98247 13.1068C2.79956 12.9617 2.58249 12.8508 2.34543 12.7813C2.10837 12.7119 1.85664 12.6855 1.60669 12.7039C1.54788 12.7015 1.48897 12.7015 1.43015 12.7039H1.43203ZM23.9689 12.7039C23.5571 12.7785 23.1898 12.9738 22.932 13.2553C22.6742 13.5368 22.5426 13.8863 22.5603 14.2419V19.0037C22.5176 19.2198 22.5311 19.4411 22.5998 19.6524C22.6686 19.8636 22.791 20.0596 22.9585 20.2268C23.126 20.3939 23.3345 20.5283 23.5697 20.6204C23.8048 20.7125 24.0609 20.7603 24.3201 20.7603C24.5793 20.7603 24.8354 20.7125 25.0705 20.6204C25.3057 20.5283 25.5142 20.3939 25.6817 20.2268C25.8492 20.0596 25.9716 19.8636 26.0403 19.6524C26.1091 19.4411 26.1226 19.2198 26.0799 19.0037V14.2419C26.0858 14.0302 26.0388 13.8199 25.9422 13.6245C25.8455 13.4291 25.7012 13.2532 25.5187 13.1081C25.3362 12.963 25.1196 12.852 24.883 12.7824C24.6464 12.7127 24.3951 12.686 24.1454 12.7039C24.086 12.7015 24.0283 12.7015 23.9689 12.7039ZM46.5058 12.7039C46.094 12.7785 45.7267 12.9738 45.4689 13.2553C45.2111 13.5368 45.0794 13.8863 45.0972 14.2419V19.0037C45.0554 19.2195 45.0696 19.4404 45.1388 19.6511C45.208 19.8617 45.3306 20.0572 45.4981 20.2238C45.6656 20.3905 45.874 20.5243 46.1088 20.6161C46.3436 20.7079 46.5992 20.7555 46.8579 20.7555C47.1166 20.7555 47.3722 20.7079 47.607 20.6161C47.8418 20.5243 48.0502 20.3905 48.2177 20.2238C48.3852 20.0572 48.5078 19.8617 48.577 19.6511C48.6462 19.4404 48.6604 19.2195 48.6186 19.0037V14.2419C48.6246 14.0299 48.5775 13.8193 48.4806 13.6237C48.3837 13.4281 48.2391 13.252 48.0562 13.1068C47.8733 12.9617 47.6562 12.8508 47.4192 12.7813C47.1821 12.7119 46.9304 12.6855 46.6804 12.7039C46.6222 12.7016 46.5639 12.7016 46.5058 12.7039Z" fill="#F98D00" />
                          <path d="M80.1972 8.00288C79.7893 8.0408 79.4256 8.14006 79.1703 8.28311C78.915 8.42615 78.7846 8.60375 78.8022 8.78447V24.1098C78.7608 24.2195 78.7748 24.3317 78.8434 24.4388C78.9119 24.5458 79.0334 24.6451 79.1993 24.7298C79.3651 24.8145 79.5715 24.8825 79.804 24.9292C80.0366 24.9758 80.2897 25 80.546 25C80.8022 25 81.0553 24.9758 81.2879 24.9292C81.5204 24.8825 81.7268 24.8145 81.8927 24.7298C82.0585 24.6451 82.18 24.5458 82.2485 24.4388C82.3171 24.3317 82.3312 24.2195 82.2897 24.1098V8.78447C82.2956 8.67675 82.2491 8.56969 82.1531 8.4703C82.0571 8.37091 81.9139 8.28141 81.7327 8.20765C81.5516 8.13389 81.3366 8.07753 81.1018 8.04225C80.867 8.00696 80.6177 7.99355 80.3702 8.00288C80.3126 8.00172 80.2548 8.00172 80.1972 8.00288ZM57.8769 8.80948C57.4691 8.8474 57.1053 8.94666 56.85 9.08971C56.5947 9.23275 56.4643 9.41035 56.4819 9.59107V23.3032C56.4405 23.4129 56.4546 23.5251 56.5231 23.6322C56.5917 23.7392 56.7131 23.8386 56.879 23.9232C57.0449 24.0079 57.2512 24.0759 57.4838 24.1226C57.7163 24.1692 57.9695 24.1934 58.2257 24.1934C58.4819 24.1934 58.7351 24.1692 58.9676 24.1226C59.2002 24.0759 59.4065 24.0079 59.5724 23.9232C59.7383 23.8386 59.8597 23.7392 59.9283 23.6322C59.9968 23.5251 60.0109 23.4129 59.9695 23.3032V9.59107C59.9754 9.48335 59.9288 9.37629 59.8328 9.2769C59.7369 9.17751 59.5936 9.08801 59.4125 9.01425C59.2313 8.94049 59.0164 8.88413 58.7816 8.84885C58.5468 8.81356 58.2975 8.80015 58.0499 8.80948C57.9923 8.80831 57.9346 8.80831 57.8769 8.80948ZM74.6171 11.2293C74.2093 11.2672 73.8455 11.3665 73.5902 11.5095C73.3349 11.6525 73.2045 11.8301 73.2221 12.0109V20.8834C73.1798 20.9932 73.1932 21.1057 73.2612 21.213C73.3293 21.3204 73.4505 21.42 73.6164 21.5049C73.7823 21.5899 73.9889 21.6581 74.2218 21.705C74.4546 21.7518 74.7083 21.776 74.965 21.776C75.2217 21.776 75.4753 21.7518 75.7082 21.705C75.9411 21.6581 76.1476 21.5899 76.3135 21.5049C76.4794 21.42 76.6006 21.3204 76.6687 21.213C76.7368 21.1057 76.7501 20.9932 76.7078 20.8834V12.0109C76.7137 11.9033 76.6672 11.7964 76.5714 11.6971C76.4757 11.5978 76.3328 11.5084 76.1521 11.4347C75.9713 11.361 75.7568 11.3046 75.5225 11.2692C75.2881 11.2338 75.0392 11.2202 74.792 11.2293C74.7331 11.2281 74.676 11.2281 74.6171 11.2293ZM52.2969 12.0359C51.889 12.0738 51.5253 12.1731 51.27 12.3161C51.0146 12.4591 50.8843 12.6367 50.9019 12.8175V20.0768C50.8595 20.1866 50.8729 20.2991 50.941 20.4064C51.0091 20.5138 51.1303 20.6134 51.2962 20.6983C51.462 20.7833 51.6686 20.8516 51.9015 20.8984C52.1344 20.9452 52.388 20.9694 52.6447 20.9694C52.9014 20.9694 53.155 20.9452 53.3879 20.8984C53.6208 20.8516 53.8274 20.7833 53.9932 20.6983C54.1591 20.6134 54.2803 20.5138 54.3484 20.4064C54.4165 20.2991 54.4299 20.1866 54.3875 20.0768V12.8175C54.3934 12.7099 54.3469 12.603 54.2512 12.5037C54.1554 12.4044 54.0125 12.315 53.8318 12.2413C53.6511 12.1676 53.4365 12.1112 53.2022 12.0758C52.9679 12.0404 52.719 12.0268 52.4717 12.0359C52.4129 12.0347 52.3557 12.0347 52.2969 12.0359ZM63.457 12.8425C63.0492 12.8804 62.6854 12.9797 62.4301 13.1227C62.1748 13.2657 62.0444 13.4433 62.062 13.6241V19.2702C62.0197 19.38 62.033 19.4925 62.1011 19.5998C62.1692 19.7072 62.2904 19.8068 62.4563 19.8917C62.6222 19.9767 62.8287 20.045 63.0616 20.0918C63.2945 20.1386 63.5481 20.1628 63.8048 20.1628C64.0615 20.1628 64.3152 20.1386 64.548 20.0918C64.7809 20.045 64.9875 19.9767 65.1534 19.8917C65.3193 19.8068 65.4405 19.7072 65.5086 19.5998C65.5766 19.4925 65.59 19.38 65.5477 19.2702V13.6241C65.5535 13.5165 65.5071 13.4096 65.4113 13.3103C65.3156 13.211 65.1727 13.1216 64.9919 13.0479C64.8112 12.9742 64.5967 12.9178 64.3623 12.8824C64.128 12.847 63.8791 12.8334 63.6319 12.8425C63.573 12.8413 63.5159 12.8413 63.457 12.8425ZM85.7773 12.8425C85.3694 12.8804 85.0056 12.9797 84.7503 13.1227C84.495 13.2657 84.3646 13.4433 84.3822 13.6241V19.2702C84.3408 19.3799 84.3549 19.4921 84.4234 19.5992C84.492 19.7063 84.6134 19.8056 84.7793 19.8902C84.9452 19.9749 85.1516 20.0429 85.3841 20.0896C85.6166 20.1362 85.8698 20.1604 86.126 20.1604C86.3822 20.1604 86.6354 20.1362 86.8679 20.0896C87.1005 20.0429 87.3068 19.9749 87.4727 19.8902C87.6386 19.8056 87.76 19.7063 87.8286 19.5992C87.8972 19.4921 87.9112 19.3799 87.8698 19.2702V13.6241C87.8757 13.5163 87.8291 13.4093 87.7332 13.3099C87.6372 13.2105 87.4939 13.121 87.3128 13.0472C87.1317 12.9735 86.9167 12.9171 86.6819 12.8818C86.4471 12.8465 86.1978 12.8331 85.9502 12.8425C85.8926 12.8413 85.8349 12.8413 85.7773 12.8425ZM69.0371 14.4557C68.6292 14.4936 68.2655 14.5928 68.0101 14.7359C67.7548 14.8789 67.6244 15.0565 67.6421 15.2373V17.6571C67.5997 17.7668 67.6131 17.8793 67.6812 17.9867C67.7493 18.094 67.8705 18.1936 68.0364 18.2785C68.2022 18.3635 68.4088 18.4318 68.6417 18.4786C68.8746 18.5254 69.1282 18.5497 69.3849 18.5497C69.6416 18.5497 69.8952 18.5254 70.1281 18.4786C70.361 18.4318 70.5676 18.3635 70.7334 18.2785C70.8993 18.1936 71.0205 18.094 71.0886 17.9867C71.1567 17.8793 71.1701 17.7668 71.1277 17.6571V15.2373C71.1336 15.1297 71.0871 15.0228 70.9914 14.9235C70.8956 14.8242 70.7527 14.7348 70.572 14.6611C70.3913 14.5874 70.1767 14.531 69.9424 14.4956C69.7081 14.4602 69.4592 14.4466 69.2119 14.4557C69.153 14.4544 69.0959 14.4544 69.0371 14.4557ZM91.3573 14.4557C90.9495 14.4936 90.5857 14.5928 90.3304 14.7359C90.0751 14.8789 89.9447 15.0565 89.9623 15.2373V17.6571C89.9209 17.7667 89.9349 17.8789 90.0035 17.986C90.0721 18.0931 90.1935 18.1924 90.3594 18.277C90.5253 18.3617 90.7316 18.4297 90.9642 18.4764C91.1967 18.5231 91.4499 18.5472 91.7061 18.5472C91.9623 18.5472 92.2155 18.5231 92.448 18.4764C92.6805 18.4297 92.8869 18.3617 93.0528 18.277C93.2187 18.1924 93.3401 18.0931 93.4087 17.986C93.4772 17.8789 93.4913 17.7667 93.4499 17.6571V15.2373C93.4558 15.1295 93.4092 15.0225 93.3132 14.9231C93.2173 14.8237 93.074 14.7342 92.8929 14.6604C92.7117 14.5867 92.4967 14.5303 92.262 14.495C92.0272 14.4597 91.7779 14.4463 91.5303 14.4557C91.4727 14.4545 91.415 14.4545 91.3573 14.4557Z" fill="#F98D00" />
                        </g>
                      </svg>
                      <style jsx>{`
                        .waveGroup { transform-origin: center; animation: waveShift 1100ms ease-in-out infinite; }
                        @keyframes waveShift {
                          0% { transform: translateX(0) translateY(0); }
                          50% { transform: translateX(-6px) translateY(-1px); }
                          100% { transform: translateX(0) translateY(0); }
                        }
                      `}</style>
                    </div>
                  </>
                )
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
