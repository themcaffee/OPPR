import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import {
  getTestApp,
  closeTestApp,
  authenticatedRequest,
  resetAuthCache,
  daysAgo,
} from '../setup/test-helpers.js';
import { createTournamentFixture } from '../fixtures/index.js';

describe('Tournaments endpoints', () => {
  beforeEach(() => {
    resetAuthCache();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/v1/tournaments', () => {
    it('should return empty list initially', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/tournaments');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([]);
      expect(body).toHaveProperty('pagination');
      expect(body.pagination.total).toBe(0);
    });

    it('should return tournaments with pagination', async () => {
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture());
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture());
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture());

      const response = await authenticatedRequest('GET', '/api/v1/tournaments?limit=2');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(2);
      expect(body.pagination.total).toBe(3);
      expect(body.pagination.totalPages).toBe(2);
    });

    it('should filter by eventBooster', async () => {
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ eventBooster: 'NONE' }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ eventBooster: 'MAJOR' }));

      const response = await authenticatedRequest('GET', '/api/v1/tournaments?eventBooster=MAJOR');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].eventBooster).toBe('MAJOR');
    });

    it('should return 401 without authentication', async () => {
      const app = await getTestApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tournaments',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/tournaments', () => {
    it('should create a new tournament', async () => {
      const tournamentData = createTournamentFixture();
      const response = await authenticatedRequest('POST', '/api/v1/tournaments', tournamentData);

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(tournamentData.name);
      expect(body.location).toBe(tournamentData.location);
    });

    it('should create a tournament with minimal data', async () => {
      const response = await authenticatedRequest('POST', '/api/v1/tournaments', {
        name: 'Minimal Tournament',
        date: new Date().toISOString(),
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.name).toBe('Minimal Tournament');
      expect(body.eventBooster).toBe('NONE');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await authenticatedRequest('POST', '/api/v1/tournaments', {
        location: 'Test City',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/tournaments/:id', () => {
    it('should return a tournament by ID', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/tournaments',
        createTournamentFixture()
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('GET', `/api/v1/tournaments/${id}`);

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.id).toBe(id);
    });

    it('should return 404 for non-existent tournament', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/tournaments/non-existent-id');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/tournaments/:id', () => {
    it('should update a tournament', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/tournaments',
        createTournamentFixture()
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('PATCH', `/api/v1/tournaments/${id}`, {
        name: 'Updated Tournament Name',
        location: 'New City',
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.name).toBe('Updated Tournament Name');
      expect(body.location).toBe('New City');
    });

    it('should return 404 when updating non-existent tournament', async () => {
      const response = await authenticatedRequest('PATCH', '/api/v1/tournaments/non-existent-id', {
        name: 'Test',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/tournaments/:id', () => {
    it('should delete a tournament', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/tournaments',
        createTournamentFixture()
      );
      const { id } = createResponse.json();

      const deleteResponse = await authenticatedRequest('DELETE', `/api/v1/tournaments/${id}`);
      expect(deleteResponse.statusCode).toBe(204);

      const getResponse = await authenticatedRequest('GET', `/api/v1/tournaments/${id}`);
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 when deleting non-existent tournament', async () => {
      const response = await authenticatedRequest('DELETE', '/api/v1/tournaments/non-existent-id');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/tournaments/search', () => {
    it('should search tournaments by name', async () => {
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ name: 'Spring Championship' }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ name: 'Fall Open' }));

      const response = await authenticatedRequest('GET', '/api/v1/tournaments/search?q=Spring');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Spring Championship');
    });

    it('should search tournaments by location', async () => {
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ location: 'Chicago' }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ location: 'New York' }));

      const response = await authenticatedRequest('GET', '/api/v1/tournaments/search?q=Chicago');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(1);
      expect(body[0].location).toBe('Chicago');
    });
  });

  describe('GET /api/v1/tournaments/recent', () => {
    it('should return recent tournaments', async () => {
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ date: daysAgo(10).toISOString() }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ date: daysAgo(5).toISOString() }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ date: daysAgo(1).toISOString() }));

      const response = await authenticatedRequest('GET', '/api/v1/tournaments/recent?limit=2');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(2);
      // Most recent should be first
      const date1 = new Date(body[0].date).getTime();
      const date2 = new Date(body[1].date).getTime();
      expect(date1).toBeGreaterThan(date2);
    });
  });

  describe('GET /api/v1/tournaments/majors', () => {
    it('should return only major tournaments', async () => {
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ eventBooster: 'NONE' }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ eventBooster: 'MAJOR' }));
      await authenticatedRequest('POST', '/api/v1/tournaments', createTournamentFixture({ eventBooster: 'CERTIFIED' }));

      const response = await authenticatedRequest('GET', '/api/v1/tournaments/majors');

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveLength(1);
      expect(body[0].eventBooster).toBe('MAJOR');
    });
  });

  describe('GET /api/v1/tournaments/:id/stats', () => {
    it('should return tournament stats', async () => {
      const createResponse = await authenticatedRequest(
        'POST',
        '/api/v1/tournaments',
        createTournamentFixture()
      );
      const { id } = createResponse.json();

      const response = await authenticatedRequest('GET', `/api/v1/tournaments/${id}/stats`);

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('tournament');
      expect(body).toHaveProperty('playerCount');
      expect(body).toHaveProperty('averagePoints');
    });

    it('should return 404 for non-existent tournament stats', async () => {
      const response = await authenticatedRequest('GET', '/api/v1/tournaments/non-existent-id/stats');

      expect(response.statusCode).toBe(404);
    });
  });
});
