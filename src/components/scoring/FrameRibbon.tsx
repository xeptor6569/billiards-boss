"use client";

import { Frame } from "@/lib/game-logic";
import { useRef, useEffect } from "react";

interface FrameRibbonProps {
  frames: Frame[];
  currentFrameIndex: number;
  calculateCumulativeScore: (index: number) => number;
  onFrameClick?: (frameIndex: number) => void;
  isEditable?: boolean;
}

export default function FrameRibbon({
  frames,
  currentFrameIndex,
  calculateCumulativeScore,
  onFrameClick,
  isEditable = false,
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

  const handleFrameClick = (frameIndex: number) => {
    if (isEditable && onFrameClick) {
      const frame = frames[frameIndex];
      // Only allow clicking frames that have at least one shot
      if (frame && frame.ballsPocketed.length > 0) {
        onFrameClick(frameIndex);
      }
    }
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
          const hasShots = frame.ballsPocketed.length > 0;
          const canEdit = isEditable && hasShots && onFrameClick;

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
                onClick={() => handleFrameClick(index)}
                className={`
                  rounded-lg border-2 p-2 min-w-[80px] text-center transition-all
                  ${isCurrent ? "border-[var(--game-accent)] bg-[var(--game-surface)]" : "border-[var(--game-border)] bg-[var(--game-bg)]"}
                  ${canEdit ? "cursor-pointer hover:border-[var(--game-accent)] hover:shadow-md active:scale-95" : ""}
                `}
                role={canEdit ? "button" : undefined}
                tabIndex={canEdit ? 0 : undefined}
                onKeyDown={(e) => {
                  if (canEdit && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleFrameClick(index);
                  }
                }}
              >
                {/* Frame number */}
                <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--game-text-secondary)] mb-1">
                  Frame {frame.frameNumber}
                  {canEdit && (
                    <span className="ml-0.5 text-[8px] opacity-60" title="Click to edit">
                      ✎
                    </span>
                  )}
                </div>

                {/* Frame score (top, smaller) */}
                <div className="text-sm font-semibold text-[var(--game-text-primary)] leading-none mb-1.5">
                  {display || "—"}
                </div>

                {/* Shot breakdown (prominent) */}
                {hasShots ? (
                  <div className="flex gap-1 justify-center mb-1">
                    {frame.ballsPocketed.map((balls, idx) => {
                      const isStrike = balls === 10;
                      const isSpare =
                        idx === 1 &&
                        frame.ballsPocketed.length >= 2 &&
                        !frame.isStrike &&
                        frame.ballsPocketed[0] + balls === 10;

                      return (
                        <div
                          key={idx}
                          className={`
                            rounded px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center
                            ${
                              isStrike
                                ? "bg-[var(--game-strike)] text-white"
                                : isSpare
                                ? "bg-[var(--game-spare)] text-white"
                                : "bg-[var(--game-text-secondary)]/20 text-[var(--game-text-primary)]"
                            }
                          `}
                        >
                          {isStrike ? "X" : isSpare ? "/" : balls === 0 ? "—" : balls}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex gap-1 justify-center mb-1">
                    <div className="rounded px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center bg-[var(--game-text-secondary)]/10 text-[var(--game-text-secondary)]">
                      —
                    </div>
                    <div className="rounded px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center bg-[var(--game-text-secondary)]/10 text-[var(--game-text-secondary)]">
                      —
                    </div>
                  </div>
                )}

                {/* Cumulative score */}
                {cumulativeScore > 0 && (
                  <div className="text-[10px] font-bold text-[var(--game-accent)] mt-0.5">
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

