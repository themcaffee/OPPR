import type {
  UserWithPlayer,
  UserListParams,
  UpdateUserRoleRequest,
  PaginatedResponse,
} from '../types/index.js';

type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;

/**
 * Users resource methods (admin only)
 */
export class UsersResource {
  constructor(
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn
  ) {}

  /**
   * List users with pagination (admin only)
   */
  async list(params: UserListParams = {}): Promise<PaginatedResponse<UserWithPlayer>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<UserWithPlayer>>(`/users${queryString}`);
  }

  /**
   * Get user by ID (admin only)
   */
  async get(id: string): Promise<UserWithPlayer> {
    return this._request<UserWithPlayer>(`/users/${id}`);
  }

  /**
   * Update user role (admin only)
   */
  async updateRole(id: string, data: UpdateUserRoleRequest): Promise<UserWithPlayer> {
    return this._request<UserWithPlayer>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a user (admin only)
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}
