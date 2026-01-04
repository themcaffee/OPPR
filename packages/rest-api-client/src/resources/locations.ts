import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationListParams,
  LocationSearchParams,
  PaginatedResponse,
} from '../types/index.js';

type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;

/**
 * Locations resource methods
 */
export class LocationsResource {
  constructor(
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn
  ) {}

  /**
   * List locations with pagination
   */
  async list(params: LocationListParams = {}): Promise<PaginatedResponse<Location>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<Location>>(`/locations${queryString}`);
  }

  /**
   * Search locations by name or city
   */
  async search(params: LocationSearchParams): Promise<Location[]> {
    const queryString = this._buildQueryString(params as unknown as Record<string, unknown>);
    return this._request<Location[]>(`/locations/search${queryString}`);
  }

  /**
   * Get location by ID
   */
  async get(id: string): Promise<Location> {
    return this._request<Location>(`/locations/${id}`);
  }

  /**
   * Create a new location
   */
  async create(data: CreateLocationRequest): Promise<Location> {
    return this._request<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a location
   */
  async update(id: string, data: UpdateLocationRequest): Promise<Location> {
    return this._request<Location>(`/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a location
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }
}
