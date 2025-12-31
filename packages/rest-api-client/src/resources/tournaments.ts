import type {
  Tournament,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentListParams,
  TournamentSearchParams,
  TournamentStats,
  TournamentResult,
  PaginatedResponse,
} from '../types/index.js';

 
type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;
 

interface LimitParams {
  limit?: number;
}

/**
 * Tournaments resource methods
 */
export class TournamentsResource {
  constructor(
     
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn,
    ) {
     }

  /**
   * List tournaments with pagination
   */
  async list(params: TournamentListParams = {}): Promise<PaginatedResponse<Tournament>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<Tournament>>(`/tournaments${queryString}`);
  }

  /**
   * Search tournaments by name or location
   */
  async search(params: TournamentSearchParams): Promise<Tournament[]> {
    const queryString = this._buildQueryString(params as unknown as Record<string, unknown>);
    return this._request<Tournament[]>(`/tournaments/search${queryString}`);
  }

  /**
   * Get recent tournaments
   */
  async recent(params: LimitParams = {}): Promise<Tournament[]> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<Tournament[]>(`/tournaments/recent${queryString}`);
  }

  /**
   * Get major tournaments
   */
  async majors(params: LimitParams = {}): Promise<Tournament[]> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<Tournament[]>(`/tournaments/majors${queryString}`);
  }

  /**
   * Get tournament by ID
   */
  async get(id: string): Promise<Tournament> {
    return this._request<Tournament>(`/tournaments/${id}`);
  }

  /**
   * Get tournament results (standings)
   */
  async getResults(id: string): Promise<TournamentResult[]> {
    return this._request<TournamentResult[]>(`/tournaments/${id}/results`);
  }

  /**
   * Get tournament statistics
   */
  async getStats(id: string): Promise<TournamentStats> {
    return this._request<TournamentStats>(`/tournaments/${id}/stats`);
  }

  /**
   * Create a new tournament
   */
  async create(data: CreateTournamentRequest): Promise<Tournament> {
    return this._request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a tournament
   */
  async update(id: string, data: UpdateTournamentRequest): Promise<Tournament> {
    return this._request<Tournament>(`/tournaments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a tournament
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }
}
