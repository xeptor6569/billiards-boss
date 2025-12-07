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
    <div className="h-full flex items-center" style={{ backgroundColor: "#09090b" }}>
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
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
                className="rounded-lg border-2 p-2 min-w-[60px] text-center"
                style={{
                  borderColor: isCurrent ? "#22c55e" : "#27272a",
                  backgroundColor: isCurrent ? "rgba(34, 197, 94, 0.15)" : "#18181b",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "#f4f4f5", opacity: 0.7 }}>
                  {frame.frameNumber}
                </div>
                <div className="text-lg font-bold mb-1" style={{ color: "#f4f4f5" }}>{display || "—"}</div>
                <div className="text-xs" style={{ color: "#f4f4f5", opacity: 0.6 }}>
                  {cumulativeScore > 0 ? cumulativeScore : ""}
                </div>
                {/* Shot breakdown */}
                {frame.ballsPocketed.length > 0 && (
                  <div className="flex gap-1 justify-center mt-1">
                    {frame.ballsPocketed.map((balls, idx) => (
                      <span
                        key={idx}
                        className="text-[10px]"
                        style={{ color: "#f4f4f5", opacity: 0.5 }}
                      >
                        {balls === 0 ? "-" : balls}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

