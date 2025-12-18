"use client";

import { useEffect, useRef, useState } from "react";

export type GuideStep = 
  | "welcome"
  | "frame-ribbon"
  | "rack-visualizer"
  | "input-keypad"
  | "first-shot"
  | "complete";

interface FirstTimeGuideProps {
  currentStep: GuideStep;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  targetElement?: string; // CSS selector or data attribute for highlighting
}

export default function FirstTimeGuide({
  currentStep,
  onNext,
  onSkip,
  onComplete,
  targetElement,
}: FirstTimeGuideProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetElement && typeof window !== "undefined") {
      const element = document.querySelector(targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }, [targetElement, currentStep]);

  const steps: Record<GuideStep, { title: string; content: string; cta: string }> = {
    welcome: {
      title: "Welcome to Billiards Boss! 🎱",
      content: "Let's take a quick tour of the scoring interface. You'll learn how to score a full game in just a few steps.",
      cta: "Start tour",
    },
    "frame-ribbon": {
      title: "Frame Ribbon",
      content: "This shows all 10 frames of your game. The highlighted frame is your current one. You'll see your score update here as you play.",
      cta: "Next",
    },
    "rack-visualizer": {
      title: "Ball Rack",
      content: "This visual shows how many balls you've pocketed (green) and how many remain (gray). It updates in real-time as you score.",
      cta: "Next",
    },
    "input-keypad": {
      title: "Scoring Controls",
      content: "Tap numbers to enter balls pocketed, or use STRIKE (all 10 on first shot) and SPARE (all 10 in 2 shots). The MISS button is for zero balls.",
      cta: "Got it",
    },
    "first-shot": {
      title: "Ready to score!",
      content: "Try entering your first shot! Tap a number or use STRIKE if you pocketed all 10 balls. Don't worry, you can edit frames later if needed.",
      cta: "Start scoring",
    },
    complete: {
      title: "You're all set!",
      content: "You've got the basics. Complete all 10 frames to finish your game. Good luck!",
      cta: "Let's play!",
    },
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === "complete";

  return (
    <>
      {/* Spotlight overlay */}
      {targetElement && currentStep !== "welcome" && currentStep !== "complete" && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Dark overlay with cutout */}
          <div className="absolute inset-0 bg-black/60">
            <div
              className="absolute bg-transparent border-4 border-[var(--accent)] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-300"
              style={{
                top: `${position.top - 8}px`,
                left: `${position.left - 8}px`,
                width: `${position.width + 16}px`,
                height: `${position.height + 16}px`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[101] transition-all duration-300 ${
          currentStep === "welcome" || currentStep === "complete"
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : currentStep === "input-keypad"
            ? "bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2"
            : currentStep === "rack-visualizer"
            ? "top-1/3 left-1/2 -translate-x-1/2"
            : "top-20 sm:top-24 left-1/2 -translate-x-1/2"
        }`}
      >
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-[var(--accent)] shadow-2xl p-4 sm:p-6 max-w-sm mx-4 pointer-events-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              Step {Object.keys(steps).indexOf(currentStep) + 1} of {Object.keys(steps).length}
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
            >
              Skip tour
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            {step.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            {step.content}
          </p>

          <div className="flex gap-3">
            {!isLastStep ? (
              <button
                onClick={onNext}
                className="flex-1 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {step.cta}
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-1 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {step.cta}
              </button>
            )}
          </div>
        </div>

        {/* Arrow pointer for non-center steps */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${
              currentStep === "input-keypad"
                ? "top-full left-1/2 -translate-x-1/2 border-t-[var(--accent)]"
                : currentStep === "rack-visualizer"
                ? "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--accent)]"
                : "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--accent)]"
            }`}
          />
        )}
      </div>
    </>
  );
}

