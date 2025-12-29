import { TVA } from './constants.js';
import type { Player } from './types.js';

/**
 * Calculates a single player's contribution to the ranking-based TVA
 *
 * Formula: ln(RANKING) * -0.211675054 + 1.459827968
 * - Rank #1 player adds ~1.46 points
 * - Rank #2 player adds ~1.31 points
 * - Top 64 ranked players total would add 50 points (max TVA from rankings)
 *
 * @param ranking - Player's world ranking position (1 = best)
 * @returns TVA contribution from this player
 */
export function calculatePlayerRankingContribution(ranking: number): number {
  // Ensure ranking is at least 1 to avoid invalid ln() calculations
  const validRanking = Math.max(1, ranking);

  const contribution =
    Math.log(validRanking) * TVA.RANKING.COEFFICIENT + TVA.RANKING.OFFSET;

  // Only count positive contributions
  return Math.max(0, contribution);
}

/**
 * Calculates the total Tournament Value Adjustment based on player rankings
 *
 * Takes the top 64 ranked players (lowest ranking numbers) and sums their contributions.
 * Maximum possible value is 50 points.
 *
 * @param players - Array of players participating in the tournament
 * @returns Total ranking-based TVA for the tournament
 *
 * @example
 * ```typescript
 * const players = [
 *   { id: '1', rating: 1800, ranking: 1, isRated: true },   // ~1.46 points
 *   { id: '2', rating: 1750, ranking: 2, isRated: true },   // ~1.31 points
 *   { id: '3', rating: 1700, ranking: 10, isRated: true },  // ~0.97 points
 * ];
 * const tva = calculateRankingTVA(players);
 * ```
 */
export function calculateRankingTVA(players: Player[]): number {
  // Filter players with valid rankings (ranking > 0)
  const rankedPlayers = players.filter((player) => player.ranking > 0);

  // Sort by ranking (lowest/best first) and take top 64
  const topRankedPlayers = [...rankedPlayers]
    .sort((a, b) => a.ranking - b.ranking)
    .slice(0, TVA.MAX_PLAYERS_CONSIDERED);

  // Sum contributions from all top-ranked players
  const totalTVA = topRankedPlayers.reduce((sum, player) => {
    return sum + calculatePlayerRankingContribution(player.ranking);
  }, 0);

  // Cap at maximum ranking TVA value
  return Math.min(totalTVA, TVA.RANKING.MAX_VALUE);
}

/**
 * Gets the top N ranked players from a player list
 *
 * @param players - Array of players
 * @param count - Number of top players to return (default 64)
 * @returns Array of top N ranked players, sorted by ranking ascending
 */
export function getTopRankedPlayers(players: Player[], count = 64): Player[] {
  return [...players]
    .filter((player) => player.ranking > 0)
    .sort((a, b) => a.ranking - b.ranking)
    .slice(0, count);
}

/**
 * Calculates the combined TVA from both rating and ranking
 *
 * @param players - Array of players participating in the tournament
 * @returns Object with rating TVA, ranking TVA, and total TVA
 */
export function calculateTotalTVA(players: Player[]): {
  ratingTVA: number;
  rankingTVA: number;
  totalTVA: number;
} {
  // Import here to avoid circular dependency
  const { calculateRatingTVA } = require('./tva-rating.js');

  const ratingTVA = calculateRatingTVA(players);
  const rankingTVA = calculateRankingTVA(players);

  return {
    ratingTVA,
    rankingTVA,
    totalTVA: ratingTVA + rankingTVA,
  };
}
