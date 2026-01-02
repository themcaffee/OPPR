import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
      // First ensure user is authenticated
      await fastify.authenticate(request, reply);

      // Then check if user has admin role
      if (request.user.role !== 'admin') {
        reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Admin access required',
        });
      }
    });
  },
  { name: 'admin', dependencies: ['auth'] }
);
