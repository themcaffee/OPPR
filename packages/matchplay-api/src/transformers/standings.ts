import type { Player, PlayerResult } from '@opprs/core';
import type { MatchplayStanding } from '../types/api-responses.js';
import type { PlayerTransformOptions } from '../types/client-options.js';
import { standingToPlayer } from './player.js';

/**
 * Transform Matchplay standings to OPPR PlayerResults
 *
 * @param standings - Array of Matchplay standings
 * @param playerMap - Optional map of userId to Player for enriched player data
 * @param options - Transform options for default values
 */
export function toOPPRResults(
  standings: MatchplayStanding[],
  playerMap?: Map<string, Player>,
  options: PlayerTransformOptions = {}
): PlayerResult[] {
  return standings.map((standing) => {
    // Try to get enriched player from map, otherwise create minimal player from standing
    const playerId = standing.userId ? String(standing.userId) : String(standing.playerId);
    const player = playerMap?.get(playerId) ?? standingToPlayer(standing, options);

    return {
      player,
      position: standing.position,
      optedOut: false, // Matchplay doesn't have opt-out concept
    };
  });
}

/**
 * Sort standings by position
 */
export function sortStandingsByPosition(standings: MatchplayStanding[]): MatchplayStanding[] {
  return [...standings].sort((a, b) => a.position - b.position);
}
