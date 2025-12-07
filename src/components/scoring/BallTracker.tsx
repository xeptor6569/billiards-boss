"use client";

interface BallTrackerProps {
  ballsPocketed: number[];
  remainingBalls: number;
  onBallClick?: (ballNumber: number) => void;
  disabled?: boolean;
}

export default function BallTracker({
  ballsPocketed,
  remainingBalls,
  onBallClick,
  disabled = false,
}: BallTrackerProps) {
  const totalBalls = 10;
  const balls = Array.from({ length: totalBalls }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Balls Remaining: {remainingBalls}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {balls.map((ballNumber) => {
          const isPocketed = ballsPocketed.some(
            (count) => count >= ballNumber
          );
          const isClickable = !disabled && onBallClick && remainingBalls > 0;

          return (
            <button
              key={ballNumber}
              type="button"
              onClick={() => isClickable && onBallClick?.(ballNumber)}
              disabled={!isClickable || isPocketed}
              className={`
                flex h-12 w-12 items-center justify-center rounded-full
                text-sm font-bold transition-all
                ${
                  isPocketed
                    ? "bg-green-500 text-white shadow-lg"
                    : isClickable
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                }
                ${isClickable && !isPocketed ? "hover:shadow-xl" : ""}
              `}
            >
              {ballNumber}
            </button>
          );
        })}
      </div>
      {ballsPocketed.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Shot {ballsPocketed.length}: {ballsPocketed[ballsPocketed.length - 1]} ball
          {ballsPocketed[ballsPocketed.length - 1] !== 1 ? "s" : ""} pocketed
        </div>
      )}
    </div>
  );
}

