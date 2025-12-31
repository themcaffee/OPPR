import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsResource } from '../../src/resources/stats.js';
import type { OverviewStats, Player } from '../../src/types/index.js';

describe('StatsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: StatsResource;

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
    resource = new StatsResource(mockRequest, mockBuildQueryString);
  });

  describe('overview', () => {
    it('should get system-wide statistics', async () => {
      const stats: OverviewStats = {
        totalPlayers: 100,
        totalTournaments: 50,
        totalResults: 500,
        ratedPlayers: 80,
        activePlayers: 60,
        averageRating: 1500,
        averageTournamentSize: 10,
        recentActivityCount: 25,
      };

      mockRequest.mockResolvedValue(stats);

      const result = await resource.overview();

      expect(result).toEqual(stats);
      expect(mockRequest).toHaveBeenCalledWith('/stats/overview');
    });
  });

  describe('leaderboard', () => {
    it('should get player leaderboard with default params', async () => {
      const players: Player[] = [
        {
          id: '1',
          name: 'Player 1',
          email: 'player1@example.com',
          rating: 2000,
          ratingDeviation: 150,
          ranking: 1,
          isRated: true,
          eventCount: 10,
          externalId: null,
          lastRatingUpdate: '2025-01-01T00:00:00Z',
          lastEventDate: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Player 2',
          email: 'player2@example.com',
          rating: 1900,
          ratingDeviation: 160,
          ranking: 2,
          isRated: true,
          eventCount: 8,
          externalId: null,
          lastRatingUpdate: '2025-01-01T00:00:00Z',
          lastEventDate: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockRequest.mockResolvedValue(players);

      const result = await resource.leaderboard();

      expect(result).toEqual(players);
      expect(mockRequest).toHaveBeenCalledWith('/stats/leaderboard');
    });

    it('should get player leaderboard with custom params', async () => {
      const players: Player[] = [
        {
          id: '1',
          name: 'Player 1',
          email: 'player1@example.com',
          rating: 2000,
          ratingDeviation: 150,
          ranking: 1,
          isRated: true,
          eventCount: 10,
          externalId: null,
          lastRatingUpdate: '2025-01-01T00:00:00Z',
          lastEventDate: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockRequest.mockResolvedValue(players);

      const result = await resource.leaderboard({ limit: 10, sortBy: 'rating' });

      expect(result).toEqual(players);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ limit: 10, sortBy: 'rating' });
      expect(mockRequest).toHaveBeenCalledWith('/stats/leaderboard?limit=10&sortBy=rating');
    });

    it('should get player leaderboard sorted by ranking', async () => {
      mockRequest.mockResolvedValue([]);

      await resource.leaderboard({ sortBy: 'ranking', limit: 50 });

      expect(mockRequest).toHaveBeenCalledWith('/stats/leaderboard?sortBy=ranking&limit=50');
    });
  });
});
