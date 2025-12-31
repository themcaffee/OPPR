import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';

/**
 * Registers all API routes with the Fastify instance.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes);
}
