import { randomUUID } from 'crypto';

/**
 * Creates a player fixture for testing
 */
export function createPlayerFixture(overrides: Record<string, unknown> = {}) {
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
 * Creates a rated player fixture (eventCount >= 5)
 */
export function createRatedPlayerFixture(overrides: Record<string, unknown> = {}) {
  return createPlayerFixture({
    isRated: true,
    eventCount: 5,
    rating: 1600,
    ratingDeviation: 100,
    ranking: 1,
    ...overrides,
  });
}

/**
 * Creates a tournament fixture for testing
 */
export function createTournamentFixture(overrides: Record<string, unknown> = {}) {
  const id = randomUUID().slice(0, 8);
  return {
    externalId: `ext-tournament-${id}`,
    name: `Test Tournament ${id}`,
    location: 'Test City',
    date: new Date().toISOString(),
    eventBooster: 'NONE',
    allowsOptOut: false,
    baseValue: 10,
    tgp: 1.0,
    firstPlaceValue: 100,
    ...overrides,
  };
}

/**
 * Creates a result fixture for testing
 */
export function createResultFixture(
  playerId: string,
  tournamentId: string,
  overrides: Record<string, unknown> = {}
) {
  return {
    playerId,
    tournamentId,
    position: 1,
    optedOut: false,
    linearPoints: 10,
    dynamicPoints: 90,
    totalPoints: 100,
    decayMultiplier: 1.0,
    decayedPoints: 100,
    efficiency: 100,
    ...overrides,
  };
}
