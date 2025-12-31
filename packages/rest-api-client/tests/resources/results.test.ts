import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsResource } from '../../src/resources/results.js';

describe('ResultsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: ResultsResource;

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
    resource = new ResultsResource(mockRequest, mockBuildQueryString);
  });

  describe('list', () => {
    it('should list results with filters', async () => {
      const response = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ playerId: 'player-1', tournamentId: 'tournament-1' });

      expect(mockRequest).toHaveBeenCalledWith(
        '/results?playerId=player-1&tournamentId=tournament-1'
      );
    });
  });

  describe('createBatch', () => {
    it('should create multiple results', async () => {
      const results = [
        { playerId: 'player-1', tournamentId: 'tournament-1', position: 1 },
        { playerId: 'player-2', tournamentId: 'tournament-1', position: 2 },
      ];

      mockRequest.mockResolvedValue({ count: 2 });

      const result = await resource.createBatch(results);

      expect(result.count).toBe(2);
      expect(mockRequest).toHaveBeenCalledWith('/results/batch', {
        method: 'POST',
        body: JSON.stringify(results),
      });
    });
  });

  describe('recalculateDecay', () => {
    it('should recalculate decay for all results', async () => {
      mockRequest.mockResolvedValue({ count: 100, message: 'Decay recalculated' });

      const result = await resource.recalculateDecay();

      expect(result.count).toBe(100);
      expect(mockRequest).toHaveBeenCalledWith('/results/recalculate-decay', {
        method: 'POST',
      });
    });
  });
});
