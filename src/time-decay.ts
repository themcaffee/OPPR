import { TIME_DECAY } from './constants.js';
import type { DecayConfig } from './types.js';

/**
 * Calculates the number of days between two dates
 *
 * @param eventDate - Date of the event
 * @param referenceDate - Date to compare against (defaults to current date)
 * @returns Number of days between the dates
 */
export function calculateDaysBetween(eventDate: Date, referenceDate: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = referenceDate.getTime() - eventDate.getTime();
  return Math.floor(diffMs / msPerDay);
}

/**
 * Calculates the age of an event in years
 *
 * @param eventDate - Date of the event
 * @param referenceDate - Date to compare against (defaults to current date)
 * @returns Age of event in years (decimal)
 */
export function calculateEventAge(eventDate: Date, referenceDate: Date = new Date()): number {
  const days = calculateDaysBetween(eventDate, referenceDate);
  return days / TIME_DECAY.DAYS_PER_YEAR;
}

/**
 * Gets the time decay multiplier for an event based on its age
 *
 * Decay schedule:
 * - 0-1 years: 100% (1.0)
 * - 1-2 years: 75% (0.75)
 * - 2-3 years: 50% (0.5)
 * - 3+ years: 0% (0.0)
 *
 * @param ageInYears - Age of the event in years
 * @returns Decay multiplier (0.0 to 1.0)
 */
export function getDecayMultiplier(ageInYears: number): number {
  if (ageInYears < 1) {
    return TIME_DECAY.YEAR_0_TO_1;
  } else if (ageInYears < 2) {
    return TIME_DECAY.YEAR_1_TO_2;
  } else if (ageInYears < 3) {
    return TIME_DECAY.YEAR_2_TO_3;
  } else {
    return TIME_DECAY.YEAR_3_PLUS;
  }
}

/**
 * Calculates the decay multiplier for an event based on its date
 *
 * @param eventDate - Date of the event
 * @param config - Optional configuration with reference date
 * @returns Decay multiplier (0.0 to 1.0)
 *
 * @example
 * ```typescript
 * const eventDate = new Date('2023-06-15');
 * const referenceDate = new Date('2024-06-15');
 * const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
 * // Returns 1.0 (event is exactly 1 year old)
 * ```
 */
export function calculateDecayMultiplier(eventDate: Date, config?: DecayConfig): number {
  const referenceDate = config?.referenceDate ?? new Date();
  const ageInYears = calculateEventAge(eventDate, referenceDate);
  return getDecayMultiplier(ageInYears);
}

/**
 * Applies time decay to points earned
 *
 * @param points - Original points earned
 * @param eventDate - Date the points were earned
 * @param config - Optional configuration with reference date
 * @returns Decayed points value
 *
 * @example
 * ```typescript
 * const points = 100;
 * const eventDate = new Date('2022-01-01');
 * const referenceDate = new Date('2024-06-01');
 * const decayedPoints = applyTimeDecay(points, eventDate, { referenceDate });
 * // Returns 50 (event is ~2.4 years old, so 50% multiplier)
 * ```
 */
export function applyTimeDecay(points: number, eventDate: Date, config?: DecayConfig): number {
  const multiplier = calculateDecayMultiplier(eventDate, config);
  return points * multiplier;
}

/**
 * Determines if an event is still active (has points value)
 *
 * Events older than 3 years are fully decayed and considered inactive
 *
 * @param eventDate - Date of the event
 * @param config - Optional configuration with reference date
 * @returns True if event still contributes points (< 3 years old)
 */
export function isEventActive(eventDate: Date, config?: DecayConfig): boolean {
  const referenceDate = config?.referenceDate ?? new Date();
  const ageInYears = calculateEventAge(eventDate, referenceDate);
  return ageInYears < 3;
}

/**
 * Filters events to only those that are active (< 3 years old)
 *
 * @param events - Array of event dates
 * @param config - Optional configuration with reference date
 * @returns Array of active event dates
 */
export function filterActiveEvents(events: Date[], config?: DecayConfig): Date[] {
  return events.filter((eventDate) => isEventActive(eventDate, config));
}

/**
 * Calculates decay information for an event
 *
 * @param eventDate - Date of the event
 * @param config - Optional configuration with reference date
 * @returns Object with age, multiplier, and active status
 */
export function getEventDecayInfo(
  eventDate: Date,
  config?: DecayConfig
): {
  ageInDays: number;
  ageInYears: number;
  decayMultiplier: number;
  isActive: boolean;
} {
  const referenceDate = config?.referenceDate ?? new Date();
  const ageInDays = calculateDaysBetween(eventDate, referenceDate);
  const ageInYears = ageInDays / TIME_DECAY.DAYS_PER_YEAR;
  const decayMultiplier = getDecayMultiplier(ageInYears);
  const isActive = ageInYears < 3;

  return {
    ageInDays,
    ageInYears,
    decayMultiplier,
    isActive,
  };
}
