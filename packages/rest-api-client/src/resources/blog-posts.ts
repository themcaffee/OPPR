import type {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostListParams,
  AdminBlogPostListParams,
  BlogPostSearchParams,
  PaginatedResponse,
} from '../types/index.js';

type RequestFn = <T>(p: string, o?: RequestInit, r?: boolean) => Promise<T>;
type BuildQueryFn = (p: Record<string, unknown>) => string;

/**
 * Blog Posts resource methods
 */
export class BlogPostsResource {
  constructor(
    private readonly _request: RequestFn,
    private readonly _buildQueryString: BuildQueryFn
  ) {}

  /**
   * List published blog posts with pagination (public)
   */
  async list(params: BlogPostListParams = {}): Promise<PaginatedResponse<BlogPost>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<BlogPost>>(`/blog-posts${queryString}`);
  }

  /**
   * List all blog posts including drafts (admin only)
   */
  async listAdmin(params: AdminBlogPostListParams = {}): Promise<PaginatedResponse<BlogPost>> {
    const queryString = this._buildQueryString(params as Record<string, unknown>);
    return this._request<PaginatedResponse<BlogPost>>(`/blog-posts/admin${queryString}`);
  }

  /**
   * Search published blog posts by title or excerpt
   */
  async search(params: BlogPostSearchParams): Promise<BlogPost[]> {
    const queryString = this._buildQueryString(params as unknown as Record<string, unknown>);
    return this._request<BlogPost[]>(`/blog-posts/search${queryString}`);
  }

  /**
   * Get published blog post by ID (public)
   */
  async get(id: string): Promise<BlogPost> {
    return this._request<BlogPost>(`/blog-posts/${id}`);
  }

  /**
   * Get any blog post by ID including drafts (admin only)
   */
  async getAdmin(id: string): Promise<BlogPost> {
    return this._request<BlogPost>(`/blog-posts/admin/${id}`);
  }

  /**
   * Get published blog post by slug (public)
   */
  async getBySlug(slug: string): Promise<BlogPost> {
    return this._request<BlogPost>(`/blog-posts/slug/${slug}`);
  }

  /**
   * Create a new blog post (admin only)
   */
  async create(data: CreateBlogPostRequest): Promise<BlogPost> {
    return this._request<BlogPost>('/blog-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a blog post (admin only)
   */
  async update(id: string, data: UpdateBlogPostRequest): Promise<BlogPost> {
    return this._request<BlogPost>(`/blog-posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a blog post (admin only)
   */
  async delete(id: string): Promise<void> {
    await this._request<void>(`/blog-posts/${id}`, {
      method: 'DELETE',
    });
  }
}
