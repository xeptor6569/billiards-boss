"use client";

interface APA9BallTurnControlsProps {
  onEndTurn: () => void;
  onFoul: () => void;
  onDefensiveShot: () => void;
  disabled?: boolean;
}

export default function APA9BallTurnControls({
  onEndTurn,
  onFoul,
  onDefensiveShot,
  disabled = false,
}: APA9BallTurnControlsProps) {
  const btnBase = "relative flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSurface = "bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100";
  const btnAction = "text-white shadow-lg";

  return (
    <div className="flex flex-col gap-3 h-full p-4 pb-6">
      {/* Primary Action - End Turn */}
      <div className="h-[40%] min-h-[100px]">
        <button
          onClick={onEndTurn}
          disabled={disabled}
          className={`${btnBase} ${btnAction} w-full h-full text-xl bg-blue-500 shadow-blue-500/30`}
        >
          End Turn
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {/* Foul Button */}
        <button
          onClick={onFoul}
          disabled={disabled}
          className={`${btnBase} ${btnAction} bg-red-600 dark:bg-red-400 shadow-red-600/30 dark:shadow-red-400/30 text-lg`}
        >
          Foul
        </button>

        {/* Defensive Shot Button */}
        <button
          onClick={onDefensiveShot}
          disabled={disabled}
          className={`${btnBase} ${btnSurface} text-lg`}
        >
          Defensive
        </button>
      </div>
    </div>
  );
}

