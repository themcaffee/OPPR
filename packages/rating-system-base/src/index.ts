/**
 * @opprs/rating-system-base
 *
 * Base interfaces and registry for OPPR rating systems.
 * This package provides the foundation for implementing pluggable rating systems.
 *
 * @packageDocumentation
 */

// Export types
export type {
  RatingSystemId,
  BaseRatingData,
  MatchResult,
  RatingUpdateResult,
  PlayerRatingResult,
  RatingSystem,
} from './types.js';

// Export registry
export {
  ratingRegistry,
  registerRatingSystem,
  getRatingSystem,
  hasRatingSystem,
  getRegisteredRatingSystems,
} from './registry.js';

// Export player utilities
export type { PlayerRatings } from './player.js';
export { getPrimaryRating, hasRating, getPlayerRatingSystems } from './player.js';
