// YAML validator for custom game configurations

import { CustomGameConfig, GameRules, ScoringConfig, WinCondition } from './schema';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCustomGameConfig(config: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Validate top-level structure
  if (!config || typeof config !== 'object') {
    errors.push({ field: 'root', message: 'Config must be an object' });
    return { valid: false, errors };
  }

  // Validate name
  if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  }

  // Validate description (optional)
  if (config.description !== undefined && typeof config.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  // Validate rules
  if (!config.rules || typeof config.rules !== 'object') {
    errors.push({ field: 'rules', message: 'Rules are required and must be an object' });
    return { valid: false, errors };
  }

  const rules = config.rules as GameRules;

  // Validate totalBalls
  if (typeof rules.totalBalls !== 'number' || rules.totalBalls < 1 || rules.totalBalls > 15) {
    errors.push({ field: 'rules.totalBalls', message: 'totalBalls must be a number between 1 and 15' });
  }

  // Validate scoring
  if (!rules.scoring || typeof rules.scoring !== 'object') {
    errors.push({ field: 'rules.scoring', message: 'Scoring configuration is required' });
  } else {
    const scoring = rules.scoring as ScoringConfig;
    if (!['points', 'frames', 'race'].includes(scoring.type)) {
      errors.push({ field: 'rules.scoring.type', message: 'Scoring type must be "points", "frames", or "race"' });
    }
    if (scoring.type === 'points' && (scoring.pointsPerBall === undefined || scoring.pointsPerBall < 0)) {
      errors.push({ field: 'rules.scoring.pointsPerBall', message: 'pointsPerBall is required for points-based scoring and must be >= 0' });
    }
    if (scoring.type === 'frames' && (scoring.frameCount === undefined || scoring.frameCount < 1)) {
      errors.push({ field: 'rules.scoring.frameCount', message: 'frameCount is required for frame-based scoring and must be >= 1' });
    }
  }

  // Validate winCondition
  if (!rules.winCondition || typeof rules.winCondition !== 'object') {
    errors.push({ field: 'rules.winCondition', message: 'Win condition is required' });
  } else {
    const winCondition = rules.winCondition as WinCondition;
    if (!['firstTo', 'highestScore', 'mostFrames', 'allBalls'].includes(winCondition.type)) {
      errors.push({ field: 'rules.winCondition.type', message: 'Win condition type must be "firstTo", "highestScore", "mostFrames", or "allBalls"' });
    }
    if ((winCondition.type === 'firstTo' || winCondition.type === 'highestScore') && 
        (winCondition.value === undefined || winCondition.value < 1)) {
      errors.push({ field: 'rules.winCondition.value', message: 'Value is required for firstTo/highestScore and must be >= 1' });
    }
  }

  // Validate specialRules (optional)
  if (rules.specialRules !== undefined) {
    if (!Array.isArray(rules.specialRules)) {
      errors.push({ field: 'rules.specialRules', message: 'specialRules must be an array' });
    } else {
      rules.specialRules.forEach((rule: any, index: number) => {
        if (!rule.type || !['foul', 'bonus', 'penalty', 'reset'].includes(rule.type)) {
          errors.push({ field: `rules.specialRules[${index}].type`, message: 'Rule type must be "foul", "bonus", "penalty", or "reset"' });
        }
        if (!rule.condition || typeof rule.condition !== 'string') {
          errors.push({ field: `rules.specialRules[${index}].condition`, message: 'Rule condition is required and must be a string' });
        }
      });
    }
  }

  // Validate turnBased (optional)
  if (rules.turnBased !== undefined && typeof rules.turnBased !== 'boolean') {
    errors.push({ field: 'rules.turnBased', message: 'turnBased must be a boolean' });
  }

  // Validate maxPlayers (optional)
  if (rules.maxPlayers !== undefined) {
    if (typeof rules.maxPlayers !== 'number' || rules.maxPlayers < 1 || rules.maxPlayers > 4) {
      errors.push({ field: 'rules.maxPlayers', message: 'maxPlayers must be a number between 1 and 4' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

