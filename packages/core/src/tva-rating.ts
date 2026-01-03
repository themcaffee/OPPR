import { getConfig } from './config.js';
import type { Player } from './types.js';
import { getPrimaryRating, type RatingSystemId } from '@opprs/rating-system-base';

/**
 * Default rating system ID for TVA calculations
 */
const DEFAULT_RATING_SYSTEM: RatingSystemId = 'glicko';

/**
 * Helper to get a player's rating value for a given system
 * @internal
 */
function getPlayerRating(player: Player, ratingSystemId: RatingSystemId): number {
  return getPrimaryRating(player.ratings, ratingSystemId) ?? 0;
}

/**
 * Calculates a single player's contribution to the rating-based TVA
 *
 * Formula: (RATING * 0.000546875) - 0.703125
 * - A perfect player (rating 2000) adds 0.39 points
 * - 64 perfect players would add 25 points total (max TVA from ratings)
 * - Players rated below 1285.71 add zero or negative value (treated as 0)
 *
 * @param rating - Player's rating value
 * @returns TVA contribution from this player (0 or positive)
 */
export function calculatePlayerRatingContribution(rating: number): number {
  const config = getConfig();
  const contribution = rating * config.TVA.RATING.COEFFICIENT - config.TVA.RATING.OFFSET;

  // Only count positive contributions
  return Math.max(0, contribution);
}

/**
 * Calculates the total Tournament Value Adjustment based on player ratings
 *
 * Takes the top 64 rated players and sums their individual contributions.
 * Maximum possible value is 25 points.
 *
 * @param players - Array of players participating in the tournament
 * @param ratingSystemId - Rating system to use (default: 'glicko')
 * @returns Total rating-based TVA for the tournament
 *
 * @example
 * ```typescript
 * const players = [
 *   { id: '1', ranking: 1, isRated: true, ratings: { glicko: { value: 2000, ratingDeviation: 50 } } },
 *   { id: '2', ranking: 5, isRated: true, ratings: { glicko: { value: 1800, ratingDeviation: 75 } } },
 *   { id: '3', ranking: 100, isRated: true, ratings: { glicko: { value: 1200, ratingDeviation: 100 } } }, // Below threshold
 * ];
 * const tva = calculateRatingTVA(players);
 * ```
 */
export function calculateRatingTVA(
  players: Player[],
  ratingSystemId: RatingSystemId = DEFAULT_RATING_SYSTEM
): number {
  const config = getConfig();
  // Sort players by rating (highest first) and take top 64
  const topRatedPlayers = [...players]
    .sort((a, b) => getPlayerRating(b, ratingSystemId) - getPlayerRating(a, ratingSystemId))
    .slice(0, config.TVA.MAX_PLAYERS_CONSIDERED);

  // Sum contributions from all top-rated players
  const totalTVA = topRatedPlayers.reduce((sum, player) => {
    return sum + calculatePlayerRatingContribution(getPlayerRating(player, ratingSystemId));
  }, 0);

  // Cap at maximum rating TVA value
  return Math.min(totalTVA, config.TVA.RATING.MAX_VALUE);
}

/**
 * Determines if a player's rating contributes to the TVA
 *
 * @param rating - Player's rating value
 * @returns True if rating is above the minimum effective threshold (1285.71)
 */
export function ratingContributesToTVA(rating: number): boolean {
  const config = getConfig();
  return rating > config.TVA.RATING.MIN_EFFECTIVE_RATING;
}

/**
 * Gets the top N rated players from a player list
 *
 * @param players - Array of players
 * @param count - Number of top players to return (default 64)
 * @param ratingSystemId - Rating system to use for sorting (default: 'glicko')
 * @returns Array of top N rated players, sorted by rating descending
 */
export function getTopRatedPlayers(
  players: Player[],
  count = 64,
  ratingSystemId: RatingSystemId = DEFAULT_RATING_SYSTEM
): Player[] {
  return [...players]
    .sort((a, b) => getPlayerRating(b, ratingSystemId) - getPlayerRating(a, ratingSystemId))
    .slice(0, count);
}
