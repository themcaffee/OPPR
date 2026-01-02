import { describe, it, expect } from 'vitest';
import {
  parsePaginationParams,
  buildPaginationMeta,
  buildPaginatedResponse,
} from '../../src/utils/pagination.js';

describe('Pagination utilities', () => {
  describe('parsePaginationParams', () => {
    it('should use default values when no params provided', () => {
      const result = parsePaginationParams({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });

    it('should parse valid page and limit', () => {
      const result = parsePaginationParams({ page: 3, limit: 50 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
      expect(result.skip).toBe(100);
      expect(result.take).toBe(50);
    });

    it('should enforce minimum page of 1', () => {
      const result = parsePaginationParams({ page: 0 });
      expect(result.page).toBe(1);

      const result2 = parsePaginationParams({ page: -5 });
      expect(result2.page).toBe(1);
    });

    it('should enforce minimum limit of 1', () => {
      const result = parsePaginationParams({ limit: 0 });
      expect(result.limit).toBe(1);

      const result2 = parsePaginationParams({ limit: -10 });
      expect(result2.limit).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = parsePaginationParams({ limit: 500 });
      expect(result.limit).toBe(100);
    });
  });

  describe('buildPaginationMeta', () => {
    it('should build correct pagination metadata', () => {
      const meta = buildPaginationMeta(2, 10, 45);
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(10);
      expect(meta.total).toBe(45);
      expect(meta.totalPages).toBe(5);
    });

    it('should handle zero total', () => {
      const meta = buildPaginationMeta(1, 10, 0);
      expect(meta.totalPages).toBe(0);
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build paginated response with data and metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = buildPaginatedResponse(data, 1, 10, 2);

      expect(response.data).toEqual(data);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(10);
      expect(response.pagination.total).toBe(2);
      expect(response.pagination.totalPages).toBe(1);
    });
  });
});
