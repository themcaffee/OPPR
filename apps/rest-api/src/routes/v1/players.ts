import type { FastifyPluginAsync } from 'fastify';
import {
  createPlayer,
  findPlayerById,
  findPlayers,
  updatePlayer,
  deletePlayer,
  countPlayers,
  getPlayerWithResults,
  getTopPlayersByOpprRating,
  getTopPlayersByOpprRanking,
  getPlayerStats,
  createOpprPlayerRanking,
  findOpprPlayerRankingByPlayerId,
  updateOpprPlayerRanking,
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
  sortBy?: 'name' | 'eventCount' | 'createdAt' | 'rating' | 'ranking';
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

// Fields that belong to OpprPlayerRanking, not Player
const RANKING_FIELDS = ['rating', 'ratingDeviation', 'ranking', 'isRated'] as const;

// Helper to split request body into player and ranking data
function splitPlayerAndRankingData(body: Record<string, unknown>) {
  const rankingData: Record<string, unknown> = {};
  const playerData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (RANKING_FIELDS.includes(key as (typeof RANKING_FIELDS)[number])) {
      rankingData[key] = value;
    } else {
      playerData[key] = value;
    }
  }

  return { playerData, rankingData };
}

// Helper to merge player with their OPPR ranking data for response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPlayerWithRanking(playerId: string): Promise<any> {
  const player = await findPlayerById(playerId, { opprRanking: true });
  if (!player) return null;

  return mergePlayerWithRanking(player);
}

// Helper to merge player object with ranking data (for player already fetched with opprRanking included)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergePlayerWithRanking(player: any): any {
  const ranking = player.opprRanking;
  // Remove opprRanking from response and flatten the fields
  const { opprRanking: _, ...playerData } = player;

  return {
    ...playerData,
    rating: ranking?.rating ?? 1500,
    ratingDeviation: ranking?.ratingDeviation ?? 200,
    ranking: ranking?.ranking ?? null,
    isRated: ranking?.isRated ?? false,
    lastRatingUpdate: ranking?.lastRatingUpdate ?? null,
  };
}

export const playerRoutes: FastifyPluginAsync = async (app) => {
  // List players with pagination (public)
  app.get<{ Querystring: PlayerListQuery }>(
    '/',
    {
      schema: {
        tags: ['Players'],
        summary: 'List players with pagination',
        querystring: playerListQuerySchema,
        response: {
          200: paginatedResponseSchema(playerSchema),
        },
      },
    },
    async (request, reply) => {
      const { sortBy, sortOrder, isRated } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      // Build orderBy - rating/ranking fields are on the opprRanking relation
      let orderBy;
      if (sortBy) {
        if (sortBy === 'rating' || sortBy === 'ranking') {
          orderBy = { opprRanking: { [sortBy]: sortOrder ?? 'asc' } };
        } else {
          orderBy = { [sortBy]: sortOrder ?? 'asc' };
        }
      }

      // Build where clause - filter by isRated through the opprRanking relation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any =
        isRated !== undefined ? { opprRanking: { isRated } } : undefined;

      const [players, total] = await Promise.all([
        findPlayers({ take, skip, orderBy, where, include: { opprRanking: true } }),
        countPlayers(where),
      ]);

      // Merge ranking data into player responses
      const playersWithRanking = players.map(mergePlayerWithRanking);

      return reply.send(buildPaginatedResponse(playersWithRanking, page, limit, total));
    }
  );

  // Search players (public)
  app.get<{ Querystring: PlayerSearchQuery }>(
    '/search',
    {
      schema: {
        tags: ['Players'],
        summary: 'Search players by name',
        querystring: playerSearchQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
        },
      },
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      const players = await findPlayers({
        take: limit,
        where: { name: { contains: q, mode: 'insensitive' } },
        include: { opprRanking: true },
      });
      const playersWithRanking = players.map(mergePlayerWithRanking);
      return reply.send(playersWithRanking);
    }
  );

  // Top players by rating (public)
  app.get<{ Querystring: TopPlayersQuery }>(
    '/top/rating',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get top players by rating',
        querystring: topPlayersQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
        },
      },
    },
    async (request, reply) => {
      const { limit = 50 } = request.query;
      const rankings = await getTopPlayersByOpprRating(limit);
      // Return player data with ranking info embedded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const players = rankings.map((r: any) => ({
        ...r.player,
        rating: r.rating,
        ratingDeviation: r.ratingDeviation,
        ranking: r.ranking,
        isRated: r.isRated,
      }));
      return reply.send(players);
    }
  );

  // Top players by ranking (public)
  app.get<{ Querystring: TopPlayersQuery }>(
    '/top/ranking',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get top players by ranking',
        querystring: topPlayersQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
        },
      },
    },
    async (request, reply) => {
      const { limit = 50 } = request.query;
      const rankings = await getTopPlayersByOpprRanking(limit);
      // Return player data with ranking info embedded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const players = rankings.map((r: any) => ({
        ...r.player,
        rating: r.rating,
        ratingDeviation: r.ratingDeviation,
        ranking: r.ranking,
        isRated: r.isRated,
      }));
      return reply.send(players);
    }
  );

  // Get player by ID (public)
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get player by ID',
        params: idParamSchema,
        response: {
          200: playerSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const playerWithRanking = await getPlayerWithRanking(request.params.id);
      if (!playerWithRanking) {
        throw new NotFoundError('Player', request.params.id);
      }
      return reply.send(playerWithRanking);
    }
  );

  // Get player results (public)
  app.get<{ Params: IdParams }>(
    '/:id/results',
    {
      schema: {
        tags: ['Players'],
        summary: "Get player's tournament results",
        params: idParamSchema,
        response: {
          200: { type: 'array', items: playerResultSchema },
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const playerWithResults = await getPlayerWithResults(request.params.id);
      if (!playerWithResults) {
        throw new NotFoundError('Player', request.params.id);
      }
      return reply.send(playerWithResults.results);
    }
  );

  // Get player stats (public)
  app.get<{ Params: IdParams }>(
    '/:id/stats',
    {
      schema: {
        tags: ['Players'],
        summary: 'Get player statistics',
        params: idParamSchema,
        response: {
          200: playerStatsSchema,
          404: errorResponseSchema,
        },
      },
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
      // Split request body into player fields and ranking fields
      const { playerData, rankingData } = splitPlayerAndRankingData(request.body);

      // Create the player first
      const player = await createPlayer(playerData);

      // If ranking data was provided, create the OpprPlayerRanking record
      if (Object.keys(rankingData).length > 0) {
        await createOpprPlayerRanking({
          playerId: player.id,
          rating: rankingData.rating as number | undefined,
          ratingDeviation: rankingData.ratingDeviation as number | undefined,
          ranking: rankingData.ranking as number | undefined,
          isRated: rankingData.isRated as boolean | undefined,
        });
      }

      // Return player with ranking data merged
      const playerWithRanking = await getPlayerWithRanking(player.id);
      return reply.status(201).send(playerWithRanking);
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

      // Split request body into player fields and ranking fields
      const { playerData, rankingData } = splitPlayerAndRankingData(request.body);

      // Update player data if any player fields were provided
      if (Object.keys(playerData).length > 0) {
        await updatePlayer(request.params.id, playerData);
      }

      // Update ranking data if any ranking fields were provided
      if (Object.keys(rankingData).length > 0) {
        // Check if ranking exists, create if not
        const existingRanking = await findOpprPlayerRankingByPlayerId(request.params.id);
        if (existingRanking) {
          await updateOpprPlayerRanking(request.params.id, {
            rating: rankingData.rating as number | undefined,
            ratingDeviation: rankingData.ratingDeviation as number | undefined,
            ranking: rankingData.ranking as number | undefined,
            isRated: rankingData.isRated as boolean | undefined,
          });
        } else {
          await createOpprPlayerRanking({
            playerId: request.params.id,
            rating: rankingData.rating as number | undefined,
            ratingDeviation: rankingData.ratingDeviation as number | undefined,
            ranking: rankingData.ranking as number | undefined,
            isRated: rankingData.isRated as boolean | undefined,
          });
        }
      }

      // Return player with ranking data merged
      const playerWithRanking = await getPlayerWithRanking(request.params.id);
      return reply.send(playerWithRanking);
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
