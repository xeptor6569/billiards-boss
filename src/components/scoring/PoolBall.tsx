"use client";

interface PoolBallProps {
  ballNumber: number;
  size?: 'sm' | 'md' | 'lg';
  isPocketed?: boolean;
  isSelected?: boolean;
  isDead?: boolean;
  pocketedBy?: 'player1' | 'player2';
  onClick?: () => void;
  disabled?: boolean;
  ballState?: 'pocketed' | 'dead';
}

// Standard pool ball colors for 9-ball
const BALL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-900' }, // Solid yellow
  2: { bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-blue-900' }, // Solid blue
  3: { bg: 'bg-red-500', border: 'border-red-700', text: 'text-red-900' }, // Solid red
  4: { bg: 'bg-purple-500', border: 'border-purple-700', text: 'text-purple-900' }, // Solid purple
  5: { bg: 'bg-orange-500', border: 'border-orange-700', text: 'text-orange-900' }, // Solid orange
  6: { bg: 'bg-green-500', border: 'border-green-700', text: 'text-green-900' }, // Solid green
  7: { bg: 'bg-rose-800', border: 'border-rose-900', text: 'text-rose-50' }, // Solid maroon/brown
  8: { bg: 'bg-slate-900', border: 'border-slate-950', text: 'text-slate-50' }, // Solid black
  9: { bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-900' }, // Yellow with stripe (using gradient)
};

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-12 h-12 sm:w-14 sm:h-14 text-sm sm:text-base',
  lg: 'w-16 h-16 text-lg',
};

export default function PoolBall({
  ballNumber,
  size = 'md',
  isPocketed = false,
  isSelected = false,
  isDead = false,
  pocketedBy,
  onClick,
  disabled = false,
  ballState,
}: PoolBallProps) {
  const colors = BALL_COLORS[ballNumber] || BALL_COLORS[1];
  const sizeClass = SIZE_CLASSES[size];
  
  // Determine visual state - only use isPocketed/isDead props, not ballState
  // ballState is only for selection indicators (ring, checkmark), not visual greying
  let visualState: 'normal' | 'pocketed' | 'dead' | 'invalid';
  if (isDead) {
    visualState = 'dead';
  } else if (isPocketed) {
    visualState = 'pocketed';
  } else {
    visualState = 'normal';
  }
  
  // Allow clicking if ball is in selection state (even if already pocketed/dead in game)
  const isInSelection = ballState !== undefined;
  const actuallyDisabled = disabled && !isInSelection;
  
  // Ball 9 has a stripe pattern - use gradient
  const isNineBall = ballNumber === 9;
  
  // Dim the ball if selected as dead (but not fully greyed like actually dead)
  const isSelectedAsDead = isSelected && ballState === 'dead';
  
  return (
    <button
      onClick={onClick}
      disabled={actuallyDisabled || (!isInSelection && (isPocketed || isDead))}
      className={`
        relative rounded-full flex items-center justify-center
        font-bold transition-all duration-300
        ${sizeClass}
        ${visualState === 'pocketed'
          ? 'bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 opacity-40 cursor-not-allowed'
          : visualState === 'dead'
          ? 'bg-slate-400 dark:bg-slate-600 border-2 border-slate-500 dark:border-slate-500 opacity-60 cursor-not-allowed'
          : disabled
          ? 'bg-slate-300 dark:bg-slate-600 border-2 border-slate-400 dark:border-slate-500 opacity-50 cursor-not-allowed'
          : `${colors.bg} ${colors.border} border-2 shadow-lg hover:scale-110 active:scale-95 cursor-pointer ${isSelectedAsDead ? 'opacity-60' : ''}`
        }
        ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : ''}
        ${pocketedBy === 'player1' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${pocketedBy === 'player2' ? 'ring-2 ring-red-500 ring-offset-2' : ''}
      `}
      style={
        isNineBall && visualState === 'normal'
          ? {
              background: 'linear-gradient(to bottom, #facc15 0%, #facc15 50%, #ffffff 50%, #ffffff 100%)',
            }
          : undefined
      }
    >
      {/* White circle with number */}
      <div
        className={`
          rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center
          ${visualState === 'pocketed' || visualState === 'dead'
            ? 'bg-slate-300 dark:bg-slate-500'
            : 'bg-white'
          }
          ${visualState === 'pocketed' || visualState === 'dead'
            ? 'text-slate-500 dark:text-slate-400'
            : 'text-slate-900'
          }
          shadow-inner
        `}
      >
        <span className="font-black drop-shadow-sm">{ballNumber}</span>
      </div>
      
      {/* Dead ball indicator - only show if actually dead in game state, not just selected as dead */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-600 dark:text-red-400 font-bold text-lg">✕</span>
        </div>
      )}
      
      {/* Selected indicator - show checkmark for pocketed state, X for dead state */}
      {isSelected && ballState === 'pocketed' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {isSelected && ballState === 'dead' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✕</span>
        </div>
      )}
    </button>
  );
}

