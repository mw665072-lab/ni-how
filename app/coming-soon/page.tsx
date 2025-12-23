"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Image from "next/image";

export default function ComingSoonPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      id: 1,
      image: "/images/slides/1.png",
    },
    {
      id: 2,
      image: "/images/slides/2.png",
    },
    {
      id: 3,
      image: "/images/slides/3.png",
    },
    {
      id: 4,
      image: "/images/slides/4.png",
    },
    {
      id: 5,
      image: "/images/slides/5.png",
    },
    {
      id: 6,
      image: "/images/slides/6.png",
    },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setIsTransitioning(true);
      setCurrentSlide(currentSlide + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
    if (isRightSwipe && currentSlide > 0) {
      setIsTransitioning(true);
      setCurrentSlide(currentSlide - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(currentSlide + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(currentSlide - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header />

      {/* Slides Container - Full Width */}
      <div className="flex-1 overflow-hidden relative">
        {/* Slides Wrapper with Carousel Animation */}
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="w-full h-full flex-shrink-0 relative"
            >
              {/* Image Only */}
              <Image
                src={slide.image}
                alt={`Slide ${slide.id}`}
                fill
                className="object-contain"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {currentSlide > 0 && (
          <button
            onClick={prevSlide}
            className="sm:flex hidden absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-brand" />
          </button>
        )}

        {currentSlide < slides.length - 1 && (
          <button
            onClick={nextSlide}
            className="sm:flex hidden absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
          >
            <ChevronRight className="w-5 h-5 text-brand" />
          </button>
        )}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-2 p-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? "bg-brand scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="text-center text-gray-600 text-sm pb-4">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
