import type { FastifyPluginAsync } from 'fastify';
import {
  createBlogPost,
  findBlogPostById,
  findBlogPostBySlug,
  findBlogPosts,
  findPublishedBlogPosts,
  searchBlogPosts,
  updateBlogPost,
  deleteBlogPost,
  countBlogPosts,
  countPublishedBlogPosts,
} from '@opprs/db-prisma';
import {
  blogPostSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
  blogPostListQuerySchema,
  adminBlogPostListQuerySchema,
  blogPostSearchQuerySchema,
} from '../../schemas/blog.js';
import { idParamSchema, errorResponseSchema, paginatedResponseSchema } from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

type PostStatus = 'DRAFT' | 'PUBLISHED';

interface BlogPostListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  tagSlug?: string;
}

interface AdminBlogPostListQuery extends BlogPostListQuery {
  status?: PostStatus;
}

interface BlogPostSearchQuery {
  q: string;
  limit?: number;
}

interface IdParams {
  id: string;
}

interface SlugParams {
  slug: string;
}

interface CreateBlogPostBody {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  tagIds?: string[];
}

interface UpdateBlogPostBody {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  status?: PostStatus;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  tagIds?: string[];
}

export const blogPostRoutes: FastifyPluginAsync = async (app) => {
  // List published posts with pagination (public)
  app.get<{ Querystring: BlogPostListQuery }>(
    '/',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'List published blog posts with pagination',
        querystring: blogPostListQuerySchema,
        response: {
          200: paginatedResponseSchema(blogPostSchema),
        },
      },
    },
    async (request, reply) => {
      const { sortBy, sortOrder, tagSlug } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'desc' } : { publishedAt: 'desc' as const };

      const [posts, total] = await Promise.all([
        findPublishedBlogPosts({ take, skip, orderBy, tagSlug }),
        countPublishedBlogPosts(tagSlug),
      ]);

      return reply.send(buildPaginatedResponse(posts, page, limit, total));
    }
  );

  // Search published posts (public)
  app.get<{ Querystring: BlogPostSearchQuery }>(
    '/search',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Search published blog posts by title or excerpt',
        querystring: blogPostSearchQuerySchema,
        response: {
          200: { type: 'array', items: blogPostSchema },
        },
      },
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      const posts = await searchBlogPosts(q, limit, true);
      return reply.send(posts);
    }
  );

  // Get published post by slug (public)
  app.get<{ Params: SlugParams }>(
    '/slug/:slug',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Get published blog post by slug',
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { type: 'string' },
          },
        },
        response: {
          200: blogPostSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const post = await findBlogPostBySlug(request.params.slug);
      if (!post) {
        throw new NotFoundError('Blog post', request.params.slug);
      }
      // Only return published posts for public access
      if (post.status !== 'PUBLISHED' || !post.publishedAt) {
        throw new NotFoundError('Blog post', request.params.slug);
      }
      return reply.send(post);
    }
  );

  // Get post by ID (public - published only)
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Get blog post by ID (published only for public access)',
        params: idParamSchema,
        response: {
          200: blogPostSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const post = await findBlogPostById(request.params.id);
      if (!post) {
        throw new NotFoundError('Blog post', request.params.id);
      }
      // Only return published posts for public access
      if (post.status !== 'PUBLISHED' || !post.publishedAt) {
        throw new NotFoundError('Blog post', request.params.id);
      }
      return reply.send(post);
    }
  );

  // List all posts including drafts (admin only)
  app.get<{ Querystring: AdminBlogPostListQuery }>(
    '/admin',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'List all blog posts including drafts (admin only)',
        security: [{ bearerAuth: [] }],
        querystring: adminBlogPostListQuerySchema,
        response: {
          200: paginatedResponseSchema(blogPostSchema),
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const { sortBy, sortOrder, status, tagSlug } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'desc' } : { createdAt: 'desc' as const };
      const where = {
        ...(status && { status }),
        ...(tagSlug && {
          tags: {
            some: { slug: tagSlug },
          },
        }),
      };

      const [posts, total] = await Promise.all([
        findBlogPosts({ take, skip, orderBy, where }),
        countBlogPosts(where),
      ]);

      return reply.send(buildPaginatedResponse(posts, page, limit, total));
    }
  );

  // Get any post by ID (admin only - includes drafts)
  app.get<{ Params: IdParams }>(
    '/admin/:id',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Get any blog post by ID including drafts (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: blogPostSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const post = await findBlogPostById(request.params.id);
      if (!post) {
        throw new NotFoundError('Blog post', request.params.id);
      }
      return reply.send(post);
    }
  );

  // Create post (admin only)
  app.post<{ Body: CreateBlogPostBody }>(
    '/',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Create a new blog post (admin only)',
        security: [{ bearerAuth: [] }],
        body: createBlogPostSchema,
        response: {
          201: blogPostSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      // Check if slug already exists
      const existing = await findBlogPostBySlug(request.body.slug);
      if (existing) {
        throw new ConflictError('Blog post with this slug already exists');
      }

      // Set publishedAt when status is PUBLISHED
      const publishedAt =
        request.body.status === 'PUBLISHED' ? new Date() : undefined;

      const post = await createBlogPost({
        ...request.body,
        authorId: request.user.sub,
        publishedAt,
      });

      return reply.status(201).send(post);
    }
  );

  // Update post (admin only)
  app.patch<{ Params: IdParams; Body: UpdateBlogPostBody }>(
    '/:id',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Update a blog post (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateBlogPostSchema,
        response: {
          200: blogPostSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findBlogPostById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Blog post', request.params.id);
      }

      // Check if new slug conflicts with another post
      if (request.body.slug && request.body.slug !== existing.slug) {
        const slugConflict = await findBlogPostBySlug(request.body.slug);
        if (slugConflict) {
          throw new ConflictError('Blog post with this slug already exists');
        }
      }

      // Set publishedAt when publishing for the first time
      let publishedAt = request.body.status === 'PUBLISHED' && !existing.publishedAt
        ? new Date()
        : undefined;

      // Clear publishedAt when unpublishing
      if (request.body.status === 'DRAFT' && existing.status === 'PUBLISHED') {
        publishedAt = null as unknown as undefined;
      }

      const updateData = {
        ...request.body,
        ...(publishedAt !== undefined && { publishedAt }),
      };

      const post = await updateBlogPost(request.params.id, updateData);
      return reply.send(post);
    }
  );

  // Delete post (admin only)
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Blog Posts'],
        summary: 'Delete a blog post (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          204: { type: 'null' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findBlogPostById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Blog post', request.params.id);
      }
      await deleteBlogPost(request.params.id);
      return reply.status(204).send();
    }
  );
};
