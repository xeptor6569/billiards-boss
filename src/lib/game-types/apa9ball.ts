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

export interface APA9BallRack {
  rackNumber: number;
  breakPlayer: 1 | 2;
  player1Balls: number[]; // Balls made by player 1 in this rack
  player2Balls: number[]; // Balls made by player 2 in this rack
  player1Innings: number; // Innings for player 1 in this rack
  player2Innings: number; // Innings for player 2 in this rack
  player1Fouls: number; // Fouls for player 1 in this rack
  player2Fouls: number; // Fouls for player 2 in this rack
  player1DefensiveShots: number; // Defensive shots for player 1 in this rack
  player2DefensiveShots: number; // Defensive shots for player 2 in this rack
  nineBallOnBreak: boolean; // Whether 9-ball was made on break
  completedAt?: Date; // When the rack was completed
}

export interface APA9BallGameState extends BaseGameState {
  gameType: 'apa9ball';
  gameData: {
    player1: {
      skillLevel: number; // 1-9
      targetScore: number;
      ballsMade: number[]; // Balls 1-9 pocketed (current rack + all previous racks)
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
    currentRack: number; // Current rack number (1-based)
    racks: APA9BallRack[]; // History of completed racks
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
      currentRack: 1, // Start with rack 1
      racks: [], // No completed racks yet
    },
  };
}

// Calculate score for a player based on balls made
function calculatePlayerScore(ballsMade: number[]): number {
  return ballsMade.reduce((total, ball) => {
    return total + (BALL_POINT_VALUES[ball] || 0);
  }, 0);
}

// Calculate cumulative score from all racks for a player
function calculateCumulativeScore(state: APA9BallGameState, player: 1 | 2): number {
  const playerData = state.gameData[player === 1 ? 'player1' : 'player2'];
  // Score from current rack
  const currentRackScore = calculatePlayerScore(playerData.ballsMade);
  // Score from all completed racks
  const completedRacksScore = state.gameData.racks.reduce((total, rack) => {
    const rackBalls = player === 1 ? rack.player1Balls : rack.player2Balls;
    return total + calculatePlayerScore(rackBalls);
  }, 0);
  return completedRacksScore + currentRackScore;
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
          // Update score to include current rack + all completed racks
          currentPlayerData.score = calculateCumulativeScore(state, state.gameData.currentPlayer);
          
          // Check if this wins the game FIRST (before resetting rack)
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
          } else {
            // Check if all balls are pocketed (new rack)
            const allBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
            if (allBallsMade.length === 9) {
              // All balls pocketed but game not won - save current rack to history
              // BUT don't reset yet - wait for user to click "Start New Rack"
              // Check if this rack has already been saved (to avoid duplicate saves)
              const lastRack = state.gameData.racks.length > 0 
                ? state.gameData.racks[state.gameData.racks.length - 1]
                : null;
              const rackAlreadySaved = lastRack && lastRack.rackNumber === state.gameData.currentRack;
              
              if (!rackAlreadySaved) {
                // Calculate cumulative scores BEFORE adding rack to array (to avoid double-counting)
                const player1ScoreBeforeSave = calculateCumulativeScore(state, 1);
                const player2ScoreBeforeSave = calculateCumulativeScore(state, 2);
                
                // Save the completed rack to history (but don't reset ballsMade yet)
                const completedRack: APA9BallRack = {
                  rackNumber: state.gameData.currentRack,
                  breakPlayer: state.gameData.breakPlayer || state.gameData.currentPlayer,
                  player1Balls: [...state.gameData.player1.ballsMade],
                  player2Balls: [...state.gameData.player2.ballsMade],
                  player1Innings: state.gameData.player1.innings,
                  player2Innings: state.gameData.player2.innings,
                  player1Fouls: state.gameData.player1.fouls,
                  player2Fouls: state.gameData.player2.fouls,
                  player1DefensiveShots: state.gameData.player1.defensiveShots,
                  player2DefensiveShots: state.gameData.player2.defensiveShots,
                  nineBallOnBreak: state.gameData.nineBallOnBreak,
                  completedAt: new Date(),
                };
                state.gameData.racks.push(completedRack);
                
                // The player who made the 9-ball will break the next rack (set breakPlayer, but don't reset yet)
                const nineBallMaker = state.gameData.currentPlayer;
                state.gameData.breakPlayer = nineBallMaker;
                // Keep currentPlayer the same for now - will be set when "Start New Rack" is clicked
                
                // Don't reset ballsMade, currentBall, or currentRack yet - wait for "Start New Rack" action
                // Scores are already calculated correctly from cumulative function
              }
            }
          }
        } else if (ballNumber >= 1 && ballNumber <= 8) {
          // Regular ball on break
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
          // Update score to include current rack + all completed racks
          currentPlayerData.score = calculateCumulativeScore(state, state.gameData.currentPlayer);
          
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
          // Update score to include current rack + all completed racks
          currentPlayerData.score = calculateCumulativeScore(state, state.gameData.currentPlayer);
          
          // Update current ball
          const newAllBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
          const newRemainingBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => !newAllBallsMade.includes(b));
          state.gameData.currentBall = newRemainingBalls.length > 0 ? Math.min(...newRemainingBalls) : 9;
          
          // Check for win condition FIRST (before resetting rack)
          // This must happen before clearing ballsMade arrays
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
          } else if (newAllBallsMade.length === 9) {
            // All balls pocketed but game not won - save current rack to history
            // BUT don't reset yet - wait for user to click "Start New Rack"
            // Check if this rack has already been saved (to avoid duplicate saves)
            const lastRack = state.gameData.racks.length > 0 
              ? state.gameData.racks[state.gameData.racks.length - 1]
              : null;
            const rackAlreadySaved = lastRack && lastRack.rackNumber === state.gameData.currentRack;
            
            if (!rackAlreadySaved) {
              // Calculate cumulative scores BEFORE adding rack to array (to avoid double-counting)
              const player1ScoreBeforeSave = calculateCumulativeScore(state, 1);
              const player2ScoreBeforeSave = calculateCumulativeScore(state, 2);
              
              // Save the completed rack to history (but don't reset ballsMade yet)
              const completedRack: APA9BallRack = {
                rackNumber: state.gameData.currentRack,
                breakPlayer: state.gameData.breakPlayer || state.gameData.currentPlayer,
                player1Balls: [...state.gameData.player1.ballsMade],
                player2Balls: [...state.gameData.player2.ballsMade],
                player1Innings: state.gameData.player1.innings,
                player2Innings: state.gameData.player2.innings,
                player1Fouls: state.gameData.player1.fouls,
                player2Fouls: state.gameData.player2.fouls,
                player1DefensiveShots: state.gameData.player1.defensiveShots,
                player2DefensiveShots: state.gameData.player2.defensiveShots,
                nineBallOnBreak: state.gameData.nineBallOnBreak,
                completedAt: new Date(),
              };
              state.gameData.racks.push(completedRack);
              
              // The player who made the 9-ball will break the next rack (set breakPlayer, but don't reset yet)
              const nineBallMaker = state.gameData.currentPlayer;
              state.gameData.breakPlayer = nineBallMaker;
              // Keep currentPlayer the same for now - will be set when "Start New Rack" is clicked
              
              // Don't reset ballsMade, currentBall, or currentRack yet - wait for "Start New Rack" action
              // Scores are already calculated correctly from cumulative function
            }
            // Note: breakAndRun is only for winning the entire match, not a single rack
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
      // Handle custom inputs like 'endTurn', 'defensiveShot', 'startNewRack', etc.
      if (input.data?.action === 'endTurn') {
        // End current player's turn, switch to other player
        state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
        otherPlayerData.innings += 1;
      } else if (input.data?.action === 'startNewRack') {
        // Manually start a new rack - reset balls and start fresh rack
        // The rack should already be saved when all 9 balls were made
        // Check if all 9 balls are pocketed
        const allBallsMade = [...new Set([...state.gameData.player1.ballsMade, ...state.gameData.player2.ballsMade])];
        if (allBallsMade.length === 9) {
          // Calculate cumulative scores BEFORE resetting (to avoid double-counting)
          const player1ScoreBeforeReset = calculateCumulativeScore(state, 1);
          const player2ScoreBeforeReset = calculateCumulativeScore(state, 2);
          
          // The current player breaks the next rack (stay on current player)
          const currentPlayer = state.gameData.currentPlayer;
          state.gameData.breakPlayer = currentPlayer;
          // Keep currentPlayer the same (don't switch)
          
          // Reset current rack balls (keep cumulative scores, innings, etc.)
          state.gameData.player1.ballsMade = [];
          state.gameData.player2.ballsMade = [];
          state.gameData.currentBall = 1;
          state.gameData.nineBallOnBreak = false;
          state.gameData.currentRack += 1;
          
          // Restore cumulative scores (they should persist across racks)
          state.gameData.player1.score = player1ScoreBeforeReset;
          state.gameData.player2.score = player2ScoreBeforeReset;
        }
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
      
      // Ensure racks array exists (for backward compatibility)
      if (!state.gameData.racks) {
        state.gameData.racks = [];
      }
      if (!state.gameData.currentRack) {
        state.gameData.currentRack = state.gameData.racks.length + 1;
      }
      
      // Recalculate scores from all racks (cumulative)
      state.gameData.player1.score = calculateCumulativeScore(state, 1);
      state.gameData.player2.score = calculateCumulativeScore(state, 2);
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

