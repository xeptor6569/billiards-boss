"use client";

interface RackVisualizerProps {
  totalPocketed: number;
  remainingBalls: number;
}

export default function RackVisualizer({
  totalPocketed,
  remainingBalls,
}: RackVisualizerProps) {
  const totalBalls = 10;
  const balls = Array.from({ length: totalBalls }, (_, i) => i + 1);

  // Triangle rack positions (approximate)
  const rackPositions = [
    { row: 0, col: 4 }, // Ball 1 (top)
    { row: 1, col: 3 }, // Ball 2
    { row: 1, col: 5 }, // Ball 3
    { row: 2, col: 2 }, // Ball 4
    { row: 2, col: 4 }, // Ball 5
    { row: 2, col: 6 }, // Ball 6
    { row: 3, col: 1 }, // Ball 7
    { row: 3, col: 3 }, // Ball 8
    { row: 3, col: 5 }, // Ball 9
    { row: 3, col: 7 }, // Ball 10
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="relative w-[300px] h-[150px] scale-90 sm:scale-100 transition-transform duration-500">
        {balls.map((ballNumber, index) => {
          const isPocketed = ballNumber <= totalPocketed;
          const position = rackPositions[index];

          return (
            <div
              key={ballNumber}
              className="absolute rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                left: `${(position.col / 8) * 100}%`,
                top: `${(position.row / 4) * 100}%`,
                transform: `translate(-50%, -50%) ${isPocketed ? "scale(0.5)" : "scale(1)"}`,
                backgroundColor: isPocketed ? "var(--game-border)" : "var(--game-accent)",
                border: `2px solid ${isPocketed ? "var(--game-surface)" : "var(--game-strike)"}`,
                opacity: isPocketed ? 0.3 : 1,
                boxShadow: isPocketed ? "none" : "0 4px 12px -2px var(--game-accent-dim)",
              }}
            >
              {!isPocketed && (
                <span className="font-bold text-[var(--game-bg)]">{ballNumber}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Text overlay or below */}
      <div className="mt-4 text-center">
        <p className="text-[var(--game-text-secondary)] font-medium text-sm">
          {totalPocketed === 10 ? "All Clear" : `${remainingBalls} Remaining`}
        </p>
      </div>
    </div>
  );
}

