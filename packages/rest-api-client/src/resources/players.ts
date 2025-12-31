import type {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  PlayerListParams,
  PlayerSearchParams,
  TopPlayersParams,
  PlayerStats,
  PlayerResult,
  PaginatedResponse,
} from '../types/index.js';

type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;

/**
 * Players resource methods
 */
export class PlayersResource {
  constructor(
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn
  ) {}

  /**
   * List players with pagination
   */
  async list(params: PlayerListParams = {}): Promise<PaginatedResponse<Player>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<Player>>(`/players${queryString}`);
  }

  /**
   * Search players by name or email
   */
  async search(params: PlayerSearchParams): Promise<Player[]> {
    const queryString = this._buildQueryString(params as unknown as Record<string, unknown>);
    return this._request<Player[]>(`/players/search${queryString}`);
  }

  /**
   * Get top players by rating
   */
  async topByRating(params: TopPlayersParams = {}): Promise<Player[]> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<Player[]>(`/players/top/rating${queryString}`);
  }

  /**
   * Get top players by ranking
   */
  async topByRanking(params: TopPlayersParams = {}): Promise<Player[]> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<Player[]>(`/players/top/ranking${queryString}`);
  }

  /**
   * Get player by ID
   */
  async get(id: string): Promise<Player> {
    return this._request<Player>(`/players/${id}`);
  }

  /**
   * Get player's tournament results
   */
  async getResults(id: string): Promise<PlayerResult[]> {
    return this._request<PlayerResult[]>(`/players/${id}/results`);
  }

  /**
   * Get player statistics
   */
  async getStats(id: string): Promise<PlayerStats> {
    return this._request<PlayerStats>(`/players/${id}/stats`);
  }

  /**
   * Create a new player
   */
  async create(data: CreatePlayerRequest): Promise<Player> {
    return this._request<Player>('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a player
   */
  async update(id: string, data: UpdatePlayerRequest): Promise<Player> {
    return this._request<Player>(`/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a player
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/players/${id}`, {
      method: 'DELETE',
    });
  }
}
