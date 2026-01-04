import type { FastifyPluginAsync } from 'fastify';
import type { EventBoosterType, Prisma } from '@opprs/db-prisma';
import {
  createTournament,
  findTournamentById,
  findTournaments,
  updateTournament,
  deleteTournament,
  countTournaments,
  searchTournaments,
  getRecentTournaments,
  getMajorTournaments,
  getTournamentWithResults,
  getTournamentStats,
} from '@opprs/db-prisma';
import {
  tournamentSchema,
  createTournamentSchema,
  updateTournamentSchema,
  tournamentListQuerySchema,
  tournamentSearchQuerySchema,
  recentTournamentsQuerySchema,
  tournamentStatsSchema,
  tournamentResultSchema,
} from '../../schemas/tournament.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface TournamentListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'name' | 'firstPlaceValue' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  eventBooster?: EventBoosterType;
}

interface TournamentSearchQuery {
  q: string;
  limit?: number;
}

interface RecentTournamentsQuery {
  limit?: number;
}

interface IdParams {
  id: string;
}

interface CreateTournamentBody {
  name: string;
  date: string;
  externalId?: string;
  description?: string;
  locationId?: string;
  organizerId?: string;
  tgpConfig?: Prisma.InputJsonValue;
  eventBooster?: EventBoosterType;
  allowsOptOut?: boolean;
  baseValue?: number;
  tvaRating?: number;
  tvaRanking?: number;
  totalTVA?: number;
  tgp?: number;
  eventBoosterMultiplier?: number;
  firstPlaceValue?: number;
}

interface UpdateTournamentBody {
  name?: string;
  date?: string;
  description?: string | null;
  locationId?: string | null;
  organizerId?: string | null;
  tgpConfig?: Prisma.InputJsonValue;
  eventBooster?: EventBoosterType;
  allowsOptOut?: boolean;
  baseValue?: number;
  tvaRating?: number;
  tvaRanking?: number;
  totalTVA?: number;
  tgp?: number;
  eventBoosterMultiplier?: number;
  firstPlaceValue?: number;
}

export const tournamentRoutes: FastifyPluginAsync = async (app) => {
  // List tournaments with pagination (public)
  app.get<{ Querystring: TournamentListQuery }>(
    '/',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'List tournaments with pagination',
        querystring: tournamentListQuerySchema,
        response: {
          200: paginatedResponseSchema(tournamentSchema),
        },
      },
    },
    async (request, reply) => {
      const { sortBy, sortOrder, eventBooster } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where = eventBooster ? { eventBooster } : undefined;
      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'desc' } : { date: 'desc' as const };

      const [tournaments, total] = await Promise.all([
        findTournaments({
          take,
          skip,
          where,
          orderBy,
          include: { location: true, organizer: { select: { id: true, name: true } } },
        }),
        countTournaments(where),
      ]);

      return reply.send(buildPaginatedResponse(tournaments, page, limit, total));
    }
  );

  // Search tournaments (public)
  app.get<{ Querystring: TournamentSearchQuery }>(
    '/search',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Search tournaments by name or location',
        querystring: tournamentSearchQuerySchema,
        response: {
          200: { type: 'array', items: tournamentSchema },
        },
      },
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      const tournaments = await searchTournaments(q, limit);
      return reply.send(tournaments);
    }
  );

  // Recent tournaments (public)
  app.get<{ Querystring: RecentTournamentsQuery }>(
    '/recent',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Get recent tournaments',
        querystring: recentTournamentsQuerySchema,
        response: {
          200: { type: 'array', items: tournamentSchema },
        },
      },
    },
    async (request, reply) => {
      const { limit = 20 } = request.query;
      const tournaments = await getRecentTournaments(limit);
      return reply.send(tournaments);
    }
  );

  // Major tournaments (public)
  app.get<{ Querystring: RecentTournamentsQuery }>(
    '/majors',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Get major tournaments',
        querystring: recentTournamentsQuerySchema,
        response: {
          200: { type: 'array', items: tournamentSchema },
        },
      },
    },
    async (request, reply) => {
      const { limit } = request.query;
      const tournaments = await getMajorTournaments(limit);
      return reply.send(tournaments);
    }
  );

  // Get tournament by ID (public)
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Get tournament by ID',
        params: idParamSchema,
        response: {
          200: tournamentSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const tournament = await findTournamentById(request.params.id, {
        location: true,
        organizer: { select: { id: true, name: true } },
      });
      if (!tournament) {
        throw new NotFoundError('Tournament', request.params.id);
      }
      return reply.send(tournament);
    }
  );

  // Get tournament results (public)
  app.get<{ Params: IdParams }>(
    '/:id/results',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Get tournament results (standings)',
        params: idParamSchema,
        response: {
          200: { type: 'array', items: tournamentResultSchema },
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const tournament = await getTournamentWithResults(request.params.id);
      if (!tournament) {
        throw new NotFoundError('Tournament', request.params.id);
      }
      return reply.send(tournament.results);
    }
  );

  // Get tournament stats (public)
  app.get<{ Params: IdParams }>(
    '/:id/stats',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Get tournament statistics',
        params: idParamSchema,
        response: {
          200: tournamentStatsSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const stats = await getTournamentStats(request.params.id);
      if (!stats) {
        throw new NotFoundError('Tournament', request.params.id);
      }
      return reply.send(stats);
    }
  );

  // Create tournament
  app.post<{ Body: CreateTournamentBody }>(
    '/',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Create a new tournament (admin only)',
        security: [{ bearerAuth: [] }],
        body: createTournamentSchema,
        response: {
          201: tournamentSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const { date, ...rest } = request.body;
      const tournament = await createTournament({
        ...rest,
        date: new Date(date),
      });
      return reply.status(201).send(tournament);
    }
  );

  // Update tournament
  app.patch<{ Params: IdParams; Body: UpdateTournamentBody }>(
    '/:id',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Update a tournament (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateTournamentSchema,
        response: {
          200: tournamentSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findTournamentById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Tournament', request.params.id);
      }
      const { date, ...rest } = request.body;
      const tournament = await updateTournament(request.params.id, {
        ...rest,
        ...(date && { date: new Date(date) }),
      });
      return reply.send(tournament);
    }
  );

  // Delete tournament
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Tournaments'],
        summary: 'Delete a tournament (admin only)',
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
      const existing = await findTournamentById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Tournament', request.params.id);
      }
      await deleteTournament(request.params.id);
      return reply.status(204).send();
    }
  );
};
