import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StandingsResource } from '../../src/resources/results.js';

describe('StandingsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: StandingsResource;

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
    resource = new StandingsResource(mockRequest, mockBuildQueryString);
  });

  describe('list', () => {
    it('should list standings with filters', async () => {
      const response = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ playerId: 'player-1', tournamentId: 'tournament-1' });

      expect(mockRequest).toHaveBeenCalledWith(
        '/standings?playerId=player-1&tournamentId=tournament-1'
      );
    });
  });

  describe('get', () => {
    it('should get standing by id', async () => {
      const standing = {
        id: 'standing-1',
        playerId: 'player-1',
        tournamentId: 'tournament-1',
        position: 1,
        isFinals: false,
        optedOut: false,
        linearPoints: 10,
        dynamicPoints: 20,
        totalPoints: 30,
        ageInDays: 5,
        decayMultiplier: 1,
        decayedPoints: 30,
        efficiency: 1.5,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        player: {
          id: 'player-1',
          name: 'Test Player',
        },
        tournament: {
          id: 'tournament-1',
          name: 'Test Tournament',
        },
      };

      mockRequest.mockResolvedValue(standing);

      const res = await resource.get('standing-1');

      expect(res).toEqual(standing);
      expect(mockRequest).toHaveBeenCalledWith('/standings/standing-1');
    });
  });

  describe('create', () => {
    it('should create a standing', async () => {
      const createData = { playerId: 'player-1', tournamentId: 'tournament-1', position: 1 };
      const createdStanding = {
        id: 'standing-1',
        ...createData,
        isFinals: false,
        optedOut: false,
        linearPoints: 10,
        dynamicPoints: 20,
        totalPoints: 30,
        ageInDays: 0,
        decayMultiplier: 1,
        decayedPoints: 30,
        efficiency: 1.5,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockRequest.mockResolvedValue(createdStanding);

      const result = await resource.create(createData);

      expect(result).toEqual(createdStanding);
      expect(mockRequest).toHaveBeenCalledWith('/standings', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
    });
  });

  describe('createBatch', () => {
    it('should create multiple standings', async () => {
      const standings = [
        { playerId: 'player-1', tournamentId: 'tournament-1', position: 1 },
        { playerId: 'player-2', tournamentId: 'tournament-1', position: 2 },
      ];

      mockRequest.mockResolvedValue({ count: 2 });

      const result = await resource.createBatch(standings);

      expect(result.count).toBe(2);
      expect(mockRequest).toHaveBeenCalledWith('/standings/batch', {
        method: 'POST',
        body: JSON.stringify(standings),
      });
    });
  });

  describe('update', () => {
    it('should update a standing', async () => {
      const updateData = { position: 2 };
      const updatedStanding = {
        id: 'standing-1',
        playerId: 'player-1',
        tournamentId: 'tournament-1',
        position: 2,
        isFinals: false,
        optedOut: false,
        linearPoints: 8,
        dynamicPoints: 15,
        totalPoints: 23,
        ageInDays: 0,
        decayMultiplier: 1,
        decayedPoints: 23,
        efficiency: 1.2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockRequest.mockResolvedValue(updatedStanding);

      const result = await resource.update('standing-1', updateData);

      expect(result).toEqual(updatedStanding);
      expect(mockRequest).toHaveBeenCalledWith('/standings/standing-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    it('should delete a standing', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('standing-1');

      expect(mockRequest).toHaveBeenCalledWith('/standings/standing-1', {
        method: 'DELETE',
      });
    });
  });

  describe('recalculateDecay', () => {
    it('should recalculate decay for all standings', async () => {
      mockRequest.mockResolvedValue({ count: 100, message: 'Decay recalculated' });

      const result = await resource.recalculateDecay();

      expect(result.count).toBe(100);
      expect(mockRequest).toHaveBeenCalledWith('/standings/recalculate-decay', {
        method: 'POST',
      });
    });
  });
});
