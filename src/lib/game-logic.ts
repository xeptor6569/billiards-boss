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

  // Validate ball count
  if (ballsPocketed < 0 || ballsPocketed > TOTAL_BALLS) {
    throw new Error(`Invalid ball count: ${ballsPocketed}`);
  }

  // Check if frame is already complete
  if (frame.isComplete) {
    return gameState;
  }

  // Add balls to frame
  frame.ballsPocketed = [...frame.ballsPocketed, ballsPocketed];

  const isTenthFrame = frame.frameNumber === 10;
  const firstBall = frame.ballsPocketed[0] || 0;
  const secondBall = frame.ballsPocketed[1] || 0;
  const totalBalls = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);

  // Check for strike (all 10 balls on first shot)
  if (firstBall === TOTAL_BALLS && frame.ballsPocketed.length === 1) {
    frame.isStrike = true;
    if (!isTenthFrame) {
      frame.isComplete = true;
    } else {
      // 10th frame: strike allows 2 more shots
      if (frame.ballsPocketed.length >= 3) {
        frame.isComplete = true;
      }
    }
  }
  // Check for spare (all 10 balls in 2 shots)
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
  // Regular frame completion (2 shots, not all 10)
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

function calculateTotalScore(frames: Frame[]): number {
  let total = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    let frameScore = frame.score;

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
  const totalPocketed = frame.ballsPocketed.reduce((sum, b) => sum + b, 0);
  return Math.max(0, TOTAL_BALLS - totalPocketed);
}

