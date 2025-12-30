import { getConfig } from './config.js';
import type { RatingUpdate, RatingResult, PlayerResult } from './types.js';

/**
 * Calculates the g(RD) function used in Glicko rating calculations
 *
 * g(RD) = 1 / sqrt(1 + 3*q²*RD² / π²)
 *
 * @param rd - Rating deviation of opponent
 * @returns g(RD) value
 */
function calculateG(rd: number): number {
  const config = getConfig();
  const qSquared = config.RATING.Q * config.RATING.Q;
  const rdSquared = rd * rd;
  return 1 / Math.sqrt(1 + (3 * qSquared * rdSquared) / (Math.PI * Math.PI));
}

/**
 * Calculates the E(s|r,RD) function - expected score
 *
 * E = 1 / (1 + 10^(-g(RD)*(r - r_opponent)/400))
 *
 * @param rating - Player's rating
 * @param opponentRating - Opponent's rating
 * @param opponentRD - Opponent's rating deviation
 * @returns Expected score (0 to 1)
 */
function calculateExpectedScore(
  rating: number,
  opponentRating: number,
  opponentRD: number
): number {
  const g = calculateG(opponentRD);
  const exponent = (-g * (rating - opponentRating)) / 400;
  return 1 / (1 + Math.pow(10, exponent));
}

/**
 * Calculates d² value for Glicko rating update
 *
 * d² = 1 / (q² * Σ(g(RD)² * E * (1 - E)))
 *
 * @param results - Array of match results against opponents
 * @param rating - Player's current rating
 * @returns d² value
 */
function calculateDSquared(
  results: Array<{ opponentRating: number; opponentRD: number }>,
  rating: number
): number {
  const config = getConfig();
  const qSquared = config.RATING.Q * config.RATING.Q;

  const sum = results.reduce((total, result) => {
    const g = calculateG(result.opponentRD);
    const e = calculateExpectedScore(rating, result.opponentRating, result.opponentRD);
    return total + g * g * e * (1 - e);
  }, 0);

  return 1 / (qSquared * sum);
}

/**
 * Updates a player's rating using the Glicko system
 *
 * Glicko is a rating system that accounts for rating reliability (RD).
 * Tournament results are simulated as head-to-head matches:
 * - Players you finish ahead of = wins
 * - Players you tie with = draws (0.5)
 * - Players who finish ahead of you = losses
 *
 * @param update - Rating update parameters
 * @returns New rating and RD values
 *
 * @example
 * ```typescript
 * const update: RatingUpdate = {
 *   currentRating: 1500,
 *   currentRD: 100,
 *   results: [
 *     { opponentRating: 1600, opponentRD: 80, score: 1 },  // Win
 *     { opponentRating: 1550, opponentRD: 90, score: 0 },  // Loss
 *   ]
 * };
 * const newRating = updateRating(update);
 * ```
 */
export function updateRating(update: RatingUpdate): RatingResult {
  const config = getConfig();
  const { currentRating, currentRD, results } = update;

  // If no results, return current values (no change)
  if (results.length === 0) {
    return {
      newRating: currentRating,
      newRD: currentRD,
    };
  }

  // Calculate d²
  const dSquared = calculateDSquared(results, currentRating);

  // Calculate sum of (g(RD) * (score - E))
  const sum = results.reduce((total, result) => {
    const g = calculateG(result.opponentRD);
    const e = calculateExpectedScore(currentRating, result.opponentRating, result.opponentRD);
    return total + g * (result.score - e);
  }, 0);

  // Calculate new rating
  const qSquared = config.RATING.Q * config.RATING.Q;
  const newRating = currentRating + (qSquared / (1 / (currentRD * currentRD) + 1 / dSquared)) * sum;

  // Calculate new RD
  const newRD = Math.sqrt(1 / (1 / (currentRD * currentRD) + 1 / dSquared));

  return {
    newRating: Math.round(newRating * 100) / 100, // Round to 2 decimal places
    newRD: Math.max(config.RATING.MIN_RD, Math.min(newRD, config.RATING.MAX_RD)),
  };
}

/**
 * Applies RD decay for inactive players
 *
 * RD increases by ~0.3 per day of inactivity, capped at MAX_RD (200)
 *
 * @param currentRD - Current rating deviation
 * @param daysSinceLastEvent - Number of days since last event
 * @returns New RD value after decay
 */
export function applyRDDecay(currentRD: number, daysSinceLastEvent: number): number {
  const config = getConfig();
  const newRD = currentRD + daysSinceLastEvent * config.RATING.RD_DECAY_PER_DAY;
  return Math.min(newRD, config.RATING.MAX_RD);
}

/**
 * Simulates tournament results as head-to-head matches for rating calculation
 *
 * Based on finishing position:
 * - Players who finished above you = losses (score = 0)
 * - Players who tied with you = draws (score = 0.5)
 * - Players who finished below you = wins (score = 1)
 *
 * Only the 32 players above and 32 players below are used (per rules)
 *
 * @param playerPosition - The player's finishing position
 * @param allResults - All tournament results sorted by position
 * @returns Array of simulated match results
 *
 * @example
 * ```typescript
 * const results: PlayerResult[] = [
 *   { player: { id: '1', rating: 1800, ranking: 1, isRated: true }, position: 1 },
 *   { player: { id: '2', rating: 1700, ranking: 5, isRated: true }, position: 2 },
 *   { player: { id: '3', rating: 1600, ranking: 10, isRated: true }, position: 3 },
 * ];
 * const matches = simulateTournamentMatches(2, results);
 * // Player in 2nd beat player in 3rd (win), lost to player in 1st (loss)
 * ```
 */
export function simulateTournamentMatches(
  playerPosition: number,
  allResults: PlayerResult[]
): Array<{ opponentRating: number; opponentRD: number; score: number }> {
  const config = getConfig();
  const matches: Array<{ opponentRating: number; opponentRD: number; score: number }> = [];

  // Sort results by position
  const sortedResults = [...allResults].sort((a, b) => a.position - b.position);

  // Find the index of the current player
  const playerIndex = sortedResults.findIndex((r) => r.position === playerPosition);

  if (playerIndex === -1) return matches;

  // Get opponents within range (32 above and 32 below)
  const startIndex = Math.max(0, playerIndex - config.RATING.OPPONENTS_RANGE);
  const endIndex = Math.min(sortedResults.length, playerIndex + config.RATING.OPPONENTS_RANGE + 1);

  for (let i = startIndex; i < endIndex; i++) {
    if (i === playerIndex) continue; // Skip self

    const opponent = sortedResults[i].player;
    const opponentPosition = sortedResults[i].position;

    // Determine match result
    let score: number;
    if (opponentPosition < playerPosition) {
      score = 0; // Loss (opponent finished higher)
    } else if (opponentPosition === playerPosition) {
      score = 0.5; // Tie
    } else {
      score = 1; // Win (opponent finished lower)
    }

    matches.push({
      opponentRating: opponent.rating,
      opponentRD: opponent.ratingDeviation ?? config.RATING.DEFAULT_RATING,
      score,
    });
  }

  return matches;
}

/**
 * Creates a new player with default/provisional rating
 *
 * @returns Player rating object with default values
 */
export function createNewPlayerRating(): { rating: number; rd: number } {
  const config = getConfig();
  return {
    rating: config.RATING.DEFAULT_RATING,
    rd: config.RATING.MAX_RD,
  };
}

/**
 * Determines if a player's rating is still provisional
 *
 * Players with fewer than 5 events have provisional ratings
 *
 * @param eventCount - Number of events player has participated in
 * @returns True if rating is provisional (< 5 events)
 */
export function isProvisionalRating(eventCount: number): boolean {
  return eventCount < 5;
}
