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
    <div className="h-full flex items-center py-6" style={{ backgroundColor: "#09090b" }}>
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory items-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
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
                ${isCurrent ? "scale-110" : "scale-90 opacity-60"}
              `}
            >
              <div
                className="rounded-lg border-2 p-2.5 min-w-[80px] text-center"
                style={{
                  borderColor: isCurrent ? "#22c55e" : "#27272a",
                  backgroundColor: isCurrent ? "rgba(34, 197, 94, 0.15)" : "#18181b",
                }}
              >
                {/* Frame number */}
                <div className="text-[10px] mb-1 font-semibold" style={{ color: "#f4f4f5", opacity: 0.8 }}>
                  F{frame.frameNumber}
                </div>
                
                {/* Main score display (X, /, or total) */}
                <div className="text-xl font-bold mb-1" style={{ color: "#f4f4f5" }}>
                  {display || "—"}
                </div>
                
                {/* Shot breakdown - horizontal layout */}
                {frame.ballsPocketed.length > 0 && (
                  <div className="flex gap-1 justify-center mb-1 mt-0.5">
                    {frame.ballsPocketed.map((balls, idx) => {
                      const isStrike = balls === 10;
                      // Check if this is a spare (second shot that makes first+second = 10, and not a strike)
                      const isSpare = idx === 1 && 
                        frame.ballsPocketed.length >= 2 && 
                        !frame.isStrike && 
                        frame.ballsPocketed[0] + balls === 10;
                      
                      return (
                        <div
                          key={idx}
                          className="rounded px-1.5 py-0.5 text-sm font-semibold"
                          style={{
                            backgroundColor: isStrike 
                              ? (isCurrent ? "rgba(34, 197, 94, 0.4)" : "rgba(34, 197, 94, 0.3)")
                              : isSpare
                              ? (isCurrent ? "rgba(6, 182, 212, 0.4)" : "rgba(6, 182, 212, 0.3)")
                              : (isCurrent ? "rgba(34, 197, 94, 0.3)" : "rgba(6, 182, 212, 0.2)"),
                            color: "#f4f4f5",
                            minWidth: "20px",
                          }}
                        >
                          {isStrike ? "X" : isSpare ? "/" : (balls === 0 ? "—" : balls)}
                        </div>
                      );
                    })}
                    {/* Show empty slot for shot 2 if only shot 1 is recorded (non-strike) */}
                    {frame.ballsPocketed.length === 1 && !frame.isStrike && frame.frameNumber !== 10 && (
                      <div
                        className="rounded px-1.5 py-0.5 text-sm font-semibold"
                        style={{
                          backgroundColor: "rgba(39, 39, 42, 0.5)",
                          color: "#f4f4f5",
                          opacity: 0.4,
                          minWidth: "20px",
                        }}
                      >
                        —
                      </div>
                    )}
                    {/* For 10th frame: show empty slots for remaining shots if strike/spare */}
                    {frame.frameNumber === 10 && !frame.isComplete && (
                      <>
                        {frame.isStrike && frame.ballsPocketed.length === 1 && (
                          <>
                            <div
                              className="rounded px-1.5 py-0.5 text-sm font-semibold"
                              style={{
                                backgroundColor: "rgba(39, 39, 42, 0.5)",
                                color: "#f4f4f5",
                                opacity: 0.4,
                                minWidth: "20px",
                              }}
                            >
                              —
                            </div>
                            <div
                              className="rounded px-1.5 py-0.5 text-sm font-semibold"
                              style={{
                                backgroundColor: "rgba(39, 39, 42, 0.5)",
                                color: "#f4f4f5",
                                opacity: 0.4,
                                minWidth: "20px",
                              }}
                            >
                              —
                            </div>
                          </>
                        )}
                        {frame.isStrike && frame.ballsPocketed.length === 2 && (
                          <div
                            className="rounded px-1.5 py-0.5 text-sm font-semibold"
                            style={{
                              backgroundColor: "rgba(39, 39, 42, 0.5)",
                              color: "#f4f4f5",
                              opacity: 0.4,
                              minWidth: "20px",
                            }}
                          >
                            —
                          </div>
                        )}
                        {frame.isSpare && frame.ballsPocketed.length === 2 && (
                          <div
                            className="rounded px-1.5 py-0.5 text-sm font-semibold"
                            style={{
                              backgroundColor: "rgba(39, 39, 42, 0.5)",
                              color: "#f4f4f5",
                              opacity: 0.4,
                              minWidth: "20px",
                            }}
                          >
                            —
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Cumulative score */}
                <div className="text-xs font-semibold mt-0.5" style={{ color: "#22c55e", opacity: 0.9 }}>
                  {cumulativeScore > 0 ? cumulativeScore : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

