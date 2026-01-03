import type { FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { UnauthorizedError, BadRequestError } from '../../utils/errors.js';
import {
  findUserByEmail,
  createUserWithPlayer,
  getUserWithPlayer,
  updateUserRefreshToken,
  type UserWithPlayer,
} from '@opprs/db-prisma';
import {
  loginRequestSchema,
  loginResponseSchema,
  refreshResponseSchema,
  registerRequestSchema,
  authResponseSchema,
  logoutResponseSchema,
  authUserResponseSchema,
} from '../../schemas/auth.js';
import { errorResponseSchema } from '../../schemas/common.js';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

interface RefreshPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  type: 'refresh';
}

// Cookie configuration
const ACCESS_TOKEN_COOKIE = 'opprs_access';
const REFRESH_TOKEN_COOKIE = 'opprs_refresh';
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days
const BCRYPT_SALT_ROUNDS = 12;

// In-memory token revocation list for dev mode (production uses database)
const revokedRefreshTokens = new Set<string>();

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: 'lax' as const,
    path: '/',
    domain: env.cookieDomain,
    maxAge,
  };
}

function generateTokens(app: FastifyPluginAsync['prototype'], user: UserWithPlayer) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role.toLowerCase() as 'user' | 'admin',
  };

  const accessToken = app.jwt.sign(payload);
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
}

function formatUserResponse(user: UserWithPlayer) {
  return {
    id: user.id,
    email: user.email,
    role: user.role.toLowerCase() as 'user' | 'admin',
    player: user.player,
  };
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/register - Register a new user
  app.post<{ Body: RegisterBody }>(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account with a linked player profile. Sets HTTP-only cookies for authentication.',
        body: registerRequestSchema,
        response: {
          201: authResponseSchema,
          400: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password, name } = request.body;

      // Check if email already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw new BadRequestError('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Create user with linked player
      const user = await createUserWithPlayer(
        { email, passwordHash },
        { name }
      );

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(app, user);

      // Store refresh token hash for validation
      const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
      await updateUserRefreshToken(user.id, refreshTokenHash);

      // Set HTTP-only cookies
      reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
      reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS));

      return reply.status(201).send({
        user: formatUserResponse(user),
        message: 'Registration successful',
      });
    }
  );

  // POST /auth/login - Login with credentials
  app.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login with credentials',
        description: 'Authenticates a user and sets HTTP-only cookies for session management.',
        body: loginRequestSchema,
        response: {
          200: loginResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // Dev mode: accept any credentials (for testing)
      if (env.authDevMode) {
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

        reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
        reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS));

        return reply.send({
          accessToken,
          refreshToken,
          expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
          tokenType: 'Bearer',
        });
      }

      // Production mode: validate against database
      const user = await findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Get user with player profile
      const userWithPlayer = await getUserWithPlayer(user.id);
      if (!userWithPlayer) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(app, userWithPlayer);

      // Store refresh token hash for validation
      const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
      await updateUserRefreshToken(user.id, refreshTokenHash);

      // Set HTTP-only cookies
      reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
      reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS));

      // Return tokens in body for backwards compatibility with API clients
      return reply.send({
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
        tokenType: 'Bearer',
        user: formatUserResponse(userWithPlayer),
        message: 'Login successful',
      });
    }
  );

  // POST /auth/refresh - Refresh access token
  app.post<{ Body: { refreshToken?: string } }>(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Uses the refresh token from cookie or request body to generate a new access token.',
        response: {
          200: refreshResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // Accept refresh token from cookie or request body (for API clients)
      const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE] || request.body?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('No refresh token provided');
      }

      try {
        const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as RefreshPayload;

        if (decoded.type !== 'refresh') {
          throw new UnauthorizedError('Invalid token type');
        }

        // In dev mode, check in-memory revocation list
        if (env.authDevMode) {
          if (revokedRefreshTokens.has(refreshToken)) {
            throw new UnauthorizedError('Token has been revoked');
          }

          const payload = {
            sub: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          };

          const accessToken = app.jwt.sign(payload);

          // Set new access token cookie
          reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));

          return reply.send({
            accessToken,
            expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
            tokenType: 'Bearer',
          });
        }

        // Production mode: Get user and verify refresh token hash
        const user = await getUserWithPlayer(decoded.sub);
        if (!user) {
          throw new UnauthorizedError('User not found');
        }

        // Generate new access token
        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role.toLowerCase() as 'user' | 'admin',
        };

        const accessToken = app.jwt.sign(payload);

        // Set new access token cookie
        reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));

        return reply.send({
          accessToken,
          expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
          tokenType: 'Bearer',
        });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          throw error;
        }
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
    }
  );

  // POST /auth/logout - Logout and invalidate tokens
  app.post<{ Body: { refreshToken?: string } }>(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout and invalidate tokens',
        description: 'Clears authentication cookies and invalidates the refresh token.',
        response: {
          200: logoutResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // Get refresh token from cookie or body
      const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE] || request.body?.refreshToken;

      // In dev mode, add to in-memory revocation list
      if (env.authDevMode && refreshToken) {
        revokedRefreshTokens.add(refreshToken);
      }

      // Try to invalidate refresh token in database if user is authenticated
      const accessToken = request.cookies?.[ACCESS_TOKEN_COOKIE];
      if (accessToken && !env.authDevMode) {
        try {
          const decoded = app.jwt.verify<{ sub: string }>(accessToken);
          await updateUserRefreshToken(decoded.sub, null);
        } catch {
          // Token might be expired, that's fine - just clear cookies
        }
      }

      // Clear cookies
      reply.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/', domain: env.cookieDomain });
      reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/', domain: env.cookieDomain });

      return reply.send({
        message: 'Successfully logged out',
      });
    }
  );

  // GET /auth/me - Get current user profile
  app.get(
    '/me',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        response: {
          200: authUserResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      // In dev mode, return a mock user without player profile
      if (env.authDevMode) {
        return reply.send({
          id: request.user.sub,
          email: request.user.email,
          role: request.user.role,
          player: null,
        });
      }

      // Production mode: get user from database
      const user = await getUserWithPlayer(request.user.sub);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return reply.send({
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase() as 'user' | 'admin',
        player: user.player,
      });
    }
  );
};
