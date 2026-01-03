import type {
  UserWithPlayer,
  UserListParams,
  UpdateUserRoleRequest,
  UpdateUserRequest,
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
   * @deprecated Use update() instead
   */
  async updateRole(id: string, data: UpdateUserRoleRequest): Promise<UserWithPlayer> {
    return this._request<UserWithPlayer>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update user (admin only)
   * Can update role, player link, and password
   */
  async update(id: string, data: UpdateUserRequest): Promise<UserWithPlayer> {
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

  /**
   * Update user (role and/or player link) (admin only)
   */
  async update(id: string, data: UpdateUserRequest): Promise<UserWithPlayer> {
    return this._request<UserWithPlayer>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Link a player to a user (admin only)
   * If the player is already linked to another user, it will be unlinked first.
   */
  async linkPlayer(id: string, playerId: string): Promise<UserWithPlayer> {
    return this.update(id, { playerId });
  }

  /**
   * Unlink the player from a user (admin only)
   */
  async unlinkPlayer(id: string): Promise<UserWithPlayer> {
    return this.update(id, { playerId: null });
  }
}
