/**
 * Configuration management for OPPR constants
 * Allows runtime configuration of all calculation constants
 */

import { DEFAULT_CONSTANTS } from './constants.js';
import type {
  BaseValueConstants,
  TVAConstants,
  TGPConstants,
  EventBoosterConstants,
  PointDistributionConstants,
  TimeDecayConstants,
  RankingConstants,
  ValidationConstants,
} from './types.js';

/**
 * Complete OPPR configuration with all constant groups
 */
export interface OPPRConfig {
  BASE_VALUE: BaseValueConstants;
  TVA: TVAConstants;
  TGP: TGPConstants;
  EVENT_BOOSTERS: EventBoosterConstants;
  POINT_DISTRIBUTION: PointDistributionConstants;
  TIME_DECAY: TimeDecayConstants;
  RANKING: RankingConstants;
  VALIDATION: ValidationConstants;
}

/**
 * Partial configuration allowing deep overrides of individual constants
 */
export type PartialOPPRConfig = DeepPartial<OPPRConfig>;

/**
 * Helper type for deep partial objects
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * User-provided configuration overrides
 */
let userConfig: PartialOPPRConfig = {};

/**
 * Cached merged configuration
 */
let mergedConfig: OPPRConfig | null = null;

/**
 * Deep merge utility function
 * Merges source into target, creating new objects as needed
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue !== undefined &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue) &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue)
    ) {
      // Recursively merge nested objects
      result[key] = deepMerge(targetValue, sourceValue as DeepPartial<typeof targetValue>);
    } else if (sourceValue !== undefined) {
      // Override primitive values
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Configure OPPR with custom constant values
 * Only specified values are overridden; all others use defaults
 *
 * @param config - Partial configuration with values to override
 *
 * @example
 * ```typescript
 * import { configureOPPR } from 'oppr';
 *
 * // Override specific constants
 * configureOPPR({
 *   BASE_VALUE: {
 *     POINTS_PER_PLAYER: 1.0,  // Override this value
 *     MAX_BASE_VALUE: 64,       // Override this value
 *     // Other BASE_VALUE constants use defaults
 *   },
 *   TIME_DECAY: {
 *     YEAR_1_TO_2: 0.8,  // Override decay rate
 *   },
 * });
 * ```
 */
export function configureOPPR(config: PartialOPPRConfig): void {
  userConfig = deepMerge(userConfig, config);
  mergedConfig = null; // Invalidate cache
}

/**
 * Reset configuration to defaults
 * Clears all user-provided overrides
 *
 * @example
 * ```typescript
 * import { resetConfig } from 'oppr';
 *
 * resetConfig();  // All functions now use default constants
 * ```
 */
export function resetConfig(): void {
  userConfig = {};
  mergedConfig = null; // Invalidate cache
}

/**
 * Get the current merged configuration
 * Returns default constants merged with any user overrides
 * Results are cached for performance
 *
 * @returns Complete configuration with all constants
 * @internal
 */
export function getConfig(): OPPRConfig {
  // Return cached config if available
  if (mergedConfig) {
    return mergedConfig;
  }

  // Merge defaults with user config and cache
  mergedConfig = deepMerge(DEFAULT_CONSTANTS, userConfig);
  return mergedConfig;
}

/**
 * Get the default configuration (without user overrides)
 * Useful for reference or resetting specific values
 *
 * @returns Default configuration constants
 *
 * @example
 * ```typescript
 * import { getDefaultConfig } from 'oppr';
 *
 * const defaults = getDefaultConfig();
 * console.log(defaults.BASE_VALUE.POINTS_PER_PLAYER);  // 0.5
 * ```
 */
export function getDefaultConfig(): OPPRConfig {
  return DEFAULT_CONSTANTS;
}
