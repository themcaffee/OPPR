import { POINT_DISTRIBUTION } from './constants.js';
import type { PointDistribution, PlayerResult } from './types.js';

/**
 * Calculates linear distribution points for a single player
 *
 * Formula: (PlayerCount + 1 - Position) * 10% * (FirstPlaceValue / PlayerCount)
 *
 * @param position - Player's finishing position (1 = first)
 * @param playerCount - Total number of players in tournament
 * @param firstPlaceValue - Total value for first place
 * @returns Linear distribution points for this player
 */
export function calculateLinearPoints(
  position: number,
  playerCount: number,
  firstPlaceValue: number
): number {
  return (
    (playerCount + 1 - position) *
    POINT_DISTRIBUTION.LINEAR_PERCENTAGE *
    (firstPlaceValue / playerCount)
  );
}

/**
 * Calculates dynamic distribution points for a single player
 *
 * Formula: (power((1 - power(((Position - 1) / min(RatedPlayerCount/2, 64)), 0.7)), 3)) * 90% * FirstPlaceValue
 *
 * This formula stretches to the top half of the field, capped at 64 players
 *
 * @param position - Player's finishing position (1 = first)
 * @param ratedPlayerCount - Total number of rated players in tournament
 * @param firstPlaceValue - Total value for first place
 * @returns Dynamic distribution points for this player
 */
export function calculateDynamicPoints(
  position: number,
  ratedPlayerCount: number,
  firstPlaceValue: number
): number {
  // Dynamic distribution only applies to top half of rated players, capped at 64
  const dynamicCap = Math.min(ratedPlayerCount / 2, POINT_DISTRIBUTION.MAX_DYNAMIC_PLAYERS);

  // Players finishing outside the dynamic range get 0 dynamic points
  if (position - 1 >= dynamicCap) {
    return 0;
  }

  // Calculate position ratio (0 for 1st place, approaching 1 for last place in range)
  const positionRatio = (position - 1) / dynamicCap;

  // Apply exponential decay formula
  const decayFactor = Math.pow(
    1 - Math.pow(positionRatio, POINT_DISTRIBUTION.POSITION_EXPONENT),
    POINT_DISTRIBUTION.VALUE_EXPONENT
  );

  return decayFactor * POINT_DISTRIBUTION.DYNAMIC_PERCENTAGE * firstPlaceValue;
}

/**
 * Calculates total points (linear + dynamic) for a single player
 *
 * @param position - Player's finishing position (1 = first)
 * @param playerCount - Total number of players in tournament
 * @param ratedPlayerCount - Total number of rated players
 * @param firstPlaceValue - Total value for first place
 * @returns Total points awarded to this player
 */
export function calculatePlayerPoints(
  position: number,
  playerCount: number,
  ratedPlayerCount: number,
  firstPlaceValue: number
): number {
  const linear = calculateLinearPoints(position, playerCount, firstPlaceValue);
  const dynamic = calculateDynamicPoints(position, ratedPlayerCount, firstPlaceValue);

  return linear + dynamic;
}

/**
 * Distributes points to all players in a tournament
 *
 * @param results - Array of player results with finishing positions
 * @param firstPlaceValue - Total value for first place
 * @returns Array of point distributions for each player
 *
 * @example
 * ```typescript
 * const results: PlayerResult[] = [
 *   { player: { id: '1', rating: 1800, ranking: 5, isRated: true }, position: 1 },
 *   { player: { id: '2', rating: 1700, ranking: 10, isRated: true }, position: 2 },
 *   { player: { id: '3', rating: 1600, ranking: 20, isRated: false }, position: 3 },
 * ];
 * const distributions = distributePoints(results, 50.0);
 * ```
 */
export function distributePoints(
  results: PlayerResult[],
  firstPlaceValue: number
): PointDistribution[] {
  // Filter out players who opted out
  const activeResults = results.filter((result) => !result.optedOut);

  const totalPlayers = activeResults.length;
  const ratedPlayerCount = activeResults.filter((result) => result.player.isRated).length;

  return activeResults.map((result) => {
    const linearPoints = calculateLinearPoints(result.position, totalPlayers, firstPlaceValue);

    const dynamicPoints = calculateDynamicPoints(
      result.position,
      ratedPlayerCount,
      firstPlaceValue
    );

    return {
      player: result.player,
      position: result.position,
      linearPoints,
      dynamicPoints,
      totalPoints: linearPoints + dynamicPoints,
    };
  });
}

/**
 * Gets points awarded to a specific finishing position
 *
 * Utility function for quick point lookups
 *
 * @param position - Finishing position to check
 * @param playerCount - Total players in tournament
 * @param ratedPlayerCount - Rated players in tournament
 * @param firstPlaceValue - First place value
 * @returns Points awarded for that position
 */
export function getPointsForPosition(
  position: number,
  playerCount: number,
  ratedPlayerCount: number,
  firstPlaceValue: number
): number {
  return calculatePlayerPoints(position, playerCount, ratedPlayerCount, firstPlaceValue);
}

/**
 * Calculates what percentage of first place value a position receives
 *
 * @param position - Finishing position
 * @param playerCount - Total players
 * @param ratedPlayerCount - Rated players
 * @returns Percentage of first place value (0.0 to 1.0)
 */
export function calculatePositionPercentage(
  position: number,
  playerCount: number,
  ratedPlayerCount: number
): number {
  const points = calculatePlayerPoints(position, playerCount, ratedPlayerCount, 100);
  return points / 100;
}
