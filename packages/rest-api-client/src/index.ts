// Main client
export { OpprsClient } from './client.js';

// Error classes
export {
  OpprsApiError,
  OpprsAuthError,
  OpprsForbiddenError,
  OpprsNotFoundError,
  OpprsValidationError,
  OpprsConflictError,
  OpprsNetworkError,
  OpprsTimeoutError,
  OpprsExternalServiceError,
} from './errors.js';

// Public types
export type {
  // Client options
  OpprsClientOptions,
  TokenPair,
  // Pagination
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  // Error
  ApiErrorResponse,
  // Auth
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  User,
  // Players
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  PlayerListParams,
  PlayerSearchParams,
  TopPlayersParams,
  PlayerStats,
  PlayerResult,
  // Tournaments
  EventBoosterType,
  Tournament,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentListParams,
  TournamentSearchParams,
  TournamentStats,
  TournamentResult,
  // Results
  Result,
  ResultWithRelations,
  CreateResultRequest,
  UpdateResultRequest,
  ResultListParams,
  BatchCreateResultsResponse,
  RecalculateDecayResponse,
  // Stats
  OverviewStats,
  LeaderboardParams,
  // Import
  ImportMatchplayTournamentRequest,
  ImportTournamentResponse,
  ExternalServiceError,
} from './types/index.js';
