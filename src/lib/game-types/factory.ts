// Game type factory for creating and managing game instances

import { GameType, BaseGameState } from './types';
import { getGameType } from './index';

/**
 * Create a new game of the specified type
 */
export function createGame(gameTypeId: string): BaseGameState {
  const gameType = getGameType(gameTypeId);
  if (!gameType) {
    throw new Error(`Unknown game type: ${gameTypeId}`);
  }
  return gameType.createNewGame();
}

/**
 * Add score to a game
 */
export function addScoreToGame(
  gameState: BaseGameState,
  input: any
): BaseGameState {
  const gameType = getGameType(gameState.gameType);
  if (!gameType) {
    throw new Error(`Unknown game type: ${gameState.gameType}`);
  }
  return gameType.addScore(gameState, input);
}

/**
 * Calculate score for a game
 */
export function calculateGameScore(gameState: BaseGameState): number {
  const gameType = getGameType(gameState.gameType);
  if (!gameType) {
    throw new Error(`Unknown game type: ${gameState.gameType}`);
  }
  return gameType.calculateScore(gameState);
}

/**
 * Check if game is complete
 */
export function isGameComplete(gameState: BaseGameState): boolean {
  const gameType = getGameType(gameState.gameType);
  if (!gameType) {
    throw new Error(`Unknown game type: ${gameState.gameType}`);
  }
  return gameType.isComplete(gameState);
}

/**
 * Reconstruct game state from saved data
 */
export function reconstructGameState(data: {
  gameType: string;
  [key: string]: any;
}): BaseGameState {
  const gameType = getGameType(data.gameType);
  if (!gameType) {
    throw new Error(`Unknown game type: ${data.gameType}`);
  }
  return gameType.reconstructFromData(data);
}

/**
 * Serialize game state for storage
 */
export function serializeGameState(gameState: BaseGameState): any {
  const gameType = getGameType(gameState.gameType);
  if (!gameType) {
    throw new Error(`Unknown game type: ${gameState.gameType}`);
  }
  return gameType.serialize(gameState);
}

