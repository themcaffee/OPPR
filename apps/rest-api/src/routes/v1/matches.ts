import type { FastifyPluginAsync } from 'fastify';
import {
  createMatch,
  createManyMatches,
  findMatchById,
  findMatches,
  updateMatch,
  deleteMatch,
  countMatches,
  getMatchWithEntries,
} from '@opprs/db-prisma';
import {
  matchSchema,
  matchWithEntriesSchema,
  createMatchSchema,
  createManyMatchesSchema,
  updateMatchSchema,
  matchListQuerySchema,
} from '../../schemas/match.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface MatchListQuery {
  page?: number;
  limit?: number;
  tournamentId?: string;
  roundId?: string;
}

interface IdParams {
  id: string;
}

interface CreateMatchBody {
  tournamentId: string;
  roundId?: string;
  number?: number;
  machineName?: string;
}

interface UpdateMatchBody {
  roundId?: string | null;
  number?: number;
  machineName?: string;
}

const batchResponseSchema = {
  type: 'object',
  properties: {
    count: { type: 'integer' },
  },
  required: ['count'],
} as const;

export const matchRoutes: FastifyPluginAsync = async (app) => {
  // List matches with pagination
  app.get<{ Querystring: MatchListQuery }>(
    '/',
    {
      schema: {
        tags: ['Matches'],
        summary: 'List matches with pagination',
        security: [{ bearerAuth: [] }],
        querystring: matchListQuerySchema,
        response: {
          200: paginatedResponseSchema(matchSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { tournamentId, roundId } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where: Record<string, unknown> = {};
      if (tournamentId) where.tournamentId = tournamentId;
      if (roundId) where.roundId = roundId;

      const [matches, total] = await Promise.all([
        findMatches({
          take,
          skip,
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy: { number: 'asc' },
          include: { round: true },
        }),
        countMatches(Object.keys(where).length > 0 ? where : undefined),
      ]);

      return reply.send(buildPaginatedResponse(matches, page, limit, total));
    }
  );

  // Get match by ID with entries
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Matches'],
        summary: 'Get match by ID with entries',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: matchWithEntriesSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const match = await getMatchWithEntries(request.params.id);
      if (!match) {
        throw new NotFoundError('Match', request.params.id);
      }
      return reply.send(match);
    }
  );

  // Create match
  app.post<{ Body: CreateMatchBody }>(
    '/',
    {
      schema: {
        tags: ['Matches'],
        summary: 'Create a new match (admin only)',
        security: [{ bearerAuth: [] }],
        body: createMatchSchema,
        response: {
          201: matchSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const match = await createMatch(request.body);
      return reply.status(201).send(match);
    }
  );

  // Batch create matches
  app.post<{ Body: CreateMatchBody[] }>(
    '/batch',
    {
      schema: {
        tags: ['Matches'],
        summary: 'Create multiple matches at once (admin only)',
        security: [{ bearerAuth: [] }],
        body: createManyMatchesSchema,
        response: {
          201: batchResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const result = await createManyMatches(request.body);
      return reply.status(201).send({ count: result.count });
    }
  );

  // Update match
  app.patch<{ Params: IdParams; Body: UpdateMatchBody }>(
    '/:id',
    {
      schema: {
        tags: ['Matches'],
        summary: 'Update a match (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateMatchSchema,
        response: {
          200: matchSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findMatchById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Match', request.params.id);
      }
      const match = await updateMatch(request.params.id, request.body);
      return reply.send(match);
    }
  );

  // Delete match
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Matches'],
        summary: 'Delete a match (admin only)',
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
      const existing = await findMatchById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Match', request.params.id);
      }
      await deleteMatch(request.params.id);
      return reply.status(204).send();
    }
  );
};
