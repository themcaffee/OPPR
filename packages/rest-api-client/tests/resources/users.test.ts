import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersResource } from '../../src/resources/users.js';
import type { UserWithPlayer, PaginatedResponse } from '../../src/types/index.js';

describe('UsersResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: UsersResource;

  beforeEach(() => {
    mockRequest = vi.fn();
    mockBuildQueryString = vi.fn((params) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      return queryString ? `?${queryString}` : '';
    });
    resource = new UsersResource(mockRequest, mockBuildQueryString);
  });

  const mockUser: UserWithPlayer = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'USER',
    playerId: null,
    player: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should list users with pagination params', async () => {
      const response: PaginatedResponse<UserWithPlayer> = {
        data: [mockUser],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.list({ page: 1, limit: 20 });

      expect(result).toEqual(response);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(mockRequest).toHaveBeenCalledWith('/users?page=1&limit=20');
    });

    it('should list users with default params', async () => {
      const response: PaginatedResponse<UserWithPlayer> = {
        data: [mockUser],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list();

      expect(mockRequest).toHaveBeenCalledWith('/users');
    });
  });

  describe('get', () => {
    it('should get user by id', async () => {
      mockRequest.mockResolvedValue(mockUser);

      const result = await resource.get('user-1');

      expect(result).toEqual(mockUser);
      expect(mockRequest).toHaveBeenCalledWith('/users/user-1');
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const updatedUser = { ...mockUser, role: 'ADMIN' as const };
      mockRequest.mockResolvedValue(updatedUser);

      const result = await resource.updateRole('user-1', { role: 'ADMIN' });

      expect(result.role).toBe('ADMIN');
      expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'ADMIN' }),
      });
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updatedUser = { ...mockUser, role: 'ADMIN' as const };
      mockRequest.mockResolvedValue(updatedUser);

      const result = await resource.update('user-1', { role: 'ADMIN' });

      expect(result.role).toBe('ADMIN');
      expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'ADMIN' }),
      });
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('user-1');

      expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
        method: 'DELETE',
      });
    });
  });

  describe('linkPlayer', () => {
    it('should link player to user', async () => {
      const linkedUser = { ...mockUser, playerId: 'player-1' };
      mockRequest.mockResolvedValue(linkedUser);

      const result = await resource.linkPlayer('user-1', 'player-1');

      expect(result.playerId).toBe('player-1');
      expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({ playerId: 'player-1' }),
      });
    });
  });

  describe('unlinkPlayer', () => {
    it('should unlink player from user', async () => {
      mockRequest.mockResolvedValue(mockUser);

      const result = await resource.unlinkPlayer('user-1');

      expect(result.playerId).toBeNull();
      expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({ playerId: null }),
      });
    });
  });
});
