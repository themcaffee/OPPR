import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TournamentsResource } from '../../src/resources/tournaments.js';
import type { Tournament, PaginatedResponse } from '../../src/types/index.js';

describe('TournamentsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: TournamentsResource;

  beforeEach(() => {
    mockRequest = vi.fn();
    mockBuildQueryString = vi.fn((params) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      return queryString ? `?${queryString}` : '';
    });
    resource = new TournamentsResource(mockRequest, mockBuildQueryString);
  });

  const mockTournament: Tournament = {
    id: '1',
    name: 'Test Tournament',
    date: '2025-01-01',
    location: 'Test Location',
    eventBooster: 'NONE',
    ratedPlayerCount: 10,
    baseValue: 5.0,
    tva: 0,
    tgp: 100,
    totalValue: 5.0,
    tgpConfig: null,
    externalId: null,
    notes: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should list tournaments with pagination params', async () => {
      const response: PaginatedResponse<Tournament> = {
        data: [mockTournament],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.list({ page: 1, limit: 20 });

      expect(result).toEqual(response);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(mockRequest).toHaveBeenCalledWith('/tournaments?page=1&limit=20');
    });

    it('should list tournaments with sorting', async () => {
      const response: PaginatedResponse<Tournament> = {
        data: [mockTournament],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ sortBy: 'date', sortOrder: 'desc' });

      expect(mockRequest).toHaveBeenCalledWith('/tournaments?sortBy=date&sortOrder=desc');
    });

    it('should list tournaments with date filters', async () => {
      const response: PaginatedResponse<Tournament> = {
        data: [mockTournament],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ startDate: '2025-01-01', endDate: '2025-12-31' });

      expect(mockRequest).toHaveBeenCalledWith(
        '/tournaments?startDate=2025-01-01&endDate=2025-12-31',
      );
    });
  });

  describe('search', () => {
    it('should search tournaments by query', async () => {
      mockRequest.mockResolvedValue([mockTournament]);

      const result = await resource.search({ q: 'Test' });

      expect(result).toEqual([mockTournament]);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/search?q=Test');
    });
  });

  describe('recent', () => {
    it('should get recent tournaments', async () => {
      mockRequest.mockResolvedValue([mockTournament]);

      const result = await resource.recent({ limit: 10 });

      expect(result).toEqual([mockTournament]);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/recent?limit=10');
    });

    it('should get recent tournaments with no params', async () => {
      mockRequest.mockResolvedValue([mockTournament]);

      const result = await resource.recent();

      expect(result).toEqual([mockTournament]);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/recent');
    });
  });

  describe('majors', () => {
    it('should get major tournaments', async () => {
      mockRequest.mockResolvedValue([mockTournament]);

      const result = await resource.majors({ limit: 10 });

      expect(result).toEqual([mockTournament]);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/majors?limit=10');
    });

    it('should get major tournaments with no params', async () => {
      mockRequest.mockResolvedValue([mockTournament]);

      const result = await resource.majors();

      expect(result).toEqual([mockTournament]);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/majors');
    });
  });

  describe('get', () => {
    it('should get tournament by id', async () => {
      mockRequest.mockResolvedValue(mockTournament);

      const result = await resource.get('1');

      expect(result).toEqual(mockTournament);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/1');
    });
  });

  describe('getResults', () => {
    it('should get tournament results', async () => {
      const results = [
        {
          id: 'result-1',
          position: 1,
          optedOut: false,
          linearPoints: 10,
          dynamicPoints: 20,
          totalPoints: 30,
          ageInDays: 0,
          decayMultiplier: 1,
          decayedPoints: 30,
          efficiency: 1.5,
          player: {
            id: 'player-1',
            name: 'Test Player',
            email: 'test@example.com',
            rating: 1500,
            ranking: 1,
          },
        },
      ];

      mockRequest.mockResolvedValue(results);

      const result = await resource.getResults('1');

      expect(result).toEqual(results);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/1/results');
    });
  });

  describe('getStats', () => {
    it('should get tournament stats', async () => {
      const stats = {
        totalPlayers: 20,
        ratedPlayers: 15,
        baseValue: 7.5,
        tva: 10,
        tgp: 120,
        totalValue: 9.0,
        eventBooster: 'NONE' as const,
        averageRating: 1500,
        topPlayerRating: 2000,
      };

      mockRequest.mockResolvedValue(stats);

      const result = await resource.getStats('1');

      expect(result).toEqual(stats);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/1/stats');
    });
  });

  describe('create', () => {
    it('should create tournament', async () => {
      const createData = {
        name: 'New Tournament',
        date: '2025-06-01',
        location: 'New Location',
        eventBooster: 'NONE' as const,
      };
      mockRequest.mockResolvedValue(mockTournament);

      const result = await resource.create(createData);

      expect(result).toEqual(mockTournament);
      expect(mockRequest).toHaveBeenCalledWith('/tournaments', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
    });
  });

  describe('update', () => {
    it('should update tournament', async () => {
      const updateData = { name: 'Updated Name' };
      mockRequest.mockResolvedValue({ ...mockTournament, name: 'Updated Name' });

      const result = await resource.update('1', updateData);

      expect(result.name).toBe('Updated Name');
      expect(mockRequest).toHaveBeenCalledWith('/tournaments/1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    it('should delete tournament', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('1');

      expect(mockRequest).toHaveBeenCalledWith('/tournaments/1', {
        method: 'DELETE',
      });
    });
  });
});
