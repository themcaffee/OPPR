// Client options
export type { OpprsClientOptions, TokenPair } from './client-options.js';

// API types
export type {
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
} from './api-types.js';
