import type { FastifyPluginAsync } from 'fastify';
import {
  createPlayer,
  findPlayerById,
  findPlayers,
  updatePlayer,
  deletePlayer,
  countPlayers,
  searchPlayers,
  getPlayerWithResults,
  getTopPlayersByRating,
  getTopPlayersByRanking,
  getPlayerStats,
} from '@opprs/db-prisma';
import {
  playerSchema,
  createPlayerSchema,
  updatePlayerSchema,
  playerListQuerySchema,
  playerSearchQuerySchema,
  topPlayersQuerySchema,
  playerStatsSchema,
  playerResultSchema,
} from '../../schemas/player.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface PlayerListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'ranking' | 'name' | 'eventCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  isRated?: boolean;
}

interface PlayerSearchQuery {
  q: string;
  limit?: number;
}

interface TopPlayersQuery {
  limit?: number;
}

interface IdParams {
  id: string;
}

export const playerRoutes: FastifyPluginAsync = async (app) => {
  // List players with pagination
  app.get<{ Querystring: PlayerListQuery }>(
    '/',
    {
      schema: {
        tags: ['Players'],
        summary: 'List players with pagination',
        security: [{ bearerAuth: [] }],
        querystring: playerListQuerySchema,
        response: {
          200: paginatedResponseSchema(playerSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { sortBy, sortOrder, isRated } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const where = isRated !== undefined ? { isRated } : undefined;
      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : undefined;

      const [players, total] = await Promise.all([
        findPlayers({ take, skip, where, orderBy }),
        countPlayers(where),
      ]);

      return reply.send(buildPaginatedResponse(players, page, limit, total));
    }
  );

  // Search players
  app.get<{ Querystring: PlayerSearchQuery }>(
    '/search',
    {
      schema: {
        tags: ['Players'],
        summary: 'Search players by name or email',
        security: [{ bearerAuth: [] }],
        querystring: playerSearchQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      const players = await searchPlayers(q, limit);
      return reply.send(players);
    }
  );

  // Top players by rating
  app.get<{ Querystring: TopPlayersQuery }>(
    '/top/rating',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get top players by rating',
        security: [{ bearerAuth: [] }],
        querystring: topPlayersQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { limit = 50 } = request.query;
      const players = await getTopPlayersByRating(limit);
      return reply.send(players);
    }
  );

  // Top players by ranking
  app.get<{ Querystring: TopPlayersQuery }>(
    '/top/ranking',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get top players by ranking',
        security: [{ bearerAuth: [] }],
        querystring: topPlayersQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { limit = 50 } = request.query;
      const players = await getTopPlayersByRanking(limit);
      return reply.send(players);
    }
  );

  // Get player by ID
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get player by ID',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: playerSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const player = await findPlayerById(request.params.id);
      if (!player) {
        throw new NotFoundError('Player', request.params.id);
      }
      return reply.send(player);
    }
  );

  // Get player results
  app.get<{ Params: IdParams }>(
    '/:id/results',
    {
      schema: {
        tags: ['Players'],
        summary: "Get player's tournament results",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: { type: 'array', items: playerResultSchema },
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const playerWithResults = await getPlayerWithResults(request.params.id);
      if (!playerWithResults) {
        throw new NotFoundError('Player', request.params.id);
      }
      return reply.send(playerWithResults.results);
    }
  );

  // Get player stats
  app.get<{ Params: IdParams }>(
    '/:id/stats',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get player statistics',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: playerStatsSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const player = await findPlayerById(request.params.id);
      if (!player) {
        throw new NotFoundError('Player', request.params.id);
      }

      const stats = await getPlayerStats(request.params.id);
      if (!stats) {
        return reply.send({
          totalEvents: 0,
          totalPoints: 0,
          totalDecayedPoints: 0,
          averagePoints: 0,
          averagePosition: 0,
          averageFinish: 0,
          averageEfficiency: 0,
          firstPlaceFinishes: 0,
          topThreeFinishes: 0,
          bestFinish: 0,
          highestPoints: 0,
        });
      }
      return reply.send(stats);
    }
  );

  // Create player
  app.post<{ Body: Record<string, unknown> }>(
    '/',
    {
      schema: {
        tags: ['Players'],
        summary: 'Create a new player (admin only)',
        security: [{ bearerAuth: [] }],
        body: createPlayerSchema,
        response: {
          201: playerSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const player = await createPlayer(request.body);
      return reply.status(201).send(player);
    }
  );

  // Update player
  app.patch<{ Params: IdParams; Body: Record<string, unknown> }>(
    '/:id',
    {
      schema: {
        tags: ['Players'],
        summary: 'Update a player (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updatePlayerSchema,
        response: {
          200: playerSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findPlayerById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Player', request.params.id);
      }
      const player = await updatePlayer(request.params.id, request.body);
      return reply.send(player);
    }
  );

  // Delete player
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Players'],
        summary: 'Delete a player (admin only)',
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
      const existing = await findPlayerById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Player', request.params.id);
      }
      await deletePlayer(request.params.id);
      return reply.status(204).send();
    }
  );
};
