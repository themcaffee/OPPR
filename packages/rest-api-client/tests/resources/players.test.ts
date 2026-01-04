import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayersResource } from '../../src/resources/players.js';
import type { Player, PaginatedResponse } from '../../src/types/index.js';

describe('PlayersResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: PlayersResource;

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
    resource = new PlayersResource(mockRequest, mockBuildQueryString);
  });

  const mockPlayer: Player = {
    id: '1',
    externalId: null,
    firstName: 'Test',
    middleInitial: null,
    lastName: 'Player',
    rating: 1500,
    ratingDeviation: 200,
    ranking: null,
    isRated: false,
    eventCount: 0,
    lastRatingUpdate: null,
    lastEventDate: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should list players with pagination params', async () => {
      const response: PaginatedResponse<Player> = {
        data: [mockPlayer],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.list({ page: 1, limit: 20 });

      expect(result).toEqual(response);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(mockRequest).toHaveBeenCalledWith('/players?page=1&limit=20');
    });

    it('should list players with sorting', async () => {
      const response: PaginatedResponse<Player> = {
        data: [mockPlayer],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ sortBy: 'rating', sortOrder: 'desc' });

      expect(mockRequest).toHaveBeenCalledWith('/players?sortBy=rating&sortOrder=desc');
    });
  });

  describe('search', () => {
    it('should search players by query', async () => {
      mockRequest.mockResolvedValue([mockPlayer]);

      const result = await resource.search({ q: 'Test' });

      expect(result).toEqual([mockPlayer]);
      expect(mockRequest).toHaveBeenCalledWith('/players/search?q=Test');
    });
  });

  describe('topByRating', () => {
    it('should get top players by rating', async () => {
      mockRequest.mockResolvedValue([mockPlayer]);

      const result = await resource.topByRating({ limit: 10 });

      expect(result).toEqual([mockPlayer]);
      expect(mockRequest).toHaveBeenCalledWith('/players/top/rating?limit=10');
    });
  });

  describe('topByRanking', () => {
    it('should get top players by ranking', async () => {
      mockRequest.mockResolvedValue([mockPlayer]);

      const result = await resource.topByRanking({ limit: 10 });

      expect(result).toEqual([mockPlayer]);
      expect(mockRequest).toHaveBeenCalledWith('/players/top/ranking?limit=10');
    });
  });

  describe('get', () => {
    it('should get player by id', async () => {
      mockRequest.mockResolvedValue(mockPlayer);

      const result = await resource.get('1');

      expect(result).toEqual(mockPlayer);
      expect(mockRequest).toHaveBeenCalledWith('/players/1');
    });
  });

  describe('getResults', () => {
    it('should get player results', async () => {
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
          tournament: {
            id: 'tournament-1',
            name: 'Test Tournament',
            date: '2025-01-01',
            location: 'Test Location',
            eventBooster: 'NONE' as const,
          },
        },
      ];

      mockRequest.mockResolvedValue(results);

      const result = await resource.getResults('1');

      expect(result).toEqual(results);
      expect(mockRequest).toHaveBeenCalledWith('/players/1/results');
    });
  });

  describe('getStats', () => {
    it('should get player stats', async () => {
      const stats = {
        totalEvents: 10,
        totalPoints: 100,
        totalDecayedPoints: 90,
        averagePoints: 10,
        averagePosition: 5,
        averageFinish: 5,
        averageEfficiency: 1.2,
        firstPlaceFinishes: 2,
        topThreeFinishes: 5,
        bestFinish: 1,
        highestPoints: 50,
      };

      mockRequest.mockResolvedValue(stats);

      const result = await resource.getStats('1');

      expect(result).toEqual(stats);
      expect(mockRequest).toHaveBeenCalledWith('/players/1/stats');
    });
  });

  describe('create', () => {
    it('should create player', async () => {
      const createData = { firstName: 'New', lastName: 'Player' };
      mockRequest.mockResolvedValue(mockPlayer);

      const result = await resource.create(createData);

      expect(result).toEqual(mockPlayer);
      expect(mockRequest).toHaveBeenCalledWith('/players', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
    });
  });

  describe('update', () => {
    it('should update player', async () => {
      const updateData = { lastName: 'Updated' };
      mockRequest.mockResolvedValue({ ...mockPlayer, lastName: 'Updated' });

      const result = await resource.update('1', updateData);

      expect(result.lastName).toBe('Updated');
      expect(mockRequest).toHaveBeenCalledWith('/players/1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    it('should delete player', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('1');

      expect(mockRequest).toHaveBeenCalledWith('/players/1', {
        method: 'DELETE',
      });
    });
  });
});
