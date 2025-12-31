import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

/**
 * Health check routes plugin.
 * Provides a /health endpoint for monitoring service health.
 */
export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<{ Reply: HealthResponse }>('/health', async (_request, reply) => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    return reply.status(200).send(response);
  });
};
