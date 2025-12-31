import type { FastifyPluginAsync } from 'fastify';
import {
  createResult,
  createManyResults,
  findResultById,
  findResults,
  updateResult,
  deleteResult,
  countResults,
  recalculateTimeDecay,
} from '@opprs/db-prisma';
import {
  resultSchema,
  resultWithRelationsSchema,
  createResultSchema,
  createManyResultsSchema,
  updateResultSchema,
  resultListQuerySchema,
  batchResultResponseSchema,
  recalculateDecayResponseSchema,
} from '../../schemas/result.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface ResultListQuery {
  page?: number;
  limit?: number;
  playerId?: string;
  tournamentId?: string;
  sortBy?: 'position' | 'totalPoints' | 'decayedPoints' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface IdParams {
  id: string;
}

interface CreateResultBody {
  playerId: string;
  tournamentId: string;
  position: number;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

interface UpdateResultBody {
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

export const resultRoutes: FastifyPluginAsync = async (app) => {
  // List results with pagination
  app.get<{ Querystring: ResultListQuery }>(
    '/',
    {
      schema: {
        tags: ['Results'],
        summary: 'List results with pagination',
        security: [{ bearerAuth: [] }],
        querystring: resultListQuerySchema,
        response: {
          200: paginatedResponseSchema(resultWithRelationsSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { playerId, tournamentId, sortBy, sortOrder } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where: Record<string, unknown> = {};
      if (playerId) where.playerId = playerId;
      if (tournamentId) where.tournamentId = tournamentId;

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : { position: 'asc' as const };

      const [results, total] = await Promise.all([
        findResults({
          take,
          skip,
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy,
          include: { player: true, tournament: true },
        }),
        countResults(Object.keys(where).length > 0 ? where : undefined),
      ]);

      return reply.send(buildPaginatedResponse(results, page, limit, total));
    }
  );

  // Get result by ID
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Results'],
        summary: 'Get result by ID',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: resultWithRelationsSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const result = await findResultById(request.params.id, {
        player: true,
        tournament: true,
      });
      if (!result) {
        throw new NotFoundError('Result', request.params.id);
      }
      return reply.send(result);
    }
  );

  // Create result
  app.post<{ Body: CreateResultBody }>(
    '/',
    {
      schema: {
        tags: ['Results'],
        summary: 'Create a new result',
        security: [{ bearerAuth: [] }],
        body: createResultSchema,
        response: {
          201: resultSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const result = await createResult(request.body);
      return reply.status(201).send(result);
    }
  );

  // Batch create results
  app.post<{ Body: CreateResultBody[] }>(
    '/batch',
    {
      schema: {
        tags: ['Results'],
        summary: 'Create multiple results at once',
        security: [{ bearerAuth: [] }],
        body: createManyResultsSchema,
        response: {
          201: batchResultResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const result = await createManyResults(request.body);
      return reply.status(201).send({ count: result.count });
    }
  );

  // Update result
  app.patch<{ Params: IdParams; Body: UpdateResultBody }>(
    '/:id',
    {
      schema: {
        tags: ['Results'],
        summary: 'Update a result',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateResultSchema,
        response: {
          200: resultSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const existing = await findResultById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Result', request.params.id);
      }
      const result = await updateResult(request.params.id, request.body);
      return reply.send(result);
    }
  );

  // Delete result
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Results'],
        summary: 'Delete a result',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          204: { type: 'null' },
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const existing = await findResultById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Result', request.params.id);
      }
      await deleteResult(request.params.id);
      return reply.status(204).send();
    }
  );

  // Recalculate time decay for all results
  app.post(
    '/recalculate-decay',
    {
      schema: {
        tags: ['Results'],
        summary: 'Recalculate time decay for all results',
        security: [{ bearerAuth: [] }],
        response: {
          200: recalculateDecayResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (_request, reply) => {
      const updatedResults = await recalculateTimeDecay();
      return reply.send({
        count: updatedResults.length,
        message: `Successfully recalculated decay for ${updatedResults.length} results`,
      });
    }
  );
};
