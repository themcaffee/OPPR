import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogTagsResource } from '../../src/resources/blog-tags.js';
import type { BlogTag, BlogTagWithCount, PaginatedResponse } from '../../src/types/index.js';

describe('BlogTagsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: BlogTagsResource;

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
    resource = new BlogTagsResource(mockRequest, mockBuildQueryString);
  });

  const mockBlogTag: BlogTag = {
    id: 'tag-1',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech related posts',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockBlogTagWithCount: BlogTagWithCount = {
    ...mockBlogTag,
    _count: {
      posts: 5,
    },
  };

  describe('list', () => {
    it('should list blog tags with pagination params', async () => {
      const response: PaginatedResponse<BlogTag> = {
        data: [mockBlogTag],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.list({ page: 1, limit: 20 });

      expect(result).toEqual(response);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags?page=1&limit=20');
    });

    it('should list blog tags with sorting', async () => {
      const response: PaginatedResponse<BlogTag> = {
        data: [mockBlogTag],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockRequest).toHaveBeenCalledWith('/blog-tags?sortBy=name&sortOrder=asc');
    });

    it('should list blog tags with default params', async () => {
      const response: PaginatedResponse<BlogTag> = {
        data: [mockBlogTag],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list();

      expect(mockBuildQueryString).toHaveBeenCalledWith({});
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags');
    });
  });

  describe('listWithCounts', () => {
    it('should list blog tags with post counts', async () => {
      mockRequest.mockResolvedValue([mockBlogTagWithCount]);

      const result = await resource.listWithCounts();

      expect(result).toEqual([mockBlogTagWithCount]);
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/with-counts');
    });
  });

  describe('search', () => {
    it('should search blog tags by query', async () => {
      mockRequest.mockResolvedValue([mockBlogTag]);

      const result = await resource.search({ q: 'Tech' });

      expect(result).toEqual([mockBlogTag]);
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/search?q=Tech');
    });

    it('should search with limit', async () => {
      mockRequest.mockResolvedValue([mockBlogTag]);

      await resource.search({ q: 'Tech', limit: 5 });

      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/search?q=Tech&limit=5');
    });
  });

  describe('get', () => {
    it('should get blog tag by id', async () => {
      mockRequest.mockResolvedValue(mockBlogTag);

      const result = await resource.get('tag-1');

      expect(result).toEqual(mockBlogTag);
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/tag-1');
    });
  });

  describe('getBySlug', () => {
    it('should get blog tag by slug', async () => {
      mockRequest.mockResolvedValue(mockBlogTag);

      const result = await resource.getBySlug('technology');

      expect(result).toEqual(mockBlogTag);
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/slug/technology');
    });
  });

  describe('create', () => {
    it('should create blog tag', async () => {
      const createData = {
        name: 'New Tag',
        slug: 'new-tag',
        description: 'A new tag',
      };
      mockRequest.mockResolvedValue({ ...mockBlogTag, ...createData });

      const result = await resource.create(createData);

      expect(result.name).toBe('New Tag');
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
    });
  });

  describe('update', () => {
    it('should update blog tag', async () => {
      const updateData = { name: 'Updated Tag' };
      mockRequest.mockResolvedValue({ ...mockBlogTag, name: 'Updated Tag' });

      const result = await resource.update('tag-1', updateData);

      expect(result.name).toBe('Updated Tag');
      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/tag-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    it('should delete blog tag', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('tag-1');

      expect(mockRequest).toHaveBeenCalledWith('/blog-tags/tag-1', {
        method: 'DELETE',
      });
    });
  });
});
