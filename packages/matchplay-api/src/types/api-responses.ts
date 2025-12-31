/**
 * Internal types for raw Matchplay API responses
 * These are not exported publicly - only used internally for transformations
 */

/**
 * Matchplay tournament status
 */
export type MatchplayTournamentStatus =
  | 'registration'
  | 'queued'
  | 'active'
  | 'completed'
  | 'cancelled';

/**
 * Matchplay game status
 */
export type MatchplayGameStatus = 'pending' | 'active' | 'completed';

/**
 * Organizer information
 */
export interface MatchplayOrganizer {
  organizerId: number;
  name: string;
  userId: number;
}

/**
 * Location information
 */
export interface MatchplayLocation {
  locationId: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Tournament data from Matchplay API
 */
export interface MatchplayTournament {
  tournamentId: number;
  name: string;
  status: MatchplayTournamentStatus;
  type: string;
  startUtc: string;
  startLocal: string;
  endUtc: string | null;
  endLocal: string | null;
  completedAt: string | null;
  organizerId: number;
  locationId: number | null;
  seriesId: number | null;
  description: string | null;
  pointsMap: number[] | null;
  tiebreakerPointsMap: number[] | null;
  test: boolean;
  timezone: string;
  scorekeeping: string;
  link: string;
  linkedTournamentId: number | null;
  estimatedTgp: number | null;
  seeding: string | null;
  pairing: string | null;
  organizer?: MatchplayOrganizer;
  location?: MatchplayLocation;
}

/**
 * User basic information
 */
export interface MatchplayUser {
  userId: number;
  name: string;
  ifpaId: number | null;
  role: string;
  flag: string | null;
  location: string | null;
  pronouns: string | null;
  initials: string | null;
  avatar: string | null;
  banner: string | null;
  tournamentAvatar: string | null;
  createdAt: string;
}

/**
 * Rating information from Matchplay
 */
export interface MatchplayRatingInfo {
  ratingId: number;
  userId: number;
  ifpaId: number | null;
  name: string;
  rating: number;
  rd: number;
  calculatedRd: number;
  lowerBound: number;
  lastRatingPeriod: string;
  rank: number;
}

/**
 * IFPA information
 */
export interface MatchplayIfpaInfo {
  ifpaId: number;
  name: string;
  rank: number;
  rating: number;
  ratingRank: number;
  womensRank: number | null;
  totalEvents: number;
  countryCode: string;
  updatedAt: string;
}

/**
 * User statistics counts
 */
export interface MatchplayUserCounts {
  tournaments: number;
  games: number;
  wins: number;
}

/**
 * User with full rating and IFPA information
 */
export interface MatchplayUserWithDetails extends MatchplayUser {
  rating?: MatchplayRatingInfo;
  ifpa?: MatchplayIfpaInfo;
  userCounts?: MatchplayUserCounts;
}

/**
 * Rating search result
 */
export interface MatchplayRating {
  ratingId: number;
  userId: number;
  ifpaId: number | null;
  name: string;
  rating: number;
  rd: number;
  calculatedRd: number;
  lowerBound: number;
  lastRatingPeriod: string;
  rank: number;
}

/**
 * Tournament standing/position
 */
export interface MatchplayStanding {
  playerId: number;
  position: number;
  name: string;
  points: number;
  wins: number;
  losses: number;
  ties: number;
  userId?: number;
  ifpaId?: number;
}

/**
 * Player within a game
 */
export interface MatchplayGamePlayer {
  playerId: number;
  name: string;
  userId?: number;
}

/**
 * Game data
 */
export interface MatchplayGame {
  gameId: number;
  tournamentId: number;
  roundId: number;
  arenaId: number;
  status: MatchplayGameStatus;
  players: MatchplayGamePlayer[];
  scores: (number | null)[];
  points: (number | null)[];
  createdAt: string;
  completedAt: string | null;
}

/**
 * Round data
 */
export interface MatchplayRound {
  roundId: number;
  tournamentId: number;
  name: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * Card/arena data
 */
export interface MatchplayCard {
  cardId: number;
  tournamentId: number;
  arenaId: number;
  name: string;
  status: string;
}

/**
 * Tournament matchplay statistics
 */
export interface MatchplayStats {
  tournamentId: number;
  totalGames: number;
  completedGames: number;
  averageGameDuration: number | null;
}

/**
 * Round statistics
 */
export interface MatchplayRoundStats {
  tournamentId: number;
  rounds: Array<{
    roundId: number;
    name: string;
    totalGames: number;
    completedGames: number;
  }>;
}

/**
 * Player statistics in tournament
 */
export interface MatchplayPlayerStats {
  playerId: number;
  name: string;
  userId?: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  averagePoints: number;
}

/**
 * Wrapper response for list endpoints
 */
export interface MatchplayListResponse<T> {
  data: T[];
}

/**
 * Wrapper response for single item endpoints
 */
export interface MatchplaySingleResponse<T> {
  data: T;
}

/**
 * Paginated response wrapper
 */
export interface MatchplayPaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
