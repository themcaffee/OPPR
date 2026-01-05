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
    name: `Test Player ${id}`,
    eventCount: 0,
    ...overrides,
  };
}

/**
 * Creates a player input with high event count (for rated players)
 */
export function createActivePlayerInput(
  overrides: Partial<CreatePlayerInput> = {},
): CreatePlayerInput {
  return createPlayerInput({
    eventCount: 5,
    ...overrides,
  });
}

/**
 * Resets the player number counter for test isolation
 */
export function resetPlayerCounter(): void {
  playerNumberCounter = 10000;
}
