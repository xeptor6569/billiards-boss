// APA 8 ball game type implementation (1v1 match play)

import { GameType, BaseGameState, ScoreInput, GameTypeMetadata } from './types';

export interface APA8BallGameState extends BaseGameState {
  gameType: 'apa8ball';
  gameData: {
    player1: {
      ballsMade: number[]; // Balls 1-7 (solids) or 9-15 (stripes)
      group: 'solids' | 'stripes' | 'unassigned'; // Assigned after break
      eightBallStatus: 'not-shot' | 'on-table' | 'pocketed' | 'scratched';
      innings: number;
      score: number;
      fouls: number;
    };
    player2: {
      ballsMade: number[];
      group: 'solids' | 'stripes' | 'unassigned';
      eightBallStatus: 'not-shot' | 'on-table' | 'pocketed' | 'scratched';
      innings: number;
      score: number;
      fouls: number;
    };
    currentPlayer: 1 | 2;
    gameStatus: 'in-progress' | 'player1-won' | 'player2-won';
    breakAndRun: boolean;
    breakPlayer: 1 | 2 | null; // Who broke
  };
}

function createNewAPA8BallGame(): APA8BallGameState {
  return {
    gameType: 'apa8ball',
    totalScore: 0,
    isComplete: false,
    gameData: {
      player1: {
        ballsMade: [],
        group: 'unassigned',
        eightBallStatus: 'not-shot',
        innings: 0,
        score: 0,
        fouls: 0,
      },
      player2: {
        ballsMade: [],
        group: 'unassigned',
        eightBallStatus: 'not-shot',
        innings: 0,
        score: 0,
        fouls: 0,
      },
      currentPlayer: 1,
      gameStatus: 'in-progress',
      breakAndRun: false,
      breakPlayer: null,
    },
  };
}

function getPlayerBalls(group: 'solids' | 'stripes'): number[] {
  return group === 'solids' ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15];
}

function checkWinCondition(state: APA8BallGameState, player: 1 | 2): boolean {
  const playerData = state.gameData[player === 1 ? 'player1' : 'player2'];
  if (playerData.group === 'unassigned') return false;
  
  const requiredBalls = getPlayerBalls(playerData.group);
  const allBallsMade = requiredBalls.every(ball => playerData.ballsMade.includes(ball));
  
  // Win if all balls made and 8-ball legally pocketed
  return allBallsMade && playerData.eightBallStatus === 'pocketed';
}

function assignGroupAfterBreak(state: APA8BallGameState, ballsMadeOnBreak: number[]): APA8BallGameState {
  // If a ball was made on break, assign groups
  if (ballsMadeOnBreak.length > 0) {
    const firstBall = ballsMadeOnBreak[0];
    if (firstBall >= 1 && firstBall <= 7) {
      // Solids made first
      state.gameData.player1.group = 'solids';
      state.gameData.player2.group = 'stripes';
    } else if (firstBall >= 9 && firstBall <= 15) {
      // Stripes made first
      state.gameData.player1.group = 'stripes';
      state.gameData.player2.group = 'solids';
    }
  }
  return state;
}

export const apa8ballGameType: GameType = {
  metadata: {
    id: 'apa8ball',
    name: 'APA 8 Ball',
    description: 'APA 8 ball match play (1v1)',
    requiresPayment: false,
    category: 'standard',
  },
  
  createNewGame(): BaseGameState {
    return createNewAPA8BallGame();
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = { ...gameState } as APA8BallGameState;
    const currentPlayerData = state.gameData[state.gameData.currentPlayer === 1 ? 'player1' : 'player2'];
    
    if (input.type === 'ball') {
      const ballNumber = input.ballNumber;
      
      // Handle break (first shot)
      if (state.gameData.breakPlayer === null && state.gameData.player1.innings === 0 && state.gameData.player2.innings === 0) {
        state.gameData.breakPlayer = state.gameData.currentPlayer;
        if (ballNumber === 8) {
          // 8-ball on break - re-rack or spot
          // For now, just mark it as on table
          currentPlayerData.eightBallStatus = 'on-table';
        } else if (ballNumber >= 1 && ballNumber <= 15) {
          // Assign groups after first ball made
          assignGroupAfterBreak(state, [ballNumber]);
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
        }
      } else {
        // Regular play
        if (ballNumber === 8) {
          // Check if player can shoot 8-ball (all their balls must be made)
          const requiredBalls = currentPlayerData.group !== 'unassigned' 
            ? getPlayerBalls(currentPlayerData.group)
            : [];
          const allBallsMade = requiredBalls.every(ball => currentPlayerData.ballsMade.includes(ball));
          
          if (allBallsMade) {
            // Legal 8-ball shot
            currentPlayerData.eightBallStatus = 'pocketed';
            state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
            state.isComplete = true;
            
            // Check for break and run
            if (state.gameData.breakPlayer === state.gameData.currentPlayer && 
                state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'].innings === 0) {
              state.gameData.breakAndRun = true;
            }
          } else {
            // 8-ball shot too early - loss of game
            state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player2-won' : 'player1-won';
            state.isComplete = true;
          }
        } else if (ballNumber >= 1 && ballNumber <= 15 && ballNumber !== 8) {
          // Regular ball
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
          
          // Assign group if not assigned and this is first ball after break
          if (currentPlayerData.group === 'unassigned') {
            if (ballNumber >= 1 && ballNumber <= 7) {
              currentPlayerData.group = 'solids';
              state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'].group = 'stripes';
            } else if (ballNumber >= 9 && ballNumber <= 15) {
              currentPlayerData.group = 'stripes';
              state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'].group = 'solids';
            }
          }
        }
      }
    } else if (input.type === 'foul') {
      currentPlayerData.fouls += 1;
      // Switch players after foul
      state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
    }
    
    // Check win condition
    if (!state.isComplete && checkWinCondition(state, state.gameData.currentPlayer)) {
      state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
      state.isComplete = true;
    }
    
    // Update total score (sum of both players' scores)
    state.totalScore = state.gameData.player1.score + state.gameData.player2.score;
    
    return state;
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as APA8BallGameState;
    // For APA 8 ball, score is typically based on balls made
    // Player 1 score = balls made count
    // Player 2 score = balls made count
    return state.gameData.player1.ballsMade.length + state.gameData.player2.ballsMade.length;
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as APA8BallGameState;
    return state.gameData.gameStatus !== 'in-progress';
  },
  
  reconstructFromData(data: any): BaseGameState {
    const state = createNewAPA8BallGame();
    if (data.gameData) {
      state.gameData = { ...state.gameData, ...data.gameData };
    }
    return state;
  },
  
  serialize(gameState: BaseGameState): any {
    const state = gameState as APA8BallGameState;
    return {
      gameType: 'apa8ball',
      gameData: state.gameData,
      totalScore: state.totalScore,
      isComplete: state.isComplete,
    };
  },
  
  getUIComponents(): GameUIComponents {
    return {};
  },
};

