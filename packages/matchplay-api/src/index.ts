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
  TournamentStats,
} from './types/index.js';

// Export raw API response types for advanced use cases
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
