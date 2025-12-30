/**
 * Constants for OPPR calculations based on the ranking system rules
 */

import type { OPPRConfig } from './config.js';

/**
 * Base Value Constants
 */
const BASE_VALUE = {
  /** Points per rated player */
  POINTS_PER_PLAYER: 0.5,
  /** Maximum base value (achieved at 64+ rated players) */
  MAX_BASE_VALUE: 32,
  /** Player count that achieves maximum base value */
  MAX_PLAYER_COUNT: 64,
  /** Minimum events to become a rated player */
  RATED_PLAYER_THRESHOLD: 5,
};

/**
 * Tournament Value Adjustment (TVA) Constants
 */
const TVA = {
  /** Rating-based TVA formula constants */
  RATING: {
    /** Maximum TVA points from ratings */
    MAX_VALUE: 25,
    /** Rating multiplier coefficient */
    COEFFICIENT: 0.000546875,
    /** Rating offset constant */
    OFFSET: 0.703125,
    /** Perfect player rating */
    PERFECT_RATING: 2000,
    /** Minimum rating that contributes to TVA */
    MIN_EFFECTIVE_RATING: 1285.71,
  },
  /** Ranking-based TVA formula constants */
  RANKING: {
    /** Maximum TVA points from rankings */
    MAX_VALUE: 50,
    /** Natural log coefficient */
    COEFFICIENT: -0.211675054,
    /** Constant offset */
    OFFSET: 1.459827968,
  },
  /** Maximum players considered for TVA calculation */
  MAX_PLAYERS_CONSIDERED: 64,
};

/**
 * Tournament Grading Percentage (TGP) Constants
 */
const TGP = {
  /** Base TGP percentage per meaningful game (4% = 0.04) */
  BASE_GAME_VALUE: 0.04,
  /** Maximum TGP for events without separate qualifying and finals */
  MAX_WITHOUT_FINALS: 1.0,
  /** Maximum TGP for events with qualifying and finals */
  MAX_WITH_FINALS: 2.0,
  /** Maximum meaningful games to reach 200% TGP */
  MAX_GAMES_FOR_200_PERCENT: 50,
  /** Multipliers for group play formats */
  MULTIPLIERS: {
    /** 4-player PAPA-style groups */
    FOUR_PLAYER_GROUPS: 2.0,
    /** 3-player groups */
    THREE_PLAYER_GROUPS: 1.5,
    /** Unlimited best game qualifying (min 20 hours) */
    UNLIMITED_BEST_GAME: 2.0,
    /** Hybrid best game qualifying */
    HYBRID_BEST_GAME: 3.0,
    /** Unlimited card qualifying (min 20 hours) */
    UNLIMITED_CARD: 4.0,
  },
  /** Ball count adjustments */
  BALL_ADJUSTMENTS: {
    /** 1-ball formats */
    ONE_BALL: 0.33,
    /** 2-ball formats */
    TWO_BALL: 0.66,
    /** 3+ ball formats */
    THREE_PLUS_BALL: 1.0,
  },
  /** Qualifying time component (1% per hour, max 20%) */
  UNLIMITED_QUALIFYING: {
    PERCENT_PER_HOUR: 0.01,
    MAX_BONUS: 0.2,
    MIN_HOURS_FOR_MULTIPLIER: 20,
  },
  /** Flip Frenzy grading divisors */
  FLIP_FRENZY: {
    THREE_BALL_DIVISOR: 2,
    ONE_BALL_DIVISOR: 3,
  },
  /** Finals eligibility requirements */
  FINALS_REQUIREMENTS: {
    /** Minimum % of participants that must advance to finals */
    MIN_FINALISTS_PERCENT: 0.1,
    /** Maximum % of participants that can advance to finals */
    MAX_FINALISTS_PERCENT: 0.5,
  },
};

/**
 * Event Booster Multipliers
 */
const EVENT_BOOSTERS = {
  /** No booster */
  NONE: 1.0,
  /** Certified events (125% = 1.25) */
  CERTIFIED: 1.25,
  /** Certified+ events (150% = 1.5) */
  CERTIFIED_PLUS: 1.5,
  /** Championship Series events (150% = 1.5) */
  CHAMPIONSHIP_SERIES: 1.5,
  /** Major Championships (200% = 2.0) */
  MAJOR: 2.0,
};

/**
 * Point Distribution Constants
 */
const POINT_DISTRIBUTION = {
  /** Linear distribution percentage (10%) */
  LINEAR_PERCENTAGE: 0.1,
  /** Dynamic distribution percentage (90%) */
  DYNAMIC_PERCENTAGE: 0.9,
  /** Dynamic formula exponent for position calculation */
  POSITION_EXPONENT: 0.7,
  /** Dynamic formula exponent for final value */
  VALUE_EXPONENT: 3,
  /** Maximum players for dynamic calculation cap */
  MAX_DYNAMIC_PLAYERS: 64,
};

/**
 * Time Decay Constants
 */
const TIME_DECAY = {
  /** Points worth 100% of value (0-1 years) */
  YEAR_0_TO_1: 1.0,
  /** Points worth 75% of value (1-2 years) */
  YEAR_1_TO_2: 0.75,
  /** Points worth 50% of value (2-3 years) */
  YEAR_2_TO_3: 0.5,
  /** Points worth 0% of value (3+ years) */
  YEAR_3_PLUS: 0.0,
  /** Days in a year for calculations */
  DAYS_PER_YEAR: 365,
};

/**
 * Player Ranking Constants
 */
const RANKING = {
  /** Number of events that count toward player ranking */
  TOP_EVENTS_COUNT: 15,
  /** Percentile for entry ranking of first-time players */
  ENTRY_RANKING_PERCENTILE: 0.1,
};

/**
 * Rating System Constants (Glicko)
 */
const RATING = {
  /** Default/provisional rating for new players */
  DEFAULT_RATING: 1300,
  /** Minimum rating deviation */
  MIN_RD: 10,
  /** Maximum rating deviation */
  MAX_RD: 200,
  /** RD decay rate per day */
  RD_DECAY_PER_DAY: 0.3,
  /** Number of players above/below used for rating calculation */
  OPPONENTS_RANGE: 32,
  /** Glicko system constant (q value) */
  Q: Math.LN10 / 400,
};

/**
 * Tournament Validation Constants
 */
const VALIDATION = {
  /** Minimum players for a sanctioned event */
  MIN_PLAYERS: 3,
  /** Minimum private tournament players */
  MIN_PRIVATE_PLAYERS: 16,
  /** Maximum games per machine per state/round */
  MAX_GAMES_PER_MACHINE: 3,
  /** Minimum participation percentage for inclusion */
  MIN_PARTICIPATION_PERCENT: 0.5,
};

/**
 * Default OPPR configuration with all constant groups
 * These are the original OPPR calculation constants
 */
export const DEFAULT_CONSTANTS: OPPRConfig = {
  BASE_VALUE,
  TVA,
  TGP,
  EVENT_BOOSTERS,
  POINT_DISTRIBUTION,
  TIME_DECAY,
  RANKING,
  RATING,
  VALIDATION,
};
