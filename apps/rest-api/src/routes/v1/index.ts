import type { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth.js';
import { playerRoutes } from './players.js';
import { tournamentRoutes } from './tournaments.js';
import { resultRoutes } from './results.js';
import { statsRoutes } from './stats.js';
import { importRoutes } from './import.js';
import { userRoutes } from './users.js';
import { locationRoutes } from './locations.js';

export const v1Routes: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(playerRoutes, { prefix: '/players' });
  await app.register(tournamentRoutes, { prefix: '/tournaments' });
  await app.register(resultRoutes, { prefix: '/results' });
  await app.register(statsRoutes, { prefix: '/stats' });
  await app.register(importRoutes, { prefix: '/import' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(locationRoutes, { prefix: '/locations' });
};
