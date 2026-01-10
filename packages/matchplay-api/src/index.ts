// Main client
export { MatchplayClient } from './client.js';

// Error classes
export {
  MatchplayApiError,
  MatchplayAuthError,
  MatchplayNotFoundError,
  MatchplayNetworkError,
  MatchplayTimeoutError,
  TransformError,
} from './errors.js';

// Public types
export type {
  MatchplayClientOptions,
  TournamentListParams,
  GameListParams,
  UserOptions,
  RatingParams,
  TransformOptions,
  PlayerTransformOptions,
  TournamentGame,
  TournamentRound,
} from './types/index.js';

// API response types (for consumers who need raw data)
export type { MatchplayStanding } from './types/api-responses.js';

// Re-export core types for convenience
export type {
  Player,
  Tournament,
  PlayerResult,
  TGPConfig,
  TournamentFormatType,
  EventBoosterType,
} from '@opprs/core';
