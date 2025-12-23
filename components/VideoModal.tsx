"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = "دليل المستخدم",
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Start muted for autoplay to work (browser requirement)
      videoRef.current.muted = true;
      setIsMuted(true);

      // Autoplay when modal opens
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log("Autoplay failed:", error);
          // If autoplay fails, user can manually start
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setIsPlaying(false);
      setCurrentTime(0);
      setIsFullscreen(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen();
        } else if ((videoRef.current as any).webkitRequestFullscreen) {
          await (videoRef.current as any).webkitRequestFullscreen();
        } else if ((videoRef.current as any).msRequestFullscreen) {
          await (videoRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/90" />
      <DialogContent
        className="max-w-sm w-full h-full p-0 bg-black border-0 rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 1000);
        }}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Video Container */}
        <div className="flex items-center justify-center h-full p-4">
          <div
            className="relative w-full bg-black"
            style={{ aspectRatio: "9/16", maxHeight: "80vh" }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
              autoPlay
              playsInline
            />

            {/* Video Controls Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Center Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full w-20 h-20 transition-all duration-200 hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="h-10 w-10" />
                  ) : (
                    <Play className="h-10 w-10 ml-1" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0">
                {/* Progress Bar */}
                <div
                  className="w-full h-2 bg-white/30 rounded-full mb-3 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{
                      width:
                        duration > 0
                          ? `${(currentTime / duration) * 100}%`
                          : "0%",
                    }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-reverse">
                    {/* Skip Backward */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipBackward}
                      className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                      <SkipBack className="h-6 w-6" />
                    </Button>

                    {/* Play/Pause */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-0.5" />
                      )}
                    </Button>

                    {/* Skip Forward */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipForward}
                      className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                      <SkipForward className="h-6 w-6" />
                    </Button>

                    {/* Volume */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center"
                    >
                      {isMuted ? (
                        <VolumeX className="h-6 w-6" />
                      ) : (
                        <Volume2 className="h-6 w-6" />
                      )}
                    </Button>
                  </div>

                  {/* Time Display */}
                  <div className="text-white text-xs font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-6 w-6" />
                    ) : (
                      <Maximize className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
