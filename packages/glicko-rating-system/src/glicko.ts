import type {
  RatingSystem,
  MatchResult,
  RatingUpdateResult,
  PlayerRatingResult,
} from '@opprs/rating-system-base';
import type { GlickoRatingData, GlickoConfig, GlickoMatchResult } from './types.js';
import { DEFAULT_GLICKO_CONFIG } from './constants.js';

/**
 * Glicko Rating System Implementation
 *
 * The Glicko rating system extends traditional Elo by tracking rating deviation (RD),
 * which represents confidence in a player's rating. New players have high RD (uncertain),
 * while active players have low RD (certain).
 *
 * @see https://en.wikipedia.org/wiki/Glicko_rating_system
 */
export class GlickoRatingSystem implements RatingSystem<GlickoRatingData> {
  readonly id = 'glicko';
  readonly name = 'Glicko Rating System';

  constructor(private config: GlickoConfig = DEFAULT_GLICKO_CONFIG) {}

  /**
   * Create initial rating for a new player
   */
  createNewRating(): GlickoRatingData {
    return {
      value: this.config.DEFAULT_RATING,
      ratingDeviation: this.config.MAX_RD,
    };
  }

  /**
   * Update rating based on match results
   */
  updateRating(
    currentRating: GlickoRatingData,
    results: MatchResult<GlickoRatingData>[]
  ): RatingUpdateResult<GlickoRatingData> {
    // If no results, return current values (no change)
    if (results.length === 0) {
      return {
        newRating: { ...currentRating },
      };
    }

    // Convert to internal format
    const glickoResults: GlickoMatchResult[] = results.map((r) => ({
      opponentRating: r.opponentRating.value,
      opponentRD: r.opponentRating.ratingDeviation,
      score: r.score,
    }));

    // Calculate new rating using Glicko formulas
    const newRating = this.calculateNewRating(
      currentRating.value,
      currentRating.ratingDeviation,
      glickoResults
    );

    return {
      newRating,
      change: newRating.value - currentRating.value,
    };
  }

  /**
   * Get the primary rating value
   */
  getRatingValue(rating: GlickoRatingData): number {
    return rating.value;
  }

  /**
   * Check if rating is provisional (new player with high uncertainty)
   */
  isProvisional(_rating: GlickoRatingData, eventCount: number): boolean {
    return eventCount < this.config.PROVISIONAL_THRESHOLD;
  }

  /**
   * Apply inactivity decay - RD increases when player is inactive
   */
  applyInactivityDecay(rating: GlickoRatingData, daysSinceLastEvent: number): GlickoRatingData {
    const newRD = Math.min(
      rating.ratingDeviation + daysSinceLastEvent * this.config.RD_DECAY_PER_DAY,
      this.config.MAX_RD
    );

    return {
      ...rating,
      ratingDeviation: newRD,
    };
  }

  /**
   * Convert tournament positions to simulated head-to-head matches
   *
   * Based on finishing position:
   * - Players who finished above you = losses (score = 0)
   * - Players who tied with you = draws (score = 0.5)
   * - Players who finished below you = wins (score = 1)
   */
  simulateTournamentMatches(
    playerPosition: number,
    allResults: PlayerRatingResult<GlickoRatingData>[],
    options?: { opponentsRange?: number }
  ): MatchResult<GlickoRatingData>[] {
    const opponentsRange = options?.opponentsRange ?? this.config.OPPONENTS_RANGE;
    const matches: MatchResult<GlickoRatingData>[] = [];

    // Sort results by position
    const sortedResults = [...allResults].sort((a, b) => a.position - b.position);

    // Find the index of the current player
    const playerIndex = sortedResults.findIndex((r) => r.position === playerPosition);

    if (playerIndex === -1) return matches;

    // Get opponents within range
    const startIndex = Math.max(0, playerIndex - opponentsRange);
    const endIndex = Math.min(sortedResults.length, playerIndex + opponentsRange + 1);

    for (let i = startIndex; i < endIndex; i++) {
      if (i === playerIndex) continue; // Skip self

      const opponent = sortedResults[i];
      const opponentPosition = opponent.position;

      // Determine match result
      let score: number;
      if (opponentPosition < playerPosition) {
        score = 0; // Loss (opponent finished higher)
      } else if (opponentPosition === playerPosition) {
        score = 0.5; // Tie
      } else {
        score = 1; // Win (opponent finished lower)
      }

      matches.push({
        opponentRating: opponent.rating,
        score,
      });
    }

    return matches;
  }

  // ============================================
  // Private Glicko calculation methods
  // ============================================

  /**
   * Calculate new rating and RD from match results
   */
  private calculateNewRating(
    currentRating: number,
    currentRD: number,
    results: GlickoMatchResult[]
  ): GlickoRatingData {
    // Calculate d²
    const dSquared = this.calculateDSquared(results, currentRating);

    // Calculate sum of (g(RD) * (score - E))
    const sum = results.reduce((total, result) => {
      const g = this.calculateG(result.opponentRD);
      const e = this.calculateExpectedScore(
        currentRating,
        result.opponentRating,
        result.opponentRD
      );
      return total + g * (result.score - e);
    }, 0);

    // Calculate new rating
    const qSquared = this.config.Q * this.config.Q;
    const newRating =
      currentRating + (qSquared / (1 / (currentRD * currentRD) + 1 / dSquared)) * sum;

    // Calculate new RD
    const newRD = Math.sqrt(1 / (1 / (currentRD * currentRD) + 1 / dSquared));

    return {
      value: Math.round(newRating * 100) / 100, // Round to 2 decimal places
      ratingDeviation: Math.max(this.config.MIN_RD, Math.min(newRD, this.config.MAX_RD)),
    };
  }

  /**
   * Calculate the g(RD) function used in Glicko rating calculations
   *
   * g(RD) = 1 / sqrt(1 + 3*q²*RD² / π²)
   */
  private calculateG(rd: number): number {
    const qSquared = this.config.Q * this.config.Q;
    const rdSquared = rd * rd;
    return 1 / Math.sqrt(1 + (3 * qSquared * rdSquared) / (Math.PI * Math.PI));
  }

  /**
   * Calculate the E(s|r,RD) function - expected score
   *
   * E = 1 / (1 + 10^(-g(RD)*(r - r_opponent)/400))
   */
  private calculateExpectedScore(
    rating: number,
    opponentRating: number,
    opponentRD: number
  ): number {
    const g = this.calculateG(opponentRD);
    const exponent = (-g * (rating - opponentRating)) / 400;
    return 1 / (1 + Math.pow(10, exponent));
  }

  /**
   * Calculate d² value for Glicko rating update
   *
   * d² = 1 / (q² * Σ(g(RD)² * E * (1 - E)))
   */
  private calculateDSquared(results: GlickoMatchResult[], rating: number): number {
    const qSquared = this.config.Q * this.config.Q;

    const sum = results.reduce((total, result) => {
      const g = this.calculateG(result.opponentRD);
      const e = this.calculateExpectedScore(rating, result.opponentRating, result.opponentRD);
      return total + g * g * e * (1 - e);
    }, 0);

    return 1 / (qSquared * sum);
  }
}
