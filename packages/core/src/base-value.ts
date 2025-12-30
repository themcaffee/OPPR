import { getConfig } from './config.js';
import type { Player } from './types.js';

/**
 * Calculates the base value for a tournament
 *
 * Base value = 0.5 points per rated player, up to a maximum of 32 points (64+ rated players)
 * Only rated players (5+ events) are counted toward base value
 *
 * @param players - Array of players participating in the tournament
 * @returns Base value for the tournament
 *
 * @example
 * ```typescript
 * const players = [
 *   { id: '1', rating: 1500, ranking: 100, isRated: true },
 *   { id: '2', rating: 1400, ranking: 200, isRated: true },
 *   { id: '3', rating: 1300, ranking: 300, isRated: false }, // Not counted
 * ];
 * const base = calculateBaseValue(players); // Returns 1.0 (2 rated players * 0.5)
 * ```
 */
export function calculateBaseValue(players: Player[]): number {
  const config = getConfig();
  // Count only rated players
  const ratedPlayerCount = players.filter((player) => player.isRated).length;

  // Calculate base value: 0.5 per rated player
  const baseValue = ratedPlayerCount * config.BASE_VALUE.POINTS_PER_PLAYER;

  // Cap at maximum base value (32 points for 64+ players)
  return Math.min(baseValue, config.BASE_VALUE.MAX_BASE_VALUE);
}

/**
 * Counts the number of rated players in a tournament
 *
 * @param players - Array of players participating in the tournament
 * @returns Number of rated players (players with 5+ events)
 */
export function countRatedPlayers(players: Player[]): number {
  return players.filter((player) => player.isRated).length;
}

/**
 * Determines if a player is rated based on event count
 *
 * @param eventCount - Number of events the player has participated in
 * @returns True if player has participated in 5 or more events
 */
export function isPlayerRated(eventCount: number): boolean {
  const config = getConfig();
  return eventCount >= config.BASE_VALUE.RATED_PLAYER_THRESHOLD;
}
