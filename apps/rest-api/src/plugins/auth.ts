import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { findApiKeysByPrefix, updateApiKeyLastUsed } from '@opprs/db-prisma';

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
const API_KEY_HEADER = 'x-api-key';
const API_KEY_PREFIX = 'opprs_';

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
        const apiKeyHeader = request.headers[API_KEY_HEADER] as string | undefined;

        // Check for API key (either in X-API-Key header or as Bearer token starting with opprs_)
        const potentialApiKey = apiKeyHeader || (headerToken?.startsWith(API_KEY_PREFIX) ? headerToken : null);

        if (potentialApiKey?.startsWith(API_KEY_PREFIX)) {
          // API key authentication
          const authenticated = await authenticateWithApiKey(request, reply, potentialApiKey);
          if (authenticated) {
            return;
          }
          // If API key auth failed, reply was already sent
          return;
        }

        // JWT authentication
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

    async function authenticateWithApiKey(
      request: FastifyRequest,
      reply: FastifyReply,
      apiKey: string,
    ): Promise<boolean> {
      const keyPrefix = apiKey.substring(0, API_KEY_PREFIX.length + 8); // "opprs_XXXXXXXX" (14 chars)

      // Find potential matching keys by prefix
      const potentialKeys = await findApiKeysByPrefix(keyPrefix);

      if (potentialKeys.length === 0) {
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid API key',
        });
        return false;
      }

      // Check each potential key
      for (const keyRecord of potentialKeys) {
        const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash);

        if (isValid) {
          // Check expiration
          if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            reply.status(401).send({
              statusCode: 401,
              error: 'Unauthorized',
              message: 'API key has expired',
            });
            return false;
          }

          // Update last used (fire-and-forget for performance)
          updateApiKeyLastUsed(keyRecord.id).catch(() => {
            // Log error but don't block authentication
          });

          // Set user from the API key's owner
          request.user = {
            sub: keyRecord.user.id,
            email: keyRecord.user.email,
            role: keyRecord.user.role.toLowerCase() as 'user' | 'admin',
          };
          return true;
        }
      }

      // No matching key found
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
      return false;
    }
  },
  { name: 'auth' },
);
