import type { FastifyPluginAsync } from 'fastify';
import {
  countPlayers,
  countTournaments,
  countStandings,
  getTopPlayersByOpprRanking,
  getTopPlayersByOpprRating,
  countOpprPlayerRankings,
} from '@opprs/db-prisma';
import { playerSchema } from '../../schemas/player.js';

const overviewResponseSchema = {
  type: 'object',
  properties: {
    players: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        rated: { type: 'integer' },
      },
    },
    tournaments: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
      },
    },
    results: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
      },
    },
  },
} as const;

const leaderboardQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    type: { type: 'string', enum: ['ranking', 'rating'], default: 'ranking' },
  },
} as const;

interface LeaderboardQuery {
  limit?: number;
  type?: 'ranking' | 'rating';
}

export const statsRoutes: FastifyPluginAsync = async (app) => {
  // System overview stats (public)
  app.get(
    '/overview',
    {
      schema: {
        tags: ['Stats'],
        summary: 'Get system-wide statistics',
        response: {
          200: overviewResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const [totalPlayers, ratedPlayers, totalTournaments, totalStandings] = await Promise.all([
        countPlayers(),
        countOpprPlayerRankings({ isRated: true }),
        countTournaments(),
        countStandings(),
      ]);

      return reply.send({
        players: {
          total: totalPlayers,
          rated: ratedPlayers,
        },
        tournaments: {
          total: totalTournaments,
        },
        results: {
          total: totalStandings,
        },
      });
    }
  );

  // Leaderboard (public)
  app.get<{ Querystring: LeaderboardQuery }>(
    '/leaderboard',
    {
      schema: {
        tags: ['Stats'],
        summary: 'Get player leaderboard',
        querystring: leaderboardQuerySchema,
        response: {
          200: { type: 'array', items: playerSchema },
        },
      },
    },
    async (request, reply) => {
      const { limit = 50, type = 'ranking' } = request.query;

      const rankings =
        type === 'rating'
          ? await getTopPlayersByOpprRating(limit)
          : await getTopPlayersByOpprRanking(limit);

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
};
