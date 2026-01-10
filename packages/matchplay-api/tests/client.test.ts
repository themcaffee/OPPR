import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MatchplayClient } from '../src/client.js';
import {
  MatchplayApiError,
  MatchplayAuthError,
  MatchplayNotFoundError,
  MatchplayNetworkError,
  MatchplayTimeoutError,
} from '../src/errors.js';
import {
  sampleTournament,
  sampleStandings,
  sampleUserWithDetails,
  sampleGames,
  sampleRounds,
  sampleRating,
} from './fixtures/index.js';

describe('MatchplayClient', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const mockFetch = (response: { ok: boolean; status: number; data: unknown }): void => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status,
      json: () => Promise.resolve(response.data),
    });
  };

  describe('constructor', () => {
    it('should use default base URL', () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: [] } });

      client.getTournaments();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://app.matchplay.events/api'),
        expect.any(Object)
      );
    });

    it('should accept custom base URL', () => {
      const client = new MatchplayClient({ baseUrl: 'https://custom.api.com' });
      mockFetch({ ok: true, status: 200, data: { data: [] } });

      client.getTournaments();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://custom.api.com'),
        expect.any(Object)
      );
    });

    it('should include API token in headers when provided', () => {
      const client = new MatchplayClient({ apiToken: 'test-token' });
      mockFetch({ ok: true, status: 200, data: { data: [] } });

      client.getTournaments();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw MatchplayAuthError on 401', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: false, status: 401, data: { message: 'Unauthorized' } });

      await expect(client.getTournaments()).rejects.toThrow(MatchplayAuthError);
    });

    it('should throw MatchplayNotFoundError on 404', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: false, status: 404, data: { message: 'Not found' } });

      await expect(client.getTournament(99999)).rejects.toThrow(MatchplayNotFoundError);
    });

    it('should throw MatchplayApiError on other errors', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: false, status: 500, data: { message: 'Server error' } });

      await expect(client.getTournaments()).rejects.toThrow(MatchplayApiError);
    });

    it('should throw MatchplayNetworkError on network failure', async () => {
      const client = new MatchplayClient();
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(client.getTournaments()).rejects.toThrow(MatchplayNetworkError);
    });

    it('should throw MatchplayTimeoutError on timeout', async () => {
      const client = new MatchplayClient({ timeout: 1 });
      globalThis.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            setTimeout(() => reject(error), 10);
          })
      );

      await expect(client.getTournaments()).rejects.toThrow(MatchplayTimeoutError);
    });
  });

  describe('getTournaments', () => {
    it('should fetch and transform tournaments', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: [sampleTournament] } });

      const tournaments = await client.getTournaments();

      expect(tournaments).toHaveLength(1);
      expect(tournaments[0].id).toBe('12345');
      expect(tournaments[0].name).toBe('Weekly Pinball League');
    });

    it('should pass query parameters', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: [] } });

      await client.getTournaments({ status: 'completed', limit: 10 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=completed'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'), expect.any(Object));
    });
  });

  describe('getTournament', () => {
    it('should fetch tournament with standings', async () => {
      const client = new MatchplayClient();
      let callCount = 0;

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        callCount++;
        if (url.includes('/standings')) {
          // Standings endpoint returns plain array, not { data: [...] }
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(sampleStandings),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: sampleTournament }),
        });
      });

      const tournament = await client.getTournament(12345);

      expect(callCount).toBe(2); // Tournament + Standings
      expect(tournament.id).toBe('12345');
      expect(tournament.players).toHaveLength(4);
    });
  });

  describe('getTournamentResults', () => {
    it('should fetch and transform standings to results', async () => {
      const client = new MatchplayClient();
      // Standings endpoint returns plain array, not { data: [...] }
      mockFetch({ ok: true, status: 200, data: sampleStandings });

      const results = await client.getTournamentResults(12345);

      expect(results).toHaveLength(4);
      expect(results[0].position).toBe(1);
      expect(results[0].player.id).toBe('1001');
    });
  });

  describe('getTournamentGames', () => {
    it('should fetch and transform games', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: sampleGames } });

      const games = await client.getTournamentGames(12345);

      expect(games).toHaveLength(1);
      expect(games[0].gameId).toBe(10001);
      expect(games[0].completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getTournamentRounds', () => {
    it('should fetch and transform rounds', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: sampleRounds } });

      const rounds = await client.getTournamentRounds(12345);

      expect(rounds).toHaveLength(2);
      expect(rounds[0].roundId).toBe(1);
      expect(rounds[0].name).toBe('Round 1');
    });
  });

  describe('getPlayer', () => {
    it('should fetch and transform user to player', async () => {
      const client = new MatchplayClient();
      // /users/{id} endpoint returns { user, rating, ifpa, userCounts } not { data: {...} }
      mockFetch({
        ok: true,
        status: 200,
        data: {
          user: {
            userId: sampleUserWithDetails.userId,
            name: sampleUserWithDetails.name,
            ifpaId: sampleUserWithDetails.ifpaId,
            role: sampleUserWithDetails.role,
            flag: sampleUserWithDetails.flag,
            location: sampleUserWithDetails.location,
            pronouns: sampleUserWithDetails.pronouns,
            initials: sampleUserWithDetails.initials,
            avatar: sampleUserWithDetails.avatar,
            banner: sampleUserWithDetails.banner,
            tournamentAvatar: sampleUserWithDetails.tournamentAvatar,
            createdAt: sampleUserWithDetails.createdAt,
          },
          rating: sampleUserWithDetails.rating,
          ifpa: sampleUserWithDetails.ifpa,
          userCounts: sampleUserWithDetails.userCounts,
        },
      });

      const player = await client.getPlayer(1001);

      expect(player.id).toBe('1001');
      expect(player.rating).toBe(1850);
      expect(player.ranking).toBe(250);
    });
  });

  describe('searchPlayers', () => {
    it('should search and transform ratings to players', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: [sampleRating] } });

      const players = await client.searchPlayers('Alice');

      expect(players).toHaveLength(1);
      expect(players[0].id).toBe('1001');
      expect(players[0].rating).toBe(1850);
    });
  });

  describe('getRatings', () => {
    it('should fetch and transform ratings', async () => {
      const client = new MatchplayClient();
      mockFetch({ ok: true, status: 200, data: { data: [sampleRating] } });

      const players = await client.getRatings({ limit: 100 });

      expect(players).toHaveLength(1);
      expect(players[0].id).toBe('1001');
    });
  });
});
