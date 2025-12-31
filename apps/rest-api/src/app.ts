import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { registerRoutes } from './routes/index.js';

export interface AppOptions extends FastifyServerOptions {
  // Extend with custom options if needed
}

/**
 * Creates and configures the Fastify application instance.
 */
export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? true,
    ...options,
  });

  // Register all routes
  await registerRoutes(app);

  return app;
}
