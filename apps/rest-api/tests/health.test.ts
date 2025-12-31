import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('buildApp', () => {
  it('should create app with default logger enabled', async () => {
    const app = await buildApp();
    expect(app).toBeDefined();
    await app.close();
  });

  it('should create app with custom logger option', async () => {
    const app = await buildApp({ logger: false });
    expect(app).toBeDefined();
    await app.close();
  });
});

describe('Health endpoint', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return JSON content type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = response.json();
      expect(body.status).toBe('ok');
    });

    it('should return a valid ISO timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = response.json();
      expect(body.timestamp).toBeDefined();
      expect(() => new Date(body.timestamp)).not.toThrow();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    it('should return a numeric uptime', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = response.json();
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should have complete health response structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = response.json();
      expect(body).toMatchObject({
        status: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });
});
