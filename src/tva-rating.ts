import { TVA } from './constants.js';
import type { Player } from './types.js';

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
  const contribution = rating * TVA.RATING.COEFFICIENT - TVA.RATING.OFFSET;

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
 * @returns Total rating-based TVA for the tournament
 *
 * @example
 * ```typescript
 * const players = [
 *   { id: '1', rating: 2000, ranking: 1, isRated: true },
 *   { id: '2', rating: 1800, ranking: 5, isRated: true },
 *   { id: '3', rating: 1200, ranking: 100, isRated: true }, // Below threshold
 * ];
 * const tva = calculateRatingTVA(players);
 * ```
 */
export function calculateRatingTVA(players: Player[]): number {
  // Sort players by rating (highest first) and take top 64
  const topRatedPlayers = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, TVA.MAX_PLAYERS_CONSIDERED);

  // Sum contributions from all top-rated players
  const totalTVA = topRatedPlayers.reduce((sum, player) => {
    return sum + calculatePlayerRatingContribution(player.rating);
  }, 0);

  // Cap at maximum rating TVA value
  return Math.min(totalTVA, TVA.RATING.MAX_VALUE);
}

/**
 * Determines if a player's rating contributes to the TVA
 *
 * @param rating - Player's rating value
 * @returns True if rating is above the minimum effective threshold (1285.71)
 */
export function ratingContributesToTVA(rating: number): boolean {
  return rating > TVA.RATING.MIN_EFFECTIVE_RATING;
}

/**
 * Gets the top N rated players from a player list
 *
 * @param players - Array of players
 * @param count - Number of top players to return (default 64)
 * @returns Array of top N rated players, sorted by rating descending
 */
export function getTopRatedPlayers(players: Player[], count = 64): Player[] {
  return [...players].sort((a, b) => b.rating - a.rating).slice(0, count);
}
