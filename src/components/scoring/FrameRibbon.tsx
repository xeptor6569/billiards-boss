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
      const frameRect = frame.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const frameLeft = frameRect.left - containerRect.left + container.scrollLeft;
      const frameWidth = frameRect.width;

      container.scrollTo({
        left: frameLeft - containerWidth / 2 + frameWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentFrameIndex]);

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
    <div className="h-full flex flex-col w-full">
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col w-full overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        {/* Frame numbers row above frames */}
        <div className="flex gap-2 px-[50vw] snap-x snap-mandatory items-center w-full pb-1">
          <div className="shrink-0 w-2" />
          {frames.map((frame, index) => {
            const isCurrent = index === currentFrameIndex;
            const canEdit = isEditable && frame.ballsPocketed.length > 0 && onFrameClick;
            return (
              <div
                key={frame.frameNumber}
                className={`
                  flex-shrink-0 snap-center transition-all duration-300
                  ${isCurrent ? "opacity-100" : "opacity-50"}
                `}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--game-text-secondary)] text-center min-w-[80px]">
                  {frame.frameNumber}
                  {canEdit && (
                    <span className="ml-0.5 text-[8px] opacity-60" title="Click to edit">
                      ✎
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div className="shrink-0 w-2" />
        </div>

        {/* Frames row */}
        <div className="flex-1 flex items-center w-full">
          <div className="flex gap-2 px-[50vw] snap-x snap-mandatory items-center w-full">
          {/* Spacer to center first item */}
          <div className="shrink-0 w-2" />

          {frames.map((frame, index) => {
            const isCurrent = index === currentFrameIndex;
            const cumulativeScore = calculateCumulativeScore(index);
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
                    rounded-lg border-2 p-2 w-[80px] h-[80px] flex flex-col transition-all aspect-square
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
                  {/* Shot boxes (top right) */}
                  <div className="flex gap-0.5 justify-end">
                    {hasShots ? (
                      <>
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
                                rounded px-1 py-0.5 text-[10px] font-bold min-w-[18px] text-center
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
                        {/* For 10th frame, show empty shot 3 box if needed */}
                        {frame.frameNumber === 10 && frame.ballsPocketed.length < 3 && (
                          <div className="rounded px-1 py-0.5 text-[10px] font-bold min-w-[18px] text-center bg-[var(--game-text-secondary)]/10 text-[var(--game-text-secondary)]">
                            —
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="rounded px-1 py-0.5 text-[10px] font-bold min-w-[18px] text-center bg-[var(--game-text-secondary)]/10 text-[var(--game-text-secondary)]">
                          —
                        </div>
                        <div className="rounded px-1 py-0.5 text-[10px] font-bold min-w-[18px] text-center bg-[var(--game-text-secondary)]/10 text-[var(--game-text-secondary)]">
                          —
                        </div>
                        {frame.frameNumber === 10 && (
                          <div className="rounded px-1 py-0.5 text-[10px] font-bold min-w-[18px] text-center bg-[var(--game-text-secondary)]/10 text-[var(--game-text-secondary)]">
                            —
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Cumulative score or strike/spare symbol (bottom center, large) */}
                  <div className="mt-auto flex items-center justify-center">
                    {cumulativeScore > 0 ? (
                      <div className="text-base sm:text-lg font-bold text-[var(--game-accent)] text-center">
                        {cumulativeScore}
                      </div>
                    ) : frame.isStrike ? (
                      <div className="text-2xl sm:text-3xl font-bold text-[var(--game-strike)] text-center">
                        X
                      </div>
                    ) : frame.isSpare ? (
                      <div className="text-2xl sm:text-3xl font-bold text-[var(--game-spare)] text-center">
                        /
                      </div>
                    ) : frame.score > 0 ? (
                      <div className="text-base sm:text-lg font-bold text-[var(--game-accent)] text-center">
                        {frame.score}
                      </div>
                    ) : (
                      <div className="text-base sm:text-lg font-bold text-[var(--game-text-secondary)]/30 text-center">
                        —
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            {/* Spacer to center last item */}
            <div className="shrink-0 w-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

