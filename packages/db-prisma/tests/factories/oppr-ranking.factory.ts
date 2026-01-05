import type { CreateOpprPlayerRankingInput } from '../../src/oppr-rankings.js';

/**
 * Creates an OPPR player ranking input with default values
 */
export function createOpprPlayerRankingInput(
  playerId: string,
  overrides: Partial<Omit<CreateOpprPlayerRankingInput, 'playerId'>> = {},
): CreateOpprPlayerRankingInput {
  return {
    playerId,
    rating: 1500,
    ratingDeviation: 200,
    isRated: false,
    ...overrides,
  };
}

/**
 * Creates a rated OPPR player ranking input (isRated = true with ranking)
 */
export function createRatedOpprPlayerRankingInput(
  playerId: string,
  overrides: Partial<Omit<CreateOpprPlayerRankingInput, 'playerId'>> = {},
): CreateOpprPlayerRankingInput {
  return createOpprPlayerRankingInput(playerId, {
    rating: 1600,
    ratingDeviation: 100,
    ranking: 1,
    isRated: true,
    ...overrides,
  });
}
