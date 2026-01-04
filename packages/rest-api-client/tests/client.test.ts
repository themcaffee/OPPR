import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpprsClient } from '../src/client.js';
import {
  OpprsApiError,
  OpprsAuthError,
  OpprsConflictError,
  OpprsExternalServiceError,
  OpprsNotFoundError,
  OpprsValidationError,
  OpprsTimeoutError,
} from '../src/errors.js';
import type { LoginResponse, Player } from '../src/types/index.js';

describe('OpprsClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  const createMockResponse = (data: unknown, status = 200): Response => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
    } as Response;
  };

  describe('constructor', () => {
    it('should create client with default options', () => {
      const client = new OpprsClient();

      expect(client).toBeInstanceOf(OpprsClient);
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create client with custom options', () => {
      const client = new OpprsClient({
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        accessToken: 'test-token',
      });

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('login', () => {
    it('should login and store tokens', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse));

      const client = new OpprsClient({ fetch: mockFetch });
      const result = await client.login({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual(loginResponse);
      expect(client.isAuthenticated()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        })
      );
    });

    it('should call onTokenRefresh callback', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      const onTokenRefresh = vi.fn();
      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse));

      const client = new OpprsClient({ fetch: mockFetch, onTokenRefresh });
      await client.login({ email: 'test@example.com', password: 'password' });

      expect(onTokenRefresh).toHaveBeenCalledWith({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(createMockResponse(null, 204));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });
      await client.logout();

      expect(client.isAuthenticated()).toBe(false);
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'refresh-token' }),
        })
      );
    });

    it('should clear tokens even if logout request fails', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(createMockResponse({ message: 'Invalid token' }, 401));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      await expect(client.logout()).rejects.toThrow(OpprsAuthError);
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw OpprsAuthError for 401 responses', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ message: 'Unauthorized' }, 401));

      const client = new OpprsClient({ fetch: mockFetch });

      await expect(client.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        OpprsAuthError
      );
    });

    it('should throw OpprsNotFoundError for 404 responses', async () => {
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: 'token',
            refreshToken: 'refresh',
            expiresIn: 900,
            tokenType: 'Bearer',
          })
        )
        .mockResolvedValueOnce(createMockResponse({ message: 'Player not found' }, 404));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      await expect(client.players.get('invalid-id')).rejects.toThrow(OpprsNotFoundError);
    });

    it('should throw OpprsValidationError for 400 responses', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Validation failed', details: { email: 'Invalid format' } },
          400
        )
      );

      const client = new OpprsClient({ fetch: mockFetch });

      await expect(client.login({ email: 'invalid', password: 'password' })).rejects.toThrow(
        OpprsValidationError
      );
    });

    it('should throw OpprsTimeoutError when request times out', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            setTimeout(() => reject(error), 100);
          })
      );

      const client = new OpprsClient({ fetch: mockFetch, timeout: 50 });

      await expect(
        client.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(OpprsTimeoutError);
    });
  });

  describe('players resource', () => {
    it('should list players with authentication', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      const playersResponse = {
        data: [
          {
            id: '1',
            name: 'Test Player',
            email: 'test@example.com',
            rating: 1500,
            ratingDeviation: 200,
            ranking: null,
            isRated: false,
            eventCount: 0,
            externalId: null,
            lastRatingUpdate: null,
            lastEventDate: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(createMockResponse(playersResponse));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      const result = await client.players.list({ page: 1, limit: 20 });

      expect(result).toEqual(playersResponse);
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/v1/players?page=1&limit=20',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token',
          }),
        })
      );
    });

    it('should get single player by id', async () => {
      const player: Player = {
        id: '1',
        name: 'Test Player',
        email: 'test@example.com',
        rating: 1500,
        ratingDeviation: 200,
        ranking: null,
        isRated: false,
        eventCount: 0,
        externalId: null,
        lastRatingUpdate: null,
        lastEventDate: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: 'token',
            refreshToken: 'refresh',
            expiresIn: 900,
            tokenType: 'Bearer',
          })
        )
        .mockResolvedValueOnce(createMockResponse(player));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      const result = await client.players.get('1');

      expect(result).toEqual(player);
    });
  });

  describe('setTokensFromStorage', () => {
    it('should restore tokens from storage', () => {
      const client = new OpprsClient();

      expect(client.isAuthenticated()).toBe(false);

      client.setTokensFromStorage({
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
        expiresIn: 900,
      });

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerResponse = {
        user: {
          id: 'user-1',
          email: 'newuser@example.com',
          role: 'user',
          player: {
            id: 'player-1',
            name: 'New User',
          },
        },
        message: 'Registration successful',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(registerResponse, 201));

      const client = new OpprsClient({ fetch: mockFetch });
      const result = await client.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toEqual(registerResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
          }),
        })
      );
    });
  });

  describe('cookie mode', () => {
    it('should use credentials include when useCookies is true', async () => {
      const authResponse = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
          player: null,
        },
        message: 'Login successful',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(authResponse));

      const client = new OpprsClient({ fetch: mockFetch, useCookies: true });
      await client.login({ email: 'test@example.com', password: 'password' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should return false for isAuthenticated in cookie mode', () => {
      const client = new OpprsClient({ useCookies: true });
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should logout with cookies (POST to /auth/logout)', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null, 204));

      const client = new OpprsClient({ fetch: mockFetch, useCookies: true });
      await client.logout();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('should get me with cookies returning AuthUser', async () => {
      const authUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
        player: { id: 'player-1', name: 'Test Player' },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(authUser));

      const client = new OpprsClient({ fetch: mockFetch, useCookies: true });
      const result = await client.getMe();

      expect(result).toEqual(authUser);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/me',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should not include Authorization header in cookie mode', async () => {
      const authResponse = {
        user: { id: 'user-1', email: 'test@example.com', role: 'user', player: null },
        message: 'Login successful',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(authResponse));

      const client = new OpprsClient({
        fetch: mockFetch,
        useCookies: true,
        accessToken: 'should-not-be-used',
      });
      await client.login({ email: 'test@example.com', password: 'password' });

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = callArgs.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('logout without refresh token', () => {
    it('should clear tokens without making request if no refresh token', async () => {
      const client = new OpprsClient({ fetch: mockFetch, accessToken: 'access-only' });

      expect(client.isAuthenticated()).toBe(true);
      await client.logout();
      expect(client.isAuthenticated()).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('additional error handling', () => {
    it('should throw OpprsConflictError for 409 responses', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ message: 'Resource already exists', details: { field: 'email' } }, 409)
      );

      const client = new OpprsClient({ fetch: mockFetch });
      await expect(client.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
        OpprsConflictError
      );
    });

    it('should throw OpprsExternalServiceError for 502 responses', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ message: 'External service failed', service: 'matchplay' }, 502)
      );

      const client = new OpprsClient({ fetch: mockFetch });
      await expect(client.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
        OpprsExternalServiceError
      );
    });

    it('should throw OpprsApiError for unknown status codes', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ message: 'Unknown error' }, 418));

      const client = new OpprsClient({ fetch: mockFetch });
      await expect(client.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
        OpprsApiError
      );
    });

    it('should throw OpprsNotFoundError with unknown resource when path has no ID', async () => {
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: 'token',
            refreshToken: 'refresh',
            expiresIn: 900,
            tokenType: 'Bearer',
          })
        )
        .mockResolvedValueOnce(createMockResponse({ message: 'Not found' }, 404));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      // Access getMe which hits /auth/me - a path without resource ID pattern
      await expect(client.getMe()).rejects.toThrow(OpprsNotFoundError);
    });
  });

  describe('resource getters', () => {
    it('should return tournaments resource', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse)).mockResolvedValueOnce(
        createMockResponse({
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      );

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      const result = await client.tournaments.list({ page: 1, limit: 20 });
      expect(result.data).toEqual([]);
    });

    it('should return standings resource', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse)).mockResolvedValueOnce(
        createMockResponse({
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      );

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      const result = await client.standings.list({ page: 1, limit: 20 });
      expect(result.data).toEqual([]);
    });

    it('should return stats resource', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(
          createMockResponse({ totalPlayers: 0, totalTournaments: 0, totalResults: 0 })
        );

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      const result = await client.stats.overview();
      expect(result.totalPlayers).toBe(0);
    });

    it('should return import resource', async () => {
      const loginResponse: LoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      };

      const importResponse = {
        tournament: { id: 't1', name: 'Test' },
        resultsImported: 10,
        message: 'Import successful',
      };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(createMockResponse(importResponse));

      const client = new OpprsClient({ fetch: mockFetch });
      await client.login({ email: 'test@example.com', password: 'password' });

      const result = await client.import.matchplayTournament(12345);
      expect(result.resultsImported).toBe(10);
    });
  });
});
