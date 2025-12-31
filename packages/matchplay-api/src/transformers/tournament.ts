import type { Tournament, TGPConfig, TournamentFormatType, EventBoosterType } from '@opprs/core';
import type { MatchplayTournament, MatchplayStanding } from '../types/api-responses.js';
import type { TransformOptions } from '../types/client-options.js';
import { standingToPlayer } from './player.js';

const DEFAULT_OPTIONS: Required<TransformOptions> = {
  includeUnrated: true,
  defaultRating: 1500,
  defaultRanking: 99999,
  defaultRD: 350,
  eventBooster: 'none',
};

/**
 * Map Matchplay tournament type to OPPR format type
 */
function mapTournamentType(matchplayType: string): TournamentFormatType {
  const typeMap: Record<string, TournamentFormatType> = {
    group_matchplay: 'match-play',
    matchplay: 'match-play',
    knockout: 'single-elimination',
    single_elimination: 'single-elimination',
    double_elimination: 'double-elimination',
    best_game: 'best-game',
    best_of: 'best-game',
    flip_frenzy: 'flip-frenzy',
    pingolf: 'pin-golf',
    pin_golf: 'pin-golf',
    // Add more mappings as needed
  };

  return typeMap[matchplayType.toLowerCase()] ?? 'hybrid';
}

/**
 * Infer TGP configuration from Matchplay tournament data
 * Note: This is best-effort since Matchplay doesn't store TGP config directly
 */
export function inferTGPConfig(
  tournament: MatchplayTournament,
  standings?: MatchplayStanding[]
): TGPConfig {
  const formatType = mapTournamentType(tournament.type);
  const playerCount = standings?.length ?? 0;

  // Best-effort inference based on tournament type
  // These are reasonable defaults but won't be perfectly accurate
  const isFourPlayerFormat =
    formatType === 'match-play' && tournament.type.toLowerCase().includes('4');
  const isThreePlayerFormat =
    formatType === 'match-play' && tournament.type.toLowerCase().includes('3');

  // Default TGP config with sensible defaults
  const tgpConfig: TGPConfig = {
    qualifying: {
      type: 'none',
      meaningfulGames: 0,
    },
    finals: {
      formatType,
      meaningfulGames: estimateMeaningfulGames(formatType, playerCount),
      fourPlayerGroups: isFourPlayerFormat,
      threePlayerGroups: isThreePlayerFormat,
      finalistCount: playerCount,
    },
  };

  return tgpConfig;
}

/**
 * Estimate meaningful games based on format and player count
 */
function estimateMeaningfulGames(formatType: TournamentFormatType, playerCount: number): number {
  switch (formatType) {
    case 'single-elimination':
      // Each player plays until eliminated, winner plays log2(n) games
      return Math.max(1, Math.ceil(Math.log2(playerCount)));

    case 'double-elimination':
      // Double elimination roughly doubles the games
      return Math.max(1, Math.ceil(Math.log2(playerCount)) * 2);

    case 'match-play':
      // Matchplay varies widely, estimate based on typical formats
      // Usually 4-7 rounds
      return Math.min(7, Math.max(4, Math.ceil(playerCount / 4)));

    case 'best-game':
      // Best game formats typically have 3-5 games
      return 4;

    case 'pin-golf':
      // Pin golf typically 9 or 18 holes
      return 9;

    case 'flip-frenzy':
      // Flip frenzy is usually time-based, estimate 5 games
      return 5;

    default:
      // Default to 4 meaningful games
      return 4;
  }
}

/**
 * Transform a Matchplay tournament to an OPPR Tournament
 */
export function toOPPRTournament(
  tournament: MatchplayTournament,
  standings: MatchplayStanding[],
  options: TransformOptions = {}
): Tournament {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Filter standings if not including unrated players
  const filteredStandings = opts.includeUnrated
    ? standings
    : standings.filter((s) => s.ifpaId !== undefined && s.ifpaId !== null);

  // Transform standings to players
  const players = filteredStandings.map((standing) =>
    standingToPlayer(standing, {
      defaultRating: opts.defaultRating,
      defaultRanking: opts.defaultRanking,
      defaultRD: opts.defaultRD,
    })
  );

  // Infer TGP config
  const tgpConfig = inferTGPConfig(tournament, filteredStandings);

  return {
    id: String(tournament.tournamentId),
    name: tournament.name,
    date: new Date(tournament.startUtc),
    players,
    tgpConfig,
    eventBooster: opts.eventBooster as EventBoosterType,
  };
}
