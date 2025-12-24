// Bowlliards game type implementation
// 10-ball pocket billiards scored like bowling

import { GameType, BaseGameState, ScoreInput, GameUIComponents } from './types';

// Bowlliards-specific game state
export interface BowlliardsGameState extends BaseGameState {
  gameType: 'bowlliards';
  gameData: {
    frames: Frame[];
    currentFrame: number;
  };
}

export interface Frame {
  frameNumber: number;
  ballsPocketed: number[];
  score: number;
  isStrike: boolean;
  isSpare: boolean;
  isComplete: boolean;
}

const MAX_FRAMES = 10;
const MAX_BALLS_PER_FRAME = 2; // Except 10th frame can have 3 if strike/spare
const TOTAL_BALLS = 10;

function createNewBowlliardsGame(): BowlliardsGameState {
  return {
    gameType: 'bowlliards',
    totalScore: 0,
    isComplete: false,
    gameData: {
      frames: Array.from({ length: MAX_FRAMES }, (_, i) => ({
        frameNumber: i + 1,
        ballsPocketed: [],
        score: 0,
        isStrike: false,
        isSpare: false,
        isComplete: false,
      })),
      currentFrame: 1,
    },
  };
}

function addBallToFrame(
  gameState: BowlliardsGameState,
  frameIndex: number,
  ballsPocketed: number
): BowlliardsGameState {
  const frames = [...gameState.gameData.frames];
  const frame = { ...frames[frameIndex] };

  // Validate ball count (allow 0 for miss)
  if (ballsPocketed < 0 || ballsPocketed > TOTAL_BALLS) {
    throw new Error(`Invalid ball count: ${ballsPocketed}`);
  }

  // Check if frame is already complete
  if (frame.isComplete) {
    return gameState;
  }

  const isTenthFrame = frame.frameNumber === 10;
  
  // Calculate remaining balls before this shot
  let remainingBeforeShot: number;
  if (isTenthFrame) {
    const shotIndex = frame.ballsPocketed.length;
    if (shotIndex === 0) {
      remainingBeforeShot = TOTAL_BALLS;
    } else if (shotIndex === 1) {
      const firstBall = frame.ballsPocketed[0];
      remainingBeforeShot = firstBall === TOTAL_BALLS ? TOTAL_BALLS : TOTAL_BALLS - firstBall;
    } else {
      const firstBall = frame.ballsPocketed[0];
      const secondBall = frame.ballsPocketed[1];
      const isSpare = firstBall + secondBall === TOTAL_BALLS && firstBall !== TOTAL_BALLS;
      
      if (secondBall === TOTAL_BALLS) {
        remainingBeforeShot = TOTAL_BALLS;
      } else if (isSpare) {
        remainingBeforeShot = TOTAL_BALLS;
      } else {
        const totalAfterFirst = firstBall === TOTAL_BALLS ? 0 : firstBall;
        remainingBeforeShot = TOTAL_BALLS - totalAfterFirst - secondBall;
      }
    }
  } else {
    const currentTotal = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);
    remainingBeforeShot = TOTAL_BALLS - currentTotal;
  }

  // Validate: can't pocket more than remaining balls
  if (ballsPocketed > remainingBeforeShot) {
    ballsPocketed = remainingBeforeShot;
  }

  // Add balls to frame
  frame.ballsPocketed = [...frame.ballsPocketed, ballsPocketed];
  const totalBalls = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);

  // Check for strike (all 10 balls on a shot)
  const shotIndex = frame.ballsPocketed.length - 1;
  const isStrikeOnThisShot = ballsPocketed === TOTAL_BALLS;
  
  if (isStrikeOnThisShot && shotIndex === 0) {
    frame.isStrike = true;
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    }
  } else if (isTenthFrame && isStrikeOnThisShot && shotIndex === 1) {
    if (frame.ballsPocketed.length >= 3) {
      frame.isComplete = true;
    }
  } else if (isTenthFrame && isStrikeOnThisShot && shotIndex === 2) {
    frame.isComplete = true;
  }
  // Check for spare
  else if (
    !frame.isStrike &&
    frame.ballsPocketed.length === 2 &&
    totalBalls === TOTAL_BALLS
  ) {
    frame.isSpare = true;
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    }
  }
  // Regular frame completion
  else if (frame.ballsPocketed.length >= MAX_BALLS_PER_FRAME && !isTenthFrame) {
    frame.isComplete = true;
  }
  else if (isTenthFrame) {
    if (frame.isStrike || frame.isSpare) {
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    } else if (frame.ballsPocketed.length >= 2) {
      frame.isComplete = true;
    }
  }

  frame.score = totalBalls;
  frames[frameIndex] = frame;

  // Update current frame
  let currentFrame = gameState.gameData.currentFrame;
  if (frame.isComplete && currentFrame < MAX_FRAMES) {
    currentFrame = frameIndex + 2;
  }

  // Check if game is complete
  const isComplete = frames.every((f) => f.isComplete);
  const totalScore = calculateTotalScore(frames);

  return {
    ...gameState,
    gameData: {
      frames,
      currentFrame: Math.min(currentFrame, MAX_FRAMES),
    },
    totalScore,
    isComplete,
  };
}

function calculateTotalScore(frames: Frame[]): number {
  let total = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const isTenthFrame = frame.frameNumber === 10;
    let frameScore = frame.score;

    if (isTenthFrame) {
      total += frameScore;
      continue;
    }

    // Add strike bonus (next 2 balls)
    if (frame.isStrike && i < frames.length - 1) {
      const nextFrame = frames[i + 1];
      if (nextFrame.ballsPocketed.length >= 2) {
        frameScore +=
          nextFrame.ballsPocketed[0] + nextFrame.ballsPocketed[1];
      } else if (nextFrame.ballsPocketed.length >= 1 && i < frames.length - 2) {
        const frameAfterNext = frames[i + 2];
        frameScore +=
          nextFrame.ballsPocketed[0] +
          (frameAfterNext.ballsPocketed[0] || 0);
      }
    }
    // Add spare bonus (next 1 ball)
    else if (frame.isSpare && i < frames.length - 1) {
      const nextFrame = frames[i + 1];
      if (nextFrame.ballsPocketed.length >= 1) {
        frameScore += nextFrame.ballsPocketed[0];
      }
    }

    total += frameScore;
  }

  return total;
}

function getRemainingBalls(frame: Frame): number {
  const isTenthFrame = frame.frameNumber === 10;
  
  if (!isTenthFrame) {
    const totalPocketed = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);
    return Math.max(0, TOTAL_BALLS - totalPocketed);
  }
  
  const shotIndex = frame.ballsPocketed.length;
  
  if (shotIndex === 0) {
    return TOTAL_BALLS;
  } else if (shotIndex === 1) {
    const firstBall = frame.ballsPocketed[0];
    if (firstBall === TOTAL_BALLS) {
      return TOTAL_BALLS;
    }
    return TOTAL_BALLS - firstBall;
  } else if (shotIndex === 2) {
    const firstBall = frame.ballsPocketed[0];
    const secondBall = frame.ballsPocketed[1];
    const isSpare = firstBall + secondBall === TOTAL_BALLS && firstBall !== TOTAL_BALLS;
    
    if (secondBall === TOTAL_BALLS) {
      return TOTAL_BALLS;
    }
    
    if (isSpare) {
      return TOTAL_BALLS;
    }
    
    if (firstBall === TOTAL_BALLS) {
      return TOTAL_BALLS - secondBall;
    }
    return TOTAL_BALLS - firstBall - secondBall;
  }
  
  return 0;
}

export const bowlliardsGameType: GameType = {
  metadata: {
    id: 'bowlliards',
    name: 'Bowlliards',
    description: '10-ball pocket billiards scored like bowling',
    requiresPayment: false,
    category: 'standard',
  },
  
  createNewGame(): BaseGameState {
    return createNewBowlliardsGame();
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = gameState as BowlliardsGameState;
    if (input.type === 'balls') {
      const currentFrameIndex = state.gameData.currentFrame - 1;
      return addBallToFrame(state, currentFrameIndex, input.count);
    }
    throw new Error(`Invalid input type for Bowlliards: ${input.type}`);
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as BowlliardsGameState;
    return calculateTotalScore(state.gameData.frames);
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as BowlliardsGameState;
    return state.gameData.frames.every((f) => f.isComplete);
  },
  
  getRemaining(gameState: BaseGameState): number {
    const state = gameState as BowlliardsGameState;
    const currentFrame = state.gameData.frames[state.gameData.currentFrame - 1];
    if (!currentFrame) return 0;
    return getRemainingBalls(currentFrame);
  },
  
  reconstructFromData(data: Record<string, unknown>): BaseGameState {
    const state = createNewBowlliardsGame();
    
    // Handle unified format (gameData structure)
    if (data.gameData && typeof data.gameData === 'object') {
      const gameData = data.gameData as Record<string, unknown>;
      if (gameData.frames && Array.isArray(gameData.frames)) {
        const sortedFrames = [...gameData.frames].sort((a: Record<string, unknown>, b: Record<string, unknown>) => 
          (a.frameNumber as number) - (b.frameNumber as number)
        );
        
        for (let i = 0; i < sortedFrames.length && i < MAX_FRAMES; i++) {
          const savedFrame = sortedFrames[i] as Record<string, unknown>;
          const frameIndex = (savedFrame.frameNumber as number) - 1;
          
          if (frameIndex >= 0 && frameIndex < state.gameData.frames.length) {
            const frame = state.gameData.frames[frameIndex];
            // Handle ballsPocketed - it might be a string (JSON) or array
            let ballsPocketed: number[] = [];
            if (Array.isArray(savedFrame.ballsPocketed)) {
              ballsPocketed = [...(savedFrame.ballsPocketed as number[])];
            } else if (typeof savedFrame.ballsPocketed === 'string') {
              try {
                ballsPocketed = JSON.parse(savedFrame.ballsPocketed);
              } catch {
                ballsPocketed = [];
              }
            }
            frame.ballsPocketed = ballsPocketed;
            frame.score = savedFrame.score as number;
            frame.isStrike = savedFrame.isStrike as boolean;
            frame.isSpare = savedFrame.isSpare as boolean;
            
            const isTenthFrame = (savedFrame.frameNumber as number) === 10;
            if (savedFrame.isStrike as boolean) {
              frame.isComplete = isTenthFrame ? ballsPocketed.length >= 3 : true;
            } else if (savedFrame.isSpare as boolean) {
              frame.isComplete = isTenthFrame ? ballsPocketed.length >= 3 : true;
            } else {
              frame.isComplete = ballsPocketed.length >= 2;
            }
          }
        }
        
        if (typeof gameData.currentFrame === 'number') {
          state.gameData.currentFrame = gameData.currentFrame;
        }
      }
    }
    // Legacy format: frames at top level (for backward compatibility during migration)
    else if (data.frames && Array.isArray(data.frames)) {
      const sortedFrames = [...data.frames].sort((a: Record<string, unknown>, b: Record<string, unknown>) => 
        (a.frameNumber as number) - (b.frameNumber as number)
      );
      
      for (let i = 0; i < sortedFrames.length && i < MAX_FRAMES; i++) {
        const savedFrame = sortedFrames[i] as Record<string, unknown>;
        const frameIndex = (savedFrame.frameNumber as number) - 1;
        
        if (frameIndex >= 0 && frameIndex < state.gameData.frames.length) {
          const frame = state.gameData.frames[frameIndex];
          let ballsPocketed: number[] = [];
          if (Array.isArray(savedFrame.ballsPocketed)) {
            ballsPocketed = [...(savedFrame.ballsPocketed as number[])];
          } else if (typeof savedFrame.ballsPocketed === 'string') {
            try {
              ballsPocketed = JSON.parse(savedFrame.ballsPocketed);
            } catch {
              ballsPocketed = [];
            }
          }
          frame.ballsPocketed = ballsPocketed;
          frame.score = savedFrame.score as number;
          frame.isStrike = savedFrame.isStrike as boolean;
          frame.isSpare = savedFrame.isSpare as boolean;
          
          const isTenthFrame = (savedFrame.frameNumber as number) === 10;
          if (savedFrame.isStrike as boolean) {
            frame.isComplete = isTenthFrame ? ballsPocketed.length >= 3 : true;
          } else if (savedFrame.isSpare as boolean) {
            frame.isComplete = isTenthFrame ? ballsPocketed.length >= 3 : true;
          } else {
            frame.isComplete = ballsPocketed.length >= 2;
          }
        }
      }
    }
    
    // Recalculate state
    const firstIncompleteIndex = state.gameData.frames.findIndex(f => !f.isComplete);
    state.gameData.currentFrame = firstIncompleteIndex >= 0 ? firstIncompleteIndex + 1 : MAX_FRAMES + 1;
    state.totalScore = calculateTotalScore(state.gameData.frames);
    state.isComplete = state.gameData.frames.every(f => f.isComplete);
    
    // Override with saved values if present
    if (typeof data.totalScore === 'number') state.totalScore = data.totalScore;
    if (typeof data.isComplete === 'boolean') state.isComplete = data.isComplete;
    
    return state;
  },
  
  serialize(gameState: BaseGameState): Record<string, unknown> {
    // Handle both old GameState format (with frames directly) and new BowlliardsGameState format
    const state = gameState as BowlliardsGameState | { frames: unknown[]; currentFrame: number; totalScore: number; isComplete: boolean };
    
    // Check if it's the old format (frames directly) or new format (gameData.frames)
    let frames: unknown[];
    let currentFrame: number;
    
    if ('gameData' in state && state.gameData && typeof state.gameData === 'object' && 'frames' in state.gameData) {
      // New format: gameData.frames
      frames = (state.gameData as { frames: unknown[] }).frames;
      currentFrame = (state.gameData as { currentFrame: number }).currentFrame;
    } else if ('frames' in state && Array.isArray(state.frames)) {
      // Old format: frames directly
      frames = state.frames;
      currentFrame = state.currentFrame || 1;
    } else {
      // Fallback: empty game
      frames = [];
      currentFrame = 1;
    }
    
    // Unified format: store as gameData structure
    return {
      gameType: 'bowlliards',
      totalScore: state.totalScore || 0,
      isComplete: state.isComplete || false,
      gameData: {
        frames,
        currentFrame,
      },
    };
  },
  
  getUIComponents(): GameUIComponents {
    // Will be implemented when we create UI components
    return {};
  },
};

// Export helper functions for backward compatibility
export function getRemainingBallsForFrame(frame: Frame): number {
  return getRemainingBalls(frame);
}

