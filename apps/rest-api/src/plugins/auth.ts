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

const ACCESS_TOKEN_COOKIE = 'opprs_access';

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
        // Try cookie first, then Authorization header (for API clients)
        const cookieToken = request.cookies?.[ACCESS_TOKEN_COOKIE];
        const authHeader = request.headers.authorization;
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        const token = cookieToken || headerToken;

        if (!token) {
          reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'No authentication token provided',
          });
          return;
        }

        // Manually verify the token and set user
        const decoded = fastify.jwt.verify<{ sub: string; email: string; role: 'user' | 'admin' }>(token);
        request.user = decoded;
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
