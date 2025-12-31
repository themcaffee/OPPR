import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';
import { v1Routes } from './v1/index.js';

/**
 * Registers all API routes with the Fastify instance.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health check (no prefix)
  await app.register(healthRoutes);

  // API v1 routes
  await app.register(v1Routes, { prefix: '/api/v1' });
}
