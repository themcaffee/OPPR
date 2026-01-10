import type { EventBoosterType } from '@opprs/core';

/**
 * Configuration options for MatchplayClient
 */
export interface MatchplayClientOptions {
  /**
   * Base URL for the Matchplay API
   * @default 'https://app.matchplay.events/api'
   */
  baseUrl?: string;

  /**
   * Bearer token for authenticated requests
   * Obtain from Matchplay account settings under API tokens
   */
  apiToken?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Parameters for listing tournaments
 */
export interface TournamentListParams {
  /** Filter by tournament status */
  status?: 'registration' | 'queued' | 'active' | 'completed' | 'cancelled';
  /** Filter by organizer ID */
  organizerId?: number;
  /** Filter by location ID */
  locationId?: number;
  /** Filter by series ID */
  seriesId?: number;
  /** Maximum number of results */
  limit?: number;
  /** Number of results to skip (for pagination) */
  offset?: number;
}

/**
 * Parameters for listing games
 */
export interface GameListParams {
  /** Filter by player ID */
  player?: number;
  /** Filter by arena ID */
  arena?: number;
  /** Filter by round ID */
  round?: number;
  /** Filter by bank ID */
  bank?: number;
  /** Filter by game status */
  status?: 'pending' | 'active' | 'completed';
}

/**
 * Options for fetching user details
 */
export interface UserOptions {
  /** Include IFPA data in response */
  includeIfpa?: boolean;
  /** Include Matchplay rating data in response */
  includeRating?: boolean;
  /** Include tournament/game counts in response */
  includeCounts?: boolean;
}

/**
 * Parameters for listing ratings
 */
export interface RatingParams {
  /** Maximum number of results */
  limit?: number;
  /** Number of results to skip (for pagination) */
  offset?: number;
}

/**
 * Options for transforming Matchplay data to OPPR types
 */
export interface TransformOptions {
  /**
   * Whether to include players without ratings/rankings
   * @default true
   */
  includeUnrated?: boolean;

  /**
   * Default rating for players without Matchplay or IFPA rating
   * @default 1500
   */
  defaultRating?: number;

  /**
   * Default ranking for unranked players
   * @default 99999
   */
  defaultRanking?: number;

  /**
   * Default rating deviation for players without RD data
   * @default 350
   */
  defaultRD?: number;

  /**
   * Event booster type for the tournament
   * Cannot be inferred from Matchplay data, must be provided
   * @default 'none'
   */
  eventBooster?: EventBoosterType;
}

/**
 * Options for transforming player data
 */
export interface PlayerTransformOptions {
  /**
   * Prefer Matchplay rating over IFPA rating when both are available
   * @default true
   */
  preferMatchplayRating?: boolean;

  /**
   * Default rating for players without rating data
   * @default 1500
   */
  defaultRating?: number;

  /**
   * Default ranking for unranked players
   * @default 99999
   */
  defaultRanking?: number;

  /**
   * Default rating deviation
   * @default 350
   */
  defaultRD?: number;
}

/**
 * Simplified game data returned by the client
 */
export interface TournamentGame {
  gameId: number;
  roundId: number;
  arenaId: number;
  status: 'pending' | 'active' | 'completed';
  players: Array<{
    playerId: number;
    name: string;
    userId?: number;
  }>;
  scores: (number | null)[];
  points: (number | null)[];
  completedAt: Date | null;
}

/**
 * Simplified round data returned by the client
 */
export interface TournamentRound {
  roundId: number;
  name: string;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
}
