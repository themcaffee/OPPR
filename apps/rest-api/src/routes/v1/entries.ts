import type { FastifyPluginAsync } from 'fastify';
import type { MatchResult } from '@opprs/db-prisma';
import {
  createEntry,
  createManyEntries,
  findEntryById,
  findEntries,
  updateEntry,
  deleteEntry,
  countEntries,
} from '@opprs/db-prisma';
import {
  entrySchema,
  entryWithRelationsSchema,
  createEntrySchema,
  createManyEntriesSchema,
  updateEntrySchema,
  entryListQuerySchema,
} from '../../schemas/entry.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface EntryListQuery {
  page?: number;
  limit?: number;
  matchId?: string;
  playerId?: string;
}

interface IdParams {
  id: string;
}

interface CreateEntryBody {
  matchId: string;
  playerId: string;
  result: MatchResult;
  position?: number;
}

interface UpdateEntryBody {
  result?: MatchResult;
  position?: number;
}

const batchResponseSchema = {
  type: 'object',
  properties: {
    count: { type: 'integer' },
  },
  required: ['count'],
} as const;

export const entryRoutes: FastifyPluginAsync = async (app) => {
  // List entries with pagination
  app.get<{ Querystring: EntryListQuery }>(
    '/',
    {
      schema: {
        tags: ['Entries'],
        summary: 'List entries with pagination',
        security: [{ bearerAuth: [] }],
        querystring: entryListQuerySchema,
        response: {
          200: paginatedResponseSchema(entryWithRelationsSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { matchId, playerId } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where: Record<string, unknown> = {};
      if (matchId) where.matchId = matchId;
      if (playerId) where.playerId = playerId;

      const [entries, total] = await Promise.all([
        findEntries({
          take,
          skip,
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy: { position: 'asc' },
          include: { player: true, match: true },
        }),
        countEntries(Object.keys(where).length > 0 ? where : undefined),
      ]);

      return reply.send(buildPaginatedResponse(entries, page, limit, total));
    }
  );

  // Get entry by ID
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Entries'],
        summary: 'Get entry by ID',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: entryWithRelationsSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const entry = await findEntryById(request.params.id, {
        player: true,
        match: true,
      });
      if (!entry) {
        throw new NotFoundError('Entry', request.params.id);
      }
      return reply.send(entry);
    }
  );

  // Create entry
  app.post<{ Body: CreateEntryBody }>(
    '/',
    {
      schema: {
        tags: ['Entries'],
        summary: 'Create a new entry (admin only)',
        security: [{ bearerAuth: [] }],
        body: createEntrySchema,
        response: {
          201: entrySchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const entry = await createEntry(request.body);
      return reply.status(201).send(entry);
    }
  );

  // Batch create entries
  app.post<{ Body: CreateEntryBody[] }>(
    '/batch',
    {
      schema: {
        tags: ['Entries'],
        summary: 'Create multiple entries at once (admin only)',
        security: [{ bearerAuth: [] }],
        body: createManyEntriesSchema,
        response: {
          201: batchResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const result = await createManyEntries(request.body);
      return reply.status(201).send({ count: result.count });
    }
  );

  // Update entry
  app.patch<{ Params: IdParams; Body: UpdateEntryBody }>(
    '/:id',
    {
      schema: {
        tags: ['Entries'],
        summary: 'Update an entry (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateEntrySchema,
        response: {
          200: entrySchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findEntryById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Entry', request.params.id);
      }
      const entry = await updateEntry(request.params.id, request.body);
      return reply.send(entry);
    }
  );

  // Delete entry
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Entries'],
        summary: 'Delete an entry (admin only)',
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
      const existing = await findEntryById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Entry', request.params.id);
      }
      await deleteEntry(request.params.id);
      return reply.status(204).send();
    }
  );
};
