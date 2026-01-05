/**
 * Re-export Prisma generated types
 */
export type {
  Player,
  Tournament,
  Round,
  Match,
  Entry,
  Standing,
  MatchResult,
  User,
  Location,
  EventBoosterType,
  TournamentFormatType,
  Role,
  Prisma,
  OpprPlayerRanking,
  OpprRankingHistory,
  OpprRankingChangeType,
} from '@prisma/client';

/**
 * Re-export custom input types
 */
export type { CreatePlayerInput, UpdatePlayerInput, FindPlayersOptions } from './players.js';

export type {
  CreateTournamentInput,
  UpdateTournamentInput,
  FindTournamentsOptions,
} from './tournaments.js';

export type { CreateRoundInput, UpdateRoundInput, FindRoundsOptions } from './rounds.js';

export type { CreateMatchInput, UpdateMatchInput, FindMatchesOptions } from './matches.js';

export type { CreateEntryInput, UpdateEntryInput, FindEntriesOptions } from './entries.js';

export type {
  CreateStandingInput,
  UpdateStandingInput,
  FindStandingsOptions,
  MergedStanding,
} from './standings.js';

export type { CreateUserInput, UpdateUserInput, UserWithPlayer } from './users.js';

export type {
  CreateLocationInput,
  UpdateLocationInput,
  FindLocationsOptions,
} from './locations.js';

export type {
  CreateOpprPlayerRankingInput,
  UpdateOpprPlayerRankingInput,
  FindOpprPlayerRankingsOptions,
  CreateOpprRankingHistoryInput,
} from './oppr-rankings.js';

/**
 * Player with full tournament standings
 */
export interface PlayerWithResults {
  player: Player;
  results: StandingWithTournament[];
  stats: PlayerStatistics;
}

/**
 * Standing with tournament details
 */
export interface StandingWithTournament {
  id: string;
  position: number;
  isFinals: boolean;
  totalPoints: number | null;
  decayedPoints: number | null;
  tournament: {
    id: string;
    name: string;
    date: Date;
    eventBooster: EventBoosterType;
  };
}

/**
 * Player statistics
 */
export interface PlayerStatistics {
  totalEvents: number;
  totalPoints: number;
  totalDecayedPoints: number;
  averagePosition: number;
  averageEfficiency: number;
  firstPlaceFinishes: number;
  topThreeFinishes: number;
  bestFinish: number;
  highestPoints: number;
}

/**
 * Tournament statistics
 */
export interface TournamentStatistics {
  totalPlayers: number;
  totalPoints: number;
  averagePosition: number;
  highestPoints: number;
  lowestPoints: number;
}

/**
 * Database connection status
 */
export interface ConnectionStatus {
  connected: boolean;
  error?: string;
}

// Import types to re-export properly
import type { Player, EventBoosterType } from '@prisma/client';
