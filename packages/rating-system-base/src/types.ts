/**
 * Unique identifier for a rating system (e.g., 'glicko', 'elo')
 */
export type RatingSystemId = string;

/**
 * Base rating data that all rating systems must store
 */
export interface BaseRatingData {
  /** The primary rating value */
  value: number;
  /** When this rating was last updated */
  lastUpdated?: Date;
}

/**
 * Result of a match against an opponent
 */
export interface MatchResult<T extends BaseRatingData = BaseRatingData> {
  /** Opponent's rating data */
  opponentRating: T;
  /** Result: 1 = win, 0.5 = draw, 0 = loss */
  score: number;
}

/**
 * Result of a rating update calculation
 */
export interface RatingUpdateResult<T extends BaseRatingData> {
  /** New rating data after update */
  newRating: T;
  /** Optional change delta for display */
  change?: number;
}

/**
 * Player result in a tournament for rating calculations
 */
export interface PlayerRatingResult<T extends BaseRatingData = BaseRatingData> {
  /** Finishing position (1 = first place) */
  position: number;
  /** Player's rating data */
  rating: T;
}

/**
 * Interface that all rating systems must implement
 */
export interface RatingSystem<T extends BaseRatingData = BaseRatingData> {
  /** Unique identifier for this rating system */
  readonly id: RatingSystemId;

  /** Human-readable name */
  readonly name: string;

  /**
   * Create initial rating for a new player
   */
  createNewRating(): T;

  /**
   * Update rating based on match results
   * @param currentRating - Player's current rating
   * @param results - Array of match results against opponents
   * @returns Updated rating and optional change delta
   */
  updateRating(currentRating: T, results: MatchResult<T>[]): RatingUpdateResult<T>;

  /**
   * Get the primary rating value for sorting/comparison
   * @param rating - Rating data
   * @returns Numeric rating value
   */
  getRatingValue(rating: T): number;

  /**
   * Check if rating is provisional (new player with high uncertainty)
   * @param rating - Rating data
   * @param eventCount - Number of events player has participated in
   * @returns True if rating is provisional
   */
  isProvisional(rating: T, eventCount: number): boolean;

  /**
   * Apply inactivity decay to rating (optional)
   * @param rating - Current rating data
   * @param daysSinceLastEvent - Number of days since last event
   * @returns Updated rating data with decay applied
   */
  applyInactivityDecay?(rating: T, daysSinceLastEvent: number): T;

  /**
   * Convert tournament positions to match results (optional)
   * Used to simulate head-to-head matches from tournament standings
   * @param playerPosition - The player's finishing position
   * @param allResults - All player results sorted by position
   * @param options - Optional configuration (e.g., opponents range)
   * @returns Array of simulated match results
   */
  simulateTournamentMatches?(
    playerPosition: number,
    allResults: PlayerRatingResult<T>[],
    options?: { opponentsRange?: number }
  ): MatchResult<T>[];

  /**
   * Check if this rating contributes to TVA calculations (optional)
   * @param rating - Rating data
   * @returns True if rating should count toward TVA
   */
  contributesToTVA?(rating: T): boolean;

  /**
   * Calculate TVA contribution for a single player's rating (optional)
   * @param rating - Rating data
   * @returns TVA contribution value
   */
  calculateTVAContribution?(rating: T): number;
}
