import type {
  Standing,
  StandingWithRelations,
  CreateStandingRequest,
  UpdateStandingRequest,
  StandingListParams,
  BatchCreateStandingsResponse,
  RecalculateDecayResponse,
  PaginatedResponse,
} from '../types/index.js';

type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;

/**
 * Standings resource methods
 * Note: Uses /standings endpoint on the API
 */
export class StandingsResource {
  constructor(
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn
  ) {}

  /**
   * List standings with pagination
   */
  async list(params: StandingListParams = {}): Promise<PaginatedResponse<StandingWithRelations>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<StandingWithRelations>>(`/standings${queryString}`);
  }

  /**
   * Get standing by ID
   */
  async get(id: string): Promise<StandingWithRelations> {
    return this._request<StandingWithRelations>(`/standings/${id}`);
  }

  /**
   * Create a new standing
   */
  async create(data: CreateStandingRequest): Promise<Standing> {
    return this._request<Standing>('/standings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Create multiple standings at once
   */
  async createBatch(data: CreateStandingRequest[]): Promise<BatchCreateStandingsResponse> {
    return this._request<BatchCreateStandingsResponse>('/standings/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a standing
   */
  async update(id: string, data: UpdateStandingRequest): Promise<Standing> {
    return this._request<Standing>(`/standings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a standing
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/standings/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Recalculate time decay for all standings
   */
  async recalculateDecay(): Promise<RecalculateDecayResponse> {
    return this._request<RecalculateDecayResponse>('/standings/recalculate-decay', {
      method: 'POST',
    });
  }
}
