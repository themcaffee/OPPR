import type { FastifyPluginAsync } from 'fastify';
import {
  createBlogTag,
  findBlogTagById,
  findBlogTagBySlug,
  findBlogTags,
  searchBlogTags,
  updateBlogTag,
  deleteBlogTag,
  countBlogTags,
  getBlogTagsWithPostCounts,
} from '@opprs/db-prisma';
import {
  blogTagSchema,
  createBlogTagSchema,
  updateBlogTagSchema,
  blogTagListQuerySchema,
  blogTagSearchQuerySchema,
} from '../../schemas/blog.js';
import { idParamSchema, errorResponseSchema, paginatedResponseSchema } from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

interface BlogTagListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface BlogTagSearchQuery {
  q: string;
  limit?: number;
}

interface IdParams {
  id: string;
}

interface SlugParams {
  slug: string;
}

interface CreateBlogTagBody {
  name: string;
  slug: string;
  description?: string;
}

interface UpdateBlogTagBody {
  name?: string;
  slug?: string;
  description?: string | null;
}

const blogTagWithCountSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    _count: {
      type: 'object',
      properties: {
        posts: { type: 'integer' },
      },
    },
  },
} as const;

export const blogTagRoutes: FastifyPluginAsync = async (app) => {
  // List tags with pagination (public)
  app.get<{ Querystring: BlogTagListQuery }>(
    '/',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'List blog tags with pagination',
        querystring: blogTagListQuerySchema,
        response: {
          200: paginatedResponseSchema(blogTagSchema),
        },
      },
    },
    async (request, reply) => {
      const { sortBy, sortOrder } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : { name: 'asc' as const };

      const [tags, total] = await Promise.all([
        findBlogTags({ take, skip, orderBy }),
        countBlogTags(),
      ]);

      return reply.send(buildPaginatedResponse(tags, page, limit, total));
    }
  );

  // List all tags with post counts (public, useful for tag cloud)
  app.get(
    '/with-counts',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'List all blog tags with post counts',
        response: {
          200: { type: 'array', items: blogTagWithCountSchema },
        },
      },
    },
    async (_request, reply) => {
      const tags = await getBlogTagsWithPostCounts();
      return reply.send(tags);
    }
  );

  // Search tags (public)
  app.get<{ Querystring: BlogTagSearchQuery }>(
    '/search',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'Search blog tags by name',
        querystring: blogTagSearchQuerySchema,
        response: {
          200: { type: 'array', items: blogTagSchema },
        },
      },
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      const tags = await searchBlogTags(q, limit);
      return reply.send(tags);
    }
  );

  // Get tag by slug (public)
  app.get<{ Params: SlugParams }>(
    '/slug/:slug',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'Get blog tag by slug',
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { type: 'string' },
          },
        },
        response: {
          200: blogTagSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const tag = await findBlogTagBySlug(request.params.slug);
      if (!tag) {
        throw new NotFoundError('Blog tag', request.params.slug);
      }
      return reply.send(tag);
    }
  );

  // Get tag by ID (public)
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'Get blog tag by ID',
        params: idParamSchema,
        response: {
          200: blogTagSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const tag = await findBlogTagById(request.params.id);
      if (!tag) {
        throw new NotFoundError('Blog tag', request.params.id);
      }
      return reply.send(tag);
    }
  );

  // Create tag (admin only)
  app.post<{ Body: CreateBlogTagBody }>(
    '/',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'Create a new blog tag (admin only)',
        security: [{ bearerAuth: [] }],
        body: createBlogTagSchema,
        response: {
          201: blogTagSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      // Check if slug already exists
      const existingSlug = await findBlogTagBySlug(request.body.slug);
      if (existingSlug) {
        throw new ConflictError('Blog tag with this slug already exists');
      }

      // Check if name already exists
      const existingName = await findBlogTags({
        where: { name: request.body.name },
        take: 1,
      });
      if (existingName.length > 0) {
        throw new ConflictError('Blog tag with this name already exists');
      }

      const tag = await createBlogTag(request.body);
      return reply.status(201).send(tag);
    }
  );

  // Update tag (admin only)
  app.patch<{ Params: IdParams; Body: UpdateBlogTagBody }>(
    '/:id',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'Update a blog tag (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateBlogTagSchema,
        response: {
          200: blogTagSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findBlogTagById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Blog tag', request.params.id);
      }

      // Check if new slug conflicts with another tag
      if (request.body.slug && request.body.slug !== existing.slug) {
        const slugConflict = await findBlogTagBySlug(request.body.slug);
        if (slugConflict) {
          throw new ConflictError('Blog tag with this slug already exists');
        }
      }

      // Check if new name conflicts with another tag
      if (request.body.name && request.body.name !== existing.name) {
        const nameConflict = await findBlogTags({
          where: { name: request.body.name },
          take: 1,
        });
        if (nameConflict.length > 0) {
          throw new ConflictError('Blog tag with this name already exists');
        }
      }

      const tag = await updateBlogTag(request.params.id, request.body);
      return reply.send(tag);
    }
  );

  // Delete tag (admin only)
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Blog Tags'],
        summary: 'Delete a blog tag (admin only)',
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
      const existing = await findBlogTagById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Blog tag', request.params.id);
      }
      await deleteBlogTag(request.params.id);
      return reply.status(204).send();
    }
  );
};
