import type { BaseRatingData } from '@opprs/rating-system-base';

/**
 * Glicko-specific rating data
 */
export interface GlickoRatingData extends BaseRatingData {
  /** Rating deviation (uncertainty) - lower means more certain */
  ratingDeviation: number;
}

/**
 * Configuration options for the Glicko rating system
 */
export interface GlickoConfig {
  /** Default rating for new players */
  DEFAULT_RATING: number;
  /** Minimum rating deviation (most certain) */
  MIN_RD: number;
  /** Maximum rating deviation (most uncertain) */
  MAX_RD: number;
  /** RD increase per day of inactivity */
  RD_DECAY_PER_DAY: number;
  /** Number of opponents above/below to consider in tournament simulation */
  OPPONENTS_RANGE: number;
  /** Glicko system constant q = ln(10)/400 */
  Q: number;
  /** Minimum events to no longer be provisional */
  PROVISIONAL_THRESHOLD: number;
}

/**
 * Match result for Glicko calculations with opponent RD
 */
export interface GlickoMatchResult {
  /** Opponent's rating value */
  opponentRating: number;
  /** Opponent's rating deviation */
  opponentRD: number;
  /** Match result: 1 = win, 0.5 = draw, 0 = loss */
  score: number;
}
