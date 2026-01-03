import type { GlickoConfig } from './types.js';

/**
 * Default Glicko configuration values
 */
export const DEFAULT_GLICKO_CONFIG: GlickoConfig = {
  /** Default/provisional rating for new players */
  DEFAULT_RATING: 1300,
  /** Minimum rating deviation (most confident) */
  MIN_RD: 10,
  /** Maximum rating deviation (least confident, new player) */
  MAX_RD: 200,
  /** Rating deviation increase per day of inactivity */
  RD_DECAY_PER_DAY: 0.3,
  /** Number of players above/below used for rating calculation */
  OPPONENTS_RANGE: 32,
  /** Glicko system constant (q value = ln(10)/400) */
  Q: Math.LN10 / 400,
  /** Minimum events to no longer be considered provisional */
  PROVISIONAL_THRESHOLD: 5,
};
