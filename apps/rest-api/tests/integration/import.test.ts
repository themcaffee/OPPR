import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';
import { getTestApp, closeTestApp, authenticatedRequest, resetAuthCache } from '../setup/test-helpers.js';

// Mock the MatchplayClient to avoid real API calls
vi.mock('@opprs/matchplay-api', () => {
  const mockTournament = {
    id: '12345',
    name: 'Test Matchplay Tournament',
    date: new Date('2024-06-15'),
    players: [
      { id: 'p1', rating: 1600, ranking: 10, isRated: true, eventCount: 10, ratingDeviation: 100 },
      { id: 'p2', rating: 1500, ranking: 50, isRated: true, eventCount: 8, ratingDeviation: 120 },
      { id: 'p3', rating: 1400, ranking: 100, isRated: false, eventCount: 3, ratingDeviation: 150 },
    ],
    tgpConfig: {
      qualifying: { type: 'limited', meaningfulGames: 5 },
      finals: { formatType: 'match-play', meaningfulGames: 10, fourPlayerGroups: true },
    },
    eventBooster: 'none',
    allowsOptOut: false,
  };

  const mockResults = [
    { player: mockTournament.players[0], position: 1 },
    { player: mockTournament.players[1], position: 2 },
    { player: mockTournament.players[2], position: 3 },
  ];

  const mockRawStandings = [
    { playerId: 'p1', name: 'John Doe' },
    { playerId: 'p2', name: 'Jane Smith' },
    { playerId: 'p3', name: 'Bob Wilson' },
  ];

  class MockMatchplayClient {
    async getTournament() {
      return mockTournament;
    }
    async getTournamentResults() {
      return mockResults;
    }
    async getRawStandings() {
      return mockRawStandings;
    }
  }

  class MatchplayNotFoundError extends Error {
    constructor(resource: string, id: string) {
      super(`${resource} not found: ${id}`);
      this.name = 'MatchplayNotFoundError';
    }
  }

  class MatchplayApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'MatchplayApiError';
    }
  }

  class MatchplayNetworkError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'MatchplayNetworkError';
    }
  }

  return {
    MatchplayClient: MockMatchplayClient,
    MatchplayNotFoundError,
    MatchplayApiError,
    MatchplayNetworkError,
  };
});

describe('Import endpoints', () => {
  beforeEach(() => {
    resetAuthCache();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('POST /api/v1/import/matchplay/tournament/:id', () => {
    it('should return 401 without authentication for valid ID', async () => {
      const app = await getTestApp();
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/import/matchplay/tournament/12345',
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });

    it('should accept eventBooster override', async () => {
      const response = await authenticatedRequest(
        'POST',
        '/api/v1/import/matchplay/tournament/99999',
        { eventBooster: 'MAJOR' }
      );

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.tournament.eventBooster).toBe('MAJOR');
    });

    it('should import a tournament and calculate OPPRS values', async () => {
      const response = await authenticatedRequest(
        'POST',
        '/api/v1/import/matchplay/tournament/77777',
        {}
      );

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body).toHaveProperty('tournament');
      expect(body.tournament.name).toBe('Test Matchplay Tournament');
      expect(body.tournament.externalId).toBe('matchplay:77777');
      expect(body.playersCreated).toBe(3);
      expect(body.resultsCount).toBe(3);
      expect(body.created).toBe(true);

      // Check OPPRS values are calculated
      expect(body.tournament).toHaveProperty('baseValue');
      expect(body.tournament).toHaveProperty('tvaRating');
      expect(body.tournament).toHaveProperty('tvaRanking');
      expect(body.tournament).toHaveProperty('tgp');
      expect(body.tournament).toHaveProperty('firstPlaceValue');
    });

    it('should update tournament on re-import with same ID', async () => {
      // Use a unique ID for this test
      const tournamentId = '55555';

      // First import
      const firstResponse = await authenticatedRequest(
        'POST',
        `/api/v1/import/matchplay/tournament/${tournamentId}`,
        {}
      );
      expect(firstResponse.statusCode).toBe(201);
      expect(firstResponse.json().created).toBe(true);

      // Second import (should update)
      const secondResponse = await authenticatedRequest(
        'POST',
        `/api/v1/import/matchplay/tournament/${tournamentId}`,
        {}
      );

      expect(secondResponse.statusCode).toBe(200);

      const body = secondResponse.json();
      expect(body.created).toBe(false);
      expect(body.playersUpdated).toBe(3);
    });

    it('should create players from Matchplay data', async () => {
      const response = await authenticatedRequest(
        'POST',
        '/api/v1/import/matchplay/tournament/66666',
        {}
      );

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.playersCreated).toBe(3);
      expect(body.resultsCount).toBe(3);
    });
  });
});
