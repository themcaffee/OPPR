import type { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcrypt';
import {
  findUserById,
  findUserByPlayerId,
  findUsers,
  updateUser,
  deleteUser,
  countUsers,
  getUserWithPlayer,
  findPlayerById,
} from '@opprs/db-prisma';
import { userSchema, userListQuerySchema, updateUserSchema } from '../../schemas/user.js';
import { idParamSchema, errorResponseSchema, paginatedResponseSchema } from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';

const BCRYPT_SALT_ROUNDS = 12;

interface UserListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface IdParams {
  id: string;
}

interface UpdateUserBody {
  role?: 'USER' | 'ADMIN';
  playerId?: string | null;
  password?: string;
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

  // Update user (admin only)
  app.patch<{ Params: IdParams; Body: UpdateUserBody }>(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update user (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateUserSchema,
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
      const { role, playerId, password } = request.body;

      // Prevent admin from demoting themselves
      if (request.params.id === request.user.sub && role === 'USER') {
        throw new ForbiddenError('Cannot demote your own admin role');
      }

      const existing = await findUserById(request.params.id);
      if (!existing) {
        throw new NotFoundError('User', request.params.id);
      }

      // Validate playerId if provided and not null
      if (playerId) {
        const player = await findPlayerById(playerId);
        if (!player) {
          throw new NotFoundError('Player', playerId);
        }

        // Check if player is already linked to another user
        const existingLink = await findUserByPlayerId(playerId);
        if (existingLink && existingLink.id !== request.params.id) {
          throw new BadRequestError('Player is already linked to another user');
        }
      }

      // Build update data
      const updateData: { role?: 'USER' | 'ADMIN'; playerId?: string | null; passwordHash?: string } =
        {};
      if (role !== undefined) updateData.role = role;
      if (playerId !== undefined) updateData.playerId = playerId;
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      }

      await updateUser(request.params.id, updateData);
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
