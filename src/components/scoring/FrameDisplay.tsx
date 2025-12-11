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

  const handleClick = () => {
    if (canEdit) {
      onFrameClick(frameIndex);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-col rounded-lg border-2 p-2 sm:p-3 transition-all aspect-square w-full
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
      {/* Shot boxes (top right) */}
      <div className="flex gap-1 justify-end">
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
                    rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-bold min-w-[24px] text-center
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
            {/* For 10th frame, show empty shot 3 box if needed */}
            {frame.frameNumber === 10 && frame.ballsPocketed.length < 3 && (
              <div 
                className="rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-bold min-w-[24px] text-center"
                style={{
                  backgroundColor: 'var(--color-border)',
                  color: 'var(--color-textSecondary)',
                }}
              >
                —
              </div>
            )}
          </>
        ) : (
          <>
            <div 
              className="rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-bold min-w-[24px] text-center"
              style={{
                backgroundColor: 'var(--color-border)',
                color: 'var(--color-textSecondary)',
              }}
            >
              —
            </div>
            <div 
              className="rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-bold min-w-[24px] text-center"
              style={{
                backgroundColor: 'var(--color-border)',
                color: 'var(--color-textSecondary)',
              }}
            >
              —
            </div>
            {frame.frameNumber === 10 && (
              <div 
                className="rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-bold min-w-[24px] text-center"
                style={{
                  backgroundColor: 'var(--color-border)',
                  color: 'var(--color-textSecondary)',
                }}
              >
                —
              </div>
            )}
          </>
        )}
      </div>

      {/* Cumulative score or strike/spare symbol (bottom center, large) */}
      <div className="mt-auto flex items-center justify-center">
        {cumulativeScore !== undefined && cumulativeScore > 0 ? (
          <div 
            className="text-center text-lg sm:text-xl font-bold"
            style={{
              color: 'var(--color-textPrimary)',
            }}
          >
            {cumulativeScore}
          </div>
        ) : frame.isStrike ? (
          <div 
            className="text-center text-3xl sm:text-4xl font-bold"
            style={{
              color: 'var(--color-primary)',
            }}
          >
            X
          </div>
        ) : frame.isSpare ? (
          <div 
            className="text-center text-3xl sm:text-4xl font-bold"
            style={{
              color: 'var(--color-primary)',
            }}
          >
            /
          </div>
        ) : frame.score > 0 ? (
          <div 
            className="text-center text-lg sm:text-xl font-bold"
            style={{
              color: 'var(--color-textPrimary)',
            }}
          >
            {frame.score}
          </div>
        ) : (
          <div 
            className="text-center text-lg sm:text-xl font-bold"
            style={{
              color: 'var(--color-textSecondary)',
              opacity: 0.3,
            }}
          >
            —
          </div>
        )}
      </div>
    </div>
  );
}

