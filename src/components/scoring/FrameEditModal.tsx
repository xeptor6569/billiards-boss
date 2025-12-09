"use client";

import { useState, useEffect } from "react";
import { Frame, GameState, updateFrameShot, calculateTotalScore } from "@/lib/game-logic";

interface FrameEditModalProps {
  isOpen: boolean;
  frame: Frame | null;
  frameIndex: number;
  gameState: GameState;
  onClose: () => void;
  onSave: (updatedGameState: GameState) => void;
}

export default function FrameEditModal({
  isOpen,
  frame,
  frameIndex,
  gameState,
  onClose,
  onSave,
}: FrameEditModalProps) {
  const [editedShots, setEditedShots] = useState<number[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (frame && isOpen) {
      setEditedShots([...frame.ballsPocketed]);
      setIsDirty(false);
    }
  }, [frame, isOpen]);

  if (!isOpen || !frame) return null;

  const handleShotChange = (shotIndex: number, newValue: number) => {
    const isTenthFrame = frame.frameNumber === 10;
    let remainingBeforeShot: number;

    if (isTenthFrame) {
      // 10th frame special rules
      if (shotIndex === 0) {
        // First shot: 10 balls available
        remainingBeforeShot = 10;
      } else if (shotIndex === 1) {
        // Second shot: if first was strike, reset to 10; otherwise use remaining
        const firstBall = editedShots[0] || 0;
        remainingBeforeShot = firstBall === 10 ? 10 : 10 - firstBall;
      } else {
        // Third shot: if second was strike OR if spare, reset to 10; otherwise use remaining
        const firstBall = editedShots[0] || 0;
        const secondBall = editedShots[1] || 0;
        const isSpare = firstBall + secondBall === 10 && firstBall !== 10;

        if (secondBall === 10) {
          remainingBeforeShot = 10; // Strike on shot 2 resets to 10
        } else if (isSpare) {
          remainingBeforeShot = 10; // Spare resets to 10 for bonus shot
        } else {
          // If first was strike, only count second ball; otherwise count both
          if (firstBall === 10) {
            remainingBeforeShot = 10 - secondBall;
          } else {
            remainingBeforeShot = 10 - firstBall - secondBall;
          }
        }
      }
    } else {
      // Regular frames: calculate remaining from total
      const totalBeforeThisShot = editedShots
        .slice(0, shotIndex)
        .reduce((sum, b) => sum + b, 0);
      remainingBeforeShot = 10 - totalBeforeThisShot;
    }

    // Clamp to valid range
    const clampedValue = Math.max(0, Math.min(newValue, remainingBeforeShot));

    const newShots = [...editedShots];
    
    // Ensure we have enough slots for the shot index
    while (newShots.length <= shotIndex) {
      newShots.push(0);
    }
    
    newShots[shotIndex] = clampedValue;

    // For regular frames: if first shot was a strike (10) and is changed to non-strike, add second shot
    if (!isTenthFrame && shotIndex === 0 && clampedValue < 10 && newShots.length === 1) {
      newShots.push(0);
    }

    // For 10th frame: handle dynamic shot slots
    if (isTenthFrame) {
      const firstBall = newShots[0] || 0;
      const secondBall = newShots[1] || 0;
      const needsThirdShot = firstBall === 10 || secondBall === 10 || (firstBall + secondBall === 10 && firstBall !== 10);
      
      // Ensure we have at least 2 shots if first is not a strike
      if (firstBall < 10 && newShots.length < 2) {
        newShots.push(0);
      }
      
      // Ensure we have 3 shots if needed
      if (needsThirdShot && newShots.length < 3) {
        newShots.push(0);
      }
    }

    setEditedShots(newShots);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!isDirty) {
      onClose();
      return;
    }

    // Reconstruct the frame with the edited shots
    const frames = [...gameState.frames];
    const frameToUpdate = { ...frames[frameIndex] };
    
    // Update ballsPocketed array - filter out trailing zeros for new shots
    const isTenthFrame = frame.frameNumber === 10;
    let newBallsPocketed = [...editedShots];
    
    // Remove trailing zeros (unless it's a valid shot slot)
    if (!isTenthFrame) {
      // Regular frames: remove trailing zeros after the first non-zero shot
      while (newBallsPocketed.length > 0 && newBallsPocketed[newBallsPocketed.length - 1] === 0) {
        const hasNonZeroBefore = newBallsPocketed.slice(0, -1).some(b => b > 0);
        if (hasNonZeroBefore) {
          newBallsPocketed.pop();
        } else {
          break;
        }
      }
      // Ensure at least one shot if there was one before
      if (frame.ballsPocketed.length > 0 && newBallsPocketed.length === 0) {
        newBallsPocketed = [0];
      }
    } else {
      // 10th frame: keep all shots up to the maximum needed
      const firstBall = newBallsPocketed[0] || 0;
      const secondBall = newBallsPocketed[1] || 0;
      const needsThirdShot = firstBall === 10 || secondBall === 10 || (firstBall + secondBall === 10 && firstBall !== 10);
      
      if (needsThirdShot && newBallsPocketed.length < 3) {
        while (newBallsPocketed.length < 3) {
          newBallsPocketed.push(0);
        }
      } else if (!needsThirdShot && newBallsPocketed.length > 2) {
        newBallsPocketed = newBallsPocketed.slice(0, 2);
      }
    }
    
    frameToUpdate.ballsPocketed = newBallsPocketed;
    
    // Recalculate frame properties (similar to updateFrameShot logic)
    const totalBalls = frameToUpdate.ballsPocketed.reduce((sum, b) => sum + b, 0);
    const firstBall = frameToUpdate.ballsPocketed[0] || 0;
    
    frameToUpdate.isStrike = firstBall === 10;
    frameToUpdate.isSpare = !frameToUpdate.isStrike && 
      frameToUpdate.ballsPocketed.length === 2 && 
      totalBalls === 10;
    
    // Recalculate completion status
    if (frameToUpdate.isStrike) {
      if (!isTenthFrame) {
        frameToUpdate.isComplete = true;
      } else {
        frameToUpdate.isComplete = frameToUpdate.ballsPocketed.length >= 3;
      }
    } else if (frameToUpdate.isSpare) {
      if (!isTenthFrame) {
        frameToUpdate.isComplete = true;
      } else {
        frameToUpdate.isComplete = frameToUpdate.ballsPocketed.length >= 3;
      }
    } else {
      frameToUpdate.isComplete = frameToUpdate.ballsPocketed.length >= 2;
    }
    
    frameToUpdate.score = totalBalls;
    
    frames[frameIndex] = frameToUpdate;
    
    // Recalculate total score and current frame
    const totalScore = calculateTotalScore(frames);
    const firstIncompleteIndex = frames.findIndex(f => !f.isComplete);
    const currentFrame = firstIncompleteIndex >= 0 ? firstIncompleteIndex + 1 : 11; // 11 means all frames complete
    
    const updatedState: GameState = {
      frames,
      currentFrame,
      totalScore,
      isComplete: frames.every(f => f.isComplete),
    };

    onSave(updatedState);
    onClose();
  };

  const handleCancel = () => {
    setEditedShots([...frame.ballsPocketed]);
    setIsDirty(false);
    onClose();
  };

  const isTenthFrame = frame.frameNumber === 10;
  
  // Determine how many shot inputs to display
  const calculateDisplayShots = () => {
    if (isTenthFrame) {
      // 10th frame: show 1-3 shots based on state
      const firstBall = editedShots[0] || 0;
      const secondBall = editedShots[1] || 0;
      const needsThirdShot = firstBall === 10 || secondBall === 10 || (firstBall + secondBall === 10 && firstBall !== 10);
      
      if (firstBall === 10) {
        // Strike on first: show up to 3 shots
        return Math.max(editedShots.length, 2); // At least 2, up to 3
      } else if (needsThirdShot) {
        // Spare or strike on second: show 3 shots
        return 3;
      } else {
        // Regular: show 2 shots minimum
        return Math.max(editedShots.length, 2);
      }
    } else {
      // Regular frames: show 1-2 shots
      const firstBall = editedShots[0] || 0;
      if (firstBall === 10) {
        // Strike: show 1 shot
        return 1;
      } else {
        // Non-strike: show 2 shots
        return Math.max(editedShots.length, 2);
      }
    }
  };
  
  const displayShots = calculateDisplayShots();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-[var(--game-surface)] rounded-xl border border-[var(--game-border)] shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Edit Frame {frame.frameNumber}
          </h2>
          <button
            onClick={handleCancel}
            className="text-[var(--game-text-secondary)] hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {Array.from({ length: displayShots }).map((_, idx) => {
            // Ensure we have a value for this shot index
            const shotValue = editedShots[idx] ?? 0;
            const isStrike = shotValue === 10;
            const isSpare =
              idx === 1 &&
              editedShots.length >= 2 &&
              editedShots[0] !== 10 &&
              editedShots[0] + shotValue === 10;

            // Calculate remaining balls for this shot
            let remainingBeforeShot: number;
            if (isTenthFrame) {
              if (idx === 0) {
                remainingBeforeShot = 10;
              } else if (idx === 1) {
                const firstBall = editedShots[0] || 0;
                remainingBeforeShot = firstBall === 10 ? 10 : 10 - firstBall;
              } else {
                const firstBall = editedShots[0] || 0;
                const secondBall = editedShots[1] || 0;
                const isSpare = firstBall + secondBall === 10 && firstBall !== 10;
                if (secondBall === 10) {
                  remainingBeforeShot = 10;
                } else if (isSpare) {
                  remainingBeforeShot = 10;
                } else {
                  remainingBeforeShot = firstBall === 10 ? 10 - secondBall : 10 - firstBall - secondBall;
                }
              }
            } else {
              const totalBeforeThisShot = editedShots
                .slice(0, idx)
                .reduce((sum, b) => sum + b, 0);
              remainingBeforeShot = 10 - totalBeforeThisShot;
            }

            return (
              <div key={idx} className="flex items-center gap-3">
                <label className="text-sm font-semibold text-[var(--game-text-secondary)] min-w-[80px]">
                  Shot {idx + 1}:
                </label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={remainingBeforeShot}
                    value={shotValue}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      handleShotChange(idx, value);
                    }}
                    className="flex-1 px-3 py-2 bg-[var(--game-bg)] border border-[var(--game-border)] rounded-lg text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-[var(--game-accent)]"
                  />
                  <div className="text-xs text-[var(--game-text-secondary)] min-w-[60px]">
                    Max: {remainingBeforeShot}
                  </div>
                </div>
                {(isStrike || isSpare) && (
                  <div
                    className={`
                      px-2 py-1 rounded text-xs font-bold
                      ${isStrike ? "bg-[var(--game-strike)]" : "bg-[var(--game-spare)]"}
                    `}
                  >
                    {isStrike ? "X" : "/"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-[var(--game-bg)] border border-[var(--game-border)] text-[var(--game-text-secondary)] rounded-lg hover:bg-[var(--game-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="flex-1 px-4 py-2 bg-[var(--game-strike)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-bold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

