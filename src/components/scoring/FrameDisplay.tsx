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
        ${isCurrent ? "shadow-lg" : ""}
        ${canEdit ? "cursor-pointer hover:shadow-md active:scale-95" : ""}
      `}
      style={{
        borderColor: isCurrent ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: isCurrent 
          ? 'var(--color-primary)' 
          : 'var(--color-surface)',
        opacity: isCurrent ? 0.15 : 1,
      }}
      onMouseEnter={(e) => {
        if (canEdit) {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (canEdit && !isCurrent) {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }
      }}
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
      <div className="text-center text-xs font-semibold mb-1" style={{ color: 'var(--color-textSecondary)' }}>
        Frame {frame.frameNumber}
        {canEdit && (
          <span className="ml-1 text-[10px] opacity-60" title="Click to edit">
            ✎
          </span>
        )}
      </div>

      {/* Frame score (top, smaller) */}
      <div 
        className="flex h-8 sm:h-10 items-center justify-center rounded border text-sm sm:text-base font-semibold mb-2"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-textPrimary)',
        }}
      >
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
          <div 
            className="flex-1 rounded-md px-1.5 sm:px-2 py-1.5 sm:py-2 text-center text-base sm:text-lg font-bold"
            style={{
              backgroundColor: 'var(--color-border)',
              color: 'var(--color-textSecondary)',
            }}
          >
            —
          </div>
          <div 
            className="flex-1 rounded-md px-1.5 sm:px-2 py-1.5 sm:py-2 text-center text-base sm:text-lg font-bold"
            style={{
              backgroundColor: 'var(--color-border)',
              color: 'var(--color-textSecondary)',
            }}
          >
            —
          </div>
        </div>
      )}

      {/* Cumulative score (bottom) */}
      {cumulativeScore !== undefined && cumulativeScore > 0 && (
        <div 
          className="mt-auto text-center text-xs font-semibold pt-1 border-t"
          style={{
            color: 'var(--color-textPrimary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {cumulativeScore}
        </div>
      )}
    </div>
  );
}

