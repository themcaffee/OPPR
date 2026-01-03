// ==================== Pagination ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ==================== Error Response ====================

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// ==================== Auth ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface User {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

// Cookie-based auth types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface PlayerProfile {
  id: string;
  name: string | null;
  rating: number;
  ratingDeviation: number;
  ranking: number | null;
  isRated: boolean;
  eventCount: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  player: PlayerProfile | null;
}

export interface AuthResponse {
  user: AuthUser;
  message: string;
}

// ==================== Players ====================

export interface Player {
  id: string;
  externalId: string | null;
  name: string | null;
  rating: number;
  ratingDeviation: number;
  ranking: number | null;
  isRated: boolean;
  eventCount: number;
  lastRatingUpdate: string | null;
  lastEventDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerRequest {
  externalId?: string;
  name?: string;
  rating?: number;
  ratingDeviation?: number;
  ranking?: number;
  isRated?: boolean;
  eventCount?: number;
}

export interface UpdatePlayerRequest {
  name?: string;
  rating?: number;
  ratingDeviation?: number;
  ranking?: number;
  isRated?: boolean;
  eventCount?: number;
}

export interface PlayerListParams extends PaginationParams {
  sortBy?: 'rating' | 'ranking' | 'name' | 'eventCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  isRated?: boolean;
}

export interface PlayerSearchParams {
  q: string;
  limit?: number;
}

export interface TopPlayersParams {
  limit?: number;
}

export interface PlayerStats {
  totalEvents: number;
  totalPoints: number;
  totalDecayedPoints: number;
  averagePoints: number;
  averagePosition: number;
  averageFinish: number;
  averageEfficiency: number;
  firstPlaceFinishes: number;
  topThreeFinishes: number;
  bestFinish: number;
  highestPoints: number;
}

export interface PlayerResult {
  id: string;
  position: number;
  optedOut: boolean;
  linearPoints: number | null;
  dynamicPoints: number | null;
  totalPoints: number | null;
  ageInDays: number | null;
  decayMultiplier: number | null;
  decayedPoints: number | null;
  efficiency: number | null;
  tournament: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    eventBooster: EventBoosterType;
  };
}

// ==================== Tournaments ====================

export type EventBoosterType =
  | 'NONE'
  | 'CERTIFIED'
  | 'CERTIFIED_PLUS'
  | 'CHAMPIONSHIP_SERIES'
  | 'MAJOR';

export interface Tournament {
  id: string;
  externalId: string | null;
  name: string;
  location: string | null;
  date: string;
  tgpConfig: Record<string, unknown> | null;
  eventBooster: EventBoosterType;
  allowsOptOut: boolean;
  baseValue: number | null;
  tvaRating: number | null;
  tvaRanking: number | null;
  totalTVA: number | null;
  tgp: number | null;
  eventBoosterMultiplier: number | null;
  firstPlaceValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTournamentRequest {
  name: string;
  date: string;
  externalId?: string;
  location?: string;
  tgpConfig?: Record<string, unknown>;
  eventBooster?: EventBoosterType;
  allowsOptOut?: boolean;
  baseValue?: number;
  tvaRating?: number;
  tvaRanking?: number;
  totalTVA?: number;
  tgp?: number;
  eventBoosterMultiplier?: number;
  firstPlaceValue?: number;
}

export interface UpdateTournamentRequest {
  name?: string;
  date?: string;
  location?: string;
  tgpConfig?: Record<string, unknown>;
  eventBooster?: EventBoosterType;
  allowsOptOut?: boolean;
  baseValue?: number;
  tvaRating?: number;
  tvaRanking?: number;
  totalTVA?: number;
  tgp?: number;
  eventBoosterMultiplier?: number;
  firstPlaceValue?: number;
}

export interface TournamentListParams extends PaginationParams {
  sortBy?: 'date' | 'name' | 'firstPlaceValue' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  eventBooster?: EventBoosterType;
}

export interface TournamentSearchParams {
  q: string;
  limit?: number;
}

export interface TournamentStats {
  tournament: Tournament;
  playerCount: number;
  averagePoints: number;
  averageEfficiency: number;
  highestPoints: number;
  lowestPoints: number;
}

export interface TournamentResult {
  id: string;
  position: number;
  optedOut: boolean;
  linearPoints: number | null;
  dynamicPoints: number | null;
  totalPoints: number | null;
  ageInDays: number | null;
  decayMultiplier: number | null;
  decayedPoints: number | null;
  efficiency: number | null;
  player: {
    id: string;
    name: string | null;
    rating: number;
    ranking: number | null;
  };
}

// ==================== Results ====================

export interface Result {
  id: string;
  playerId: string;
  tournamentId: string;
  position: number;
  optedOut: boolean;
  linearPoints: number | null;
  dynamicPoints: number | null;
  totalPoints: number | null;
  ageInDays: number | null;
  decayMultiplier: number | null;
  decayedPoints: number | null;
  efficiency: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResultWithRelations extends Result {
  player: {
    id: string;
    name: string | null;
    rating: number;
    ranking: number | null;
  };
  tournament: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    eventBooster: EventBoosterType;
  };
}

export interface CreateResultRequest {
  playerId: string;
  tournamentId: string;
  position: number;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

export interface UpdateResultRequest {
  position?: number;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

export interface ResultListParams extends PaginationParams {
  playerId?: string;
  tournamentId?: string;
  sortBy?: 'position' | 'totalPoints' | 'decayedPoints' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchCreateResultsResponse {
  count: number;
}

export interface RecalculateDecayResponse {
  count: number;
  message: string;
}

// ==================== Stats ====================

export interface OverviewStats {
  players: {
    total: number;
    rated: number;
  };
  tournaments: {
    total: number;
  };
  results: {
    total: number;
  };
}

export interface LeaderboardParams {
  limit?: number;
  type?: 'ranking' | 'rating';
}

// ==================== Import ====================

export interface ImportMatchplayTournamentRequest {
  eventBooster?: EventBoosterType;
  apiToken?: string;
}

export interface ImportTournamentResponse {
  tournament: Tournament;
  playersCreated: number;
  playersUpdated: number;
  resultsCount: number;
  created: boolean;
}

export interface ExternalServiceError {
  statusCode: number;
  error: string;
  message: string;
  service: string;
}

// ==================== Users (Admin) ====================

export interface UserWithPlayer {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  playerId: string | null;
  player: PlayerProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams extends PaginationParams {
  sortBy?: 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserRoleRequest {
  role: 'USER' | 'ADMIN';
}
