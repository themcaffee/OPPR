import type { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth.js';
import { playerRoutes } from './players.js';
import { tournamentRoutes } from './tournaments.js';
import { resultRoutes } from './results.js';
import { statsRoutes } from './stats.js';

export const v1Routes: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(playerRoutes, { prefix: '/players' });
  await app.register(tournamentRoutes, { prefix: '/tournaments' });
  await app.register(resultRoutes, { prefix: '/results' });
  await app.register(statsRoutes, { prefix: '/stats' });
};
