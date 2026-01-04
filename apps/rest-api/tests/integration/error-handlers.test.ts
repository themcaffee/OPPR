import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import { getTestApp, closeTestApp, getAuthToken, authenticatedRequest } from '../setup/test-helpers.js';
import { prisma } from '@opprs/db-prisma';

/**
 * Tests for error handler coverage - exercises error paths
 * not covered by other integration tests.
 */
describe('Error handlers', () => {
  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.entry.deleteMany();
    await prisma.standing.deleteMany();
    await prisma.match.deleteMany();
    await prisma.round.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
    await prisma.player.deleteMany();
  });

  describe('Player endpoints - error cases', () => {
    it('should return 404 for non-existent player results', async () => {
      const app = await getTestApp();
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players/nonexistent-id/results',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toContain('not found');
    });

    it('should return 404 for non-existent player stats', async () => {
      const app = await getTestApp();
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players/nonexistent-id/stats',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return results for existing player', async () => {
      // Create a player
      const playerResponse = await authenticatedRequest('POST', '/api/v1/players', {
        name: 'Test Player',
      });
      const player = playerResponse.json();

      // Get player results
      const response = await authenticatedRequest('GET', `/api/v1/players/${player.id}/results`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should return stats for existing player (empty stats)', async () => {
      // Create a player with no results
      const playerResponse = await authenticatedRequest('POST', '/api/v1/players', {
        name: 'Test Player',
      });
      const player = playerResponse.json();

      // Get player stats - should return empty stats
      const response = await authenticatedRequest('GET', `/api/v1/players/${player.id}/stats`);
      expect(response.statusCode).toBe(200);
      const stats = response.json();
      expect(stats.totalEvents).toBe(0);
    });

    it('should return stats for player with results', async () => {
      // Create a player
      const playerResponse = await authenticatedRequest('POST', '/api/v1/players', {
        name: 'Test Player',
      });
      const player = playerResponse.json();

      // Create a tournament
      const tournamentResponse = await authenticatedRequest('POST', '/api/v1/tournaments', {
        name: 'Test Tournament',
        date: '2024-01-01T00:00:00Z',
      });
      const tournament = tournamentResponse.json();

      // Create a standing for this player
      await authenticatedRequest('POST', '/api/v1/standings', {
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
        totalPoints: 100,
      });

      // Get player stats - should return computed stats
      const response = await authenticatedRequest('GET', `/api/v1/players/${player.id}/stats`);
      expect(response.statusCode).toBe(200);
      const stats = response.json();
      expect(stats.totalEvents).toBe(1);
      expect(stats.totalPoints).toBe(100);
    });
  });

  describe('Tournament endpoints - error cases', () => {
    it('should return 404 for non-existent tournament results', async () => {
      const app = await getTestApp();
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tournaments/nonexistent-id/results',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toContain('not found');
    });

    it('should return results for existing tournament', async () => {
      // Create a tournament
      const tournamentResponse = await authenticatedRequest('POST', '/api/v1/tournaments', {
        name: 'Test Tournament',
        date: '2024-01-01T00:00:00Z',
      });
      const tournament = tournamentResponse.json();

      // Get tournament results
      const response = await authenticatedRequest(
        'GET',
        `/api/v1/tournaments/${tournament.id}/results`
      );
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });
  });

  describe('Import endpoints - error cases', () => {
    it('should return 400 for invalid matchplay ID (zero)', async () => {
      const app = await getTestApp();
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/import/matchplay/tournament/0',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {}, // Include body to pass validation
      });

      // Either the handler or schema validation returns 400
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid matchplay ID (negative)', async () => {
      const app = await getTestApp();
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/import/matchplay/tournament/-1',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for non-numeric matchplay ID', async () => {
      const app = await getTestApp();
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/import/matchplay/tournament/abc',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
