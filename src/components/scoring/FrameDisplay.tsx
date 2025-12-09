"use client";

import { Frame } from "@/lib/game-logic";

interface FrameDisplayProps {
  frame: Frame;
  isCurrent: boolean;
  cumulativeScore?: number;
  onFrameClick?: (frameIndex: number) => void;
  isEditable?: boolean;
}

export default function FrameDisplay({
  frame,
  isCurrent,
  cumulativeScore,
  onFrameClick,
  isEditable = false,
}: FrameDisplayProps) {
  const frameIndex = frame.frameNumber - 1;
  const hasShots = frame.ballsPocketed.length > 0;
  const canEdit = isEditable && hasShots && onFrameClick;

  const getDisplayScore = () => {
    if (frame.isStrike) return "X";
    if (frame.isSpare) return "/";
    return frame.score > 0 ? frame.score : "";
  };

  const handleClick = () => {
    if (canEdit) {
      onFrameClick(frameIndex);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-col rounded-lg border-2 p-2 sm:p-3 transition-all min-w-0
        ${
          isCurrent
            ? "border-indigo-500 bg-indigo-50 shadow-lg dark:bg-indigo-900/20 dark:border-indigo-400"
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        }
        ${
          canEdit
            ? "cursor-pointer hover:border-indigo-400 hover:shadow-md active:scale-95 dark:hover:border-indigo-500"
            : ""
        }
      `}
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onKeyDown={(e) => {
        if (canEdit && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Frame number */}
      <div className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
        Frame {frame.frameNumber}
        {canEdit && (
          <span className="ml-1 text-[10px] opacity-60" title="Click to edit">
            ✎
          </span>
        )}
      </div>

      {/* Frame score (top, smaller) */}
      <div className="flex h-8 sm:h-10 items-center justify-center rounded border border-gray-300 bg-gray-50 text-sm sm:text-base font-semibold dark:border-gray-600 dark:bg-gray-700 mb-2">
        {getDisplayScore() || "—"}
      </div>

      {/* Shot breakdown (prominent, middle) */}
      {hasShots ? (
        <div className="flex gap-1.5 sm:gap-2 mb-2">
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
                  flex-1 rounded-md px-1.5 sm:px-2 py-1.5 sm:py-2 text-center
                  text-base sm:text-lg font-bold
                  ${
                    isStrike
                      ? "bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200"
                      : isSpare
                      ? "bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-200"
                      : "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                  }
                `}
              >
                {isStrike ? "X" : isSpare ? "/" : balls === 0 ? "—" : balls}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-1.5 sm:gap-2 mb-2">
          <div className="flex-1 rounded-md px-1.5 sm:px-2 py-1.5 sm:py-2 text-center text-base sm:text-lg font-bold bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
            —
          </div>
          <div className="flex-1 rounded-md px-1.5 sm:px-2 py-1.5 sm:py-2 text-center text-base sm:text-lg font-bold bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
            —
          </div>
        </div>
      )}

      {/* Cumulative score (bottom) */}
      {cumulativeScore !== undefined && cumulativeScore > 0 && (
        <div className="mt-auto text-center text-xs font-semibold text-gray-700 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-700">
          {cumulativeScore}
        </div>
      )}
    </div>
  );
}

