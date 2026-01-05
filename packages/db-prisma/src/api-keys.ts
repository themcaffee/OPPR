import { prisma } from './client.js';
import type { ApiKey } from '@prisma/client';

/**
 * Maximum number of API keys allowed per user
 */
export const MAX_API_KEYS_PER_USER = 5;

/**
 * Input for creating a new API key
 */
export interface CreateApiKeyInput {
  name: string;
  keyPrefix: string;
  keyHash: string;
  userId: string;
  expiresAt?: Date | null;
}

/**
 * API key with user info (for authentication)
 */
export interface ApiKeyWithUser {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  userId: string;
  user: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

/**
 * API key info for listing (without sensitive data)
 */
export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

/**
 * Creates a new API key
 */
export async function createApiKey(data: CreateApiKeyInput): Promise<ApiKey> {
  return prisma.apiKey.create({ data });
}

/**
 * Finds an API key by ID
 */
export async function findApiKeyById(id: string): Promise<ApiKey | null> {
  return prisma.apiKey.findUnique({ where: { id } });
}

/**
 * Finds API keys by prefix with user data (for authentication)
 * Returns all keys matching the prefix so we can verify the hash
 */
export async function findApiKeysByPrefix(keyPrefix: string): Promise<ApiKeyWithUser[]> {
  const keys = await prisma.apiKey.findMany({
    where: { keyPrefix },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
  return keys as ApiKeyWithUser[];
}

/**
 * Gets all API keys for a user (without sensitive data)
 */
export async function getUserApiKeys(userId: string): Promise<ApiKeyInfo[]> {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Counts API keys for a user
 */
export async function countUserApiKeys(userId: string): Promise<number> {
  return prisma.apiKey.count({ where: { userId } });
}

/**
 * Updates the lastUsedAt timestamp for an API key
 */
export async function updateApiKeyLastUsed(id: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}

/**
 * Deletes an API key
 */
export async function deleteApiKey(id: string): Promise<ApiKey> {
  return prisma.apiKey.delete({ where: { id } });
}

/**
 * Deletes an API key only if it belongs to the specified user
 * Returns null if the key doesn't exist or doesn't belong to the user
 */
export async function deleteUserApiKey(id: string, userId: string): Promise<ApiKey | null> {
  const key = await prisma.apiKey.findFirst({
    where: { id, userId },
  });

  if (!key) {
    return null;
  }

  return prisma.apiKey.delete({ where: { id } });
}
