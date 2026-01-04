import type { Player, Tournament, TournamentResult, UserWithPlayer } from '@opprs/rest-api-client';

export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    externalId: null,
    name: 'Test Player',
    rating: 1500,
    ratingDeviation: 200,
    ranking: null,
    isRated: true,
    eventCount: 5,
    lastRatingUpdate: null,
    lastEventDate: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: 'tournament-1',
    externalId: null,
    name: 'Test Tournament',
    description: null,
    date: '2024-01-15T00:00:00.000Z',
    locationId: null,
    location: null,
    organizerId: null,
    organizer: null,
    eventBooster: 'NONE',
    tgpConfig: null,
    allowsOptOut: false,
    firstPlaceValue: 100,
    baseValue: 32,
    tgp: 1,
    tvaRating: 10,
    tvaRanking: 15,
    totalTVA: 25,
    eventBoosterMultiplier: 1.0,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockTournamentResult(
  overrides: Partial<TournamentResult> = {}
): TournamentResult {
  return {
    id: 'result-1',
    position: 1,
    optedOut: false,
    linearPoints: null,
    dynamicPoints: null,
    totalPoints: 100,
    ageInDays: null,
    decayMultiplier: null,
    decayedPoints: 100,
    efficiency: null,
    player: {
      id: 'player-1',
      name: 'Test Player',
      rating: 1500,
      ranking: null,
    },
    ...overrides,
  };
}

export function createMockUser(overrides: Partial<UserWithPlayer> = {}): UserWithPlayer {
  return {
    id: 'user-1',
    email: 'test@example.com',
    role: 'USER',
    playerId: null,
    player: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  totalPages: number = 1,
  total: number = data.length
) {
  return {
    data,
    pagination: {
      page,
      limit: 20,
      total,
      totalPages,
    },
  };
}
