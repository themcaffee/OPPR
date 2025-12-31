import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import {
  getTestApp,
  closeTestApp,
  authenticatedRequest,
  resetAuthCache,
} from '../setup/test-helpers.js';
import {
  createPlayerFixture,
  createTournamentFixture,
  createResultFixture,
} from '../fixtures/index.js';

describe('Results endpoints', () => {
  beforeEach(() => {
    resetAuthCache();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  async function createPlayerAndTournament() {
    const playerResponse = await authenticatedRequest(
      'POST',
      '/api/v1/players',
      createPlayerFixture()
    );
    const player = playerResponse.json();

    const tournamentResponse = await authenticatedRequest(
      'POST',
      '/api/v1/tournaments',
      createTournamentFixture()
    );
    const tournament = tournamentResponse.json();

    return { player, tournament };
  }

  describe('GET /api/v1/results', () => {
    it('should return empty list initially', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/results');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([]);
      expect(body).toHaveProperty('pagination');
      expect(body.pagination.total).toBe(0);
    });

    it('should return results with pagination', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      // Create another player for multiple results
      const player2Response = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const player2 = player2Response.json();

      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id, { position: 1 })
      );
      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player2.id, tournament.id, { position: 2 })
      );

      const response = await authenticatedRequest('GET', '/api/v1/results?limit=1');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(1);
      expect(body.pagination.total).toBe(2);
    });

    it('should filter by playerId', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      const player2Response = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const player2 = player2Response.json();

      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id, { position: 1 })
      );
      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player2.id, tournament.id, { position: 2 })
      );

      const response = await authenticatedRequest('GET', `/api/v1/results?playerId=${player.id}`);

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].playerId).toBe(player.id);
    });

    it('should filter by tournamentId', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      const tournament2Response = await authenticatedRequest(
        'POST',
        '/api/v1/tournaments',
        createTournamentFixture()
      );
      const tournament2 = tournament2Response.json();

      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id, { position: 1 })
      );
      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament2.id, { position: 2 })
      );

      const response = await authenticatedRequest(
        'GET',
        `/api/v1/results?tournamentId=${tournament.id}`
      );

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].tournamentId).toBe(tournament.id);
    });

    it('should return 401 without authentication', async () => {
      const app = await getTestApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/results',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/results', () => {
    it('should create a new result', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      const resultData = createResultFixture(player.id, tournament.id);
      const response = await authenticatedRequest('POST', '/api/v1/results', resultData);

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body).toHaveProperty('id');
      expect(body.playerId).toBe(player.id);
      expect(body.tournamentId).toBe(tournament.id);
      expect(body.position).toBe(resultData.position);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await authenticatedRequest('POST', '/api/v1/results', {
        position: 1,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/results/batch', () => {
    it('should create multiple results at once', async () => {
      const { tournament } = await createPlayerAndTournament();

      const player2Response = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const player2 = player2Response.json();

      const player3Response = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const player3 = player3Response.json();

      const resultsData = [
        createResultFixture(player2.id, tournament.id, { position: 1 }),
        createResultFixture(player3.id, tournament.id, { position: 2 }),
      ];

      const response = await authenticatedRequest('POST', '/api/v1/results/batch', resultsData);

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.count).toBe(2);
    });
  });

  describe('GET /api/v1/results/:id', () => {
    it('should return a result by ID', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id)
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('GET', `/api/v1/results/${id}`);

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.id).toBe(id);
      expect(body).toHaveProperty('player');
      expect(body).toHaveProperty('tournament');
    });

    it('should return 404 for non-existent result', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/results/non-existent-id');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/results/:id', () => {
    it('should update a result', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id, { position: 1 })
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('PATCH', `/api/v1/results/${id}`, {
        position: 2,
        totalPoints: 80,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.position).toBe(2);
      expect(body.totalPoints).toBe(80);
    });

    it('should return 404 when updating non-existent result', async () => {
      const response = await authenticatedRequest('PATCH', '/api/v1/results/non-existent-id', {
        position: 2,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/results/:id', () => {
    it('should delete a result', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id)
      );
      const { id } = createResponse.json();

      const deleteResponse = await authenticatedRequest('DELETE', `/api/v1/results/${id}`);
      expect(deleteResponse.statusCode).toBe(204);

      const getResponse = await authenticatedRequest('GET', `/api/v1/results/${id}`);
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 when deleting non-existent result', async () => {
      const response = await authenticatedRequest('DELETE', '/api/v1/results/non-existent-id');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/results/recalculate-decay', () => {
    it('should recalculate time decay for all results', async () => {
      const { player, tournament } = await createPlayerAndTournament();

      await authenticatedRequest(
        'POST',
        '/api/v1/results',
        createResultFixture(player.id, tournament.id)
      );

      const response = await authenticatedRequest('POST', '/api/v1/results/recalculate-decay');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('count');
      expect(body).toHaveProperty('message');
      expect(body.count).toBeGreaterThanOrEqual(1);
    });
  });
});
