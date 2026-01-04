import type { FastifyPluginAsync } from 'fastify';
import {
  createRound,
  createManyRounds,
  findRoundById,
  findRounds,
  updateRound,
  deleteRound,
  countRounds,
  getRoundWithMatches,
} from '@opprs/db-prisma';
import {
  roundSchema,
  roundWithMatchesSchema,
  createRoundSchema,
  createManyRoundsSchema,
  updateRoundSchema,
  roundListQuerySchema,
} from '../../schemas/round.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface RoundListQuery {
  page?: number;
  limit?: number;
  tournamentId?: string;
  isFinals?: boolean;
}

interface IdParams {
  id: string;
}

interface CreateRoundBody {
  tournamentId: string;
  number: number;
  name?: string;
  isFinals?: boolean;
}

interface UpdateRoundBody {
  number?: number;
  name?: string;
  isFinals?: boolean;
}

const batchResponseSchema = {
  type: 'object',
  properties: {
    count: { type: 'integer' },
  },
  required: ['count'],
} as const;

export const roundRoutes: FastifyPluginAsync = async (app) => {
  // List rounds with pagination
  app.get<{ Querystring: RoundListQuery }>(
    '/',
    {
      schema: {
        tags: ['Rounds'],
        summary: 'List rounds with pagination',
        security: [{ bearerAuth: [] }],
        querystring: roundListQuerySchema,
        response: {
          200: paginatedResponseSchema(roundSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { tournamentId, isFinals } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where: Record<string, unknown> = {};
      if (tournamentId) where.tournamentId = tournamentId;
      if (isFinals !== undefined) where.isFinals = isFinals;

      const [rounds, total] = await Promise.all([
        findRounds({
          take,
          skip,
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy: [{ isFinals: 'asc' }, { number: 'asc' }],
        }),
        countRounds(Object.keys(where).length > 0 ? where : undefined),
      ]);

      return reply.send(buildPaginatedResponse(rounds, page, limit, total));
    }
  );

  // Get round by ID with matches
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Rounds'],
        summary: 'Get round by ID with matches',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: roundWithMatchesSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const round = await getRoundWithMatches(request.params.id);
      if (!round) {
        throw new NotFoundError('Round', request.params.id);
      }
      return reply.send(round);
    }
  );

  // Create round
  app.post<{ Body: CreateRoundBody }>(
    '/',
    {
      schema: {
        tags: ['Rounds'],
        summary: 'Create a new round (admin only)',
        security: [{ bearerAuth: [] }],
        body: createRoundSchema,
        response: {
          201: roundSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const round = await createRound(request.body);
      return reply.status(201).send(round);
    }
  );

  // Batch create rounds
  app.post<{ Body: CreateRoundBody[] }>(
    '/batch',
    {
      schema: {
        tags: ['Rounds'],
        summary: 'Create multiple rounds at once (admin only)',
        security: [{ bearerAuth: [] }],
        body: createManyRoundsSchema,
        response: {
          201: batchResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const result = await createManyRounds(request.body);
      return reply.status(201).send({ count: result.count });
    }
  );

  // Update round
  app.patch<{ Params: IdParams; Body: UpdateRoundBody }>(
    '/:id',
    {
      schema: {
        tags: ['Rounds'],
        summary: 'Update a round (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateRoundSchema,
        response: {
          200: roundSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findRoundById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Round', request.params.id);
      }
      const round = await updateRound(request.params.id, request.body);
      return reply.send(round);
    }
  );

  // Delete round
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Rounds'],
        summary: 'Delete a round (admin only)',
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
      const existing = await findRoundById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Round', request.params.id);
      }
      await deleteRound(request.params.id);
      return reply.status(204).send();
    }
  );
};
