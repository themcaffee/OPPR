import type { Player } from '../src/types.js';

/**
 * Helper to create a Player object with the new ratings structure
 */
export function createPlayer(
  id: string,
  rating: number,
  ranking: number,
  isRated: boolean,
  ratingDeviation = 100
): Player {
  return {
    id,
    ranking,
    isRated,
    ratings: {
      glicko: {
        value: rating,
        ratingDeviation,
      } as { value: number; ratingDeviation: number },
    },
  };
}

/**
 * Helper to get the Glicko rating value from a player
 */
export function getGlickoRating(player: Player): number {
  return (player.ratings?.glicko as { value: number })?.value ?? 0;
}
