import type { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import {
  createApiKey,
  getUserApiKeys,
  countUserApiKeys,
  deleteUserApiKey,
  findApiKeyById,
  MAX_API_KEYS_PER_USER,
} from '@opprs/db-prisma';
import {
  apiKeySchema,
  apiKeyCreatedSchema,
  createApiKeySchema,
  apiKeyListSchema,
} from '../../schemas/api-key.js';
import { idParamSchema, errorResponseSchema } from '../../schemas/common.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

const BCRYPT_SALT_ROUNDS = 12;
const API_KEY_PREFIX = 'opprs_';
const API_KEY_BYTES = 32; // 256 bits of entropy

interface CreateApiKeyBody {
  name: string;
  expiresAt?: string;
}

interface IdParams {
  id: string;
}

/**
 * Generates a cryptographically secure API key
 * Format: opprs_<random_base64url>
 */
function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(API_KEY_BYTES);
  const encoded = randomBytes.toString('base64url');
  return `${API_KEY_PREFIX}${encoded}`;
}

export const apiKeyRoutes: FastifyPluginAsync = async (app) => {
  // List user's API keys
  app.get(
    '/',
    {
      schema: {
        tags: ['API Keys'],
        summary: 'List your API keys',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        response: {
          200: apiKeyListSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const keys = await getUserApiKeys(request.user.sub);
      return reply.send(keys);
    },
  );

  // Create a new API key
  app.post<{ Body: CreateApiKeyBody }>(
    '/',
    {
      schema: {
        tags: ['API Keys'],
        summary: 'Create a new API key',
        description: 'Creates a new API key. The full key is only shown once in the response.',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        body: createApiKeySchema,
        response: {
          201: apiKeyCreatedSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { name, expiresAt } = request.body;
      const userId = request.user.sub;

      // Check key limit
      const keyCount = await countUserApiKeys(userId);
      if (keyCount >= MAX_API_KEYS_PER_USER) {
        throw new BadRequestError(
          `Maximum of ${MAX_API_KEYS_PER_USER} API keys allowed per user`,
        );
      }

      // Validate expiration date if provided
      if (expiresAt) {
        const expDate = new Date(expiresAt);
        if (expDate <= new Date()) {
          throw new BadRequestError('Expiration date must be in the future');
        }
      }

      // Generate the key
      const fullKey = generateApiKey();
      const keyPrefix = fullKey.substring(0, API_KEY_PREFIX.length + 8); // "opprs_XXXXXXXX" (14 chars)
      const keyHash = await bcrypt.hash(fullKey, BCRYPT_SALT_ROUNDS);

      // Create in database
      const apiKey = await createApiKey({
        name,
        keyPrefix,
        keyHash,
        userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      // Return with full key (only time it's visible)
      return reply.status(201).send({
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey,
        keyPrefix: apiKey.keyPrefix,
        expiresAt: apiKey.expiresAt?.toISOString() ?? null,
        createdAt: apiKey.createdAt.toISOString(),
      });
    },
  );

  // Get single API key details
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['API Keys'],
        summary: 'Get API key details',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        params: idParamSchema,
        response: {
          200: apiKeySchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const apiKey = await findApiKeyById(request.params.id);

      if (!apiKey) {
        throw new NotFoundError('API Key', request.params.id);
      }

      // Users can only view their own keys
      if (apiKey.userId !== request.user.sub) {
        throw new NotFoundError('API Key', request.params.id);
      }

      return reply.send({
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        expiresAt: apiKey.expiresAt?.toISOString() ?? null,
        lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
        createdAt: apiKey.createdAt.toISOString(),
      });
    },
  );

  // Delete an API key
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['API Keys'],
        summary: 'Delete an API key',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        params: idParamSchema,
        response: {
          204: { type: 'null' },
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const deleted = await deleteUserApiKey(request.params.id, request.user.sub);

      if (!deleted) {
        throw new NotFoundError('API Key', request.params.id);
      }

      return reply.status(204).send();
    },
  );
};
