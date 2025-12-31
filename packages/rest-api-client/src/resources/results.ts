import type {
  Result,
  ResultWithRelations,
  CreateResultRequest,
  UpdateResultRequest,
  ResultListParams,
  BatchCreateResultsResponse,
  RecalculateDecayResponse,
  PaginatedResponse,
} from '../types/index.js';

 
type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;
 

/**
 * Results resource methods
 */
export class ResultsResource {
  constructor(
     
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn,
    ) {
     }

  /**
   * List results with pagination
   */
  async list(params: ResultListParams = {}): Promise<PaginatedResponse<ResultWithRelations>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<ResultWithRelations>>(`/results${queryString}`);
  }

  /**
   * Get result by ID
   */
  async get(id: string): Promise<ResultWithRelations> {
    return this._request<ResultWithRelations>(`/results/${id}`);
  }

  /**
   * Create a new result
   */
  async create(data: CreateResultRequest): Promise<Result> {
    return this._request<Result>('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Create multiple results at once
   */
  async createBatch(data: CreateResultRequest[]): Promise<BatchCreateResultsResponse> {
    return this._request<BatchCreateResultsResponse>('/results/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a result
   */
  async update(id: string, data: UpdateResultRequest): Promise<Result> {
    return this._request<Result>(`/results/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a result
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/results/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Recalculate time decay for all results
   */
  async recalculateDecay(): Promise<RecalculateDecayResponse> {
    return this._request<RecalculateDecayResponse>('/results/recalculate-decay', {
      method: 'POST',
    });
  }
}
