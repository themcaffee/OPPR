import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationsResource } from '../../src/resources/locations.js';
import type { Location, PaginatedResponse } from '../../src/types/index.js';

describe('LocationsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: LocationsResource;

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
    resource = new LocationsResource(mockRequest, mockBuildQueryString);
  });

  const mockLocation: Location = {
    id: 'loc-1',
    externalId: null,
    name: 'Test Location',
    address: '123 Main St',
    city: 'Portland',
    state: 'OR',
    country: 'USA',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should list locations with pagination params', async () => {
      const response: PaginatedResponse<Location> = {
        data: [mockLocation],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.list({ page: 1, limit: 20 });

      expect(result).toEqual(response);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(mockRequest).toHaveBeenCalledWith('/locations?page=1&limit=20');
    });

    it('should list locations with sorting', async () => {
      const response: PaginatedResponse<Location> = {
        data: [mockLocation],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockRequest).toHaveBeenCalledWith('/locations?sortBy=name&sortOrder=asc');
    });
  });

  describe('search', () => {
    it('should search locations by query', async () => {
      mockRequest.mockResolvedValue([mockLocation]);

      const result = await resource.search({ q: 'Portland' });

      expect(result).toEqual([mockLocation]);
      expect(mockRequest).toHaveBeenCalledWith('/locations/search?q=Portland');
    });

    it('should search with limit', async () => {
      mockRequest.mockResolvedValue([mockLocation]);

      await resource.search({ q: 'Portland', limit: 5 });

      expect(mockRequest).toHaveBeenCalledWith('/locations/search?q=Portland&limit=5');
    });
  });

  describe('get', () => {
    it('should get location by id', async () => {
      mockRequest.mockResolvedValue(mockLocation);

      const result = await resource.get('loc-1');

      expect(result).toEqual(mockLocation);
      expect(mockRequest).toHaveBeenCalledWith('/locations/loc-1');
    });
  });

  describe('create', () => {
    it('should create location', async () => {
      const createData = {
        name: 'New Location',
        city: 'Seattle',
        state: 'WA',
      };
      mockRequest.mockResolvedValue({ ...mockLocation, ...createData });

      const result = await resource.create(createData);

      expect(result.name).toBe('New Location');
      expect(mockRequest).toHaveBeenCalledWith('/locations', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
    });
  });

  describe('update', () => {
    it('should update location', async () => {
      const updateData = { name: 'Updated Location' };
      mockRequest.mockResolvedValue({ ...mockLocation, name: 'Updated Location' });

      const result = await resource.update('loc-1', updateData);

      expect(result.name).toBe('Updated Location');
      expect(mockRequest).toHaveBeenCalledWith('/locations/loc-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    it('should delete location', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('loc-1');

      expect(mockRequest).toHaveBeenCalledWith('/locations/loc-1', {
        method: 'DELETE',
      });
    });
  });
});
