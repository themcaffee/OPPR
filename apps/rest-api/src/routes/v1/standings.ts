import type { FastifyPluginAsync } from 'fastify';
import {
  createStanding,
  createManyStandings,
  findStandingById,
  findStandings,
  updateStanding,
  deleteStanding,
  countStandings,
  recalculateTimeDecay,
} from '@opprs/db-prisma';
import {
  standingSchema,
  standingWithRelationsSchema,
  createStandingSchema,
  createManyStandingsSchema,
  updateStandingSchema,
  standingListQuerySchema,
  batchStandingResponseSchema,
  recalculateDecayResponseSchema,
} from '../../schemas/standing.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface StandingListQuery {
  page?: number;
  limit?: number;
  playerId?: string;
  tournamentId?: string;
  isFinals?: boolean;
  sortBy?: 'position' | 'totalPoints' | 'decayedPoints' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface IdParams {
  id: string;
}

interface CreateStandingBody {
  playerId: string;
  tournamentId: string;
  position: number;
  isFinals?: boolean;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

interface UpdateStandingBody {
  position?: number;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

export const standingRoutes: FastifyPluginAsync = async (app) => {
  // List standings with pagination
  app.get<{ Querystring: StandingListQuery }>(
    '/',
    {
      schema: {
        tags: ['Standings'],
        summary: 'List standings with pagination',
        security: [{ bearerAuth: [] }],
        querystring: standingListQuerySchema,
        response: {
          200: paginatedResponseSchema(standingWithRelationsSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { playerId, tournamentId, isFinals, sortBy, sortOrder } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where: Record<string, unknown> = {};
      if (playerId) where.playerId = playerId;
      if (tournamentId) where.tournamentId = tournamentId;
      if (isFinals !== undefined) where.isFinals = isFinals;

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : { position: 'asc' as const };

      const [standings, total] = await Promise.all([
        findStandings({
          take,
          skip,
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy,
          include: { player: true, tournament: true },
        }),
        countStandings(Object.keys(where).length > 0 ? where : undefined),
      ]);

      return reply.send(buildPaginatedResponse(standings, page, limit, total));
    }
  );

  // Get standing by ID
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Standings'],
        summary: 'Get standing by ID',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: standingWithRelationsSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const standing = await findStandingById(request.params.id, {
        player: true,
        tournament: true,
      });
      if (!standing) {
        throw new NotFoundError('Standing', request.params.id);
      }
      return reply.send(standing);
    }
  );

  // Create standing
  app.post<{ Body: CreateStandingBody }>(
    '/',
    {
      schema: {
        tags: ['Standings'],
        summary: 'Create a new standing (admin only)',
        security: [{ bearerAuth: [] }],
        body: createStandingSchema,
        response: {
          201: standingSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const standing = await createStanding(request.body);
      return reply.status(201).send(standing);
    }
  );

  // Batch create standings
  app.post<{ Body: CreateStandingBody[] }>(
    '/batch',
    {
      schema: {
        tags: ['Standings'],
        summary: 'Create multiple standings at once (admin only)',
        security: [{ bearerAuth: [] }],
        body: createManyStandingsSchema,
        response: {
          201: batchStandingResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const result = await createManyStandings(request.body);
      return reply.status(201).send({ count: result.count });
    }
  );

  // Update standing
  app.patch<{ Params: IdParams; Body: UpdateStandingBody }>(
    '/:id',
    {
      schema: {
        tags: ['Standings'],
        summary: 'Update a standing (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateStandingSchema,
        response: {
          200: standingSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findStandingById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Standing', request.params.id);
      }
      const standing = await updateStanding(request.params.id, request.body);
      return reply.send(standing);
    }
  );

  // Delete standing
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Standings'],
        summary: 'Delete a standing (admin only)',
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
      const existing = await findStandingById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Standing', request.params.id);
      }
      await deleteStanding(request.params.id);
      return reply.status(204).send();
    }
  );

  // Recalculate time decay for all standings
  app.post(
    '/recalculate-decay',
    {
      schema: {
        tags: ['Standings'],
        summary: 'Recalculate time decay for all standings (admin only)',
        security: [{ bearerAuth: [] }],
        response: {
          200: recalculateDecayResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (_request, reply) => {
      const updatedStandings = await recalculateTimeDecay();
      return reply.send({
        count: updatedStandings.length,
        message: `Successfully recalculated decay for ${updatedStandings.length} standings`,
      });
    }
  );
};
