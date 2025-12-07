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
    <div className="w-full h-full flex items-center justify-center relative" style={{ backgroundColor: "#18181b" }}>
      <div className="relative" style={{ width: "280px", height: "140px" }}>
        {balls.map((ballNumber, index) => {
          const isPocketed = ballNumber <= totalPocketed;
          const position = rackPositions[index];

          return (
            <div
              key={ballNumber}
              className="absolute rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold transition-all duration-500"
              style={{
                left: `${(position.col / 8) * 100}%`,
                top: `${(position.row / 4) * 100}%`,
                transform: `translate(-50%, -50%) ${isPocketed ? "scale(0.6)" : "scale(1)"}`,
                backgroundColor: isPocketed ? "#27272a" : "#22c55e",
                border: `2px solid ${isPocketed ? "#3f3f46" : "#16a34a"}`,
                opacity: isPocketed ? 0.2 : 1,
                boxShadow: isPocketed ? "none" : "0 4px 6px -1px rgba(34, 197, 94, 0.3)",
              }}
            >
              {!isPocketed && (
                <span className="font-bold" style={{ color: "#09090b" }}>{ballNumber}</span>
              )}
            </div>
          );
        })}
      </div>
      {/* Status text */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <div className="text-base font-semibold" style={{ color: "#f4f4f5" }}>
          {totalPocketed === 0
            ? "Ready to break"
            : remainingBalls > 0
            ? `${remainingBalls} ball${remainingBalls !== 1 ? "s" : ""} remaining`
            : "Frame complete"}
        </div>
      </div>
    </div>
  );
}

