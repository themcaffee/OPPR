import type { PlayerEvent } from './types.js';

/**
 * Calculates efficiency percentage for a single event
 *
 * Efficiency = (Points Earned / First Place Value) * 100
 *
 * @param pointsEarned - Points the player earned in the event
 * @param firstPlaceValue - Points available for first place
 * @returns Efficiency percentage (0 to 100)
 *
 * @example
 * ```typescript
 * const efficiency = calculateEventEfficiency(15, 50);
 * // Returns 30 (player earned 30% of available points)
 * ```
 */
export function calculateEventEfficiency(
  pointsEarned: number,
  firstPlaceValue: number
): number {
  if (firstPlaceValue === 0) return 0;
  return (pointsEarned / firstPlaceValue) * 100;
}

/**
 * Calculates overall efficiency percentage across multiple events
 *
 * Overall Efficiency = (Total Points Earned / Total First Place Values) * 100
 *
 * Only active events (< 3 years old) are included in the calculation
 *
 * @param events - Array of player events with points and values
 * @returns Overall efficiency percentage (0 to 100)
 *
 * @example
 * ```typescript
 * const events: PlayerEvent[] = [
 *   { pointsEarned: 30, firstPlaceValue: 50, ... },
 *   { pointsEarned: 15, firstPlaceValue: 40, ... },
 *   { pointsEarned: 40, firstPlaceValue: 60, ... },
 * ];
 * const efficiency = calculateOverallEfficiency(events);
 * // Returns 56.67 (85 points / 150 available = 56.67%)
 * ```
 */
export function calculateOverallEfficiency(events: PlayerEvent[]): number {
  // Only include active events (decayMultiplier > 0)
  const activeEvents = events.filter((event) => event.decayMultiplier > 0);

  if (activeEvents.length === 0) return 0;

  const totalPointsEarned = activeEvents.reduce((sum, event) => sum + event.pointsEarned, 0);
  const totalFirstPlaceValue = activeEvents.reduce((sum, event) => sum + event.firstPlaceValue, 0);

  if (totalFirstPlaceValue === 0) return 0;

  return (totalPointsEarned / totalFirstPlaceValue) * 100;
}

/**
 * Calculates efficiency for a player's top N events
 *
 * @param events - Array of player events
 * @param topN - Number of top events to consider (default 15)
 * @returns Efficiency percentage for top N events
 */
export function calculateTopNEfficiency(events: PlayerEvent[], topN = 15): number {
  // Sort events by points earned (highest first) and take top N
  const topEvents = [...events]
    .filter((event) => event.decayMultiplier > 0)
    .sort((a, b) => b.pointsEarned - a.pointsEarned)
    .slice(0, topN);

  return calculateOverallEfficiency(topEvents);
}

/**
 * Calculates efficiency using decayed points
 *
 * Uses decayed points instead of raw points for efficiency calculation
 *
 * @param events - Array of player events with decay information
 * @returns Efficiency percentage based on decayed points
 */
export function calculateDecayedEfficiency(events: PlayerEvent[]): number {
  const activeEvents = events.filter((event) => event.decayMultiplier > 0);

  if (activeEvents.length === 0) return 0;

  const totalDecayedPoints = activeEvents.reduce((sum, event) => sum + event.decayedPoints, 0);
  const totalFirstPlaceValue = activeEvents.reduce((sum, event) => sum + event.firstPlaceValue, 0);

  if (totalFirstPlaceValue === 0) return 0;

  return (totalDecayedPoints / totalFirstPlaceValue) * 100;
}

/**
 * Analyzes efficiency trends over time
 *
 * @param events - Array of player events sorted by date
 * @param windowSize - Number of recent events to analyze (default 10)
 * @returns Object with recent and overall efficiency for comparison
 */
export function analyzeEfficiencyTrend(
  events: PlayerEvent[],
  windowSize = 10
): {
  overallEfficiency: number;
  recentEfficiency: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  // Sort by date (most recent first)
  const sortedEvents = [...events]
    .filter((event) => event.decayMultiplier > 0)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const recentEvents = sortedEvents.slice(0, windowSize);

  const overallEfficiency = calculateOverallEfficiency(sortedEvents);
  const recentEfficiency = calculateOverallEfficiency(recentEvents);

  // Determine trend (using 5% threshold for "stable")
  let trend: 'improving' | 'declining' | 'stable';
  const difference = recentEfficiency - overallEfficiency;

  if (Math.abs(difference) < 5) {
    trend = 'stable';
  } else if (difference > 0) {
    trend = 'improving';
  } else {
    trend = 'declining';
  }

  return {
    overallEfficiency,
    recentEfficiency,
    trend,
  };
}

/**
 * Gets efficiency statistics for a player
 *
 * @param events - Array of player events
 * @returns Object with various efficiency metrics
 */
export function getEfficiencyStats(events: PlayerEvent[]): {
  overall: number;
  top15: number;
  best: number;
  worst: number;
  average: number;
  median: number;
} {
  const activeEvents = events.filter((event) => event.decayMultiplier > 0);

  if (activeEvents.length === 0) {
    return {
      overall: 0,
      top15: 0,
      best: 0,
      worst: 0,
      average: 0,
      median: 0,
    };
  }

  // Calculate individual event efficiencies
  const efficiencies = activeEvents.map((event) =>
    calculateEventEfficiency(event.pointsEarned, event.firstPlaceValue)
  );

  // Sort for best/worst/median
  const sortedEfficiencies = [...efficiencies].sort((a, b) => b - a);

  return {
    overall: calculateOverallEfficiency(activeEvents),
    top15: calculateTopNEfficiency(activeEvents, 15),
    best: sortedEfficiencies[0] ?? 0,
    worst: sortedEfficiencies[sortedEfficiencies.length - 1] ?? 0,
    average: efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length,
    median:
      sortedEfficiencies[Math.floor(sortedEfficiencies.length / 2)] ??
      0,
  };
}
