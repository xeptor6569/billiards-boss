"use client";

interface APA9BallTurnControlsProps {
  onEndTurn: () => void;
  onFoul: () => void;
  onFoulWithBalls?: (ballNumbers: number[]) => void;
  onDefensiveShot: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
  isRackComplete?: boolean;
  ballStates?: Record<number, 'pocketed' | 'dead'>;
}

export default function APA9BallTurnControls({
  onEndTurn,
  onFoul,
  onFoulWithBalls,
  onDefensiveShot,
  onUndo,
  canUndo,
  disabled = false,
  isRackComplete = false,
  ballStates = {},
}: APA9BallTurnControlsProps) {
  const btnBase = "relative flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSurface = "bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100";
  const btnAction = "text-white shadow-lg";
  
  const hasSelectedBalls = Object.keys(ballStates).length > 0;
  const deadBalls = Object.keys(ballStates).filter(b => ballStates[Number(b)] === 'dead').map(Number);

  return (
    <div className="flex flex-col gap-4 h-full p-3 pb-4 justify-center">
      {/* Primary Action - End Turn / Start New Rack */}
      <button
        onClick={onEndTurn}
        disabled={disabled || hasSelectedBalls}
        className={`${btnBase} ${btnAction} w-full py-10 sm:py-12 text-lg sm:text-xl bg-blue-500 shadow-blue-500/30`}
      >
        {isRackComplete ? "Start New Rack" : "End Turn"}
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-2">
        {/* Foul Button - only show "Mark Foul" if there are dead balls in selection */}
        <button
          onClick={() => {
            if (deadBalls.length > 0 && onFoulWithBalls) {
              // Legacy support: if user somehow has dead balls selected, mark them as foul
              // But this shouldn't happen with new state cycling flow
              onFoulWithBalls(deadBalls);
            } else {
              onFoul();
            }
          }}
          disabled={disabled}
          className={`${btnBase} ${btnAction} py-3 sm:py-4 ${
            deadBalls.length > 0
              ? 'bg-orange-600 dark:bg-orange-500 shadow-orange-600/30 dark:shadow-orange-500/30' 
              : 'bg-red-600 dark:bg-red-400 shadow-red-600/30 dark:shadow-red-400/30'
          } text-base sm:text-lg`}
          title={deadBalls.length > 0 ? "Mark selected dead balls as foul (legacy)" : "Foul"}
        >
          {deadBalls.length > 0 ? "Mark Foul" : "Foul"}
        </button>

        {/* Defensive Shot Button */}
        <button
          onClick={onDefensiveShot}
          disabled={disabled || hasSelectedBalls}
          className={`${btnBase} ${btnSurface} py-3 sm:py-4 text-base sm:text-lg`}
        >
          Defensive
        </button>

        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={disabled || !canUndo || hasSelectedBalls}
          className={`${btnBase} ${btnSurface} py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-1.5`}
          title="Undo last action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
}

