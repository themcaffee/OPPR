import type { Player, PlayerResult, Tournament } from '@opprs/core';
import type {
  MatchplayTournament,
  MatchplayStanding,
  MatchplayUserResponse,
  MatchplayGame,
  MatchplayRound,
  MatchplayRating,
  MatchplayListResponse,
  MatchplaySingleResponse,
} from './types/api-responses.js';
import type {
  MatchplayClientOptions,
  TournamentListParams,
  GameListParams,
  RatingParams,
  TransformOptions,
  PlayerTransformOptions,
  TournamentGame,
  TournamentRound,
} from './types/client-options.js';
import {
  MatchplayApiError,
  MatchplayAuthError,
  MatchplayNotFoundError,
  MatchplayNetworkError,
  MatchplayTimeoutError,
} from './errors.js';
import {
  toOPPRTournament,
  toOPPRPlayer,
  toOPPRResults,
  ratingToPlayer,
} from './transformers/index.js';

const DEFAULT_BASE_URL = 'https://app.matchplay.events/api';
const DEFAULT_TIMEOUT = 30000;

/**
 * Client for the Matchplay Events API
 * Returns data transformed to @opprs/core types
 */
export class MatchplayClient {
  private readonly baseUrl: string;
  private readonly apiToken?: string;
  private readonly timeout: number;

  constructor(options: MatchplayClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.apiToken = options.apiToken;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Make a request to the Matchplay API
   */
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response, path);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof MatchplayApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new MatchplayTimeoutError(this.timeout);
      }

      throw new MatchplayNetworkError(
        'Network request failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response, path: string): Promise<never> {
    const body = await response.json().catch(() => null);

    if (response.status === 401) {
      throw new MatchplayAuthError();
    }

    if (response.status === 404) {
      // Try to extract resource type from path
      const resourceMatch = path.match(/\/([a-z]+)(?:\/(\d+))?/i);
      if (resourceMatch) {
        throw new MatchplayNotFoundError(
          resourceMatch[1] ?? 'Resource',
          resourceMatch[2] ?? 'unknown'
        );
      }
      throw new MatchplayNotFoundError('Resource', 'unknown');
    }

    throw new MatchplayApiError(
      (body as { message?: string })?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body
    );
  }

  /**
   * Build URL query string from params object
   */
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ==================== Tournament Methods ====================

  /**
   * Get a list of tournaments (transformed to OPPR Tournament type)
   * Note: Returns tournaments without player data. Use getTournament() for full data.
   */
  async getTournaments(
    params: TournamentListParams = {},
    options: TransformOptions = {}
  ): Promise<Tournament[]> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    const response = await this.request<MatchplayListResponse<MatchplayTournament>>(
      `/tournaments${queryString}`
    );

    // For list endpoint, we don't have standings data
    // Return tournaments with empty players array
    return response.data.map((tournament) => toOPPRTournament(tournament, [], options));
  }

  /**
   * Get a single tournament with full player data
   */
  async getTournament(id: number, options: TransformOptions = {}): Promise<Tournament> {
    // Fetch both tournament and standings in parallel
    const [tournamentResponse, standings] = await Promise.all([
      this.request<MatchplaySingleResponse<MatchplayTournament>>(`/tournaments/${id}`),
      this.getRawStandings(id),
    ]);

    return toOPPRTournament(tournamentResponse.data, standings, options);
  }

  /**
   * Get tournament standings as OPPR PlayerResults
   */
  async getTournamentResults(
    id: number,
    options: PlayerTransformOptions = {}
  ): Promise<PlayerResult[]> {
    const standings = await this.getRawStandings(id);
    return toOPPRResults(standings, undefined, options);
  }

  /**
   * Get raw standings from API (internal helper)
   * Note: The standings endpoint returns a plain array, not wrapped in { data: [...] }
   */
  private async getRawStandings(id: number): Promise<MatchplayStanding[]> {
    return this.request<MatchplayStanding[]>(`/tournaments/${id}/standings`);
  }

  /**
   * Get raw standings data including player names
   */
  async getStandings(id: number): Promise<MatchplayStanding[]> {
    return this.getRawStandings(id);
  }

  /**
   * Get tournament games
   */
  async getTournamentGames(id: number, params: GameListParams = {}): Promise<TournamentGame[]> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    const response = await this.request<MatchplayListResponse<MatchplayGame>>(
      `/tournaments/${id}/games${queryString}`
    );

    return response.data.map((game) => ({
      gameId: game.gameId,
      roundId: game.roundId,
      arenaId: game.arenaId,
      status: game.status,
      players: game.players,
      scores: game.scores,
      points: game.points,
      completedAt: game.completedAt ? new Date(game.completedAt) : null,
    }));
  }

  /**
   * Get tournament rounds
   */
  async getTournamentRounds(id: number): Promise<TournamentRound[]> {
    const response = await this.request<MatchplayListResponse<MatchplayRound>>(
      `/tournaments/${id}/rounds`
    );

    return response.data.map((round) => ({
      roundId: round.roundId,
      name: round.name,
      status: round.status,
      startedAt: round.startedAt ? new Date(round.startedAt) : null,
      completedAt: round.completedAt ? new Date(round.completedAt) : null,
    }));
  }

  // ==================== Player/User Methods ====================

  /**
   * Get a user's profile as OPPR Player
   * Note: The /users/{id} endpoint returns { user, rating, ifpa, userCounts } not { data: {...} }
   */
  async getPlayer(userId: number, options: PlayerTransformOptions = {}): Promise<Player> {
    // Request user with all available data
    const queryString = this.buildQueryString({
      with: 'rating,ifpa,counts',
    });

    const response = await this.request<MatchplayUserResponse>(`/users/${userId}${queryString}`);

    // Combine the separate fields into a single user object for transformation
    const userWithDetails = {
      ...response.user,
      rating: response.rating ?? undefined,
      ifpa: response.ifpa ?? undefined,
      userCounts: response.userCounts ?? undefined,
    };

    return toOPPRPlayer(userWithDetails, options);
  }

  /**
   * Search for players by name
   */
  async searchPlayers(query: string, options: PlayerTransformOptions = {}): Promise<Player[]> {
    const queryString = this.buildQueryString({ query });
    const response = await this.request<MatchplayListResponse<MatchplayRating>>(
      `/ratings/search${queryString}`
    );

    return response.data.map((rating) => ratingToPlayer(rating, options));
  }

  /**
   * Get ratings list (for leaderboard/ranking purposes)
   */
  async getRatings(
    params: RatingParams = {},
    options: PlayerTransformOptions = {}
  ): Promise<Player[]> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    const response = await this.request<MatchplayListResponse<MatchplayRating>>(
      `/ratings${queryString}`
    );

    return response.data.map((rating) => ratingToPlayer(rating, options));
  }
}
