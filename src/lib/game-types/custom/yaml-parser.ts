// YAML parser for custom game configurations

import { CustomGameConfig } from './schema';
import { validateCustomGameConfig } from './validator';

/**
 * Parse YAML string into CustomGameConfig
 * Note: In a real implementation, you'd use a YAML library like 'js-yaml'
 * For now, we'll support JSON as well (since YAML is a superset of JSON)
 */
export function parseCustomGameYAML(yamlString: string): { 
  config: CustomGameConfig | null; 
  error: string | null;
} {
  try {
    // Try parsing as JSON first (simpler, no dependencies)
    let config: any;
    
    try {
      config = JSON.parse(yamlString);
    } catch (jsonError) {
      // If JSON parsing fails, try YAML parsing
      // In production, you'd use a library like 'js-yaml':
      // import yaml from 'js-yaml';
      // config = yaml.load(yamlString);
      
      // For now, return error suggesting JSON format
      return {
        config: null,
        error: 'YAML parsing not yet implemented. Please use JSON format or install js-yaml library.',
      };
    }

    // Validate the parsed config
    const validation = validateCustomGameConfig(config);
    if (!validation.valid) {
      return {
        config: null,
        error: `Validation failed: ${validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
      };
    }

    return {
      config: config as CustomGameConfig,
      error: null,
    };
  } catch (error: any) {
    return {
      config: null,
      error: error.message || 'Failed to parse YAML/JSON',
    };
  }
}

/**
 * Convert CustomGameConfig to YAML string
 */
export function stringifyCustomGameConfig(config: CustomGameConfig): string {
  // For now, return JSON (which is valid YAML)
  // In production, use a YAML library for proper formatting
  return JSON.stringify(config, null, 2);
}

