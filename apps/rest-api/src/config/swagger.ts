import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'OPPRS API',
      description: 'Open Pinball Player Ranking System REST API',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Players', description: 'Player management' },
      { name: 'Tournaments', description: 'Tournament management' },
      { name: 'Results', description: 'Tournament result management' },
      { name: 'Stats', description: 'Statistics and leaderboards' },
    ],
  },
};

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
};
