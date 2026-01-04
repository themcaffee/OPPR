// Main client
export { OpprsClient } from './client.js';

// Utility functions
export { formatPlayerName } from './utils.js';

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
  RegisterRequest,
  PlayerProfile,
  AuthUser,
  AuthResponse,
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
  // Users (Admin)
  UserWithPlayer,
  UserListParams,
  UpdateUserRoleRequest,
  UpdateUserRequest,
} from './types/index.js';
