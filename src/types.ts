/**
 * Player information for OPPR calculations
 */
export interface Player {
  /** Unique identifier for the player */
  id: string;
  /** Player's current rating (Glicko-based) */
  rating: number;
  /** Player's current world ranking position (1 = highest) */
  ranking: number;
  /** Whether the player is rated (has participated in 5+ events) */
  isRated: boolean;
  /** Player's rating deviation (RD) for Glicko calculations */
  ratingDeviation?: number;
  /** Number of events player has participated in */
  eventCount?: number;
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
 * Glicko rating calculation input
 */
export interface RatingUpdate {
  /** Player's current rating */
  currentRating: number;
  /** Player's current rating deviation */
  currentRD: number;
  /** Opponents faced (as wins/losses based on finishing order) */
  results: Array<{
    /** Opponent rating */
    opponentRating: number;
    /** Opponent RD */
    opponentRD: number;
    /** Result: 1 = win, 0.5 = tie, 0 = loss */
    score: number;
  }>;
}

/**
 * Glicko rating calculation output
 */
export interface RatingResult {
  /** New rating after update */
  newRating: number;
  /** New rating deviation after update */
  newRD: number;
}

/**
 * Time decay configuration
 */
export interface DecayConfig {
  /** Reference date for calculating age (defaults to current date) */
  referenceDate?: Date;
}
