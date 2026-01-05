import type {
  BlogTag,
  BlogTagWithCount,
  CreateBlogTagRequest,
  UpdateBlogTagRequest,
  BlogTagListParams,
  BlogTagSearchParams,
  PaginatedResponse,
} from '../types/index.js';

type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;

/**
 * Blog Tags resource methods
 */
export class BlogTagsResource {
  constructor(
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn
  ) {}

  /**
   * List blog tags with pagination
   */
  async list(params: BlogTagListParams = {}): Promise<PaginatedResponse<BlogTag>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<BlogTag>>(`/blog-tags${queryString}`);
  }

  /**
   * List all blog tags with post counts
   */
  async listWithCounts(): Promise<BlogTagWithCount[]> {
    return this._request<BlogTagWithCount[]>('/blog-tags/with-counts');
  }

  /**
   * Search blog tags by name
   */
  async search(params: BlogTagSearchParams): Promise<BlogTag[]> {
    const queryString = this._buildQueryString(params as unknown as Record<string, unknown>);
    return this._request<BlogTag[]>(`/blog-tags/search${queryString}`);
  }

  /**
   * Get blog tag by ID
   */
  async get(id: string): Promise<BlogTag> {
    return this._request<BlogTag>(`/blog-tags/${id}`);
  }

  /**
   * Get blog tag by slug
   */
  async getBySlug(slug: string): Promise<BlogTag> {
    return this._request<BlogTag>(`/blog-tags/slug/${slug}`);
  }

  /**
   * Create a new blog tag (admin only)
   */
  async create(data: CreateBlogTagRequest): Promise<BlogTag> {
    return this._request<BlogTag>('/blog-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a blog tag (admin only)
   */
  async update(id: string, data: UpdateBlogTagRequest): Promise<BlogTag> {
    return this._request<BlogTag>(`/blog-tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a blog tag (admin only)
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/blog-tags/${id}`, {
      method: 'DELETE',
    });
  }
}
