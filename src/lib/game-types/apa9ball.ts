// APA 9 ball game type implementation

import { GameType, BaseGameState, ScoreInput, GameTypeMetadata } from './types';

export interface APA9BallGameState extends BaseGameState {
  gameType: 'apa9ball';
  gameData: {
    player1: {
      ballsMade: number[]; // Balls 1-9 pocketed (in order)
      innings: number;
      score: number;
      fouls: number;
    };
    player2: {
      ballsMade: number[];
      innings: number;
      score: number;
      fouls: number;
    };
    currentPlayer: 1 | 2;
    gameStatus: 'in-progress' | 'player1-won' | 'player2-won';
    breakAndRun: boolean;
    nineBallOnBreak: boolean;
    breakPlayer: 1 | 2 | null;
    currentBall: number; // Next ball to be shot (1-9)
  };
}

function createNewAPA9BallGame(): APA9BallGameState {
  return {
    gameType: 'apa9ball',
    totalScore: 0,
    isComplete: false,
    gameData: {
      player1: {
        ballsMade: [],
        innings: 0,
        score: 0,
        fouls: 0,
      },
      player2: {
        ballsMade: [],
        innings: 0,
        score: 0,
        fouls: 0,
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

function checkWinCondition(state: APA9BallGameState, player: 1 | 2): boolean {
  const playerData = state.gameData[player === 1 ? 'player1' : 'player2'];
  // Win if 9-ball is made
  return playerData.ballsMade.includes(9);
}

export const apa9ballGameType: GameType = {
  metadata: {
    id: 'apa9ball',
    name: 'APA 9 Ball',
    description: 'APA 9 ball scoring',
    requiresPayment: false,
    category: 'standard',
  },
  
  createNewGame(): BaseGameState {
    return createNewAPA9BallGame();
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = { ...gameState } as APA9BallGameState;
    const currentPlayerData = state.gameData[state.gameData.currentPlayer === 1 ? 'player1' : 'player2'];
    
    if (input.type === 'ball') {
      const ballNumber = input.ballNumber;
      
      // Handle break (first shot)
      if (state.gameData.breakPlayer === null && state.gameData.player1.innings === 0 && state.gameData.player2.innings === 0) {
        state.gameData.breakPlayer = state.gameData.currentPlayer;
        
        if (ballNumber === 9) {
          // 9-ball on break - win if legal, otherwise re-rack or spot
          state.gameData.nineBallOnBreak = true;
          // For simplicity, we'll count it as a win if made on break
          currentPlayerData.ballsMade.push(9);
          state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
          state.isComplete = true;
          state.gameData.breakAndRun = true;
        } else if (ballNumber >= 1 && ballNumber <= 8) {
          // Regular ball on break
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
          // Update current ball to next in sequence
          state.gameData.currentBall = Math.max(...currentPlayerData.ballsMade) + 1;
          if (state.gameData.currentBall > 9) state.gameData.currentBall = 9;
        }
      } else {
        // Regular play - must shoot balls in order (1-9)
        if (ballNumber === state.gameData.currentBall) {
          // Legal shot - ball made in order
          if (!currentPlayerData.ballsMade.includes(ballNumber)) {
            currentPlayerData.ballsMade.push(ballNumber);
          }
          
          // Update current ball
          if (ballNumber < 9) {
            state.gameData.currentBall = ballNumber + 1;
          }
          
          // Check for win (9-ball made)
          if (ballNumber === 9) {
            state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
            state.isComplete = true;
            
            // Check for break and run
            if (state.gameData.breakPlayer === state.gameData.currentPlayer && 
                state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'].innings === 0) {
              state.gameData.breakAndRun = true;
            }
          }
        } else if (ballNumber === 9 && state.gameData.currentBall === 9) {
          // 9-ball made legally
          if (!currentPlayerData.ballsMade.includes(9)) {
            currentPlayerData.ballsMade.push(9);
          }
          state.gameData.gameStatus = state.gameData.currentPlayer === 1 ? 'player1-won' : 'player2-won';
          state.isComplete = true;
          
          if (state.gameData.breakPlayer === state.gameData.currentPlayer && 
              state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'].innings === 0) {
            state.gameData.breakAndRun = true;
          }
        } else {
          // Wrong ball - this would be a foul in real play
          // For now, just don't count it and switch players
          state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
          currentPlayerData.fouls += 1;
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
    
    // Update total score
    state.totalScore = state.gameData.player1.ballsMade.length + state.gameData.player2.ballsMade.length;
    
    return state;
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as APA9BallGameState;
    // Score is based on balls made
    return state.gameData.player1.ballsMade.length + state.gameData.player2.ballsMade.length;
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as APA9BallGameState;
    return state.gameData.gameStatus !== 'in-progress';
  },
  
  reconstructFromData(data: any): BaseGameState {
    const state = createNewAPA9BallGame();
    if (data.gameData) {
      state.gameData = { ...state.gameData, ...data.gameData };
    }
    return state;
  },
  
  serialize(gameState: BaseGameState): any {
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

