// Core types for the multi-game type system

/**
 * Base game state interface - each game type will extend this
 */
export interface BaseGameState {
  gameType: string;
  totalScore: number;
  isComplete: boolean;
  // Store game-specific data as JSON
  gameData: Record<string, any>;
}

/**
 * Score input - varies by game type
 */
export type ScoreInput = 
  | { type: 'balls'; count: number }
  | { type: 'ball'; ballNumber: number }
  | { type: 'ballsArray'; ballNumbers: number[] } // Array of balls for combination shots
  | { type: 'foul'; penalty?: number; ballNumbers?: number[] } // Foul with optional balls made (dead balls)
  | { type: 'custom'; data: Record<string, any> };

/**
 * UI component requirements for each game type
 * Components will be loaded dynamically, so we use string paths or component factories
 */
export interface GameUIComponents {
  header?: string | React.ComponentType<any>;
  scoreDisplay?: string | React.ComponentType<any>;
  inputControls?: string | React.ComponentType<any>;
  visualizer?: string | React.ComponentType<any>;
  summary?: string | React.ComponentType<any>;
}

/**
 * Game type metadata
 */
export interface GameTypeMetadata {
  id: string;
  name: string;
  description: string;
  requiresPayment: boolean;
  icon?: string;
  category: 'standard' | 'custom';
}

/**
 * Game type interface - all game types must implement this
 */
export interface GameType {
  metadata: GameTypeMetadata;
  
  /**
   * Create a new game state
   */
  createNewGame(): BaseGameState;
  
  /**
   * Add a score/input to the game
   */
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState;
  
  /**
   * Calculate the current total score
   */
  calculateScore(gameState: BaseGameState): number;
  
  /**
   * Check if the game is complete
   */
  isComplete(gameState: BaseGameState): boolean;
  
  /**
   * Get remaining balls/points/etc available
   */
  getRemaining?(gameState: BaseGameState): number;
  
  /**
   * Reconstruct game state from saved data
   */
  reconstructFromData(data: any): BaseGameState;
  
  /**
   * Serialize game state for storage
   */
  serialize(gameState: BaseGameState): any;
  
  /**
   * Get UI components for this game type
   */
  getUIComponents(): GameUIComponents;
}

