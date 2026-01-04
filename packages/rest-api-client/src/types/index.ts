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
  // Locations
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationListParams,
  LocationSearchParams,
  // Tournaments
  EventBoosterType,
  Tournament,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentListParams,
  TournamentSearchParams,
  TournamentStats,
  TournamentResult,
  // Standings
  Standing,
  StandingWithRelations,
  CreateStandingRequest,
  UpdateStandingRequest,
  StandingListParams,
  BatchCreateStandingsResponse,
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
} from './api-types.js';
