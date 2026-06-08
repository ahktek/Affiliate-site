"use client";

import React from "react";

interface SliderControlsProps {
  currentIndex: number;
  slidesCount: number;
  isPaused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
  sliderHovered: boolean;
}

export default function SliderControls({
  currentIndex,
  slidesCount,
  isPaused,
  onPrev,
  onNext,
  onJump,
  sliderHovered,
}: SliderControlsProps) {
  // Slide 1 has off-white background on the left (index 0)
  const isEditorial = currentIndex === 0;

  return (
    <>
      {/* Inject Keyframe Styles */}
      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .progress-bar-fill {
          animation: progressFill 7000ms linear forwards;
        }
        .progress-bar-paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* LEFT ARROW (Desktop only, hidden on mobile) */}
      <button
        onClick={onPrev}
        className="hidden md:flex absolute left-[24px] top-1/2 -translate-y-1/2 z-30 w-11 h-11 items-center justify-center transition-opacity duration-200 focus:outline-none group"
        style={{
          opacity: sliderHovered ? 1.0 : 0.6,
        }}
        aria-label="Previous Slide"
      >
        <svg
          className="w-6 h-6 transform group-hover:translate-x-[-3px] transition-transform duration-180 ease-out"
          fill="none"
          viewBox="0 0 24 24"
          stroke={isEditorial ? "#1A1A18" : "#FFFFFF"}
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* RIGHT ARROW (Desktop only, hidden on mobile) */}
      <button
        onClick={onNext}
        className="hidden md:flex absolute right-[24px] top-1/2 -translate-y-1/2 z-30 w-11 h-11 items-center justify-center transition-opacity duration-200 focus:outline-none group"
        style={{
          opacity: sliderHovered ? 1.0 : 0.6,
        }}
        aria-label="Next Slide"
      >
        <svg
          className="w-6 h-6 transform group-hover:translate-x-[3px] transition-transform duration-180 ease-out"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#FFFFFF" // always on image or dark background
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* PROGRESS INDICATOR BARS */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-[6px]"
        role="tablist"
        aria-label="Slide Selection"
      >
        {Array.from({ length: slidesCount }).map((_, idx) => {
          const isActive = idx === currentIndex;
          
          // Color coding based on whether the progress bar sits on dark background or Slide 1 off-white background
          // On mobile, all progress bars sit on the bottom text area of Slide 1 which is off-white.
          const isBarEditorial = isEditorial;

          // Inactive color
          const inactiveBg = isBarEditorial 
            ? "rgba(26, 26, 24, 0.2)" 
            : "rgba(255, 255, 255, 0.35)";

          // Active background color (the filling color)
          const activeBg = isBarEditorial 
            ? "#1A1A18" 
            : "#FFFFFF";

          return (
            <button
              key={idx}
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => onJump(idx)}
              className="relative h-[3px] rounded-[1.5px] overflow-hidden focus:outline-none transition-all w-[50px] md:w-[80px]"
              style={{
                backgroundColor: inactiveBg,
              }}
            >
              {isActive && (
                <div
                  className={`h-full progress-bar-fill ${isPaused ? "progress-bar-paused" : ""}`}
                  style={{
                    backgroundColor: activeBg,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
