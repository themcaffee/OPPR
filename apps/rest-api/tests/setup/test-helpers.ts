import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';

let cachedApp: FastifyInstance | null = null;
let cachedToken: string | null = null;

/**
 * Gets or creates a test app instance
 */
export async function getTestApp(): Promise<FastifyInstance> {
  if (!cachedApp) {
    cachedApp = await buildApp({ logger: false });
  }
  return cachedApp;
}

/**
 * Closes the cached test app
 */
export async function closeTestApp(): Promise<void> {
  if (cachedApp) {
    await cachedApp.close();
    cachedApp = null;
    cachedToken = null;
  }
}

/**
 * Gets an authentication token for testing protected routes
 */
export async function getAuthToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  const app = await getTestApp();
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email: 'test@example.com',
      password: 'password123',
    },
  });

  const body = response.json();
  cachedToken = body.accessToken;
  return cachedToken;
}

/**
 * Makes an authenticated request
 */
export async function authenticatedRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  payload?: Record<string, unknown>
) {
  const app = await getTestApp();
  const token = await getAuthToken();

  return app.inject({
    method,
    url,
    headers: {
      authorization: `Bearer ${token}`,
    },
    ...(payload && { payload }),
  });
}

/**
 * Creates a date N days ago from now
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Resets authentication cache (useful between test suites)
 */
export function resetAuthCache(): void {
  cachedToken = null;
}
