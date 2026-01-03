import type { BaseRatingData, RatingSystemId } from './types.js';

/**
 * Player's ratings across different rating systems
 *
 * @example
 * ```typescript
 * const ratings: PlayerRatings = {
 *   glicko: { value: 1650, ratingDeviation: 75 },
 *   elo: { value: 1580 },
 * };
 * ```
 */
export interface PlayerRatings {
  [systemId: RatingSystemId]: BaseRatingData | undefined;
}

/**
 * Get the primary rating value from a player's ratings
 * @param ratings - Player's ratings object
 * @param systemId - Rating system to get value from
 * @returns Rating value or undefined if not found
 */
export function getPrimaryRating(
  ratings: PlayerRatings | undefined,
  systemId: RatingSystemId
): number | undefined {
  const ratingData = ratings?.[systemId];
  return ratingData?.value;
}

/**
 * Check if a player has a rating for a specific system
 * @param ratings - Player's ratings object
 * @param systemId - Rating system to check
 * @returns True if player has a rating for the system
 */
export function hasRating(ratings: PlayerRatings | undefined, systemId: RatingSystemId): boolean {
  return ratings?.[systemId] !== undefined;
}

/**
 * Get all rating system IDs that a player has ratings for
 * @param ratings - Player's ratings object
 * @returns Array of rating system IDs
 */
export function getPlayerRatingSystems(ratings: PlayerRatings | undefined): RatingSystemId[] {
  if (!ratings) return [];
  return Object.keys(ratings).filter((key) => ratings[key] !== undefined);
}
