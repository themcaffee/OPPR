import { EVENT_BOOSTERS } from './constants.js';
import type { EventBoosterType } from './types.js';

/**
 * Gets the event booster multiplier for a given event type
 *
 * Event boosters are applied after TGP to increase tournament value:
 * - None: 1.0x (100%)
 * - Certified: 1.25x (125%)
 * - Certified+: 1.5x (150%)
 * - Championship Series: 1.5x (150%)
 * - Major: 2.0x (200%)
 *
 * @param boosterType - Type of event booster
 * @returns Multiplier value (e.g., 2.0 for Major events)
 *
 * @example
 * ```typescript
 * const multiplier = getEventBoosterMultiplier('major'); // Returns 2.0
 * const baseValue = 50;
 * const tgp = 1.5;
 * const finalValue = baseValue * tgp * multiplier; // 50 * 1.5 * 2.0 = 150
 * ```
 */
export function getEventBoosterMultiplier(boosterType: EventBoosterType): number {
  switch (boosterType) {
    case 'major':
      return EVENT_BOOSTERS.MAJOR;
    case 'championship-series':
      return EVENT_BOOSTERS.CHAMPIONSHIP_SERIES;
    case 'certified-plus':
      return EVENT_BOOSTERS.CERTIFIED_PLUS;
    case 'certified':
      return EVENT_BOOSTERS.CERTIFIED;
    case 'none':
    default:
      return EVENT_BOOSTERS.NONE;
  }
}

/**
 * Validates if an event qualifies for Certified status (125% booster)
 *
 * Requirements for Certified events:
 * - All Certified+ requirements EXCEPT the 128 rated player minimum
 *
 * @param ratedPlayerCount - Number of rated players
 * @param hasValidQualifying - Whether qualifying format meets requirements
 * @param hasValidFinals - Whether finals format meets requirements
 * @param finalistCount - Number of players in finals
 * @param durationDays - Tournament duration in days
 * @returns True if event qualifies for Certified status
 */
export function qualifiesForCertified(
  _ratedPlayerCount: number,
  hasValidQualifying: boolean,
  hasValidFinals: boolean,
  finalistCount: number,
  durationDays: number
): boolean {
  // Must have at least 24 finalists
  if (finalistCount < 24) return false;

  // Must have valid qualifying and finals formats
  if (!hasValidQualifying || !hasValidFinals) return false;

  // Maximum 4 consecutive days
  if (durationDays > 4) return false;

  return true;
}

/**
 * Validates if an event qualifies for Certified+ status (150% booster)
 *
 * Requirements for Certified+ events (includes all Certified requirements plus):
 * - Minimum 128 rated players
 * - Valid qualifying format (Limited/Hybrid/Unlimited Best Game or Card, Match Play, or H2H)
 * - Minimum 24 finalists
 * - Valid finals format (PAPA-style match play or head-to-head)
 * - No byes beyond round of 16
 * - Maximum 4 consecutive days
 * - Finals cannot start same day as qualifying
 *
 * @param ratedPlayerCount - Number of rated players
 * @param hasValidQualifying - Whether qualifying format meets requirements
 * @param hasValidFinals - Whether finals format meets requirements
 * @param finalistCount - Number of players in finals
 * @param durationDays - Tournament duration in days
 * @returns True if event qualifies for Certified+ status
 */
export function qualifiesForCertifiedPlus(
  ratedPlayerCount: number,
  hasValidQualifying: boolean,
  hasValidFinals: boolean,
  finalistCount: number,
  durationDays: number
): boolean {
  // Certified+ requires minimum 128 rated players
  if (ratedPlayerCount < 128) return false;

  // Must meet all other Certified requirements
  return qualifiesForCertified(
    ratedPlayerCount,
    hasValidQualifying,
    hasValidFinals,
    finalistCount,
    durationDays
  );
}

/**
 * Determines the highest event booster an event qualifies for
 *
 * Note: Major and Championship Series events are designated, not calculated.
 * This function determines Certified vs Certified+ vs None.
 *
 * @param ratedPlayerCount - Number of rated players
 * @param hasValidQualifying - Whether qualifying format meets requirements
 * @param hasValidFinals - Whether finals format meets requirements
 * @param finalistCount - Number of players in finals
 * @param durationDays - Tournament duration in days
 * @returns The highest event booster type the event qualifies for
 */
export function determineEventBooster(
  ratedPlayerCount: number,
  hasValidQualifying: boolean,
  hasValidFinals: boolean,
  finalistCount: number,
  durationDays: number
): EventBoosterType {
  if (
    qualifiesForCertifiedPlus(
      ratedPlayerCount,
      hasValidQualifying,
      hasValidFinals,
      finalistCount,
      durationDays
    )
  ) {
    return 'certified-plus';
  }

  if (
    qualifiesForCertified(
      ratedPlayerCount,
      hasValidQualifying,
      hasValidFinals,
      finalistCount,
      durationDays
    )
  ) {
    return 'certified';
  }

  return 'none';
}

/**
 * Applies the event booster to a tournament value
 *
 * @param baseValue - Tournament value before booster (base + TVA) * TGP
 * @param boosterType - Type of event booster to apply
 * @returns Final tournament value after applying booster
 */
export function applyEventBooster(baseValue: number, boosterType: EventBoosterType): number {
  const multiplier = getEventBoosterMultiplier(boosterType);
  return baseValue * multiplier;
}
