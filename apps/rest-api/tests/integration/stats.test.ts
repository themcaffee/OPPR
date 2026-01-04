import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import {
  getTestApp,
  closeTestApp,
  authenticatedRequest,
  resetAuthCache,
} from '../setup/test-helpers.js';
import {
  createPlayerFixture,
  createRatedPlayerFixture,
  createTournamentFixture,
  createResultFixture,
} from '../fixtures/index.js';

describe('Stats endpoints', () => {
  beforeEach(() => {
    resetAuthCache();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/v1/stats/overview', () => {
    it('should return system overview with zeros initially', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/stats/overview');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('players');
      expect(body).toHaveProperty('tournaments');
      expect(body).toHaveProperty('results');
      expect(body.players.total).toBe(0);
      expect(body.players.rated).toBe(0);
      expect(body.tournaments.total).toBe(0);
      expect(body.results.total).toBe(0);
    });

    it('should return accurate counts after creating data', async () => {
      // Create players
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture({ isRated: false }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture());
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture());

      // Create tournaments
      const tournamentResponse = await authenticatedRequest(
        'POST',
        '/api/v1/tournaments',
        createTournamentFixture()
      );
      const tournament = tournamentResponse.json();

      // Create a result
      const playerResponse = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const player = playerResponse.json();

      await authenticatedRequest(
        'POST',
        '/api/v1/standings',
        createResultFixture(player.id, tournament.id)
      );

      const response = await authenticatedRequest('GET', '/api/v1/stats/overview');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.players.total).toBe(4);
      expect(body.players.rated).toBe(2);
      expect(body.tournaments.total).toBe(1);
      expect(body.results.total).toBe(1);
    });

    it('should allow unauthenticated access (public endpoint)', async () => {
      const app = await getTestApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/stats/overview',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/stats/leaderboard', () => {
    it('should return empty leaderboard initially', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/stats/leaderboard');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toEqual([]);
    });

    it('should return leaderboard by ranking by default', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 5 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 1 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 10 }));

      const response = await authenticatedRequest('GET', '/api/v1/stats/leaderboard');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(3);
      expect(body[0].ranking).toBe(1);
      expect(body[1].ranking).toBe(5);
      expect(body[2].ranking).toBe(10);
    });

    it('should return leaderboard by rating when type=rating', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ rating: 1800 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ rating: 1900 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ rating: 1700 }));

      const response = await authenticatedRequest('GET', '/api/v1/stats/leaderboard?type=rating');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(3);
      expect(body[0].rating).toBe(1900);
      expect(body[1].rating).toBe(1800);
      expect(body[2].rating).toBe(1700);
    });

    it('should respect limit parameter', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 1 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 2 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 3 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 4 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 5 }));

      const response = await authenticatedRequest('GET', '/api/v1/stats/leaderboard?limit=3');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(3);
    });

    it('should allow unauthenticated access (public endpoint)', async () => {
      const app = await getTestApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/stats/leaderboard',
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
