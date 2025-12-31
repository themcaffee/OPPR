import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { swaggerConfig, swaggerUiConfig } from '../config/swagger.js';

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(swagger, swaggerConfig);
    await fastify.register(swaggerUi, swaggerUiConfig);
  },
  { name: 'swagger' }
);
