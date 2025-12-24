/**
 * Strongly typed data contracts for game state serialization
 * Each game type defines its own serialization format
 */

import { BaseGameState } from '../types';

/**
 * Base interface for all game state data
 */
export interface GameStateData {
  gameType: string;
  totalScore: number;
  isComplete: boolean;
  gameData: Record<string, unknown>;
}

/**
 * Bowlliards game state data structure
 */
export interface BowlliardsGameStateData extends GameStateData {
  gameType: 'bowlliards';
  gameData: {
    frames: Array<{
      frameNumber: number;
      ballsPocketed: number[];
      score: number;
      isStrike: boolean;
      isSpare: boolean;
      isComplete: boolean;
    }>;
    currentFrame: number;
  };
}

/**
 * APA 9-Ball game state data structure
 */
export interface APA9BallGameStateData extends GameStateData {
  gameType: 'apa9ball';
  gameData: {
    player1: {
      skillLevel: number;
      targetScore: number;
      ballsMade: number[];
      innings: number;
      defensiveShots: number;
      score: number;
      fouls: number;
      deadBalls: number[];
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
    currentBall: number;
    matchPoints?: {
      player1: number;
      player2: number;
    };
  };
}

/**
 * Type guard to check if data is Bowlliards format
 */
export function isBowlliardsData(data: unknown): data is BowlliardsGameStateData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'gameType' in data &&
    (data as { gameType: unknown }).gameType === 'bowlliards'
  );
}

/**
 * Type guard to check if data is APA 9-Ball format
 */
export function isAPA9BallData(data: unknown): data is APA9BallGameStateData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'gameType' in data &&
    (data as { gameType: unknown }).gameType === 'apa9ball'
  );
}

