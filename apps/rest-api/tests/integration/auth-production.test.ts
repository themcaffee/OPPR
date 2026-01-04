import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';

// Mock the env module to force production mode BEFORE importing app
vi.mock('../../src/config/env.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/config/env.js')>();
  return {
    ...original,
    env: {
      ...original.loadEnvConfig(),
      authDevMode: false, // Force production mode
    },
  };
});

// Import after mocking
const { buildApp } = await import('../../src/app.js');
const { prisma, generateUniquePlayerNumber } = await import('@opprs/db-prisma');

/**
 * These tests cover the production code paths in auth.ts
 * by mocking authDevMode=false and using real database users.
 */
describe('Auth endpoints (production mode)', () => {
  let app: FastifyInstance;
  const testUserEmail = 'prod-test@example.com';
  const testUserPassword = 'securePassword123';
  let testUserId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  beforeEach(async () => {
    // Clean up and create test user
    await prisma.tournamentResult.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.user.deleteMany();
    await prisma.player.deleteMany();

    // Create a test user with hashed password
    const passwordHash = await bcrypt.hash(testUserPassword, 12);
    const playerNumber = await generateUniquePlayerNumber();
    const player = await prisma.player.create({
      data: { name: 'Test Player', playerNumber },
    });
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        passwordHash,
        playerId: player.id,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with player profile', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          acceptPolicies: true,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('email', 'newuser@example.com');
      expect(body.user).toHaveProperty('role', 'user');
      expect(body.user).toHaveProperty('player');
      expect(body.user.player).toHaveProperty('name', 'New User');
      expect(body).toHaveProperty('message', 'Registration successful');

      // Verify cookies were set
      const cookies = response.cookies;
      expect(cookies.find((c) => c.name === 'opprs_access')).toBeDefined();
      expect(cookies.find((c) => c.name === 'opprs_refresh')).toBeDefined();
    });

    it('should return 400 for duplicate email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: testUserEmail, // Already exists
          password: 'password123',
          name: 'Duplicate User',
          acceptPolicies: true,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toBe('Email already registered');
    });

    it('should return 400 for missing fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'incomplete@example.com',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login (production)', () => {
    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(body).toHaveProperty('expiresIn');
      expect(body).toHaveProperty('tokenType', 'Bearer');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('email', testUserEmail);
      expect(body).toHaveProperty('message', 'Login successful');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'anypassword',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().message).toBe('Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().message).toBe('Invalid credentials');
    });

    it('should login successfully even without player profile', async () => {
      // Create user without player
      const passwordHash = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'noplayeruser@example.com',
          passwordHash,
          // No playerId
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'noplayeruser@example.com',
          password: 'password123',
        },
      });

      // Login succeeds, user just has no player linked
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.user.player).toBeNull();
    });
  });

  describe('POST /api/v1/auth/refresh (production)', () => {
    it('should refresh token for valid user', async () => {
      // First login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      const { refreshToken } = loginResponse.json();

      // Refresh
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: { refreshToken },
      });

      expect(refreshResponse.statusCode).toBe(200);
      expect(refreshResponse.json()).toHaveProperty('accessToken');
    });

    it('should return 401 when user not found', async () => {
      // Login first
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      const { refreshToken } = loginResponse.json();

      // Delete the user
      await prisma.user.delete({ where: { id: testUserId } });

      // Try to refresh
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: { refreshToken },
      });

      expect(refreshResponse.statusCode).toBe(401);
      expect(refreshResponse.json().message).toBe('User not found');
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {},
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().message).toBe('No refresh token provided');
    });

    it('should return 401 for token with wrong type', async () => {
      // Login to get an access token (which has no 'type' field)
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      const { accessToken } = loginResponse.json();

      // Try to use access token as refresh token
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: { refreshToken: accessToken },
      });

      expect(refreshResponse.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout (production)', () => {
    it('should logout and invalidate refresh token in database', async () => {
      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      const { accessToken, refreshToken } = loginResponse.json();

      // Logout using cookies
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        cookies: {
          opprs_access: accessToken,
          opprs_refresh: refreshToken,
        },
      });

      expect(logoutResponse.statusCode).toBe(200);

      // Verify refresh token was invalidated in database
      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(user?.refreshTokenHash).toBeNull();
    });

    it('should handle logout with expired token gracefully', async () => {
      // Logout with invalid/expired token should still succeed
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        cookies: {
          opprs_access: 'expired-token',
        },
      });

      expect(logoutResponse.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/auth/me (production)', () => {
    it('should return user profile from database', async () => {
      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      const { accessToken } = loginResponse.json();

      // Get me
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(meResponse.statusCode).toBe(200);

      const body = meResponse.json();
      expect(body).toHaveProperty('id', testUserId);
      expect(body).toHaveProperty('email', testUserEmail);
      expect(body).toHaveProperty('role', 'user');
    });

    it('should return 401 when user not found', async () => {
      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUserEmail,
          password: testUserPassword,
        },
      });

      const { accessToken } = loginResponse.json();

      // Delete the user
      await prisma.user.delete({ where: { id: testUserId } });

      // Try to get me
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(meResponse.statusCode).toBe(401);
      expect(meResponse.json().message).toBe('User not found');
    });
  });
});
