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

  const canRecordMiss = !disabled && onBallClick && ballsPocketed.length < 2;
  const shotNumber = ballsPocketed.length + 1;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
        Balls Remaining: {remainingBalls}
      </div>
      
      {/* Miss button - always available for first 2 shots */}
      {canRecordMiss && (
        <button
          type="button"
          onClick={() => onBallClick?.(0)}
          className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold shadow-md"
        >
          Miss (0 balls)
        </button>
      )}

      <div className="grid grid-cols-5 gap-3">
        {balls.map((ballNumber) => {
          // Calculate cumulative total of balls pocketed so far
          const totalPocketed = ballsPocketed.reduce((sum, count) => sum + count, 0);
          // A ball is visually "pocketed" (green) if its number is <= the total already pocketed
          const isPocketed = ballNumber <= totalPocketed;
          
          // For remaining balls, show balls starting from (totalPocketed + 1) up to 10
          // These represent the remaining balls that can be pocketed
          // Clicking on them means pocketing that many balls total (so we'll calculate the difference)
          const startOfRemaining = totalPocketed + 1;
          const isRemainingBall = ballNumber >= startOfRemaining && ballNumber <= 10;
          const isClickable = !disabled && onBallClick && remainingBalls > 0 && isRemainingBall && ballNumber <= (totalPocketed + remainingBalls);
          
          // Calculate how many balls to pocket when clicking this ball
          // If clicking ball 7 after pocketing 6, that means pocketing 1 more (7-6=1)
          const ballsToPocket = isClickable ? ballNumber - totalPocketed : 0;

          return (
            <button
              key={ballNumber}
              type="button"
              onClick={() => isClickable && onBallClick?.(ballsToPocket)}
              disabled={!isClickable}
              className={`
                flex h-12 w-12 items-center justify-center rounded-full
                text-sm font-bold transition-all relative
                ${
                  isClickable
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 active:scale-95 cursor-pointer shadow-md ring-2 ring-blue-400 ring-offset-1"
                    : isPocketed
                    ? "bg-green-500 text-white shadow-lg"
                    : "cursor-not-allowed"
                }
                ${isClickable ? "hover:shadow-xl" : ""}
              `}
              style={!isClickable && !isPocketed ? {
                backgroundColor: 'var(--color-border)',
                color: 'var(--color-textSecondary)',
              } : undefined}
            >
              {ballNumber}
            </button>
          );
        })}
      </div>
      {ballsPocketed.length > 0 && (
        <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
          Shot {ballsPocketed.length}: {ballsPocketed[ballsPocketed.length - 1]} ball
          {ballsPocketed[ballsPocketed.length - 1] !== 1 ? "s" : ""} pocketed
        </div>
      )}
      {ballsPocketed.length === 0 && (
        <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
          Ready for shot {shotNumber}
        </div>
      )}
    </div>
  );
}

