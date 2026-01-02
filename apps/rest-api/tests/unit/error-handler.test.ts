import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import errorHandler from '../../src/middleware/error-handler.js';
import { ExternalServiceError, ApiError } from '../../src/utils/errors.js';

describe('Error handler middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(errorHandler);

    // Route that throws ExternalServiceError
    app.get('/external-error', () => {
      throw new ExternalServiceError('TestService', 'Connection failed');
    });

    // Route that throws generic ApiError
    app.get('/api-error', () => {
      throw new ApiError('Something went wrong', 418);
    });

    // Route that throws Prisma P2025 error (not found)
    app.get('/prisma-not-found', () => {
      const error = new Error('Record not found') as Error & { code: string };
      error.code = 'P2025';
      throw error;
    });

    // Route that throws Prisma P2002 error (unique constraint)
    app.get('/prisma-conflict', () => {
      const error = new Error('Unique constraint failed') as Error & { code: string };
      error.code = 'P2002';
      throw error;
    });

    // Route that throws generic 500 error
    app.get('/server-error', () => {
      throw new Error('Internal server error');
    });

    // Route that throws error without name
    app.get('/nameless-error', () => {
      const error = { message: 'Nameless error' };
      throw error;
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle ExternalServiceError with service info', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/external-error',
    });

    expect(response.statusCode).toBe(502);
    const body = response.json();
    expect(body.error).toBe('Bad Gateway');
    expect(body.message).toBe('TestService error: Connection failed');
    expect(body.service).toBe('TestService');
  });

  it('should handle generic ApiError', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api-error',
    });

    expect(response.statusCode).toBe(418);
    const body = response.json();
    expect(body.error).toBe('ApiError');
    expect(body.message).toBe('Something went wrong');
  });

  it('should handle Prisma P2025 (not found) error', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/prisma-not-found',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.error).toBe('Not Found');
    expect(body.message).toBe('Resource not found');
  });

  it('should handle Prisma P2002 (unique constraint) error', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/prisma-conflict',
    });

    expect(response.statusCode).toBe(409);
    const body = response.json();
    expect(body.error).toBe('Conflict');
    expect(body.message).toBe('Resource already exists');
  });

  it('should handle generic server error with 500', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/server-error',
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toBe('Error');
    expect(body.message).toBe('Internal server error');
  });

  it('should handle error without name', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/nameless-error',
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toBe('Error');
  });
});
