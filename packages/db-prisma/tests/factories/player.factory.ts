import { randomUUID } from 'crypto';
import type { CreatePlayerInput } from '../../src/players.js';

/**
 * Creates a player input object with default values
 */
export function createPlayerInput(overrides: Partial<CreatePlayerInput> = {}): CreatePlayerInput {
  const id = randomUUID().slice(0, 8);
  return {
    externalId: `ext-player-${id}`,
    name: `Test Player ${id}`,
    email: `player-${id}@test.com`,
    rating: 1500,
    ratingDeviation: 200,
    isRated: false,
    eventCount: 0,
    ...overrides,
  };
}

/**
 * Creates a rated player input (eventCount >= 5)
 */
export function createRatedPlayerInput(overrides: Partial<CreatePlayerInput> = {}): CreatePlayerInput {
  return createPlayerInput({
    isRated: true,
    eventCount: 5,
    rating: 1600,
    ratingDeviation: 100,
    ranking: 1,
    ...overrides,
  });
}

/**
 * Resets the player counter (no longer needed with UUID-based IDs)
 */
export function resetPlayerCounter(): void {
  // No-op for backward compatibility
}
