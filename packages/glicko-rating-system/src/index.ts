/**
 * @opprs/glicko-rating-system
 *
 * Glicko rating system implementation for OPPR.
 * This package provides a complete Glicko rating system that can be registered
 * with the rating system registry.
 *
 * @packageDocumentation
 */

// Export types
export type { GlickoRatingData, GlickoConfig, GlickoMatchResult } from './types.js';

// Export constants
export { DEFAULT_GLICKO_CONFIG } from './constants.js';

// Export the rating system class
export { GlickoRatingSystem } from './glicko.js';

// Re-export base types for convenience
export type {
  RatingSystem,
  MatchResult,
  RatingUpdateResult,
  PlayerRatingResult,
} from '@opprs/rating-system-base';

// Auto-register default Glicko instance
import { registerRatingSystem } from '@opprs/rating-system-base';
import { GlickoRatingSystem } from './glicko.js';
import { DEFAULT_GLICKO_CONFIG } from './constants.js';

/**
 * Default Glicko rating system instance
 */
export const defaultGlickoSystem = new GlickoRatingSystem(DEFAULT_GLICKO_CONFIG);

// Register on import
registerRatingSystem(defaultGlickoSystem);
