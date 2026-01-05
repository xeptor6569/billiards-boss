"use client";

import { useState, useEffect } from "react";
import { APA8BallGameState } from "@/lib/game-types/apa8ball";

interface APA8BallTurnControlsProps {
  gameState: APA8BallGameState;
  onEndTurn: () => void;
  onDefense: () => void;
  onFoul: () => void;
  onTimeout: () => void;
  onRackComplete: (winner: 1 | 2) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  disabled?: boolean;
  timeoutActive?: boolean; // Disable all controls when timeout is active
}

export default function APA8BallTurnControls({
  gameState,
  onEndTurn,
  onDefense,
  onFoul,
  onTimeout,
  onRackComplete,
  onUndo,
  canUndo = false,
  disabled = false,
  timeoutActive = false,
}: APA8BallTurnControlsProps) {
  const [showRackCompleteDialog, setShowRackCompleteDialog] = useState(false);
  const currentPlayerData = gameState.gameData[gameState.gameData.currentPlayer === 1 ? 'player1' : 'player2'];
  const canUseTimeout = currentPlayerData.timeoutsRemaining > 0;
  // Disable all controls when timeout is active
  const isDisabled = disabled || timeoutActive;
  
  // Close rack complete dialog if timeout becomes active
  useEffect(() => {
    if (timeoutActive && showRackCompleteDialog) {
      setShowRackCompleteDialog(false);
    }
  }, [timeoutActive, showRackCompleteDialog]);
  
  const handleRackCompleteClick = () => {
    setShowRackCompleteDialog(true);
  };
  
  const handleRackCompleteConfirm = (winner: 1 | 2) => {
    onRackComplete(winner);
    setShowRackCompleteDialog(false);
  };
  
  return (
    <div className="w-full h-full flex flex-col p-3 gap-2">
      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        <button
          onClick={onEndTurn}
          disabled={isDisabled}
          className="px-4 py-3 bg-blue-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          End Turn
        </button>
        
        <button
          onClick={onDefense}
          disabled={isDisabled}
          className="px-4 py-3 bg-slate-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors text-sm sm:text-base"
        >
          Defense
        </button>
        
        <button
          onClick={onFoul}
          disabled={isDisabled}
          className="px-4 py-3 bg-red-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors text-sm sm:text-base"
        >
          Foul
        </button>
        
        <button
          onClick={onTimeout}
          disabled={isDisabled || !canUseTimeout}
          className="px-4 py-3 bg-amber-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors text-sm sm:text-base"
        >
          Time-out ({currentPlayerData.timeoutsRemaining})
        </button>
      </div>
      
      {/* Rack Complete Button */}
      <button
        onClick={handleRackCompleteClick}
        disabled={isDisabled}
        className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors text-sm sm:text-base"
      >
        Rack Complete
      </button>
      
      {/* Undo Button */}
      {onUndo && (
        <button
          onClick={onUndo}
          disabled={isDisabled || !canUndo}
          className="w-full px-4 py-2 bg-slate-400 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors text-xs sm:text-sm"
        >
          Undo
        </button>
      )}
      
      {/* Rack Complete Dialog */}
      {showRackCompleteDialog && !timeoutActive && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Who won this rack?
            </h3>
            <div className="space-y-3 mb-4">
              <button
                onClick={() => handleRackCompleteConfirm(1)}
                className="w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                {gameState.gameData.player1Name}
              </button>
              <button
                onClick={() => handleRackCompleteConfirm(2)}
                className="w-full py-3 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
              >
                {gameState.gameData.player2Name}
              </button>
            </div>
            <button
              onClick={() => setShowRackCompleteDialog(false)}
              className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

