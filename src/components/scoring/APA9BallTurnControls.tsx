"use client";

interface APA9BallTurnControlsProps {
  onEndTurn: () => void;
  onFoul: () => void;
  onDefensiveShot: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
  isRackComplete?: boolean;
}

export default function APA9BallTurnControls({
  onEndTurn,
  onFoul,
  onDefensiveShot,
  onUndo,
  canUndo,
  disabled = false,
  isRackComplete = false,
}: APA9BallTurnControlsProps) {
  const btnBase = "relative flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSurface = "bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100";
  const btnAction = "text-white shadow-lg";

  return (
    <div className="flex flex-col gap-2 h-full p-3 pb-4 justify-center">
      {/* Primary Action - End Turn / Start New Rack */}
      <button
        onClick={onEndTurn}
        disabled={disabled}
        className={`${btnBase} ${btnAction} w-full py-3 text-base bg-blue-500 shadow-blue-500/30`}
      >
        {isRackComplete ? "Start New Rack" : "End Turn"}
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-2">
        {/* Foul Button */}
        <button
          onClick={onFoul}
          disabled={disabled}
          className={`${btnBase} ${btnAction} py-2.5 bg-red-600 dark:bg-red-400 shadow-red-600/30 dark:shadow-red-400/30 text-sm`}
        >
          Foul
        </button>

        {/* Defensive Shot Button */}
        <button
          onClick={onDefensiveShot}
          disabled={disabled}
          className={`${btnBase} ${btnSurface} py-2.5 text-sm`}
        >
          Defensive
        </button>

        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={disabled || !canUndo}
          className={`${btnBase} ${btnSurface} py-2.5 text-sm flex items-center justify-center gap-1`}
          title="Undo last action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
}

