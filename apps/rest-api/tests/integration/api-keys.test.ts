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
      authDevMode: false, // Force production mode for real user auth
    },
  };
});

// Import after mocking
const { buildApp } = await import('../../src/app.js');
const { prisma, generateUniquePlayerNumber } = await import('@opprs/db-prisma');

describe('API Keys endpoints', () => {
  let app: FastifyInstance;
  const testUserEmail = 'apikey-test@example.com';
  const testUserPassword = 'password123';
  let _testUserId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  beforeEach(async () => {
    // Clean up all tables (order matters due to foreign keys)
    await prisma.apiKey.deleteMany();
    await prisma.standing.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
    await prisma.player.deleteMany();

    // Create test user with hashed password
    const passwordHash = await bcrypt.hash(testUserPassword, 12);
    const playerNumber = await generateUniquePlayerNumber();
    const player = await prisma.player.create({
      data: { name: 'API Key Test User', playerNumber },
    });
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        passwordHash,
        playerId: player.id,
      },
    });
    _testUserId = user.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  async function getAuthToken(): Promise<string> {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUserEmail,
        password: testUserPassword,
      },
    });
    return response.json().accessToken;
  }

  describe('GET /api/v1/api-keys', () => {
    it('should return empty array when user has no API keys', async () => {
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('should return user API keys', async () => {
      const token = await getAuthToken();

      // Create an API key first
      await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Test Key' },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      const keys = response.json();
      expect(keys).toHaveLength(1);
      expect(keys[0].name).toBe('Test Key');
      expect(keys[0].keyPrefix).toMatch(/^opprs_/);
      expect(keys[0]).not.toHaveProperty('keyHash');
      expect(keys[0]).not.toHaveProperty('key');
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/api-keys',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/api-keys', () => {
    it('should create a new API key', async () => {
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'My API Key' },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.name).toBe('My API Key');
      expect(body.key).toMatch(/^opprs_[A-Za-z0-9_-]+$/);
      expect(body.keyPrefix).toMatch(/^opprs_[A-Za-z0-9_-]{8}$/);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.expiresAt).toBeNull();
    });

    it('should create an API key with expiration date', async () => {
      const token = await getAuthToken();
      const expiresAt = new Date(Date.now() + 86400000).toISOString(); // 1 day from now

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Expiring Key', expiresAt },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.expiresAt).toBe(expiresAt);
    });

    it('should reject expiration date in the past', async () => {
      const token = await getAuthToken();
      const expiresAt = new Date(Date.now() - 86400000).toISOString(); // 1 day ago

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Past Key', expiresAt },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain('future');
    });

    it('should reject when at key limit', async () => {
      const token = await getAuthToken();

      // Create 5 keys (max limit)
      for (let i = 0; i < 5; i++) {
        const createResponse = await app.inject({
          method: 'POST',
          url: '/api/v1/api-keys',
          headers: { authorization: `Bearer ${token}` },
          payload: { name: `Key ${i + 1}` },
        });
        expect(createResponse.statusCode).toBe(201);
      }

      // Try to create 6th key
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Key 6' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain('Maximum');
    });

    it('should return 400 for missing name', async () => {
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        payload: { name: 'Test Key' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/api-keys/:id', () => {
    it('should return API key details', async () => {
      const token = await getAuthToken();

      // Create an API key first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Detail Key' },
      });
      const { id } = createResponse.json();

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/api-keys/${id}`,
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.id).toBe(id);
      expect(body.name).toBe('Detail Key');
      expect(body.keyPrefix).toMatch(/^opprs_/);
      expect(body).not.toHaveProperty('key');
      expect(body).not.toHaveProperty('keyHash');
    });

    it('should return 404 for non-existent key', async () => {
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/api-keys/non-existent-id',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/api-keys/some-id',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/v1/api-keys/:id', () => {
    it('should delete own API key', async () => {
      const token = await getAuthToken();

      // Create an API key first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'To Delete' },
      });
      const { id } = createResponse.json();

      // Delete it
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/api-keys/${id}`,
        headers: { authorization: `Bearer ${token}` },
      });

      expect(deleteResponse.statusCode).toBe(204);

      // Verify it's deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/api-keys/${id}`,
        headers: { authorization: `Bearer ${token}` },
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent key', async () => {
      const token = await getAuthToken();

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/api-keys/non-existent-id',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/api-keys/some-id',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('API Key Authentication', () => {
    it('should authenticate with API key in X-API-Key header', async () => {
      const token = await getAuthToken();

      // Create an API key
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Auth Test Key' },
      });
      const { key } = createResponse.json();

      // Use API key to access authenticated endpoint
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { 'x-api-key': key },
      });

      expect(meResponse.statusCode).toBe(200);
      expect(meResponse.json()).toHaveProperty('email', testUserEmail);
    });

    it('should authenticate with API key as Bearer token', async () => {
      const token = await getAuthToken();

      // Create an API key
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Bearer Test Key' },
      });
      const { key } = createResponse.json();

      // Use API key as Bearer token
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { authorization: `Bearer ${key}` },
      });

      expect(meResponse.statusCode).toBe(200);
      expect(meResponse.json()).toHaveProperty('email', testUserEmail);
    });

    it('should reject invalid API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { 'x-api-key': 'opprs_invalidkey123456789' },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().message).toContain('Invalid API key');
    });

    it('should reject expired API key', async () => {
      const token = await getAuthToken();

      // Create an API key with expiration in the future
      const futureDate = new Date(Date.now() + 60000).toISOString(); // 1 minute from now
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Expiring Key', expiresAt: futureDate },
      });
      const { key, id } = createResponse.json();

      // Manually update the expiration to the past via database
      await prisma.apiKey.update({
        where: { id },
        data: { expiresAt: new Date(Date.now() - 1000) }, // 1 second ago
      });

      // Try to use expired API key
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { 'x-api-key': key },
      });

      expect(meResponse.statusCode).toBe(401);
      expect(meResponse.json().message).toContain('expired');
    });

    it('should update lastUsedAt on successful authentication', async () => {
      const token = await getAuthToken();

      // Create an API key
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Usage Track Key' },
      });
      const { key, id } = createResponse.json();

      // Verify lastUsedAt is null initially
      const beforeKey = await prisma.apiKey.findUnique({ where: { id } });
      expect(beforeKey?.lastUsedAt).toBeNull();

      // Use the API key
      await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { 'x-api-key': key },
      });

      // Wait a bit for the fire-and-forget update
      await new Promise((resolve) => globalThis.setTimeout(resolve, 100));

      // Verify lastUsedAt is updated
      const afterKey = await prisma.apiKey.findUnique({ where: { id } });
      expect(afterKey?.lastUsedAt).not.toBeNull();
    });

    it('should allow API key to access protected resources', async () => {
      const token = await getAuthToken();

      // Create an API key
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Resource Access Key' },
      });
      const { key } = createResponse.json();

      // Use API key to list players
      const playersResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
        headers: { 'x-api-key': key },
      });

      expect(playersResponse.statusCode).toBe(200);
    });

    it('should allow API key to manage own API keys', async () => {
      const token = await getAuthToken();

      // Create first API key with JWT
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'First Key' },
      });
      const { key: firstKey } = createResponse.json();

      // Use first API key to create second API key
      const secondKeyResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { 'x-api-key': firstKey },
        payload: { name: 'Second Key' },
      });

      expect(secondKeyResponse.statusCode).toBe(201);
      expect(secondKeyResponse.json().name).toBe('Second Key');

      // Use first API key to list all keys
      const listResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/api-keys',
        headers: { 'x-api-key': firstKey },
      });

      expect(listResponse.statusCode).toBe(200);
      expect(listResponse.json()).toHaveLength(2);
    });

    it('should not allow access to other user API keys', async () => {
      const token = await getAuthToken();

      // Create an API key for the test user
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/api-keys',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Test User Key' },
      });
      const { id } = createResponse.json();

      // Create another user
      const passwordHash = await bcrypt.hash('otherpassword', 12);
      const playerNumber = await generateUniquePlayerNumber();
      const player = await prisma.player.create({
        data: { name: 'Other User', playerNumber },
      });
      await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash,
          playerId: player.id,
        },
      });

      // Login as other user
      const otherLoginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'other@example.com',
          password: 'otherpassword',
        },
      });
      const otherToken = otherLoginResponse.json().accessToken;

      // Try to get the first user's API key
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/api-keys/${id}`,
        headers: { authorization: `Bearer ${otherToken}` },
      });

      expect(getResponse.statusCode).toBe(404);

      // Try to delete the first user's API key
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/api-keys/${id}`,
        headers: { authorization: `Bearer ${otherToken}` },
      });

      expect(deleteResponse.statusCode).toBe(404);
    });
  });
});
