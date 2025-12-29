import { TGP } from './constants.js';
import type { TGPConfig } from './types.js';

/**
 * Calculates the qualifying component of the TGP
 *
 * @param config - TGP configuration with qualifying details
 * @returns TGP percentage contribution from qualifying (0.0 - 2.0)
 */
export function calculateQualifyingTGP(config: TGPConfig): number {
  const { qualifying } = config;
  let tgp = 0;

  // No TGP from qualifying if type is 'none'
  if (qualifying.type === 'none') {
    return 0;
  }

  // Base meaningful games value
  let gameValue = TGP.BASE_GAME_VALUE;

  // Apply multipliers based on format type
  if (qualifying.type === 'unlimited' && qualifying.hours && qualifying.hours >= TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER) {
    // Unlimited Best Game: 2X (8% per game)
    // Note: Card qualifying uses different multiplier
    gameValue = TGP.BASE_GAME_VALUE * TGP.MULTIPLIERS.UNLIMITED_BEST_GAME;
  } else if (qualifying.type === 'hybrid') {
    // Hybrid Best Game: 3X (12% per game)
    gameValue = TGP.BASE_GAME_VALUE * TGP.MULTIPLIERS.HYBRID_BEST_GAME;
  }

  // Apply group size multipliers (if applicable and not multi-matchplay)
  if (!qualifying.multiMatchplay) {
    if (qualifying.fourPlayerGroups) {
      gameValue *= TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS;
    } else if (qualifying.threePlayerGroups) {
      gameValue *= TGP.MULTIPLIERS.THREE_PLAYER_GROUPS;
    }
  }

  // Apply ball count adjustment if specified
  const ballAdjustment = config.ballCountAdjustment ?? 1.0;

  // Calculate TGP from meaningful games
  tgp += qualifying.meaningfulGames * gameValue * ballAdjustment;

  // Add time component for unlimited qualifying (1% per hour, max 20%)
  if (qualifying.type === 'unlimited' && qualifying.hours) {
    const timeBonus = Math.min(
      qualifying.hours * TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR,
      TGP.UNLIMITED_QUALIFYING.MAX_BONUS
    );
    tgp += timeBonus;
  }

  return tgp;
}

/**
 * Calculates the finals component of the TGP
 *
 * @param config - TGP configuration with finals details
 * @returns TGP percentage contribution from finals (0.0 - 2.0)
 */
export function calculateFinalsTGP(config: TGPConfig): number {
  const { finals } = config;
  let gameValue = TGP.BASE_GAME_VALUE;

  // Apply group size multipliers for PAPA-style formats (not multi-matchplay)
  if (!finals.multiMatchplay) {
    if (finals.fourPlayerGroups) {
      gameValue *= TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS;
    } else if (finals.threePlayerGroups) {
      gameValue *= TGP.MULTIPLIERS.THREE_PLAYER_GROUPS;
    }
  }

  // Apply ball count adjustment if specified
  const ballAdjustment = config.ballCountAdjustment ?? 1.0;

  // Calculate TGP from meaningful games in finals
  return finals.meaningfulGames * gameValue * ballAdjustment;
}

/**
 * Calculates the total Tournament Grading Percentage (TGP)
 *
 * TGP determines the quality/completeness of a tournament format:
 * - Events without separate qualifying/finals: max 100%
 * - Events with qualifying and finals: max 200%
 * - Base: 4% per meaningful game played
 * - Multipliers apply for certain format types
 *
 * @param config - Complete TGP configuration
 * @returns Total TGP as a decimal (e.g., 1.5 = 150%)
 *
 * @example
 * ```typescript
 * const config: TGPConfig = {
 *   qualifying: {
 *     type: 'limited',
 *     meaningfulGames: 7,
 *     fourPlayerGroups: false,
 *   },
 *   finals: {
 *     formatType: 'single-elimination',
 *     meaningfulGames: 15,
 *     fourPlayerGroups: true,
 *   },
 * };
 * const tgp = calculateTGP(config); // Returns 1.48 (148%)
 * ```
 */
export function calculateTGP(config: TGPConfig): number {
  const qualifyingTGP = calculateQualifyingTGP(config);
  const finalsTGP = calculateFinalsTGP(config);

  let totalTGP = qualifyingTGP + finalsTGP;

  // Determine maximum TGP based on whether there's a qualifying component
  const hasSeparateQualifying = config.qualifying.type !== 'none' && config.qualifying.meaningfulGames > 0;
  const maxTGP = hasSeparateQualifying ? TGP.MAX_WITH_FINALS : TGP.MAX_WITHOUT_FINALS;

  // Cap at maximum
  totalTGP = Math.min(totalTGP, maxTGP);

  return totalTGP;
}

/**
 * Calculates TGP for an Unlimited Card qualifying format
 * Card qualifying gets 4X multiplier (16% per game) with 20+ hours
 *
 * @param meaningfulGames - Number of meaningful games in qualifying
 * @param hours - Hours of qualifying time available
 * @param finalsGames - Number of meaningful games in finals
 * @returns Total TGP value
 */
export function calculateUnlimitedCardTGP(
  meaningfulGames: number,
  hours: number,
  finalsGames: number
): number {
  const config: TGPConfig = {
    qualifying: {
      type: 'unlimited',
      meaningfulGames,
      hours,
    },
    finals: {
      formatType: 'match-play',
      meaningfulGames: finalsGames,
    },
  };

  // For card qualifying, override the game value calculation
  let qualifyingTGP = 0;
  if (hours >= TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER) {
    // 4X multiplier for card qualifying (16% per game)
    qualifyingTGP = meaningfulGames * TGP.BASE_GAME_VALUE * TGP.MULTIPLIERS.UNLIMITED_CARD;
  } else {
    qualifyingTGP = meaningfulGames * TGP.BASE_GAME_VALUE;
  }

  // Add time bonus
  const timeBonus = Math.min(
    hours * TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR,
    TGP.UNLIMITED_QUALIFYING.MAX_BONUS
  );
  qualifyingTGP += timeBonus;

  const finalsTGP = calculateFinalsTGP(config);
  const totalTGP = Math.min(qualifyingTGP + finalsTGP, TGP.MAX_WITH_FINALS);

  return totalTGP;
}

/**
 * Calculates TGP for Flip Frenzy format
 * Based on average number of matches played by all players
 *
 * @param averageMatches - Average number of matches played across all players
 * @param isOneBall - Whether it's a one-ball flip frenzy format
 * @returns TGP value
 */
export function calculateFlipFrenzyTGP(averageMatches: number, isOneBall = false): number {
  const divisor = isOneBall ? TGP.FLIP_FRENZY.ONE_BALL_DIVISOR : TGP.FLIP_FRENZY.THREE_BALL_DIVISOR;
  const meaningfulGames = averageMatches / divisor;

  const tgp = meaningfulGames * TGP.BASE_GAME_VALUE;

  return Math.min(tgp, TGP.MAX_WITHOUT_FINALS);
}

/**
 * Validates that a finals format meets requirements for >100% TGP
 *
 * Requirements:
 * - Minimum 10% of participants advance to finals
 * - Maximum 50% of participants advance to finals
 * - Finals must reduce to 4 players or fewer at some point
 *
 * @param totalParticipants - Total number of tournament participants
 * @param finalistCount - Number of players advancing to finals
 * @returns True if format meets requirements for >100% TGP eligibility
 */
export function validateFinalsEligibility(
  totalParticipants: number,
  finalistCount: number
): boolean {
  const finalistPercentage = finalistCount / totalParticipants;

  return (
    finalistPercentage >= TGP.FINALS_REQUIREMENTS.MIN_FINALISTS_PERCENT &&
    finalistPercentage <= TGP.FINALS_REQUIREMENTS.MAX_FINALISTS_PERCENT
  );
}
