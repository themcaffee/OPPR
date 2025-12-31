import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: 'user' | 'admin';
    };
    user: {
      sub: string;
      email: string;
      role: 'user' | 'admin';
    };
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(jwt, {
      secret: env.jwtSecret,
      sign: {
        expiresIn: env.jwtAccessExpiresIn,
      },
    });

    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      }
    });
  },
  { name: 'auth' }
);
