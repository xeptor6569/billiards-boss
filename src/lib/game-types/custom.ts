// Custom game type implementation (YAML-based)

import { GameType, BaseGameState, ScoreInput, GameTypeMetadata, GameUIComponents } from './types';
import { CustomGameConfig } from './custom/schema';
import { parseCustomGameYAML } from './custom/yaml-parser';

export interface CustomGameState extends BaseGameState {
  gameType: 'custom';
  gameData: {
    customGameId: number;
    config: CustomGameConfig;
    state: {
      ballsPocketed: number[];
      currentScore: number;
      innings?: number;
      currentPlayer?: number;
      [key: string]: any; // Additional game-specific state
    };
  };
}

function createNewCustomGame(customGameId: number, config: CustomGameConfig): CustomGameState {
  const initialState: any = {
    ballsPocketed: [],
    currentScore: 0,
  };

  if (config.rules.turnBased) {
    initialState.currentPlayer = 1;
  }
  if (config.rules.scoring.type === 'frames') {
    initialState.innings = 0;
  }

  return {
    gameType: 'custom',
    totalScore: 0,
    isComplete: false,
    gameData: {
      customGameId,
      config,
      state: initialState,
    },
  };
}

function checkWinCondition(state: CustomGameState): boolean {
  const { config, state: gameState } = state.gameData;
  const winCondition = config.rules.winCondition;

  switch (winCondition.type) {
    case 'firstTo':
      return gameState.currentScore >= (winCondition.value || 0);
    case 'highestScore':
      // For highestScore, we'd need to compare with other players
      // For single player, just check if target reached
      return gameState.currentScore >= (winCondition.value || 0);
    case 'allBalls':
      return gameState.ballsPocketed.length >= config.rules.totalBalls;
    case 'mostFrames':
      // Would need frame tracking
      return false;
    default:
      return false;
  }
}

function applySpecialRules(state: CustomGameState, input: ScoreInput): CustomGameState {
  const { config, state: gameStateData } = state.gameData;
  
  if (!config.rules.specialRules) {
    return state;
  }

  const newState = { ...state };
  let scoreDelta = 0;

  for (const rule of config.rules.specialRules) {
    let applies = false;

    // Check if rule condition applies
    switch (rule.condition) {
      case 'allBalls':
        applies = gameStateData.ballsPocketed.length >= config.rules.totalBalls;
        break;
      case 'scratch':
        // Would need to detect scratch from input
        applies = input.type === 'foul';
        break;
      // Add more conditions as needed
    }

    if (applies) {
      switch (rule.type) {
        case 'foul':
        case 'penalty':
          scoreDelta -= (rule.value || 0);
          break;
        case 'bonus':
          scoreDelta += (rule.value || 0);
          break;
        case 'reset':
          // Reset some state
          newState.gameData.state.ballsPocketed = [];
          break;
      }
    }
  }

  if (scoreDelta !== 0) {
    newState.gameData.state.currentScore = Math.max(0, gameStateData.currentScore + scoreDelta);
    newState.totalScore = newState.gameData.state.currentScore;
  }

  return newState;
}

export const customGameType: GameType = {
  metadata: {
    id: 'custom',
    name: 'Custom Game',
    description: 'User-defined custom game via YAML',
    requiresPayment: true,
    category: 'custom',
  },
  
  createNewGame(): BaseGameState {
    // This should be called with custom game config via createCustomGame helper
    throw new Error('Custom games must be created with a custom game ID and config. Use createCustomGame() helper.');
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = { ...gameState } as CustomGameState;
    const { config, state: gameStateData } = state.gameData;

    if (input.type === 'balls') {
      // Add balls to pocketed list
      const ballsToAdd = Array.from({ length: input.count }, (_, i) => {
        // For simplicity, assign sequential numbers
        // In a real implementation, you'd track which specific balls
        return gameStateData.ballsPocketed.length + i + 1;
      });
      state.gameData.state.ballsPocketed = [...gameStateData.ballsPocketed, ...ballsToAdd];

      // Update score based on scoring type
      if (config.rules.scoring.type === 'points') {
        const pointsPerBall = config.rules.scoring.pointsPerBall || 1;
        state.gameData.state.currentScore += input.count * pointsPerBall;
      } else if (config.rules.scoring.type === 'frames') {
        // Frame-based scoring would need different logic
        state.gameData.state.currentScore += input.count;
      }

      state.totalScore = state.gameData.state.currentScore;

      // Apply special rules
      const stateWithRules = applySpecialRules(state, input);
      
      // Check win condition
      if (checkWinCondition(stateWithRules)) {
        stateWithRules.isComplete = true;
      }

      // Handle turn-based games
      if (config.rules.turnBased && input.type === 'balls') {
        const maxPlayers = config.rules.maxPlayers || 2;
        stateWithRules.gameData.state.currentPlayer = 
          ((stateWithRules.gameData.state.currentPlayer || 1) % maxPlayers) + 1;
      }

      return stateWithRules;
    } else if (input.type === 'foul') {
      return applySpecialRules(state, input);
    } else if (input.type === 'custom') {
      // Handle custom input types
      return applySpecialRules(state, input);
    }

    return state;
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as CustomGameState;
    return state.totalScore;
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as CustomGameState;
    return checkWinCondition(state) || state.isComplete;
  },
  
  reconstructFromData(data: any): BaseGameState {
    // If config is a string (YAML), parse it
    let config = data.gameData?.config;
    if (typeof config === 'string') {
      const parsed = parseCustomGameYAML(config);
      if (parsed.error || !parsed.config) {
        throw new Error(`Failed to parse custom game config: ${parsed.error}`);
      }
      config = parsed.config;
    }

    const state: CustomGameState = {
      gameType: 'custom',
      totalScore: data.totalScore || 0,
      isComplete: data.isComplete || false,
      gameData: {
        customGameId: data.gameData?.customGameId || 0,
        config: config || {} as CustomGameConfig,
        state: data.gameData?.state || {
          ballsPocketed: [],
          currentScore: 0,
        },
      },
    };
    return state;
  },
  
  serialize(gameState: BaseGameState): any {
    const state = gameState as CustomGameState;
    return {
      gameType: 'custom',
      gameData: state.gameData,
      totalScore: state.totalScore,
      isComplete: state.isComplete,
    };
  },
  
  getUIComponents(): GameUIComponents {
    return {};
  },
};

// Helper to create custom game with config
export function createCustomGame(customGameId: number, config: CustomGameConfig | string): CustomGameState {
  let parsedConfig: CustomGameConfig;
  
  if (typeof config === 'string') {
    const parsed = parseCustomGameYAML(config);
    if (parsed.error || !parsed.config) {
      throw new Error(`Failed to parse custom game config: ${parsed.error}`);
    }
    parsedConfig = parsed.config;
  } else {
    parsedConfig = config;
  }
  
  return createNewCustomGame(customGameId, parsedConfig);
}

