/**
 * Re-export Prisma generated types
 */
export type {
  Player,
  Tournament,
  TournamentResult,
  User,
  Location,
  EventBoosterType,
  Role,
  Prisma,
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

export type { CreateResultInput, UpdateResultInput, FindResultsOptions } from './results.js';

export type { CreateUserInput, UpdateUserInput, UserWithPlayer } from './users.js';

export type {
  CreateLocationInput,
  UpdateLocationInput,
  FindLocationsOptions,
} from './locations.js';

/**
 * Player with full tournament results
 */
export interface PlayerWithResults {
  player: Player;
  results: TournamentResultWithTournament[];
  stats: PlayerStatistics;
}

/**
 * Tournament result with tournament details
 */
export interface TournamentResultWithTournament {
  id: string;
  position: number;
  totalPoints: number;
  decayedPoints: number;
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
