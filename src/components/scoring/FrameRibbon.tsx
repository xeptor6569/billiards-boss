"use client";

import { Frame } from "@/lib/game-logic";
import { useRef, useEffect } from "react";

interface FrameRibbonProps {
  frames: Frame[];
  currentFrameIndex: number;
  calculateCumulativeScore: (index: number) => number;
}

export default function FrameRibbon({
  frames,
  currentFrameIndex,
  calculateCumulativeScore,
}: FrameRibbonProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll current frame into view
    if (currentFrameRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const frame = currentFrameRef.current;
      const containerWidth = container.offsetWidth;
      const frameLeft = frame.offsetLeft;
      const frameWidth = frame.offsetWidth;

      container.scrollTo({
        left: frameLeft - containerWidth / 2 + frameWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentFrameIndex]);

  const getFrameDisplay = (frame: Frame, index: number) => {
    if (frame.isStrike) return "X";
    if (frame.isSpare) return "/";
    if (frame.ballsPocketed.length === 0) return "";
    return frame.score;


  };

  return (
    <div className="h-full flex items-center w-full">
      <div
        ref={scrollRef}
        className="flex gap-2 px-[50vw] overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory items-center w-full"
      >
        {/* Spacer to center first item */}
        <div className="shrink-0 w-2" />

        {frames.map((frame, index) => {
          const isCurrent = index === currentFrameIndex;
          const cumulativeScore = calculateCumulativeScore(index);
          const display = getFrameDisplay(frame, index);

          return (
            <div
              key={frame.frameNumber}
              ref={isCurrent ? currentFrameRef : null}
              className={`
                flex-shrink-0 snap-center transition-all duration-300
                ${isCurrent ? "scale-100 opacity-100" : "scale-90 opacity-50 blur-[1px]"}
              `}
            >
              <div
                className={`
                  rounded-lg border-2 p-2 min-w-[70px] text-center
                  ${isCurrent ? "border-[var(--game-accent)] bg-[var(--game-surface)]" : "border-[var(--game-border)] bg-[var(--game-bg)]"}
                `}
              >
                {/* Frame number */}
                <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--game-text-secondary)] mb-1">
                  Frame {frame.frameNumber}
                </div>

                {/* Main score display */}
                <div className="text-2xl font-black text-[var(--game-text-primary)] leading-none mb-1">
                  {display || "—"}
                </div>

                {/* Shot breakdown */}
                {frame.ballsPocketed.length > 0 && (
                  <div className="flex gap-1 justify-center mt-1">
                    {frame.ballsPocketed.map((balls, idx) => {
                      const isStrike = balls === 10;
                      const isSpare = idx === 1 && frame.ballsPocketed.length >= 2 && !frame.isStrike && frame.ballsPocketed[0] + balls === 10;

                      return (
                        <div
                          key={idx}
                          className={`
                            rounded h-1.5 w-1.5
                            ${isStrike ? "bg-[var(--game-strike)]" : isSpare ? "bg-[var(--game-spare)]" : "bg-[var(--game-text-secondary)]"}
                          `}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Cumulative score */}
                {cumulativeScore > 0 && (
                  <div className="text-xs font-bold text-[var(--game-accent)] mt-1">
                    {cumulativeScore}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* Spacer to center last item */}
        <div className="shrink-0 w-2" />
      </div>
    </div>
  );
}

