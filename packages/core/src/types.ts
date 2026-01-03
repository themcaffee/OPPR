import type { PlayerRatings } from '@opprs/rating-system-base';

/**
 * Player information for OPPR calculations
 */
export interface Player {
  /** Unique identifier for the player */
  id: string;
  /** Player's current world ranking position (1 = highest) */
  ranking: number;
  /** Whether the player is rated (has participated in 5+ events) */
  isRated: boolean;
  /** Number of events player has participated in */
  eventCount?: number;
  /**
   * Player's ratings across different rating systems
   * @example
   * {
   *   glicko: { value: 1650, ratingDeviation: 75 },
   *   elo: { value: 1580 }
   * }
   */
  ratings: PlayerRatings;
}

/**
 * Tournament format type
 */
export type TournamentFormatType =
  | 'single-elimination'
  | 'double-elimination'
  | 'match-play'
  | 'best-game'
  | 'card-qualifying'
  | 'pin-golf'
  | 'flip-frenzy'
  | 'strike-format'
  | 'target-match-play'
  | 'hybrid'
  | 'none';

/**
 * Qualifying format configuration
 */
export type QualifyingType = 'unlimited' | 'limited' | 'hybrid' | 'none';

/**
 * Group size for match play formats
 */
export type GroupSize = 2 | 3 | 4;

/**
 * Event booster classification
 */
export type EventBoosterType =
  | 'none'
  | 'certified'
  | 'certified-plus'
  | 'championship-series'
  | 'major';

/**
 * Tournament Grading Percentage (TGP) calculation details
 */
export interface TGPConfig {
  /** Qualifying format configuration */
  qualifying: {
    type: QualifyingType;
    /** Number of meaningful games played in qualifying */
    meaningfulGames: number;
    /** Number of qualifying hours (for unlimited formats) */
    hours?: number;
    /** Whether format uses 4-player groups (2X multiplier) */
    fourPlayerGroups?: boolean;
    /** Whether format uses 3-player groups (1.5X multiplier) */
    threePlayerGroups?: boolean;
    /** Whether format uses multi-matchplay (no group multiplier) */
    multiMatchplay?: boolean;
    /** Number of machines/games in qualifying */
    machineCount?: number;
    /** Total entry attempts allowed */
    totalEntries?: number;
  };
  /** Finals format configuration */
  finals: {
    /** Tournament format type */
    formatType: TournamentFormatType;
    /** Number of meaningful games in finals (expected value for brackets) */
    meaningfulGames: number;
    /** Whether format uses 4-player groups (2X multiplier) */
    fourPlayerGroups?: boolean;
    /** Whether format uses 3-player groups (1.5X multiplier) */
    threePlayerGroups?: boolean;
    /** Whether format uses multi-matchplay (no group multiplier) */
    multiMatchplay?: boolean;
    /** Number of finalists */
    finalistCount?: number;
  };
  /** Ball count adjustments (1-ball = 33%, 2-ball = 66%, 3+ = 100%) */
  ballCountAdjustment?: number;
}

/**
 * Tournament event data
 */
export interface Tournament {
  /** Tournament identifier */
  id: string;
  /** Tournament name */
  name: string;
  /** Date of the tournament */
  date: Date;
  /** List of players who participated */
  players: Player[];
  /** TGP configuration details */
  tgpConfig: TGPConfig;
  /** Event booster type */
  eventBooster: EventBoosterType;
  /** Whether players can opt-out (affects player count) */
  allowsOptOut?: boolean;
}

/**
 * Player finishing position and details
 */
export interface PlayerResult {
  /** Player information */
  player: Player;
  /** Finishing position (1 = first place) */
  position: number;
  /** Whether player opted out (not counted in calculations) */
  optedOut?: boolean;
}

/**
 * Tournament value calculation breakdown
 */
export interface TournamentValue {
  /** Base value (0.5 per rated player, max 32) */
  baseValue: number;
  /** Tournament Value Adjustment from player ratings */
  tvaRating: number;
  /** Tournament Value Adjustment from player rankings */
  tvaRanking: number;
  /** Total TVA (tvaRating + tvaRanking) */
  totalTVA: number;
  /** Tournament Grading Percentage (as decimal, e.g., 1.5 = 150%) */
  tgp: number;
  /** Event booster multiplier (as decimal, e.g., 2.0 = 200%) */
  eventBoosterMultiplier: number;
  /** Final first place value */
  firstPlaceValue: number;
}

/**
 * Point distribution for a single player
 */
export interface PointDistribution {
  /** Player information */
  player: Player;
  /** Finishing position */
  position: number;
  /** Linear distribution points */
  linearPoints: number;
  /** Dynamic distribution points */
  dynamicPoints: number;
  /** Total points awarded (linear + dynamic) */
  totalPoints: number;
}

/**
 * Complete tournament results with points
 */
export interface TournamentResult {
  /** Tournament information */
  tournament: Tournament;
  /** Tournament value breakdown */
  value: TournamentValue;
  /** Points awarded to each player */
  pointsDistribution: PointDistribution[];
}

/**
 * Player event record (for efficiency and decay calculations)
 */
export interface PlayerEvent {
  /** Tournament information */
  tournament: Tournament;
  /** Finishing position */
  position: number;
  /** Points earned */
  pointsEarned: number;
  /** First place value for this tournament */
  firstPlaceValue: number;
  /** Event date */
  date: Date;
  /** Age of event in days */
  ageInDays: number;
  /** Time decay multiplier (1.0, 0.75, 0.5, or 0.0) */
  decayMultiplier: number;
  /** Points after applying decay */
  decayedPoints: number;
}

/**
 * Player ranking profile
 */
export interface PlayerProfile {
  /** Player information */
  player: Player;
  /** All active events (top 15 + any others within 3 years) */
  events: PlayerEvent[];
  /** Top 15 events counting toward ranking */
  top15Events: PlayerEvent[];
  /** Total ranking points (sum of top 15 decayed points) */
  totalPoints: number;
  /** Efficiency percentage */
  efficiency: number;
}

/**
 * Time decay configuration
 */
export interface DecayConfig {
  /** Reference date for calculating age (defaults to current date) */
  referenceDate?: Date;
}

/**
 * Base Value Constants Type
 */
export interface BaseValueConstants {
  /** Points per rated player */
  POINTS_PER_PLAYER: number;
  /** Maximum base value (achieved at 64+ rated players) */
  MAX_BASE_VALUE: number;
  /** Player count that achieves maximum base value */
  MAX_PLAYER_COUNT: number;
  /** Minimum events to become a rated player */
  RATED_PLAYER_THRESHOLD: number;
}

/**
 * Tournament Value Adjustment (TVA) Constants Type
 */
export interface TVAConstants {
  /** Rating-based TVA formula constants */
  RATING: {
    /** Maximum TVA points from ratings */
    MAX_VALUE: number;
    /** Rating multiplier coefficient */
    COEFFICIENT: number;
    /** Rating offset constant */
    OFFSET: number;
    /** Perfect player rating */
    PERFECT_RATING: number;
    /** Minimum rating that contributes to TVA */
    MIN_EFFECTIVE_RATING: number;
  };
  /** Ranking-based TVA formula constants */
  RANKING: {
    /** Maximum TVA points from rankings */
    MAX_VALUE: number;
    /** Natural log coefficient */
    COEFFICIENT: number;
    /** Constant offset */
    OFFSET: number;
  };
  /** Maximum players considered for TVA calculation */
  MAX_PLAYERS_CONSIDERED: number;
}

/**
 * Tournament Grading Percentage (TGP) Constants Type
 */
export interface TGPConstants {
  /** Base TGP percentage per meaningful game (4% = 0.04) */
  BASE_GAME_VALUE: number;
  /** Maximum TGP for events without separate qualifying and finals */
  MAX_WITHOUT_FINALS: number;
  /** Maximum TGP for events with qualifying and finals */
  MAX_WITH_FINALS: number;
  /** Maximum meaningful games to reach 200% TGP */
  MAX_GAMES_FOR_200_PERCENT: number;
  /** Multipliers for group play formats */
  MULTIPLIERS: {
    /** 4-player PAPA-style groups */
    FOUR_PLAYER_GROUPS: number;
    /** 3-player groups */
    THREE_PLAYER_GROUPS: number;
    /** Unlimited best game qualifying (min 20 hours) */
    UNLIMITED_BEST_GAME: number;
    /** Hybrid best game qualifying */
    HYBRID_BEST_GAME: number;
    /** Unlimited card qualifying (min 20 hours) */
    UNLIMITED_CARD: number;
  };
  /** Ball count adjustments */
  BALL_ADJUSTMENTS: {
    /** 1-ball formats */
    ONE_BALL: number;
    /** 2-ball formats */
    TWO_BALL: number;
    /** 3+ ball formats */
    THREE_PLUS_BALL: number;
  };
  /** Qualifying time component (1% per hour, max 20%) */
  UNLIMITED_QUALIFYING: {
    PERCENT_PER_HOUR: number;
    MAX_BONUS: number;
    MIN_HOURS_FOR_MULTIPLIER: number;
  };
  /** Flip Frenzy grading divisors */
  FLIP_FRENZY: {
    THREE_BALL_DIVISOR: number;
    ONE_BALL_DIVISOR: number;
  };
  /** Finals eligibility requirements */
  FINALS_REQUIREMENTS: {
    /** Minimum % of participants that must advance to finals */
    MIN_FINALISTS_PERCENT: number;
    /** Maximum % of participants that can advance to finals */
    MAX_FINALISTS_PERCENT: number;
  };
}

/**
 * Event Booster Multipliers Type
 */
export interface EventBoosterConstants {
  /** No booster */
  NONE: number;
  /** Certified events (125% = 1.25) */
  CERTIFIED: number;
  /** Certified+ events (150% = 1.5) */
  CERTIFIED_PLUS: number;
  /** Championship Series events (150% = 1.5) */
  CHAMPIONSHIP_SERIES: number;
  /** Major Championships (200% = 2.0) */
  MAJOR: number;
}

/**
 * Point Distribution Constants Type
 */
export interface PointDistributionConstants {
  /** Linear distribution percentage (10%) */
  LINEAR_PERCENTAGE: number;
  /** Dynamic distribution percentage (90%) */
  DYNAMIC_PERCENTAGE: number;
  /** Dynamic formula exponent for position calculation */
  POSITION_EXPONENT: number;
  /** Dynamic formula exponent for final value */
  VALUE_EXPONENT: number;
  /** Maximum players for dynamic calculation cap */
  MAX_DYNAMIC_PLAYERS: number;
}

/**
 * Time Decay Constants Type
 */
export interface TimeDecayConstants {
  /** Points worth 100% of value (0-1 years) */
  YEAR_0_TO_1: number;
  /** Points worth 75% of value (1-2 years) */
  YEAR_1_TO_2: number;
  /** Points worth 50% of value (2-3 years) */
  YEAR_2_TO_3: number;
  /** Points worth 0% of value (3+ years) */
  YEAR_3_PLUS: number;
  /** Days in a year for calculations */
  DAYS_PER_YEAR: number;
}

/**
 * Player Ranking Constants Type
 */
export interface RankingConstants {
  /** Number of events that count toward player ranking */
  TOP_EVENTS_COUNT: number;
  /** Percentile for entry ranking of first-time players */
  ENTRY_RANKING_PERCENTILE: number;
}

/**
 * Tournament Validation Constants Type
 */
export interface ValidationConstants {
  /** Minimum players for a sanctioned event */
  MIN_PLAYERS: number;
  /** Minimum private tournament players */
  MIN_PRIVATE_PLAYERS: number;
  /** Maximum games per machine per state/round */
  MAX_GAMES_PER_MACHINE: number;
  /** Minimum participation percentage for inclusion */
  MIN_PARTICIPATION_PERCENT: number;
}
