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
  acceptPolicies: boolean;
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
    locationId: string | null;
    location?: Location | null;
    eventBooster: EventBoosterType;
  };
}

// ==================== Locations ====================

export interface Location {
  id: string;
  externalId: string | null;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  externalId?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface LocationListParams extends PaginationParams {
  sortBy?: 'name' | 'city' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LocationSearchParams {
  q: string;
  limit?: number;
}

// ==================== Tournaments ====================

export type EventBoosterType =
  | 'NONE'
  | 'CERTIFIED'
  | 'CERTIFIED_PLUS'
  | 'CHAMPIONSHIP_SERIES'
  | 'MAJOR';

export type TournamentFormatType =
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'MATCH_PLAY'
  | 'BEST_GAME'
  | 'CARD_QUALIFYING'
  | 'PIN_GOLF'
  | 'FLIP_FRENZY'
  | 'STRIKE_FORMAT'
  | 'TARGET_MATCH_PLAY'
  | 'HYBRID'
  | 'NONE';

export interface Tournament {
  id: string;
  externalId: string | null;
  name: string;
  description: string | null;
  date: string;
  locationId: string | null;
  location?: Location | null;
  organizerId: string | null;
  organizer?: {
    id: string;
    name: string | null;
  } | null;
  tgpConfig: Record<string, unknown> | null;
  eventBooster: EventBoosterType;
  qualifyingFormat: TournamentFormatType;
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
  description?: string;
  locationId?: string;
  organizerId?: string;
  tgpConfig?: Record<string, unknown>;
  eventBooster?: EventBoosterType;
  qualifyingFormat?: TournamentFormatType;
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
  description?: string | null;
  locationId?: string | null;
  organizerId?: string | null;
  tgpConfig?: Record<string, unknown>;
  eventBooster?: EventBoosterType;
  qualifyingFormat?: TournamentFormatType;
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

// ==================== Standings ====================

export interface Standing {
  id: string;
  playerId: string;
  tournamentId: string;
  position: number;
  isFinals: boolean;
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

export interface StandingWithRelations extends Standing {
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
    locationId: string | null;
    location?: Location | null;
    eventBooster: EventBoosterType;
  };
}

export interface CreateStandingRequest {
  playerId: string;
  tournamentId: string;
  position: number;
  isFinals?: boolean;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

export interface UpdateStandingRequest {
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

export interface StandingListParams extends PaginationParams {
  playerId?: string;
  tournamentId?: string;
  isFinals?: boolean;
  sortBy?: 'position' | 'totalPoints' | 'decayedPoints' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchCreateStandingsResponse {
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

export interface UpdateUserRequest {
  role?: 'USER' | 'ADMIN';
  playerId?: string | null;
  password?: string;
}

// ==================== Blog Posts ====================

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTagWithCount extends BlogTag {
  _count: {
    posts: number;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: PostStatus;
  publishedAt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  authorId: string;
  author: {
    id: string;
    email: string;
  };
  tags: BlogTag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  tagIds?: string[];
}

export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  status?: PostStatus;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  tagIds?: string[];
}

export interface BlogPostListParams extends PaginationParams {
  sortBy?: 'publishedAt' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  tagSlug?: string;
}

export interface AdminBlogPostListParams extends BlogPostListParams {
  status?: PostStatus;
}

export interface BlogPostSearchParams {
  q: string;
  limit?: number;
}

// ==================== Blog Tags ====================

export interface CreateBlogTagRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateBlogTagRequest {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface BlogTagListParams extends PaginationParams {
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogTagSearchParams {
  q: string;
  limit?: number;
}
