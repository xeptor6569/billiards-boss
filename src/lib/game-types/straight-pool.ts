// Straight pool game type implementation

import { GameType, BaseGameState, ScoreInput, GameTypeMetadata, GameUIComponents } from './types';

export interface StraightPoolGameState extends BaseGameState {
  gameType: 'straight-pool';
  gameData: {
    points: number; // Total points (balls pocketed)
    innings: number;
    currentRun: number; // Current consecutive balls
    highRun: number; // Highest consecutive balls in current run
    bestRun: number; // Best run of the game
    ballsRemaining: number; // Balls on table (starts at 15)
    rackNumber: number; // Current rack number
    targetScore?: number; // Optional target score (game ends when reached)
  };
}

function createNewStraightPoolGame(targetScore?: number): StraightPoolGameState {
  return {
    gameType: 'straight-pool',
    totalScore: 0,
    isComplete: false,
    gameData: {
      points: 0,
      innings: 0,
      currentRun: 0,
      highRun: 0,
      bestRun: 0,
      ballsRemaining: 15,
      rackNumber: 1,
      targetScore,
    },
  };
}

function checkWinCondition(state: StraightPoolGameState): boolean {
  if (state.gameData.targetScore) {
    return state.gameData.points >= state.gameData.targetScore;
  }
  // If no target score, game continues until manually ended
  return state.isComplete;
}

export const straightPoolGameType: GameType = {
  metadata: {
    id: 'straight-pool',
    name: 'Straight Pool',
    description: 'Straight pool (14.1 continuous) scoring',
    requiresPayment: false,
    category: 'standard',
  },
  
  createNewGame(): BaseGameState {
    return createNewStraightPoolGame();
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = { ...gameState } as StraightPoolGameState;
    
    if (input.type === 'balls') {
      const ballsPocketed = input.count;
      
      // Add points (each ball = 1 point)
      state.gameData.points += ballsPocketed;
      state.gameData.ballsRemaining -= ballsPocketed;
      state.gameData.currentRun += ballsPocketed;
      
      // Update high run
      if (state.gameData.currentRun > state.gameData.highRun) {
        state.gameData.highRun = state.gameData.currentRun;
      }
      
      // Update best run
      if (state.gameData.currentRun > state.gameData.bestRun) {
        state.gameData.bestRun = state.gameData.currentRun;
      }
      
      // If all balls are pocketed, re-rack (except cue ball)
      if (state.gameData.ballsRemaining <= 0) {
        state.gameData.ballsRemaining = 14; // Re-rack 14 balls (cue ball stays)
        state.gameData.rackNumber += 1;
        // Reset current run when re-racking (optional rule - some continue the run)
        // state.gameData.currentRun = 0;
      }
      
      // Check win condition
      if (checkWinCondition(state)) {
        state.isComplete = true;
      }
      
      state.totalScore = state.gameData.points;
    } else if (input.type === 'foul') {
      // Foul ends the run
      state.gameData.currentRun = 0;
      state.gameData.innings += 1;
    } else if (input.type === 'custom' && input.data.type === 'miss') {
      // Miss ends the run
      state.gameData.currentRun = 0;
      state.gameData.innings += 1;
    } else if (input.type === 'custom' && input.data.type === 'end-game') {
      // Manually end game
      state.isComplete = true;
    }
    
    return state;
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as StraightPoolGameState;
    return state.gameData.points;
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as StraightPoolGameState;
    return checkWinCondition(state);
  },
  
  getRemaining(gameState: BaseGameState): number {
    const state = gameState as StraightPoolGameState;
    return state.gameData.ballsRemaining;
  },
  
  reconstructFromData(data: any): BaseGameState {
    const state = createNewStraightPoolGame();
    if (data.gameData) {
      state.gameData = { ...state.gameData, ...data.gameData };
    }
    return state;
  },
  
  serialize(gameState: BaseGameState): any {
    const state = gameState as StraightPoolGameState;
    return {
      gameType: 'straight-pool',
      gameData: state.gameData,
      totalScore: state.totalScore,
      isComplete: state.isComplete,
    };
  },
  
  getUIComponents(): GameUIComponents {
    return {};
  },
};

