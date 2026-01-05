import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogPostsResource } from '../../src/resources/blog-posts.js';
import type { BlogPost, PaginatedResponse } from '../../src/types/index.js';

describe('BlogPostsResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let mockBuildQueryString: ReturnType<typeof vi.fn>;
  let resource: BlogPostsResource;

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
    resource = new BlogPostsResource(mockRequest, mockBuildQueryString);
  });

  const mockBlogPost: BlogPost = {
    id: 'post-1',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    content: '<p>Test content</p>',
    excerpt: 'Test excerpt',
    status: 'PUBLISHED',
    publishedAt: '2025-01-01T00:00:00Z',
    featuredImageUrl: null,
    featuredImageAlt: null,
    metaTitle: null,
    metaDescription: null,
    ogTitle: null,
    ogDescription: null,
    ogImageUrl: null,
    authorId: 'user-1',
    author: {
      id: 'user-1',
      email: 'test@example.com',
    },
    tags: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('list', () => {
    it('should list blog posts with pagination params', async () => {
      const response: PaginatedResponse<BlogPost> = {
        data: [mockBlogPost],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.list({ page: 1, limit: 20 });

      expect(result).toEqual(response);
      expect(mockBuildQueryString).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts?page=1&limit=20');
    });

    it('should list blog posts with sorting', async () => {
      const response: PaginatedResponse<BlogPost> = {
        data: [mockBlogPost],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list({ sortBy: 'publishedAt', sortOrder: 'desc' });

      expect(mockRequest).toHaveBeenCalledWith('/blog-posts?sortBy=publishedAt&sortOrder=desc');
    });

    it('should list blog posts with default params', async () => {
      const response: PaginatedResponse<BlogPost> = {
        data: [mockBlogPost],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.list();

      expect(mockBuildQueryString).toHaveBeenCalledWith({});
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts');
    });
  });

  describe('listAdmin', () => {
    it('should list all blog posts including drafts', async () => {
      const response: PaginatedResponse<BlogPost> = {
        data: [mockBlogPost],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.listAdmin({ status: 'DRAFT' });

      expect(result).toEqual(response);
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/admin?status=DRAFT');
    });

    it('should list admin posts with default params', async () => {
      const response: PaginatedResponse<BlogPost> = {
        data: [mockBlogPost],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockRequest.mockResolvedValue(response);

      await resource.listAdmin();

      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/admin');
    });
  });

  describe('search', () => {
    it('should search blog posts by query', async () => {
      mockRequest.mockResolvedValue([mockBlogPost]);

      const result = await resource.search({ q: 'Test' });

      expect(result).toEqual([mockBlogPost]);
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/search?q=Test');
    });

    it('should search with limit', async () => {
      mockRequest.mockResolvedValue([mockBlogPost]);

      await resource.search({ q: 'Test', limit: 5 });

      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/search?q=Test&limit=5');
    });
  });

  describe('get', () => {
    it('should get blog post by id', async () => {
      mockRequest.mockResolvedValue(mockBlogPost);

      const result = await resource.get('post-1');

      expect(result).toEqual(mockBlogPost);
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/post-1');
    });
  });

  describe('getAdmin', () => {
    it('should get any blog post by id including drafts', async () => {
      mockRequest.mockResolvedValue(mockBlogPost);

      const result = await resource.getAdmin('post-1');

      expect(result).toEqual(mockBlogPost);
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/admin/post-1');
    });
  });

  describe('getBySlug', () => {
    it('should get blog post by slug', async () => {
      mockRequest.mockResolvedValue(mockBlogPost);

      const result = await resource.getBySlug('test-blog-post');

      expect(result).toEqual(mockBlogPost);
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/slug/test-blog-post');
    });
  });

  describe('create', () => {
    it('should create blog post', async () => {
      const createData = {
        title: 'New Blog Post',
        slug: 'new-blog-post',
        content: '<p>New content</p>',
      };
      mockRequest.mockResolvedValue({ ...mockBlogPost, ...createData });

      const result = await resource.create(createData);

      expect(result.title).toBe('New Blog Post');
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
    });
  });

  describe('update', () => {
    it('should update blog post', async () => {
      const updateData = { title: 'Updated Blog Post' };
      mockRequest.mockResolvedValue({ ...mockBlogPost, title: 'Updated Blog Post' });

      const result = await resource.update('post-1', updateData);

      expect(result.title).toBe('Updated Blog Post');
      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/post-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    it('should delete blog post', async () => {
      mockRequest.mockResolvedValue(undefined);

      await resource.delete('post-1');

      expect(mockRequest).toHaveBeenCalledWith('/blog-posts/post-1', {
        method: 'DELETE',
      });
    });
  });
});
