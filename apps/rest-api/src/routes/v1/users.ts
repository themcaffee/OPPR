import type { FastifyPluginAsync } from 'fastify';
import {
  findUserById,
  findUsers,
  updateUser,
  deleteUser,
  countUsers,
  getUserWithPlayer,
} from '@opprs/db-prisma';
import { userSchema, userListQuerySchema, updateUserRoleSchema } from '../../schemas/user.js';
import { idParamSchema, errorResponseSchema, paginatedResponseSchema } from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

interface UserListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface IdParams {
  id: string;
}

interface UpdateUserRoleBody {
  role: 'USER' | 'ADMIN';
}

export const userRoutes: FastifyPluginAsync = async (app) => {
  // List users with pagination (admin only)
  app.get<{ Querystring: UserListQuery }>(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'List users with pagination (admin only)',
        security: [{ bearerAuth: [] }],
        querystring: userListQuerySchema,
        response: {
          200: paginatedResponseSchema(userSchema),
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const { sortBy, sortOrder } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'desc' } : { createdAt: 'desc' as const };

      const [users, total] = await Promise.all([
        findUsers({ take, skip, orderBy }),
        countUsers(),
      ]);

      return reply.send(buildPaginatedResponse(users, page, limit, total));
    }
  );

  // Get user by ID (admin only)
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get user by ID (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: userSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const user = await getUserWithPlayer(request.params.id);
      if (!user) {
        throw new NotFoundError('User', request.params.id);
      }
      return reply.send(user);
    }
  );

  // Update user role (admin only)
  app.patch<{ Params: IdParams; Body: UpdateUserRoleBody }>(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update user role (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateUserRoleSchema,
        response: {
          200: userSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      // Prevent admin from demoting themselves
      if (request.params.id === request.user.sub && request.body.role === 'USER') {
        throw new ForbiddenError('Cannot demote your own admin role');
      }

      const existing = await findUserById(request.params.id);
      if (!existing) {
        throw new NotFoundError('User', request.params.id);
      }

      await updateUser(request.params.id, { role: request.body.role });
      const user = await getUserWithPlayer(request.params.id);
      return reply.send(user);
    }
  );

  // Delete user (admin only)
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete a user (admin only)',
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
      // Prevent admin from deleting themselves
      if (request.params.id === request.user.sub) {
        throw new ForbiddenError('Cannot delete your own account');
      }

      const existing = await findUserById(request.params.id);
      if (!existing) {
        throw new NotFoundError('User', request.params.id);
      }

      await deleteUser(request.params.id);
      return reply.status(204).send();
    }
  );
};
