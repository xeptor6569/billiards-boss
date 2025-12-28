// YAML schema definition for custom games

export interface CustomGameConfig {
  name: string;
  description?: string;
  rules: GameRules;
}

export interface GameRules {
  totalBalls: number;
  scoring: ScoringConfig;
  winCondition: WinCondition;
  specialRules?: SpecialRule[];
  turnBased?: boolean; // If true, players take turns
  maxPlayers?: number; // Maximum number of players (default: 1)
}

export interface ScoringConfig {
  type: 'points' | 'frames' | 'race';
  pointsPerBall?: number; // For points-based scoring
  frameCount?: number; // For frame-based scoring
}

export interface WinCondition {
  type: 'firstTo' | 'highestScore' | 'mostFrames' | 'allBalls';
  value?: number; // For firstTo or target score
}

export interface SpecialRule {
  type: 'foul' | 'bonus' | 'penalty' | 'reset';
  condition: string; // e.g., 'allBalls', 'specificBall', 'consecutive'
  value?: number; // Points/penalty amount
  description?: string;
}

// Example YAML structure:
/*
name: "Custom 10-Ball"
description: "A custom 10-ball game"
rules:
  totalBalls: 10
  scoring:
    type: "points"
    pointsPerBall: 1
  winCondition:
    type: "firstTo"
    value: 50
  specialRules:
    - type: "foul"
      condition: "scratch"
      value: -5
    - type: "bonus"
      condition: "allBalls"
      value: 10
*/

