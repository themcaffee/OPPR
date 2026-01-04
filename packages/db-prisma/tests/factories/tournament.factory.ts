import { randomUUID } from 'crypto';
import type { CreateTournamentInput } from '../../src/tournaments.js';
import type { EventBoosterType } from '@prisma/client';

/**
 * Creates a tournament input object with default values
 */
export function createTournamentInput(
  overrides: Partial<CreateTournamentInput> = {},
): CreateTournamentInput {
  const id = randomUUID().slice(0, 8);
  return {
    externalId: `ext-tournament-${id}`,
    name: `Test Tournament ${id}`,
    date: new Date(),
    eventBooster: 'NONE' as EventBoosterType,
    ...overrides,
  };
}

/**
 * Creates a major tournament input
 */
export function createMajorTournamentInput(
  overrides: Partial<CreateTournamentInput> = {},
): CreateTournamentInput {
  return createTournamentInput({
    eventBooster: 'MAJOR' as EventBoosterType,
    ...overrides,
  });
}

/**
 * Creates a certified tournament input
 */
export function createCertifiedTournamentInput(
  overrides: Partial<CreateTournamentInput> = {},
): CreateTournamentInput {
  return createTournamentInput({
    eventBooster: 'CERTIFIED' as EventBoosterType,
    ...overrides,
  });
}

/**
 * Resets the tournament counter (no longer needed with UUID-based IDs)
 */
export function resetTournamentCounter(): void {
  // No-op for backward compatibility
}
