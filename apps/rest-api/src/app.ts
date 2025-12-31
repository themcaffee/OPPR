import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import corsPlugin from './plugins/cors.js';
import swaggerPlugin from './plugins/swagger.js';
import databasePlugin from './plugins/database.js';
import authPlugin from './plugins/auth.js';
import errorHandlerPlugin from './middleware/error-handler.js';
import { registerRoutes } from './routes/index.js';

export interface AppOptions extends FastifyServerOptions {
  skipDatabase?: boolean;
}

/**
 * Creates and configures the Fastify application instance.
 */
export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const { skipDatabase = false, ...fastifyOptions } = options;

  const app = Fastify({
    logger: fastifyOptions.logger ?? true,
    ...fastifyOptions,
  });

  // 1. Core plugins (no dependencies)
  await app.register(corsPlugin);
  await app.register(swaggerPlugin);

  // 2. Database connection (can be skipped for testing)
  if (!skipDatabase) {
    await app.register(databasePlugin);
  }

  // 3. Authentication
  await app.register(authPlugin);

  // 4. Error handling
  await app.register(errorHandlerPlugin);

  // 5. Routes
  await registerRoutes(app);

  return app;
}
