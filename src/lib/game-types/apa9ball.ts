// APA 9 ball game type implementation

import { GameType, BaseGameState, ScoreInput, GameUIComponents } from './types';

// Skill level target scores (The Equalizer® system)
export const SKILL_LEVEL_TARGETS: Record<number, number> = {
  1: 14,
  2: 19,
  3: 25,
  4: 31,
  5: 38,
  6: 46,
  7: 55,
  8: 65,
  9: 75,
};

// Point values: Balls 1-8 = 1 point, Ball 9 = 2 points
export const BALL_POINT_VALUES: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 2,
};

export interface APA9BallGameState extends BaseGameState {
  gameType: 'apa9ball';
  gameData: {
    player1: {
      skillLevel: number; // 1-9
      targetScore: number;
      ballsMade: number[]; // Balls 1-9 pocketed
      innings: number;
      defensiveShots: number;
      score: number; // Calculated: (balls 1-8 × 1) + (9-balls × 2)
      fouls: number;
      deadBalls: number[]; // Balls pocketed on fouls
    };
    player2: {
      skillLevel: number;
      targetScore: number;
      ballsMade: number[];
      innings: number;
      defensiveShots: number;
      score: number;
      fouls: number;
      deadBalls: number[];
    };
    currentPlayer: 1 | 2;
    gameStatus: 'in-progress' | 'player1-won' | 'player2-won';
    breakAndRun: boolean;
    nineBallOnBreak: boolean;
    breakPlayer: 1 | 2 | null;
    currentBall: number; // Lowest numbered ball on table (1-9)
    matchPoints?: {
      player1: number;
      player2: number;
    };
  };
}

function createNewAPA9BallGame(player1SkillLevel: number = 3, player2SkillLevel: number = 3): APA9BallGameState {
  const player1Target = SKILL_LEVEL_TARGETS[player1SkillLevel] || SKILL_LEVEL_TARGETS[3];
  const player2Target = SKILL_LEVEL_TARGETS[player2SkillLevel] || SKILL_LEVEL_TARGETS[3];
  
  return {
    gameType: 'apa9ball',
    totalScore: 0,
    isComplete: false,
    gameData: {
      player1: {
        skillLevel: player1SkillLevel,
        targetScore: player1Target,
        ballsMade: [],
        innings: 0,
        defensiveShots: 0,
        score: 0,
        fouls: 0,
        deadBalls: [],
      },
      player2: {
        skillLevel: player2SkillLevel,
        targetScore: player2Target,
        ballsMade: [],
        innings: 0,
        defensiveShots: 0,
        score: 0,
        fouls: 0,
        deadBalls: [],
      },
      currentPlayer: 1,
      gameStatus: 'in-progress',
      breakAndRun: false,
      nineBallOnBreak: false,
      breakPlayer: null,
      currentBall: 1, // Start with ball 1
    },
  };
}

// Calculate score for a player based on balls made
function calculatePlayerScore(ballsMade: number[]): number {
  return ballsMade.reduce((total, ball) => {
    return total + (BALL_POINT_VALUES[ball] || 0);
  }, 0);
}

// Calculate match points (simplified version - full APA chart can be added later)
function calculateMatchPoints(
  player1Score: number,
  player1Target: number,
  player2Score: number,
  player2Target: number
): { player1: number; player2: number } {
  const player1Won = player1Score >= player1Target;
  const player2Won = player2Score >= player2Target;
  
  if (player1Won && !player2Won) {
    // Player 1 won
    const scoreDiff = player1Score - player2Score;
    // Simplified: winner gets 10-20 points based on margin
    // Full APA chart would be more complex
    const winnerPoints = Math.min(20, Math.max(10, 15 + Math.floor(scoreDiff / 5)));
    return { player1: winnerPoints, player2: 20 - winnerPoints };
  } else if (player2Won && !player1Won) {
    // Player 2 won
    const scoreDiff = player2Score - player1Score;
    const winnerPoints = Math.min(20, Math.max(10, 15 + Math.floor(scoreDiff / 5)));
    return { player1: 20 - winnerPoints, player2: winnerPoints };
  } else {
    // Both reached target or game ended differently - split points
    return { player1: 10, player2: 10 };
  }
}

function checkWinCondition(state: APA9BallGameState, player: 1 | 2): boolean {
  const playerData = state.gameData[player === 1 ? 'player1' : 'player2'];
  // Win if player reaches their target score
  return playerData.score >= playerData.targetScore;
}

export const apa9ballGameType: GameType = {
  metadata: {
    id: 'apa9ball',
    name: 'APA 9 Ball',
    description: 'APA 9 ball scoring with The Equalizer® handicap system',
    requiresPayment: false,
    category: 'standard',
  },
  
  createNewGame(...args: unknown[]): BaseGameState {
    // args[0] = player1SkillLevel, args[1] = player2SkillLevel
    const player1SL = (typeof args[0] === 'number' ? args[0] : 3) || 3;
    const player2SL = (typeof args[1] === 'number' ? args[1] : 3) || 3;
    return createNewAPA9BallGame(player1SL, player2SL);
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = { ...gameState } as APA9BallGameState;
    const currentPlayerData = state.gameData[state.gameData.currentPlayer === 1 ? 'player1' : 'player2'];
    const otherPlayerData = state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'];
    
    if (input.type === 'ball') {
      const ballNumber = input.ballNumber;
      
      // Validate ball number
      if (ballNumber < 1 || ballNumber > 9) {
        return state;
      }
      
      // Handle break (first shot of the game)
      if (state.gameData.breakPlayer === null && state.gameData.player1.innings === 0 && state.gameData.player2.innings === 0) {
        state.gameData.breakPlayer = state.gameData.currentPlayer;
        currentPlayerData.innings = 1; // Break counts as first inning
        
        if (ballNumber === 9) {
          // 9-ball on break - win if legal
          state.gameData.nineBallOnBreak = true;
          if (!currentPlayerData.ballsMade.includes(9)) {
            currentPlayerData.ballsMade.push(9);
          }
          currentPlayerData.score = calculatePlayerScore(currentPlayerData.ballsMade);
          
          // Check if all balls are pocketed (new rack)
          const allBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
          if (allBallsMade.length === 9) {
            // All balls pocketed - start new rack
            const nineBallMaker = state.gameData.currentPlayer;
            state.gameData.breakPlayer = nineBallMaker;
            state.gameData.currentPlayer = nineBallMaker;
            state.gameData.player1.ballsMade = [];
            state.gameData.player2.ballsMade = [];
            state.gameData.currentBall = 1;
            state.gameData.nineBallOnBreak = false;
          } else {
            // Check if this wins the game
            if (checkWinCondition(state, state.gameData.currentPlayer)) {
              state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
              state.isComplete = true;
              state.gameData.breakAndRun = true;
              state.gameData.matchPoints = calculateMatchPoints(
                state.gameData.player1.score,
                state.gameData.player1.targetScore,
                state.gameData.player2.score,
                state.gameData.player2.targetScore
              );
            }
          }
        } else if (ballNumber >= 1 && ballNumber <= 8) {
          // Regular ball on break
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
          currentPlayerData.score = calculatePlayerScore(currentPlayerData.ballsMade);
          
          // Update current ball to next lowest on table
          const allBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
          const remainingBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => !allBallsMade.includes(b));
          state.gameData.currentBall = remainingBalls.length > 0 ? Math.min(...remainingBalls) : 9;
        }
      } else {
        // Regular play - must hit lowest-numbered ball first
        const allBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
        const remainingBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => !allBallsMade.includes(b));
        const lowestBall = remainingBalls.length > 0 ? Math.min(...remainingBalls) : 9;
        
        // Check if this is a legal shot (hitting the lowest ball)
        if (ballNumber === lowestBall || (ballNumber === 9 && lowestBall === 9)) {
          // Legal shot - ball made
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
          currentPlayerData.score = calculatePlayerScore(currentPlayerData.ballsMade);
          
          // Update current ball
          const newAllBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
          const newRemainingBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => !newAllBallsMade.includes(b));
          state.gameData.currentBall = newRemainingBalls.length > 0 ? Math.min(...newRemainingBalls) : 9;
          
          // Check if all balls are pocketed (new rack needed)
          const newAllBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
          if (newAllBallsMade.length === 9) {
            // All balls pocketed - start new rack
            // The player who made the 9-ball breaks the next rack
            const nineBallMaker = state.gameData.currentPlayer;
            state.gameData.breakPlayer = nineBallMaker;
            state.gameData.currentPlayer = nineBallMaker;
            
            // Reset balls (keep scores, innings, etc.)
            state.gameData.player1.ballsMade = [];
            state.gameData.player2.ballsMade = [];
            state.gameData.currentBall = 1;
            state.gameData.nineBallOnBreak = false;
            // Note: breakAndRun is only for winning the entire match, not a single rack
          }
          
          // Check for win condition (reached target score)
          if (checkWinCondition(state, state.gameData.currentPlayer)) {
            state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
            state.isComplete = true;
            
            // Check for break and run
            if (state.gameData.breakPlayer === state.gameData.currentPlayer && 
                otherPlayerData.innings === 0) {
              state.gameData.breakAndRun = true;
            }
            
            // Calculate match points
            state.gameData.matchPoints = calculateMatchPoints(
              state.gameData.player1.score,
              state.gameData.player1.targetScore,
              state.gameData.player2.score,
              state.gameData.player2.targetScore
            );
          }
        } else {
          // Illegal shot - foul (wrong ball)
          currentPlayerData.fouls += 1;
          // Switch players after foul
          state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
          // Increment inning for the other player
          otherPlayerData.innings += 1;
        }
      }
    } else if (input.type === 'foul') {
      currentPlayerData.fouls += 1;
      // Switch players after foul
      state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
      // Increment inning for the other player
      otherPlayerData.innings += 1;
    } else if (input.type === 'custom') {
      // Handle custom inputs like 'endTurn', 'defensiveShot', etc.
      if (input.data?.action === 'endTurn') {
        // End current player's turn, switch to other player
        state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
        otherPlayerData.innings += 1;
      } else if (input.data?.action === 'defensiveShot') {
        // Mark defensive shot
        currentPlayerData.defensiveShots += 1;
      }
    }
    
    // Update total score (sum of both players)
    state.totalScore = state.gameData.player1.score + state.gameData.player2.score;
    
    return state;
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as APA9BallGameState;
    // Return total score (sum of both players' scores)
    return state.gameData.player1.score + state.gameData.player2.score;
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as APA9BallGameState;
    return state.gameData.gameStatus !== 'in-progress';
  },
  
  reconstructFromData(data: Record<string, unknown>): BaseGameState {
    const gameData = data.gameData as Record<string, unknown> | undefined;
    const player1SL = (gameData?.player1 as Record<string, unknown>)?.skillLevel as number || 3;
    const player2SL = (gameData?.player2 as Record<string, unknown>)?.skillLevel as number || 3;
    const state = createNewAPA9BallGame(player1SL, player2SL);
    if (gameData) {
      // Merge game data, ensuring scores are recalculated
      state.gameData = { ...state.gameData, ...gameData } as typeof state.gameData;
      // Recalculate scores in case they're missing
      const player1Balls = (state.gameData.player1.ballsMade || []) as number[];
      const player2Balls = (state.gameData.player2.ballsMade || []) as number[];
      state.gameData.player1.score = calculatePlayerScore(player1Balls);
      state.gameData.player2.score = calculatePlayerScore(player2Balls);
    }
    if (typeof data.totalScore === 'number') state.totalScore = data.totalScore;
    if (typeof data.isComplete === 'boolean') state.isComplete = data.isComplete;
    return state;
  },
  
  serialize(gameState: BaseGameState): Record<string, unknown> {
    const state = gameState as APA9BallGameState;
    return {
      gameType: 'apa9ball',
      gameData: state.gameData,
      totalScore: state.totalScore,
      isComplete: state.isComplete,
    };
  },
  
  getUIComponents(): GameUIComponents {
    return {};
  },
};

