import { randomUUID } from 'crypto';
import type { CreatePlayerInput } from '../../src/players.js';

let playerNumberCounter = 10000;

/**
 * Creates a player input object with default values
 */
export function createPlayerInput(overrides: Partial<CreatePlayerInput> = {}): CreatePlayerInput {
  const id = randomUUID().slice(0, 8);
  return {
    externalId: `ext-player-${id}`,
    playerNumber: playerNumberCounter++,
    firstName: 'Test',
    lastName: `Player ${id}`,
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
 * Resets the player number counter for test isolation
 */
export function resetPlayerCounter(): void {
  playerNumberCounter = 10000;
}
