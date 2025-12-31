import type {
  MatchplayTournament,
  MatchplayStanding,
  MatchplayUserWithDetails,
  MatchplayRating,
  MatchplayGame,
  MatchplayRound,
} from '../../src/types/api-responses.js';

/**
 * Sample tournament fixture
 */
export const sampleTournament: MatchplayTournament = {
  tournamentId: 12345,
  name: 'Weekly Pinball League',
  status: 'completed',
  type: 'group_matchplay',
  startUtc: '2024-01-15T19:00:00Z',
  startLocal: '2024-01-15T14:00:00',
  endUtc: '2024-01-15T23:00:00Z',
  endLocal: '2024-01-15T18:00:00',
  completedAt: '2024-01-15T23:00:00Z',
  organizerId: 100,
  locationId: 200,
  seriesId: null,
  description: 'Weekly matchplay tournament',
  pointsMap: [7, 5, 3, 1],
  tiebreakerPointsMap: null,
  test: false,
  timezone: 'America/New_York',
  scorekeeping: 'default',
  link: 'https://app.matchplay.events/tournaments/12345',
  linkedTournamentId: null,
  estimatedTgp: 85,
  seeding: 'random',
  pairing: 'balanced',
};

/**
 * Sample standings fixture
 */
export const sampleStandings: MatchplayStanding[] = [
  {
    playerId: 1,
    position: 1,
    name: 'Alice Johnson',
    points: 42,
    wins: 10,
    losses: 2,
    ties: 0,
    userId: 1001,
    ifpaId: 50001,
  },
  {
    playerId: 2,
    position: 2,
    name: 'Bob Smith',
    points: 38,
    wins: 9,
    losses: 3,
    ties: 0,
    userId: 1002,
    ifpaId: 50002,
  },
  {
    playerId: 3,
    position: 3,
    name: 'Charlie Brown',
    points: 35,
    wins: 8,
    losses: 4,
    ties: 0,
    userId: 1003,
    ifpaId: undefined,
  },
  {
    playerId: 4,
    position: 4,
    name: 'Diana Ross',
    points: 30,
    wins: 7,
    losses: 5,
    ties: 0,
    userId: 1004,
    ifpaId: 50004,
  },
];

/**
 * Sample user with full details fixture
 */
export const sampleUserWithDetails: MatchplayUserWithDetails = {
  userId: 1001,
  name: 'Alice Johnson',
  ifpaId: 50001,
  role: 'user',
  flag: 'US',
  location: 'New York, NY',
  pronouns: 'she/her',
  initials: 'AJ',
  avatar: 'https://example.com/avatar.jpg',
  banner: null,
  tournamentAvatar: null,
  createdAt: '2020-01-01T00:00:00Z',
  rating: {
    ratingId: 5001,
    userId: 1001,
    ifpaId: 50001,
    name: 'Alice Johnson',
    rating: 1850,
    rd: 45,
    calculatedRd: 42,
    lowerBound: 1765,
    lastRatingPeriod: '2024-01-14',
    rank: 150,
  },
  ifpa: {
    ifpaId: 50001,
    name: 'Alice Johnson',
    rank: 250,
    rating: 1720,
    ratingRank: 300,
    womensRank: 15,
    totalEvents: 120,
    countryCode: 'US',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  userCounts: {
    tournaments: 150,
    games: 2500,
    wins: 1200,
  },
};

/**
 * Sample user without rating fixture
 */
export const sampleUserWithoutRating: MatchplayUserWithDetails = {
  userId: 1005,
  name: 'New Player',
  ifpaId: null,
  role: 'user',
  flag: null,
  location: null,
  pronouns: null,
  initials: 'NP',
  avatar: null,
  banner: null,
  tournamentAvatar: null,
  createdAt: '2024-01-01T00:00:00Z',
};

/**
 * Sample rating fixture
 */
export const sampleRating: MatchplayRating = {
  ratingId: 5001,
  userId: 1001,
  ifpaId: 50001,
  name: 'Alice Johnson',
  rating: 1850,
  rd: 45,
  calculatedRd: 42,
  lowerBound: 1765,
  lastRatingPeriod: '2024-01-14',
  rank: 150,
};

/**
 * Sample games fixture
 */
export const sampleGames: MatchplayGame[] = [
  {
    gameId: 10001,
    tournamentId: 12345,
    roundId: 1,
    arenaId: 1,
    status: 'completed',
    players: [
      { playerId: 1, name: 'Alice Johnson', userId: 1001 },
      { playerId: 2, name: 'Bob Smith', userId: 1002 },
      { playerId: 3, name: 'Charlie Brown', userId: 1003 },
      { playerId: 4, name: 'Diana Ross', userId: 1004 },
    ],
    scores: [1500000, 1200000, 800000, 500000],
    points: [7, 5, 3, 1],
    createdAt: '2024-01-15T19:00:00Z',
    completedAt: '2024-01-15T19:15:00Z',
  },
];

/**
 * Sample rounds fixture
 */
export const sampleRounds: MatchplayRound[] = [
  {
    roundId: 1,
    tournamentId: 12345,
    name: 'Round 1',
    status: 'completed',
    createdAt: '2024-01-15T19:00:00Z',
    startedAt: '2024-01-15T19:00:00Z',
    completedAt: '2024-01-15T19:30:00Z',
  },
  {
    roundId: 2,
    tournamentId: 12345,
    name: 'Round 2',
    status: 'completed',
    createdAt: '2024-01-15T19:30:00Z',
    startedAt: '2024-01-15T19:30:00Z',
    completedAt: '2024-01-15T20:00:00Z',
  },
];

/**
 * Create a mock fetch function that returns predefined responses
 */
export function createMockFetch(
  responses: Map<string, { ok: boolean; status: number; data: unknown }>
): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const path = new URL(url).pathname;

    const response = responses.get(path);
    if (!response) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      } as Response;
    }

    return {
      ok: response.ok,
      status: response.status,
      json: async () => response.data,
    } as Response;
  }) as typeof fetch;
}
