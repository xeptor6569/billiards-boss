"use client";

import { Frame } from "@/lib/game-logic";

interface FrameDisplayProps {
  frame: Frame;
  isCurrent: boolean;
  cumulativeScore?: number;
}

export default function FrameDisplay({
  frame,
  isCurrent,
  cumulativeScore,
}: FrameDisplayProps) {
  const getDisplayScore = () => {
    if (frame.isStrike) return "X";
    if (frame.isSpare) return "/";
    return frame.score > 0 ? frame.score : "";
  };

  return (
    <div
      className={`
        flex flex-col rounded-lg border-2 p-3 transition-all
        ${
          isCurrent
            ? "border-indigo-500 bg-indigo-50 shadow-lg dark:bg-indigo-900/20 dark:border-indigo-400"
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        }
      `}
    >
      <div className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
        Frame {frame.frameNumber}
      </div>
      <div className="my-2 flex h-16 items-center justify-center rounded border border-gray-300 bg-gray-50 text-2xl font-bold dark:border-gray-600 dark:bg-gray-700">
        {getDisplayScore()}
      </div>
      <div className="flex gap-1 text-xs">
        {frame.ballsPocketed.map((balls, idx) => (
          <div
            key={idx}
            className="flex-1 rounded bg-blue-100 px-1 text-center dark:bg-blue-900/30"
          >
            {balls}
          </div>
        ))}
      </div>
      {cumulativeScore !== undefined && (
        <div className="mt-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
          {cumulativeScore}
        </div>
      )}
    </div>
  );
}

