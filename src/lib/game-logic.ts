// Billiards bowling (bowlliards) scoring logic
// 10-ball pocket billiards scored like bowling

export interface Frame {
  frameNumber: number;
  ballsPocketed: number[];
  score: number;
  isStrike: boolean;
  isSpare: boolean;
  isComplete: boolean;
}

export interface GameState {
  frames: Frame[];
  currentFrame: number;
  totalScore: number;
  isComplete: boolean;
}

const MAX_FRAMES = 10;
const MAX_BALLS_PER_FRAME = 2; // Except 10th frame can have 3 if strike/spare
const TOTAL_BALLS = 10;

export function createNewGame(): GameState {
  return {
    frames: Array.from({ length: MAX_FRAMES }, (_, i) => ({
      frameNumber: i + 1,
      ballsPocketed: [],
      score: 0,
      isStrike: false,
      isSpare: false,
      isComplete: false,
    })),
    currentFrame: 1,
    totalScore: 0,
    isComplete: false,
  };
}

export function addBallToFrame(
  gameState: GameState,
  frameIndex: number,
  ballsPocketed: number
): GameState {
  const frames = [...gameState.frames];
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
  
  // For 10th frame with strikes: each strike resets available balls to 10
  // For other frames or non-strike shots: calculate remaining from total
  let remainingBeforeShot: number;
  if (isTenthFrame) {
    // In 10th frame, check if previous shot was a strike
    const shotIndex = frame.ballsPocketed.length;
    if (shotIndex === 0) {
      // First shot: 10 balls available
      remainingBeforeShot = TOTAL_BALLS;
    } else if (shotIndex === 1) {
      // Second shot: if first was strike, reset to 10; otherwise use remaining
      const firstBall = frame.ballsPocketed[0];
      remainingBeforeShot = firstBall === TOTAL_BALLS ? TOTAL_BALLS : TOTAL_BALLS - firstBall;
    } else {
      // Third shot: if second was strike OR if spare (first+second = 10), reset to 10; otherwise use remaining
      const firstBall = frame.ballsPocketed[0];
      const secondBall = frame.ballsPocketed[1];
      const isSpare = firstBall + secondBall === TOTAL_BALLS && firstBall !== TOTAL_BALLS;
      
      if (secondBall === TOTAL_BALLS) {
        remainingBeforeShot = TOTAL_BALLS; // Strike on shot 2 resets to 10
      } else if (isSpare) {
        remainingBeforeShot = TOTAL_BALLS; // Spare resets to 10 for bonus shot
      } else {
        // If first was strike, only count second ball; otherwise count both
        const totalAfterFirst = firstBall === TOTAL_BALLS ? 0 : firstBall;
        remainingBeforeShot = TOTAL_BALLS - totalAfterFirst - secondBall;
      }
    }
  } else {
    // Regular frames: calculate remaining from total
    const currentTotal = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);
    remainingBeforeShot = TOTAL_BALLS - currentTotal;
  }

  // Validate: can't pocket more than remaining balls
  if (ballsPocketed > remainingBeforeShot) {
    // Clamp to remaining balls
    ballsPocketed = remainingBeforeShot;
  }

  // Add balls to frame (can be 0 for a miss)
  frame.ballsPocketed = [...frame.ballsPocketed, ballsPocketed];

  const totalBalls = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);

  // Check for strike (all 10 balls on a shot)
  // In 10th frame, can have strikes on shots 1, 2, or 3
  const shotIndex = frame.ballsPocketed.length - 1;
  const isStrikeOnThisShot = ballsPocketed === TOTAL_BALLS;
  
  if (isStrikeOnThisShot && shotIndex === 0) {
    // Strike on first shot
    frame.isStrike = true;
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      // 10th frame: strike on shot 1 allows 2 more shots
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    }
  } else if (isTenthFrame && isStrikeOnThisShot && shotIndex === 1) {
    // Strike on second shot in 10th frame (after first strike)
    // Frame already marked as strike, just check completion
    if (frame.ballsPocketed.length >= 3) {
      frame.isComplete = true;
    }
  } else if (isTenthFrame && isStrikeOnThisShot && shotIndex === 2) {
    // Strike on third shot in 10th frame (after two strikes)
    frame.isComplete = true;
  }
  // Check for spare (all 10 balls in 2 shots, not a strike)
  else if (
    !frame.isStrike &&
    frame.ballsPocketed.length === 2 &&
    totalBalls === TOTAL_BALLS
  ) {
    frame.isSpare = true;
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      // 10th frame: spare allows 1 more shot
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    }
  }
  // Regular frame completion (2 shots, not all 10) - including when second shot is 0
  else if (frame.ballsPocketed.length >= MAX_BALLS_PER_FRAME && !isTenthFrame) {
    frame.isComplete = true;
  }
  // 10th frame: complete after 2 shots if no strike/spare, or 3 shots if strike/spare
  else if (isTenthFrame) {
    if (frame.isStrike || frame.isSpare) {
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    } else if (frame.ballsPocketed.length >= 2) {
      frame.isComplete = true;
    }
  }

  // Calculate frame score (base score, strikes/spares calculated later)
  // For 10th frame with multiple strikes, score is sum of all balls
  frame.score = totalBalls;

  frames[frameIndex] = frame;

  // Update current frame if this one is complete
  let currentFrame = gameState.currentFrame;
  if (frame.isComplete && currentFrame < MAX_FRAMES) {
    currentFrame = frameIndex + 2;
  }

  // Check if game is complete
  const isComplete = frames.every((f) => f.isComplete);

  // Calculate total score with strike/spare bonuses
  const totalScore = calculateTotalScore(frames);

  return {
    frames,
    currentFrame: Math.min(currentFrame, MAX_FRAMES),
    totalScore,
    isComplete,
  };
}

export function calculateTotalScore(frames: Frame[]): number {
  let total = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const isTenthFrame = frame.frameNumber === 10;
    let frameScore = frame.score;

    // For 10th frame, score is just the sum of all balls (no bonus needed)
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
        // Need to look at frame after next
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

export function getRemainingBalls(frame: Frame): number {
  const isTenthFrame = frame.frameNumber === 10;
  
  if (!isTenthFrame) {
    // Regular frames: calculate remaining from total
    const totalPocketed = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);
    return Math.max(0, TOTAL_BALLS - totalPocketed);
  }
  
  // 10th frame: special handling for strikes
  const shotIndex = frame.ballsPocketed.length;
  
  if (shotIndex === 0) {
    // First shot: 10 balls available
    return TOTAL_BALLS;
  } else if (shotIndex === 1) {
    // Second shot: if first was strike, reset to 10; otherwise use remaining
    const firstBall = frame.ballsPocketed[0];
    if (firstBall === TOTAL_BALLS) {
      return TOTAL_BALLS; // Strike resets to 10
    }
    return TOTAL_BALLS - firstBall;
  } else if (shotIndex === 2) {
    // Third shot: if second was strike OR if spare (first+second = 10), reset to 10; otherwise use remaining
    const firstBall = frame.ballsPocketed[0];
    const secondBall = frame.ballsPocketed[1];
    const isSpare = firstBall + secondBall === TOTAL_BALLS && firstBall !== TOTAL_BALLS;
    
    if (secondBall === TOTAL_BALLS) {
      return TOTAL_BALLS; // Strike on shot 2 resets to 10
    }
    
    if (isSpare) {
      return TOTAL_BALLS; // Spare resets to 10 for bonus shot
    }
    
    // If first was strike, only count second ball; otherwise count both
    if (firstBall === TOTAL_BALLS) {
      return TOTAL_BALLS - secondBall;
    }
    return TOTAL_BALLS - firstBall - secondBall;
  }
  
  // Frame complete
  return 0;
}

/**
 * Reconstructs a GameState from saved frame data
 * This allows us to load and edit saved games
 */
export function reconstructGameStateFromFrames(savedFrames: Array<{
  frameNumber: number;
  ballsPocketed: number[];
  score: number;
  isStrike: boolean;
  isSpare: boolean;
}>): GameState {
  const state = createNewGame();
  
  // Sort frames by frame number
  const sortedFrames = [...savedFrames].sort((a, b) => a.frameNumber - b.frameNumber);
  
  // Reconstruct each frame
  for (let i = 0; i < sortedFrames.length && i < MAX_FRAMES; i++) {
    const savedFrame = sortedFrames[i];
    const frameIndex = savedFrame.frameNumber - 1;
    
    if (frameIndex >= 0 && frameIndex < state.frames.length) {
      const frame = state.frames[frameIndex];
      
      // Restore frame data
      frame.ballsPocketed = [...savedFrame.ballsPocketed];
      frame.score = savedFrame.score;
      frame.isStrike = savedFrame.isStrike;
      frame.isSpare = savedFrame.isSpare;
      
      // Determine if frame is complete
      const isTenthFrame = savedFrame.frameNumber === 10;
      
      if (savedFrame.isStrike) {
        frame.isComplete = isTenthFrame ? savedFrame.ballsPocketed.length >= 3 : true;
      } else if (savedFrame.isSpare) {
        frame.isComplete = isTenthFrame ? savedFrame.ballsPocketed.length >= 3 : true;
      } else {
        frame.isComplete = savedFrame.ballsPocketed.length >= 2;
      }
    }
  }
  
  // Determine current frame (first incomplete frame, or 11 if all complete)
  const firstIncompleteIndex = state.frames.findIndex(f => !f.isComplete);
  state.currentFrame = firstIncompleteIndex >= 0 ? firstIncompleteIndex + 1 : MAX_FRAMES + 1;
  
  // Recalculate total score
  state.totalScore = calculateTotalScore(state.frames);
  state.isComplete = state.frames.every(f => f.isComplete);
  
  return state;
}

/**
 * Updates a specific frame's shot data
 * This allows editing frames after they've been scored
 */
export function updateFrameShot(
  gameState: GameState,
  frameIndex: number,
  shotIndex: number,
  newBallCount: number
): GameState {
  const frames = [...gameState.frames];
  const frame = { ...frames[frameIndex] };
  
  // Validate frame and shot indices
  if (frameIndex < 0 || frameIndex >= frames.length) {
    throw new Error(`Invalid frame index: ${frameIndex}`);
  }
  
  if (shotIndex < 0 || shotIndex >= frame.ballsPocketed.length) {
    throw new Error(`Invalid shot index: ${shotIndex}`);
  }
  
  // Validate ball count
  if (newBallCount < 0 || newBallCount > TOTAL_BALLS) {
    throw new Error(`Invalid ball count: ${newBallCount}`);
  }
  
  // Calculate remaining balls before this shot
  const totalBeforeThisShot = frame.ballsPocketed
    .slice(0, shotIndex)
    .reduce((sum, b) => sum + b, 0);
  const remainingBeforeShot = TOTAL_BALLS - totalBeforeThisShot;
  
  // Clamp to remaining balls
  const clampedBalls = Math.min(newBallCount, remainingBeforeShot);
  
  // Update the shot
  const newBallsPocketed = [...frame.ballsPocketed];
  newBallsPocketed[shotIndex] = clampedBalls;
  frame.ballsPocketed = newBallsPocketed;
  
  // Recalculate frame properties
  const totalBalls = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);
  const isTenthFrame = frame.frameNumber === 10;
  const firstBall = frame.ballsPocketed[0] || 0;
  
  // Recalculate strike/spare status
  // Strike is when first ball is 10 (for 10th frame, can have multiple strikes)
  frame.isStrike = firstBall === TOTAL_BALLS;
  frame.isSpare = !frame.isStrike && frame.ballsPocketed.length === 2 && totalBalls === TOTAL_BALLS;
  
  // Recalculate completion status
  if (frame.isStrike) {
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      // 10th frame: need 3 shots if strike
      frame.isComplete = frame.ballsPocketed.length >= 3;
    }
  } else if (frame.isSpare) {
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      // 10th frame: need 3 shots if spare
      frame.isComplete = frame.ballsPocketed.length >= 3;
    }
  } else {
    frame.isComplete = frame.ballsPocketed.length >= 2;
  }
  
  // Recalculate base score
  frame.score = totalBalls;
  
  frames[frameIndex] = frame;
  
  // Recalculate total score
  const totalScore = calculateTotalScore(frames);
  
  // Update current frame
  const firstIncompleteIndex = frames.findIndex(f => !f.isComplete);
  const currentFrame = firstIncompleteIndex >= 0 ? firstIncompleteIndex + 1 : MAX_FRAMES + 1;
  
  return {
    frames,
    currentFrame,
    totalScore,
    isComplete: frames.every(f => f.isComplete),
  };
}

/**
 * Switches the current frame to a specified frame index
 * This allows users to jump to any frame for editing
 */
export function switchToFrame(
  gameState: GameState,
  frameIndex: number
): GameState {
  // Validate frame index
  if (frameIndex < 0 || frameIndex >= gameState.frames.length) {
    return gameState;
  }

  // Only allow switching to frames that have at least one shot
  const targetFrame = gameState.frames[frameIndex];
  if (!targetFrame || targetFrame.ballsPocketed.length === 0) {
    return gameState;
  }

  // Update current frame
  return {
    ...gameState,
    currentFrame: frameIndex + 1,
  };
}

