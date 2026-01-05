// Game type registry and factory

import { GameType, GameTypeMetadata } from './types';
import { bowlliardsGameType } from './bowlliards';
import { apa8ballGameType } from './apa8ball';
import { apa9ballGameType } from './apa9ball';
import { straightPoolGameType } from './straight-pool';
import { customGameType } from './custom';

/**
 * Registry of all available game types
 */
const gameTypeRegistry = new Map<string, GameType>();

/**
 * Register a game type
 */
export function registerGameType(gameType: GameType): void {
  gameTypeRegistry.set(gameType.metadata.id, gameType);
}

/**
 * Get a game type by ID
 */
export function getGameType(id: string): GameType | undefined {
  return gameTypeRegistry.get(id);
}

/**
 * Get all game types
 */
export function getAllGameTypes(): GameType[] {
  return Array.from(gameTypeRegistry.values());
}

/**
 * Get game types available to a user (filtered by payment requirements)
 */
export function getAvailableGameTypes(hasPremiumAccess: boolean): GameType[] {
  return getAllGameTypes().filter(
    (gt) => !gt.metadata.requiresPayment || hasPremiumAccess
  );
}

/**
 * Get standard (free) game types
 */
export function getStandardGameTypes(): GameType[] {
  return getAllGameTypes().filter((gt) => !gt.metadata.requiresPayment);
}

/**
 * Initialize all game types
 */
export function initializeGameTypes(): void {
  // Register standard game types
  registerGameType(bowlliardsGameType);
  registerGameType(apa8ballGameType);
  registerGameType(apa9ballGameType);
  registerGameType(straightPoolGameType);
  
  // Register custom game type (requires premium)
  registerGameType(customGameType);
}

// Auto-initialize on import
initializeGameTypes();

// Export types
export type { GameType, BaseGameState, ScoreInput, GameUIComponents, GameTypeMetadata } from './types';

