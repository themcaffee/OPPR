import type { FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../utils/errors.js';
import {
  loginRequestSchema,
  loginResponseSchema,
  refreshRequestSchema,
  refreshResponseSchema,
  userResponseSchema,
  logoutRequestSchema,
  logoutResponseSchema,
} from '../../schemas/auth.js';
import { errorResponseSchema } from '../../schemas/common.js';

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

interface RefreshPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  type: 'refresh';
}

const revokedTokens = new Set<string>();

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login with credentials',
        body: loginRequestSchema,
        response: {
          200: loginResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // For MVP: simple validation - in production, validate against user store
      // This accepts any email/password combo for development purposes
      if (!email || !password) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const payload = {
        sub: email,
        email,
        role: 'admin' as const,
      };

      const accessToken = app.jwt.sign(payload);
      const refreshToken = jwt.sign(
        { ...payload, type: 'refresh' },
        env.jwtRefreshSecret,
        { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
      );

      return reply.send({
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer',
      });
    }
  );

  app.post<{ Body: RefreshBody }>(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        body: refreshRequestSchema,
        response: {
          200: refreshResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      if (revokedTokens.has(refreshToken)) {
        throw new UnauthorizedError('Token has been revoked');
      }

      try {
        const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as RefreshPayload;

        if (decoded.type !== 'refresh') {
          throw new UnauthorizedError('Invalid token type');
        }

        const payload = {
          sub: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        };

        const accessToken = app.jwt.sign(payload);

        return reply.send({
          accessToken,
          expiresIn: 900,
          tokenType: 'Bearer',
        });
      } catch {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
    }
  );

  app.post<{ Body: RefreshBody }>(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout and invalidate refresh token',
        security: [{ bearerAuth: [] }],
        body: logoutRequestSchema,
        response: {
          200: logoutResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { refreshToken } = request.body;
      revokedTokens.add(refreshToken);

      return reply.send({
        message: 'Successfully logged out',
      });
    }
  );

  app.get(
    '/me',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: userResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      return reply.send({
        sub: request.user.sub,
        email: request.user.email,
        role: request.user.role,
      });
    }
  );
};
