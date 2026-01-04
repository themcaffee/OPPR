import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import {
  getTestApp,
  closeTestApp,
  authenticatedRequest,
  resetAuthCache,
} from '../setup/test-helpers.js';
import { createPlayerFixture, createRatedPlayerFixture } from '../fixtures/index.js';

describe('Players endpoints', () => {
  beforeEach(() => {
    resetAuthCache();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/v1/players', () => {
    it('should return empty list initially', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/players');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([]);
      expect(body).toHaveProperty('pagination');
      expect(body.pagination.total).toBe(0);
    });

    it('should return players with pagination', async () => {
      // Create some players first
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture());
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture());
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture());

      const response = await authenticatedRequest('GET', '/api/v1/players?limit=2');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(2);
      expect(body.pagination.total).toBe(3);
      expect(body.pagination.totalPages).toBe(2);
    });

    it('should filter by isRated', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture({ isRated: false }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture());

      const response = await authenticatedRequest('GET', '/api/v1/players?isRated=true');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].isRated).toBe(true);
    });

    it('should allow unauthenticated access (public endpoint)', async () => {
      const app = await getTestApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/v1/players', () => {
    it('should create a new player', async () => {
      const playerData = createPlayerFixture();
      const response = await authenticatedRequest('POST', '/api/v1/players', playerData);

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body).toHaveProperty('id');
      expect(body.firstName).toBe(playerData.firstName);
      expect(body.lastName).toBe(playerData.lastName);
      expect(body.rating).toBe(playerData.rating);
    });

    it('should create a player with minimal data', async () => {
      const response = await authenticatedRequest('POST', '/api/v1/players', {
        firstName: 'Minimal',
        lastName: 'Player',
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.firstName).toBe('Minimal');
      expect(body.lastName).toBe('Player');
      expect(body.rating).toBe(1500); // default
      expect(body.ratingDeviation).toBe(200); // default
    });
  });

  describe('GET /api/v1/players/:id', () => {
    it('should return a player by ID', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('GET', `/api/v1/players/${id}`);

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.id).toBe(id);
    });

    it('should return 404 for non-existent player', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/players/non-existent-id');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/players/:id', () => {
    it('should update a player', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('PATCH', `/api/v1/players/${id}`, {
        firstName: 'Updated',
        lastName: 'Name',
        rating: 1700,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.firstName).toBe('Updated');
      expect(body.lastName).toBe('Name');
      expect(body.rating).toBe(1700);
    });

    it('should return 404 when updating non-existent player', async () => {
      const response = await authenticatedRequest('PATCH', '/api/v1/players/non-existent-id', {
        firstName: 'Test',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/players/:id', () => {
    it('should delete a player', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const { id } = createResponse.json();

      const deleteResponse = await authenticatedRequest('DELETE', `/api/v1/players/${id}`);
      expect(deleteResponse.statusCode).toBe(204);

      const getResponse = await authenticatedRequest('GET', `/api/v1/players/${id}`);
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 when deleting non-existent player', async () => {
      const response = await authenticatedRequest('DELETE', '/api/v1/players/non-existent-id');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/players/search', () => {
    it('should search players by name', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture({ firstName: 'John', lastName: 'Doe' }));
      await authenticatedRequest('POST', '/api/v1/players', createPlayerFixture({ firstName: 'Jane', lastName: 'Smith' }));

      const response = await authenticatedRequest('GET', '/api/v1/players/search?q=John');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(1);
      expect(body[0].firstName).toBe('John');
      expect(body[0].lastName).toBe('Doe');
    });

  });

  describe('GET /api/v1/players/top/rating', () => {
    it('should return top players by rating', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ rating: 1800 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ rating: 1900 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ rating: 1700 }));

      const response = await authenticatedRequest('GET', '/api/v1/players/top/rating?limit=2');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(2);
      expect(body[0].rating).toBe(1900);
      expect(body[1].rating).toBe(1800);
    });
  });

  describe('GET /api/v1/players/top/ranking', () => {
    it('should return top players by ranking', async () => {
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 5 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 1 }));
      await authenticatedRequest('POST', '/api/v1/players', createRatedPlayerFixture({ ranking: 10 }));

      const response = await authenticatedRequest('GET', '/api/v1/players/top/ranking?limit=2');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(2);
      expect(body[0].ranking).toBe(1);
      expect(body[1].ranking).toBe(5);
    });
  });

  describe('GET /api/v1/players/:id/stats', () => {
    it('should return player stats', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/players',
        createPlayerFixture()
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('GET', `/api/v1/players/${id}/stats`);

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('totalEvents');
      expect(body).toHaveProperty('totalPoints');
      expect(body).toHaveProperty('averagePosition');
    });

    it('should return 404 for non-existent player stats', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/players/non-existent-id/stats');

      expect(response.statusCode).toBe(404);
    });
  });
});
