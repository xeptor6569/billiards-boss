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
              className={`absolute rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                isPocketed 
                  ? "bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-800 opacity-30" 
                  : "bg-[var(--accent)] border-2 border-amber-500 shadow-[0_4px_12px_-2px_var(--accent-dim)]"
              }`}
              style={{
                left: `${(position.col / 8) * 100}%`,
                top: `${(position.row / 4) * 100}%`,
                transform: `translate(-50%, -50%) ${isPocketed ? "scale(0.5)" : "scale(1)"}`,
              }}
            >
              {!isPocketed && (
                <span className="font-bold text-white">{ballNumber}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Text overlay or below */}
      <div className="mt-4 text-center">
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
          {totalPocketed === 10 ? "All Clear" : `${remainingBalls} Remaining`}
        </p>
      </div>
    </div>
  );
}

